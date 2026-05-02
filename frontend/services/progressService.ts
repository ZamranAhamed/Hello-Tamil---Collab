import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveScore = async (score:number) => {

  const history = await AsyncStorage.getItem("scores");

  const arr = history ? JSON.parse(history) : [];

  arr.push(score);

  await AsyncStorage.setItem(
    "scores",
    JSON.stringify(arr)
  );

};

export const getScores = async () => {

  const history = await AsyncStorage.getItem("scores");

  return history ? JSON.parse(history) : [];

};