from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from faster_whisper import WhisperModel
from difflib import SequenceMatcher
import tempfile
import os
import json

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "..", "backend", "public", "dataset")

app.mount("/dataset", StaticFiles(directory=DATASET_DIR), name="dataset")

# Whisper model
model = WhisperModel("base")


# normalize pronunciation
def normalize_text(text):

    text = text.lower().strip()

    replacements = {
        "aa": "a",
        "ee": "i",
        "oo": "u",
        "ai": "a",
        "ou": "o"
    }

    for k, v in replacements.items():
        text = text.replace(k, v)

    return text


# pronunciation score
def score_pronunciation(spoken, correct):

    spoken = normalize_text(spoken)
    correct = normalize_text(correct)

    similarity = SequenceMatcher(None, spoken, correct).ratio()

    score = round(similarity * 100)

    if spoken.startswith(correct[:1]):
        score += 10

    return min(score, 100)


@app.get("/categories")
def get_categories():

    categories = []

    for c in os.listdir(DATASET_DIR):
        if os.path.isdir(os.path.join(DATASET_DIR, c)):
            categories.append(c)

    return {"categories": categories}


@app.get("/categories/{category}")
def get_words(category: str):

    category_path = os.path.join(DATASET_DIR, category)

    items = []

    if not os.path.exists(category_path):
        return {"items": []}

    for word in os.listdir(category_path):

        word_path = os.path.join(category_path, word)
        json_path = os.path.join(word_path, "word.json")

        if os.path.exists(json_path):

            with open(json_path, encoding="utf-8") as f:
                data = json.load(f)

            items.append({
                "name": word,
                "english": data["english"],
                "tamil": data["tamil"],
                "sinhala": data["sinhala"],
                "image": f"/dataset/{category}/{word}/image.png",
                "audio": f"/dataset/{category}/{word}/tamil_audio.mp3"
            })

    return {"items": items}


@app.post("/check-pronunciation")
async def check_pronunciation(
    file: UploadFile = File(...),
    correct_word: str = Form(...)
):

    if not file:
        raise HTTPException(status_code=400, detail="No audio file received")

    # save uploaded audio temporarily
    with tempfile.NamedTemporaryFile(delete=False) as temp_audio:
        content = await file.read()
        temp_audio.write(content)
        temp_audio_path = temp_audio.name

    try:

        print("File received:", file.filename)
        print("Correct word:", correct_word)

        segments, info = model.transcribe(
    temp_audio_path,
    language="ta",
    beam_size=5,
    vad_filter=True,
    temperature=0
)

        spoken_text = ""

        for segment in segments:
            spoken_text += segment.text

        spoken_text = spoken_text.strip()

        score = score_pronunciation(spoken_text, correct_word)

        # learning feedback
        if score >= 90:
            feedback = "Excellent!"
        elif score >= 75:
            feedback = "Great job!"
        elif score >= 60:
            feedback = "Almost there!"
        else:
            feedback = "Try again!"

        print("Spoken:", spoken_text)
        print("Score:", score)

        return {
            "spoken": spoken_text,
            "correct": correct_word,
            "score": score,
            "feedback": feedback
        }

    except Exception as e:
        print("Error:", e)
        raise HTTPException(status_code=400, detail="Audio processing failed")

    finally:
        os.remove(temp_audio_path)