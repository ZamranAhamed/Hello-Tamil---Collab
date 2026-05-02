import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SignatureScreen from "react-native-signature-canvas";

export default function CanvasWriting() {

  const handleOK = (signature: string) => {

    console.log("Canvas Image:", signature);

    // Later we will send this base64 image to the backend

  };

  return (

    <View style={styles.container}>

      <Text style={styles.title}>
        Write the Tamil Word
      </Text>

      <SignatureScreen
        onOK={handleOK}
        descriptionText="Draw here"
        clearText="Clear"
        confirmText="Analyze"
      />

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    flex:1
  },

  title:{
    textAlign:"center",
    fontSize:18,
    marginTop:20
  }

});