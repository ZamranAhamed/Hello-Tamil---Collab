import { View,Text,Pressable,StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useEffect,useState } from "react";
import { getCategories } from "../../../services/api";

export default function SpeechTraining(){

  const router = useRouter();
  const [categories,setCategories] = useState<string[]>([]);

  useEffect(()=>{

    async function load(){

      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : data?.categories ?? []);

    }

    load();

  },[]);

  return(

    <View style={styles.container}>

      {categories.map(c=>(
        <Pressable
          key={c}
          style={styles.card}
          onPress={()=>router.push(`/modules/speech_training/category?name=${c}`)}
        >
          <Text style={styles.text}>{c}</Text>
        </Pressable>
      ))}

    </View>

  );

}

const styles = StyleSheet.create({

  container:{
    padding:20
  },

  card:{
    backgroundColor:"#FFD966",
    padding:20,
    marginBottom:15,
    borderRadius:20,
    alignItems:"center"
  },

  text:{
    fontSize:22,
    fontWeight:"bold"
  }

});