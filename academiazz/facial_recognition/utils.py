# facial_recognition/utils.py

import insightface
import cv2
import numpy as np
from pinecone import Pinecone, ServerlessSpec
import os

def init_face_model():
    model = insightface.app.FaceAnalysis(name="buffalo_l")
    model.prepare(ctx_id=1) 
    return model

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

def get_face_embedding(img):
    model = init_face_model()
    faces = model.get(img)
    if len(faces) == 0:
        return None
    return faces[0].embedding

