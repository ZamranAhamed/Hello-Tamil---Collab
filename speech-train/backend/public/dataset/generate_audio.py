from gtts import gTTS
import os

root="."

for category in os.listdir(root):

    cat_path=os.path.join(root,category)

    if os.path.isdir(cat_path):

        for item in os.listdir(cat_path):

            try:

                tts=gTTS(text=item,lang="ta")

                audio_path=os.path.join(cat_path,item,"audio.mp3")

                tts.save(audio_path)

                print("created audio for",item)

            except:
                pass