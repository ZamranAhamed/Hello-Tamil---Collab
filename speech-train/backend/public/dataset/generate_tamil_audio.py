import os
import json
from gtts import gTTS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 🔥 ONLY THIS CATEGORY WILL RUN
TARGET_CATEGORY = "sentences"

def generate_audio():

    category_path = os.path.join(BASE_DIR, TARGET_CATEGORY)

    if not os.path.exists(category_path):
        print("❌ sentences folder not found")
        return

    print("📁 Processing:", TARGET_CATEGORY)

    for word in os.listdir(category_path):

        word_path = os.path.join(category_path, word)

        json_path = os.path.join(word_path, "word.json")
        audio_path = os.path.join(word_path, "tamil_audio.mp3")

        if not os.path.exists(json_path):
            continue

        # ✅ IMPORTANT: DO NOT overwrite old audio
        if os.path.exists(audio_path):
            print(f"⏩ Skipped (already exists): {word}")
            continue

        try:
            with open(json_path, encoding="utf-8") as f:
                data = json.load(f)

            tamil_text = data.get("tamil")

            if not tamil_text:
                continue

            print("🎤 Generating:", tamil_text)

            tts = gTTS(text=tamil_text, lang="ta")
            tts.save(audio_path)

            print("✅ Saved:", audio_path)

        except Exception as e:
            print("❌ Error:", e)

    print("🎉 SENTENCE AUDIO DONE")

if __name__ == "__main__":
    generate_audio()