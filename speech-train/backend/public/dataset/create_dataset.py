import os

dataset = {
"animals":["dog","cat","cow","goat","horse","elephant","lion","tiger","rabbit","monkey"],

"fruits":["apple","banana","mango","orange","grapes","pineapple","papaya","watermelon","guava","jackfruit"],

"vehicles":["car","bus","train","bicycle","motorbike","truck","van","boat","ship","airplane"],

"vegetables":["carrot","potato","onion","tomato","cabbage","cauliflower","cucumber","brinjal","pumpkin","beans"],

"family":["mother","father","brother","sister","baby","grandfather","grandmother","uncle","aunt","cousin"],

"letters":["a","aa","i","ii","u","uu","e","ee","ai","o"]
}

root="."

for category,items in dataset.items():

    for item in items:

        path=os.path.join(root,category,item)

        os.makedirs(path,exist_ok=True)

print("Dataset folders created successfully")