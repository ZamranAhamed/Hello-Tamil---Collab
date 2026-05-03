import api from "./api";

export const getRandomWord = async () => {
  try {
    const response = await api.get("/speech/random");
    return response.data;
  } catch (err) {
    console.warn("[speechService] getRandomWord failed", err);
    throw err;
  }
};

export const getCategoryWords = async (category: string) => {
  try {
    const response = await api.get(`/speech/category/${category}`);
    return response.data;
  } catch (err) {
    console.warn("[speechService] getCategoryWords failed", { category, err });
    throw err;
  }
};
