import cv2
import numpy as np
import base64
import sys
import json

# receive base64 image from Node
base64_image = sys.argv[1]

# decode base64 image
image_bytes = base64.b64decode(base64_image)
nparr = np.frombuffer(image_bytes, np.uint8)

image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

# resize for consistent processing
image = cv2.resize(image, (600, 200))

# convert to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# reduce noise
blur = cv2.GaussianBlur(gray, (5,5), 0)

# adaptive threshold (better for handwriting)
thresh = cv2.adaptiveThreshold(
    blur,
    255,
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
    cv2.THRESH_BINARY_INV,
    11,
    2
)

# morphological operation to clean noise
kernel = np.ones((3,3), np.uint8)
morph = cv2.morphologyEx(
    thresh,
    cv2.MORPH_OPEN,
    kernel
)

# detect contours (letters)
contours,_ = cv2.findContours(
    morph,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)

letters = []

for c in contours:

    x,y,w,h = cv2.boundingRect(c)

    if w>10 and h>15:
        letters.append((x,y,w,h))

# sort letters left to right
letters = sorted(letters, key=lambda b:b[0])

# draw bounding boxes for visualization
annotated = image.copy()

for x,y,w,h in letters:
    cv2.rectangle(
        annotated,
        (x,y),
        (x+w,y+h),
        (0,255,0),
        2
    )

# calculate spacing
gaps = []

for i in range(len(letters)-1):

    x1,y1,w1,h1 = letters[i]
    x2,y2,w2,h2 = letters[i+1]

    gap = x2 - (x1+w1)
    gaps.append(gap)

spacing = int(np.mean(gaps)) if gaps else 0

# baseline alignment
bottoms = [y+h for x,y,w,h in letters]

baseline = int(np.std(bottoms)) if bottoms else 0

# height consistency
heights = [h for x,y,w,h in letters]

consistency = int(np.std(heights)) if heights else 0

overall = int((spacing + baseline + consistency)/3)

# convert images to base64 for frontend

def encode_image(img):

    _, buffer = cv2.imencode('.png', img)
    return base64.b64encode(buffer).decode()

processed_base64 = encode_image(morph)
annotated_base64 = encode_image(annotated)

result = {
    "spacingScore": spacing,
    "baselineScore": baseline,
    "letterConsistencyScore": consistency,
    "overallScore": overall,
    "processedImage": processed_base64,
    "annotatedImage": annotated_base64
}

print(json.dumps(result))