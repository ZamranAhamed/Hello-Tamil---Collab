const mongoose = require("mongoose");

const speechWordSchema = new mongoose.Schema({
  tamilWord: { type: String, required: true },
  englishMeaning: { type: String, required: true },
  sinhalaMeaning: { type: String, default: "" },

  category: { type: String, required: true },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "easy"
  },

  imageUrl: String,
  audioUrl: String,
  hint: String

}, { timestamps: true });

module.exports = mongoose.model("SpeechWord", speechWordSchema);