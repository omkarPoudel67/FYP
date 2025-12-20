# facial_recognition/utils.py

import insightface
import cv2
import numpy as np
from pinecone import Pinecone, ServerlessSpec
import os

# 1. Initialize InsightFace model (run once)
def init_face_model():
    model = insightface.app.FaceAnalysis(name="buffalo_l")
    model.prepare(ctx_id=0)  # 0 = GPU, -1 = CPU
    return model

# 2. Capture image from file or webcam
def read_image(image_path=None, from_webcam=False):
    if from_webcam:
        cap = cv2.VideoCapture(0)
        ret, img = cap.read()
        cap.release()
        if not ret:
            raise Exception("Failed to capture image from webcam")
        return img
    else:
        img = cv2.imread(image_path)
        if img is None:
            raise Exception(f"Failed to read image from {image_path}")
        return img

# 3. Extract embedding from image
def get_face_embedding(model, img):
    faces = model.get(img)
    if len(faces) == 0:
        return None
    return faces[0].embedding

