require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const SpeechWord = require("./src/speech/src/models/speechWordModel");

const datasetPath = path.join(__dirname, "public", "dataset");

async function importDataset() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const categories = fs.readdirSync(datasetPath);

    for (const category of categories) {
      const categoryPath = path.join(datasetPath, category);

      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const words = fs.readdirSync(categoryPath);

      for (const wordFolder of words) {
        const wordPath = path.join(categoryPath, wordFolder);
        const jsonPath = path.join(wordPath, "word.json");

        if (!fs.existsSync(jsonPath)) continue;

        const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

        // check duplicate
        const exists = await SpeechWord.findOne({
          category: category,
          englishMeaning: data.english
        });

        if (exists) {
          console.log("Skip existing:", data.english);
          continue;
        }

        await SpeechWord.create({
          tamilWord: data.tamil,
          englishMeaning: data.english,
          sinhalaMeaning: data.sinhala,
          category: category,
          difficulty: "easy",
          imageUrl: `${category}/${wordFolder}/image.png`,
          audioUrl: `${category}/${wordFolder}/tamil_audio.mp3`
        });

        console.log("Inserted:", data.english);
      }
    }

    console.log("✅ Import Complete");
    process.exit();

  } catch (error) {
    console.log(error);
    process.exit();
  }
}

importDataset();