#!/usr/bin/env python3

import sys
import json
import cv2
import numpy as np
import time
from pathlib import Path


def analyze_drawing(image_path):

    if not Path(image_path).exists():
        raise Exception("Image not found")

    image = cv2.imread(image_path)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    _, thresh = cv2.threshold(gray,150,255,cv2.THRESH_BINARY_INV)

    h,w = thresh.shape

    # convert 255 -> 1
    binary = thresh/255

    # total ink
    ink = np.sum(binary)

    density = ink/(h*w)

    # vertical distribution
    vertical = np.sum(binary,axis=0)

    spacing_var = np.std(vertical)

    # horizontal distribution
    horizontal = np.sum(binary,axis=1)

    baseline_var = np.std(horizontal)

    # edge density
    edges = cv2.Canny(gray,50,150)

    edge_pixels = np.sum(edges>0)

    edge_density = edge_pixels/(h*w)

    # base scores
    spacingScore = 100 - spacing_var/8
    baselineScore = 100 - baseline_var/8
    consistencyScore = 100 - abs(edge_density-0.02)*4000

    # clamp
    spacingScore = max(30,min(100,spacingScore))
    baselineScore = max(30,min(100,baselineScore))
    consistencyScore = max(30,min(100,consistencyScore))

    # add variation based on image + time
    seed = int(ink + time.time()) % 1000
    np.random.seed(seed)

    spacingScore += np.random.randint(-8,8)
    baselineScore += np.random.randint(-8,8)
    consistencyScore += np.random.randint(-8,8)

    spacingScore = int(max(0,min(100,spacingScore)))
    baselineScore = int(max(0,min(100,baselineScore)))
    consistencyScore = int(max(0,min(100,consistencyScore)))

    overallScore = int((spacingScore + baselineScore + consistencyScore)/3)

    feedback = []

    if spacingScore < 70:
        feedback.append("Spacing between letters needs improvement")

    if baselineScore < 70:
        feedback.append("Letters are not aligned on baseline")

    if consistencyScore < 70:
        feedback.append("Stroke consistency needs improvement")

    if len(feedback)==0:
        feedback.append("Great job! Your handwriting looks good")

    return {
        "spacingScore":spacingScore,
        "baselineScore":baselineScore,
        "consistencyScore":consistencyScore,
        "overallScore":overallScore,
        "feedback":" ".join(feedback)
    }


def main():

    if len(sys.argv) < 2:
        print(json.dumps({"error":"Image path required"}))
        return

    image_path = sys.argv[1]

    result = analyze_drawing(image_path)

    print(json.dumps(result))


if __name__ == "__main__":
    main()