const express = require("express");
const router = express.Router();
const { predictSpeech, getRandomWord } = require("../controllers/speechController");

router.get("/random", getRandomWord);
router.post("/predict", predictSpeech);

module.exports = router;