import React, { useState } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { analyzeImage } from "@/services/writingService";

export default function UploadAnalysis() {

  const [image, setImage] = useState<any>(null);
  const [result, setResult] = useState<any>(null);

  const pickImage = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1
    });

    if (!result.canceled) {

      setImage(result.assets[0].uri);

    }

  };

  const takePhoto = async () => {

    const result = await ImagePicker.launchCameraAsync({
      quality: 1
    });

    if (!result.canceled) {

      setImage(result.assets[0].uri);

    }

  };

  const uploadImage = async () => {

    const data = await analyzeImage(image);
    setResult(data);

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Spatial Model Evaluation
      </Text>

      <View style={styles.buttons}>

        <Button title="Pick Image" onPress={pickImage} />
        <Button title="Take Photo" onPress={takePhoto} />

      </View>

      {image && (
        <Image
          source={{ uri: image }}
          style={styles.image}
        />
      )}

      <Button
        title="Upload to All Models"
        onPress={uploadImage}
      />

      {result && (

        <View style={styles.result}>

          <Text>Spacing: {result.spacingScore}%</Text>
          <Text>Baseline: {result.baselineScore}%</Text>
          <Text>Letter Consistency: {result.letterConsistencyScore}%</Text>
          <Text>Overall Score: {result.overallScore}%</Text>

        </View>

      )}

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20
  },

  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:20
  },

  buttons:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginBottom:20
  },

  image:{
    width:300,
    height:200,
    marginBottom:20
  },

  result:{
    marginTop:20
  }

});