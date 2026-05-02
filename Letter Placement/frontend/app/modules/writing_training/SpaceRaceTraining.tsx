import React, { useRef, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import * as Progress from 'react-native-progress';
import { useRouter } from 'expo-router';
import { analyzeDrawing } from '@/services/writingService';

const { width: screenWidth } = Dimensions.get('window');

/*
  ========================================
  Flow: Word practice → Draw → Analyze → Next word → Final result
  ========================================
  
  1. User selects word from words array
  2. User draws on canvas
  3. Click "Analyze Writing" → readSignature() captures base64
  4. onOK callback: removes prefix and calls analyzeDrawing()
  5. Backend returns scores and feedback
  6. Display scores using progress bars
  7. Show feedback messages in styled box
  8. Click "Next Word" → clear canvas, move to next word
  9. After all words, show final results screen
  10. Calculate and display average scores
*/

export default function SpaceRaceTraining() {
  const router = useRouter();
  const signatureRef = useRef<any>(null);
  
  // Activity words: Tamil language
  const words = ["அம்மா","அப்பா","தங்கை"];
  
  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Array<{
    spacing: number;
    baseline: number;
    consistency: number;
    feedback: string;
  }>>([]);
  const [spacingScore, setSpacingScore] = useState<number | null>(null);
  const [baselineScore, setBaselineScore] = useState<number | null>(null);
  const [consistencyScore, setConsistencyScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // onOK callback: called when canvas returns base64 image
  const handleOK = useCallback(async (signature: string) => {
    if (!signature) {
      Alert.alert('Error', 'Please draw something first');
      return;
    }

    try {
      setLoading(true);
      // Remove base64 prefix
      const base64Image = signature.replace('data:image/png;base64,', '');
      if (!base64Image) {
        Alert.alert('Error', 'Drawing is empty');
        return;
      }
      // Call backend to analyze drawing
      const result = await analyzeDrawing(base64Image);
      
      // Save result for current word to results array
      setResults(prev => [
        ...prev,
        {
          spacing: result.spacingScore,
          baseline: result.baselineScore,
          consistency: result.consistencyScore,
          feedback: result.feedback
        }
      ]);
      
      // Set current display values
      setSpacingScore(result.spacingScore);
      setBaselineScore(result.baselineScore);
      setConsistencyScore(result.consistencyScore);
      setFeedback(result.feedback);
    } catch (error) {
      console.error('Analysis error:', error);
      Alert.alert('Error', 'Failed to analyze drawing');
    } finally {
      setLoading(false);
    }
  }, []);

  // Analyze Writing button: readSignature()
  const handleAnalyze = useCallback(() => {
    if (signatureRef.current) {
      signatureRef.current.readSignature();
    }
  }, []);

  // Reset button: clearSignature()
  const handleReset = useCallback(() => {
    signatureRef.current?.clearSignature();
    setSpacingScore(null);
    setBaselineScore(null);
    setConsistencyScore(null);
    setFeedback("");
  }, []);

  // Next Word button: clear canvas and advance
  const handleNextWord = useCallback(() => {
    signatureRef.current?.clearSignature();
    setSpacingScore(null);
    setBaselineScore(null);
    setConsistencyScore(null);
    setFeedback("");
    setCurrentIndex(prev => prev + 1);
  }, []);

  // Check if all words are done
  const allDone = currentIndex >= words.length;

  // Calculate final averages
  const finalResults = useMemo(() => {
    if (allDone && results.length > 0) {
      const avgSpacing = results.reduce((sum, r) => sum + r.spacing, 0) / results.length;
      const avgBaseline = results.reduce((sum, r) => sum + r.baseline, 0) / results.length;
      const avgConsistency = results.reduce((sum, r) => sum + r.consistency, 0) / results.length;
      const overallScore = (avgSpacing + avgBaseline + avgConsistency) / 3;
      
      // Collect all feedback from all words
      const allFeedback = results.map(r => r.feedback).join(' ');
      
      return {
        averageSpacing: avgSpacing,
        averageBaseline: avgBaseline,
        averageConsistency: avgConsistency,
        overallScore: overallScore,
        feedback: allFeedback,
      };
    }
    return null;
  }, [allDone, results]);

  // Canvas style
  const customStyle = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      background-color: white;
    }
    .m-signature-pad--body {
      border: none;
      background-color: white;
    }
    .m-signature-pad--footer {
      display: none;
    }
  `;

  // ========================================
  // RENDER: Word practice screen OR Final result screen
  // ========================================
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        {!allDone ? (
          <>
            {/* ===== Word Practice Screen ===== */}
            
            <Text style={styles.title}>Space Race</Text>

            {/* Progress indicator */}
            <Text style={styles.progressText}>
              Word {currentIndex + 1} of {words.length}
            </Text>

            {/* Target word display */}
            <Text style={styles.wordDisplay}>{words[currentIndex]}</Text>

            {/* Instructions */}
            <Text style={styles.instruction}>
              Practice writing the word above. Keep your letters evenly spaced, aligned, and consistent in size.
            </Text>

            {/* Canvas wrapper with visual guides */}
            <View style={styles.canvasWrapper}>
              {/* Visual guides */}
              <View style={styles.guidesContainer}>
                {/* Horizontal baseline */}
                <View style={styles.baseline} />
                {/* Vertical markers */}
                <View style={[styles.verticalMarker, { left: '25%' }]} />
                <View style={[styles.verticalMarker, { left: '50%' }]} />
                <View style={[styles.verticalMarker, { right: '25%' }]} />
              </View>
              
              <SignatureScreen
                ref={signatureRef}
                onOK={handleOK}
                onEmpty={() => console.log('Canvas is empty')}
                onClear={() => console.log('Canvas cleared')}
                webStyle={customStyle}
                autoClear={false}
                imageType="image/png"
                style={styles.signatureCanvas}
              />
            </View>

            {/* Button container: Reset and Analyze */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.resetBtn}
                onPress={handleReset}
              >
                <Text style={styles.buttonText}>Reset</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.analyzeBtn,
                  loading && styles.disabledBtn,
                ]}
                onPress={handleAnalyze}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Analyzing...' : 'Analyze Writing'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Score results section */}
            {spacingScore !== null && (
              <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>Your Scores:</Text>

                {/* Spacing Score Bar */}
                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>Spacing</Text>
                    <Text style={styles.scoreValue}>{spacingScore}%</Text>
                  </View>
                  <Progress.Bar
                    progress={spacingScore / 100}
                    width={null}
                    color="#4CAF50"
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                    height={8}
                  />
                </View>

                {/* Baseline Score Bar */}
                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>Baseline</Text>
                    <Text style={styles.scoreValue}>{baselineScore}%</Text>
                  </View>
                  <Progress.Bar
                    progress={baselineScore / 100}
                    width={null}
                    color="#2196F3"
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                    height={8}
                  />
                </View>

                {/* Consistency Score Bar */}
                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>Consistency</Text>
                    <Text style={styles.scoreValue}>{consistencyScore}%</Text>
                  </View>
                  <Progress.Bar
                    progress={consistencyScore / 100}
                    width={null}
                    color="#FF9800"
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                    height={8}
                  />
                </View>

                {/* Feedback box */}
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackTitle}>💡 Feedback:</Text>
                  <Text style={styles.feedbackMessage}>
                    {feedback || "Great job! Your handwriting looks neat."}
                  </Text>
                </View>

                {/* Next Word button */}
                <TouchableOpacity
                  style={styles.nextWordBtn}
                  onPress={handleNextWord}
                >
                  <Text style={styles.buttonText}>Next Word</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          <>
            {/* ===== Final Result Screen ===== */}
            
            <Text style={styles.title}>Space Race</Text>
            <Text style={styles.completionText}>✓ All words completed!</Text>

            {finalResults && (
              <View style={styles.resultsSection}>
                <Text style={styles.resultsTitle}>Final Results:</Text>

                {/* Average Spacing Bar */}
                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>Average Spacing</Text>
                    <Text style={styles.scoreValue}>{finalResults.averageSpacing.toFixed(0)}%</Text>
                  </View>
                  <Progress.Bar
                    progress={finalResults.averageSpacing / 100}
                    width={null}
                    color="#4CAF50"
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                    height={8}
                  />
                </View>

                {/* Average Baseline Bar */}
                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>Average Baseline</Text>
                    <Text style={styles.scoreValue}>{finalResults.averageBaseline.toFixed(0)}%</Text>
                  </View>
                  <Progress.Bar
                    progress={finalResults.averageBaseline / 100}
                    width={null}
                    color="#2196F3"
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                    height={8}
                  />
                </View>

                {/* Average Consistency Bar */}
                <View style={styles.scoreItem}>
                  <View style={styles.scoreHeader}>
                    <Text style={styles.scoreLabel}>Average Consistency</Text>
                    <Text style={styles.scoreValue}>{finalResults.averageConsistency.toFixed(0)}%</Text>
                  </View>
                  <Progress.Bar
                    progress={finalResults.averageConsistency / 100}
                    width={null}
                    color="#FF9800"
                    unfilledColor="#E0E0E0"
                    borderWidth={0}
                    height={8}
                  />
                </View>

                {/* Overall Score */}
                <View style={styles.overallScoreBox}>
                  <Text style={styles.overallScoreLabel}>Overall Score</Text>
                  <Text style={styles.overallScoreValue}>
                    {finalResults.overallScore.toFixed(0)}%
                  </Text>
                </View>

                {/* Final Feedback */}
                <View style={styles.feedbackBox}>
                  <Text style={styles.feedbackTitle}>📝 Summary Feedback:</Text>
                  <Text style={styles.feedbackMessage}>
                    {finalResults.feedback || "Great job! Your handwriting looks neat."}
                  </Text>
                </View>

                {/* Back button to close */}
                <TouchableOpacity
                  style={styles.finishBtn}
                  onPress={() => router.back()}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFF9E6',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
    letterSpacing: 1,
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '500',
  },
  wordDisplay: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000000',
    marginVertical: 20,
    letterSpacing: 2,
  },
  instruction: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  canvasWrapper: {
    width: screenWidth - 32,
    height: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  guidesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    pointerEvents: 'none',
  },
  baseline: {
    position: 'absolute',
    top: '60%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#2196F3',
    opacity: 0.7,
  },
  verticalMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#2196F3',
    opacity: 0.7,
  },
  signatureCanvas: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  analyzeBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  disabledBtn: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  resultsSection: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  scoreItem: {
    marginBottom: 16,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  feedbackBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  feedbackMessage: {
    fontSize: 13,
    color: '#555555',
    marginBottom: 6,
    lineHeight: 18,
  },
  nextWordBtn: {
    width: '100%',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  completionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginVertical: 12,
  },
  overallScoreBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  overallScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    marginBottom: 8,
  },
  overallScoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF9800',
  },
  finishBtn: {
    width: '100%',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
});