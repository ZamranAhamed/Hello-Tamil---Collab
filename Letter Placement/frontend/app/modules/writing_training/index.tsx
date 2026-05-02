import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { analyzeImage } from "@/services/writingService";
import { useRouter } from "expo-router";

export default function WritingTraining() {

  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);

  /* PICK IMAGE */

  const pickImage = async () => {

    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission required");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* TAKE PHOTO */

  const takePhoto = async () => {

    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Camera permission required");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  /* SEND IMAGE TO MODEL */

  const uploadImage = async () => {

    if (!image) {
      Alert.alert("Please select an image first");
      return;
    }

    try {

      const data = await analyzeImage(image);

      router.push({
        pathname: "/modules/writing_training/ResultScreen",
        params: {
          result: JSON.stringify(data),
          originalImage: image,
        },
      });

    } catch (error) {

      console.log(error);

      Alert.alert(
        "Error",
        "Failed to analyze image"
      );
    }
  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Writing Training
      </Text>

      <View style={styles.buttonRow}>

        <Button
          title="Pick Image"
          onPress={pickImage}
        />

        <Button
          title="Take Photo"
          onPress={takePhoto}
        />

      </View>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}

      <Button
        title="Upload to Model"
        onPress={uploadImage}
      />

      {/* SPACE RACE TRAINING BUTTON */}

      <TouchableOpacity
        style={styles.practiceBtn}
        onPress={() =>
          router.push("/modules/writing_training/SpaceRaceTraining")
        }
      >
        <Text style={styles.practiceText}>
          ✍️ Space Race Training
        </Text>
      </TouchableOpacity>

    </View>

  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20,
    backgroundColor:"#FFF9E6",
  },

  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:20,
    textAlign:"center",
  },

  buttonRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:20,
  },

  image:{
    width:"100%",
    height:220,
    borderRadius:10,
    marginBottom:20,
  },

  practiceBtn:{
    backgroundColor:"#2BB3A3",
    padding:15,
    borderRadius:12,
    marginTop:20,
    alignItems:"center",
  },

  practiceText:{
    color:"#fff",
    fontSize:16,
    fontWeight:"bold",
  },

});