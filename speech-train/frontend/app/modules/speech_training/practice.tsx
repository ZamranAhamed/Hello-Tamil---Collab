import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
  ScrollView
} from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams } from "expo-router";

const NODE_BASE = "http://172.27.26.232:8001";
const AI_BASE = "http://172.27.26.232:5001";

export default function Practice() {
  const params = useLocalSearchParams();

  const recordingRef = useRef<Audio.Recording | null>(null);

  const [recording, setRecording] = useState(false);
  const [checking, setChecking] = useState(false);
  const [playing, setPlaying] = useState(false);

  const [result, setResult] = useState<any>(null);

 const tamilWord = String(params.word || params.tamil || "");
 console.log("Tamil Word:", tamilWord);
  const englishMeaning = String(params.english || "");
  const sinhalaMeaning = String(params.sinhala || "");
  const imageUrl = String(params.image || "");
  const audioUrl = String(params.audio || "");

  const playAudio = async () => {
    try {
      setPlaying(true);

      const { sound } = await Audio.Sound.createAsync(
        { uri: `${NODE_BASE}/dataset/${audioUrl}` },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlaying(false);
          sound.unloadAsync();
        }
      });
    } catch {
      setPlaying(false);
      Alert.alert("Error", "Unable to play pronunciation.");
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Microphone permission needed.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const rec = new Audio.Recording();

      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      await rec.startAsync();

      recordingRef.current = rec;
      setRecording(true);
      setResult(null);
    } catch {
      Alert.alert("Error", "Unable to start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;

      await recordingRef.current.stopAndUnloadAsync();

      const uri = recordingRef.current.getURI();

      setRecording(false);

      if (uri) {
        await uploadForCheck(uri);
      }
    } catch {
      setRecording(false);
      Alert.alert("Error", "Unable to stop recording.");
    }
  };

  const uploadForCheck = async (uri: string) => {
    try {
      setChecking(true);

      const formData = new FormData();

      formData.append("correct_word", tamilWord);

      formData.append("file", {
        uri,
        name: "audio.m4a",
        type: "audio/m4a"
      } as any);

      const response = await fetch(
        `${AI_BASE}/check-pronunciation`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      setResult(data);
    } catch {
      Alert.alert("Error", "Failed to check pronunciation.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pronunciation Practice</Text>

    <View style={styles.imageBox}>
  <Image
    source={{ uri: `${NODE_BASE}/dataset/${imageUrl}` }}
    style={styles.image}
    resizeMode="cover"
  />
</View>

      <Text style={styles.tamil}>{tamilWord}</Text>
      <Text style={styles.sinhala}>{sinhalaMeaning}</Text>
      <Text style={styles.english}>{englishMeaning}</Text>

      <Pressable style={styles.listenBtn} onPress={playAudio}>
        <Text style={styles.btnText}>
          {playing ? "Playing..." : "🔊 Listen"}
        </Text>
      </Pressable>

      {!recording ? (
        <Pressable style={styles.recordBtn} onPress={startRecording}>
          <Text style={styles.btnText}>🎤 Start Recording</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.stopBtn} onPress={stopRecording}>
          <Text style={styles.btnText}>⏹ Stop Recording</Text>
        </Pressable>
      )}

      {checking && (
        <ActivityIndicator
          size="large"
          color="#1976D2"
          style={{ marginTop: 20 }}
        />
      )}

      {result && (
        <View style={styles.resultBox}>
          <Text style={styles.score}>
            Score: {result.score}%
          </Text>

          <Text style={styles.feedback}>
            {result.feedback}
          </Text>

          <Text style={styles.small}>
            Spoken: {result.spoken}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    minHeight: "100%"
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20
  },

  imageBox: {
  width: 280,
  height: 220,
  borderRadius: 22,
  overflow: "hidden",
  backgroundColor: "#fff",
  marginBottom: 20,
  elevation: 6
},

image: {
  width: "100%",
  height: "100%"
},

  tamil: {
    fontSize: 42,
    fontWeight: "bold"
  },

  sinhala: {
    fontSize: 24,
    marginTop: 6
  },

  english: {
    fontSize: 22,
    marginTop: 4,
    marginBottom: 20
  },

  listenBtn: {
    backgroundColor: "#FFD54F",
    width: 240,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 14
  },

  recordBtn: {
    backgroundColor: "#66BB6A",
    width: 240,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 14
  },

  stopBtn: {
    backgroundColor: "#EF5350",
    width: 240,
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 14
  },

  btnText: {
    fontSize: 18,
    fontWeight: "bold"
  },

  resultBox: {
    width: "100%",
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center"
  },

  score: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1976D2"
  },

  feedback: {
    fontSize: 22,
    marginTop: 8,
    fontWeight: "600"
  },

  small: {
    marginTop: 10,
    fontSize: 16
  }
});