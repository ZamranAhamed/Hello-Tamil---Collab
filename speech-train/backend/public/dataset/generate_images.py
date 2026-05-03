import os
import requests

root="."

def download_image(word, path):

    url=f"https://source.unsplash.com/400x400/?cartoon,{word}"

    img=requests.get(url).content

    with open(path,"wb") as f:
        f.write(img)


for category in os.listdir(root):

    cat_path=os.path.join(root,category)

    if os.path.isdir(cat_path):

        for item in os.listdir(cat_path):

            image_path=os.path.join(cat_path,item,"image.png")

            try:

                download_image(item,image_path)

                print("image downloaded for",item)

            except:
                print("failed",item)