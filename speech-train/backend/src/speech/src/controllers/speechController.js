const axios = require("axios");
const SpeechWord = require("../models/speechWordModel");

exports.predictSpeech = async (req, res) => {
  try {
    const audio = req.body.audio;

    const response = await axios.post("http://localhost:8000/predict", {
      audio: audio,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Prediction failed" });
  }
};

exports.getRandomWord = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const count = await SpeechWord.countDocuments(filter);
    if (count === 0) {
      return res.status(404).json({ message: "No words found" });
    }

    const randomIndex = Math.floor(Math.random() * count);
    const word = await SpeechWord.findOne(filter).skip(randomIndex);

    res.json(word);
  } catch (error) {
    console.error("Failed to fetch random word:", error);
    res.status(500).json({ message: "Failed to fetch random word" });
  }
};