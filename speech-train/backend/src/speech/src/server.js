const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const speechRoutes = require("./routes/speechRoutes");
const testRoutes = require("./routes/testRoutes");
const SpeechWord = require("./models/speechWordModel");
const path = require("path");

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const app = express();

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static files from the dataset folder
const datasetPath = path.join(__dirname, "../../../public/dataset");
console.log("Dataset path:", datasetPath);
app.use("/dataset", express.static(datasetPath));

// API routes
app.get("/api/categories", async (req, res) => {
  console.log("GET /api/categories called");
  try {
    const categories = await SpeechWord.distinct("category");
    console.log("Categories found:", categories);
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/categories/:category", async (req, res) => {
  try {
    const words = await SpeechWord.find({ category: req.params.category });
    res.json(words);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/test", async (req, res) => {
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

app.get("/api/debug", (req, res) => {
  res.json({ message: "API is working", timestamp: new Date() });
});

// Ensure DB is connected before starting server
const startServer = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("MongoDB connected successfully");

    app.use("/api/speech", speechRoutes);

    app.get("/", (req, res) => {
      res.send("Hello Tamil API running");
    });

    const PORT = process.env.PORT || 8001;

    app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();