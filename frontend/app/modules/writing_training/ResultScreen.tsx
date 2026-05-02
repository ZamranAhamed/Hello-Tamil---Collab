import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Progress from "react-native-progress";
import { saveScore } from "@/services/progressService";

export default function ResultScreen() {

  const params = useLocalSearchParams();

  const result = JSON.parse(params.result as string);
  const originalImage = params.originalImage as string;

  /* SAVE SCORE AUTOMATICALLY */

  useEffect(() => {

    if (result?.overallScore !== undefined) {
      saveScore(result.overallScore);
    }

  }, []);

  return (

    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Spatial Model Evaluation
      </Text>

      {/* Original Image */}

      <Text style={styles.section}>Original Image</Text>

      <Image
        source={{ uri: originalImage }}
        style={styles.image}
      />

      {/* Processed Image */}

      <Text style={styles.section}>Preprocessed Image</Text>

      <Image
        source={{
          uri: `data:image/png;base64,${result.processedImage}`
        }}
        style={styles.image}
      />

      {/* Annotated Image */}

      <Text style={styles.section}>Detected Letters</Text>

      <Image
        source={{
          uri: `data:image/png;base64,${result.annotatedImage}`
        }}
        style={styles.image}
      />

      {/* Score Bars */}

      <View style={styles.scoreBox}>

        <Text style={styles.scoreTitle}>Spacing</Text>
        <Progress.Bar
          progress={result.spacingScore / 100}
          width={250}
        />

        <Text style={styles.scoreTitle}>Baseline</Text>
        <Progress.Bar
          progress={result.baselineScore / 100}
          width={250}
        />

        <Text style={styles.scoreTitle}>Consistency</Text>
        <Progress.Bar
          progress={result.letterConsistencyScore / 100}
          width={250}
        />

        <Text style={styles.overall}>
          Overall Score: {result.overallScore}
        </Text>

      </View>

      {/* Feedback */}

      <Text style={styles.section}>Feedback</Text>

      {result.feedback?.map((msg: string, index: number) => (

        <Text key={index}>• {msg}</Text>

      ))}

      {/* Recommended Exercises */}

      <Text style={styles.section}>Recommended Exercises</Text>

      {result.recommendedExercises?.map((ex: string, index: number) => (

        <Text key={index}>🎮 {ex}</Text>

      ))}

    </ScrollView>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20,
    backgroundColor:"#FFF9E6"
  },

  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:20,
    textAlign:"center"
  },

  section:{
    marginTop:20,
    fontWeight:"bold"
  },

  image:{
    width:"100%",
    height:200,
    marginTop:10,
    borderRadius:10
  },

  scoreBox:{
    marginTop:20
  },

  scoreTitle:{
    marginTop:10
  },

  overall:{
    marginTop:15,
    fontWeight:"bold",
    fontSize:18
  }

});