const express = require("express");
const router = express.Router();

const SpeechWord = require("../models/speechWordModel");

router.get("/test", async (req, res) => {
  console.log("Test route called");

  try {
    console.log("Attempting to create SpeechWord document...");

    const word = await SpeechWord.create({
      tamilWord: "நாய்",
      englishMeaning: "Dog",
      category: "animals",
      difficulty: "easy",
      imageUrl: "dog.png",
      audioUrl: "dog.mp3",
      hint: "Say naa-ee"
    });

    console.log("SpeechWord created successfully:", word);
    res.json(word);

  } catch (error) {
    console.error("Error in test route:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;