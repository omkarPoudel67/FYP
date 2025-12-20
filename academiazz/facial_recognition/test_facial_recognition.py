# facial_recognition/capture_and_store.py

import os
from facial_recognition.utils import init_face_model, read_image, get_face_embedding
from facial_recognition.pinecone_utils import init_pinecone_index, store_embedding


api_key = os.environ.get("PINECONE_API_KEY")

model = init_face_model()
index = init_pinecone_index(api_key)

SCRIPT_DIR = os.path.dirname(__file__)

img_path = os.path.join(SCRIPT_DIR, "face.jpg")

print (f"{img_path}")


img = read_image(img_path)  

embedding = get_face_embedding(model, img)
if embedding is None:
    print("No face detected!")
else:

    store_embedding(index, user_id="suyesh", embedding=embedding)
    print("Embedding stored successfully!")

