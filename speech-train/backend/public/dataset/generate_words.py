import os
import json

translations = {

# Animals
"dog":("நாய்","බල්ලා"),
"cat":("பூனை","බළලා"),
"cow":("மாடு","ගවයා"),
"goat":("ஆடு","එළු"),
"horse":("குதிரை","අශ්වයා"),
"elephant":("யானை","අලියා"),
"lion":("சிங்கம்","සිංහයා"),
"tiger":("புலி","කොටියා"),
"rabbit":("முயல்","හාවා"),
"monkey":("குரங்கு","වඳුරා"),

# Fruits
"apple":("ஆப்பிள்","ඇපල්"),
"banana":("வாழை","කෙසෙල්"),
"mango":("மாம்பழம்","අඹ"),
"orange":("ஆரஞ்சு","දොඩම්"),
"grapes":("திராட்சை","දෙළුම්"),
"pineapple":("அன்னாசி","අන්නාසි"),
"papaya":("பப்பாளி","පපොල්"),
"watermelon":("தர்பூசணி","තරබුස්"),
"guava":("கொய்யா","පේර"),
"jackfruit":("பலா","කොස්"),

# Vegetables
"carrot":("காரட்","ගජරු"),
"potato":("உருளைக்கிழங்கு","අර්තාපල්"),
"onion":("வெங்காயம்","ලූණු"),
"tomato":("தக்காளி","තක්කාලි"),
"cabbage":("முட்டைக்கோஸ்","ගෝවා"),
"cauliflower":("பூக்கோஸ்","මල් ගෝවා"),
"cucumber":("வெள்ளரிக்காய்","පිපිඤ්ඤා"),
"brinjal":("கத்திரிக்காய்","වම්බටු"),
"pumpkin":("பூசணி","වට්ටක්කා"),
"beans":("பீன்ஸ்","බෝංචි"),

# Vehicles
"car":("கார்","කාර්"),
"bus":("பஸ்","බස්"),
"train":("ரயில்","දුම්රිය"),
"bicycle":("மிதிவண்டி","බයිසිකලය"),
"motorbike":("மோட்டார் சைக்கிள்","මෝටර් බයිසිකලය"),
"truck":("லாரி","ලොරි"),
"van":("வேன்","වෑන්"),
"boat":("படகு","බෝට්ටුව"),
"ship":("கப்பல்","නෞකාව"),
"airplane":("விமானம்","ගුවන් යානය"),

# Family
"mother":("அம்மா","අම්මා"),
"father":("அப்பா","තාත්තා"),
"brother":("அண்ணன்","අයියා"),
"sister":("அக்கா","අක්කා"),
"baby":("குழந்தை","බබා"),
"grandfather":("தாத்தா","සීයා"),
"grandmother":("பாட்டி","අච්චි"),
"uncle":("மாமா","මාමා"),
"aunt":("மாமி","නැන්දා"),
"cousin":("சகோதரப்பிள்ளை","මචං"),

# Letters
"a":("அ","අ"),
"aa":("ஆ","ආ"),
"i":("இ","ඉ"),
"ii":("ஈ","ඊ"),
"u":("உ","උ"),
"uu":("ஊ","ඌ"),
"e":("எ","එ"),
"ee":("ஏ","ඒ"),
"ai":("ஐ","ඓ"),
"o":("ஒ","ඔ")
}

root="."

for category in os.listdir(root):

    cat_path=os.path.join(root,category)

    if os.path.isdir(cat_path):

        for item in os.listdir(cat_path):

            if item in translations:

                tamil,sinhala = translations[item]

                data={
                    "english":item,
                    "tamil":tamil,
                    "sinhala":sinhala
                }

                file_path=os.path.join(cat_path,item,"word.json")

                with open(file_path,"w",encoding="utf-8") as f:
                    json.dump(data,f,ensure_ascii=False,indent=4)

                print("created word file for",item)