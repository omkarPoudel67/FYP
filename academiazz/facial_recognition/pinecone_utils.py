from dotenv import load_dotenv
import os
from pinecone import Pinecone, ServerlessSpec
import numpy as np


load_dotenv("../.env") 


api_key = os.getenv("PINECONE_API_KEY")
print(api_key)
pc = Pinecone(api_key=api_key)


index_name = "face-embeddings"

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=512,  # ArcFace embeddings
        metric="cosine",  # similarity metric
        spec=ServerlessSpec(cloud="aws", region="us-east-1")  
    )

# Connect to the index
index = pc.Index(index_name)
print("Index ready:", index_name)

def init_pinecone_index(api_key, index_name="face-embeddings", dimension=512, cloud="aws", region="us-east-1"):
    pc = Pinecone(api_key=api_key)
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name,
            dimension=dimension,
            metric="cosine",
            spec=ServerlessSpec(cloud=cloud, region=region)
        )
    return pc.Index(index_name)

def store_embedding(user_id, embedding):
    index.upsert([(str(user_id), embedding.tolist())])


def find_best_match(index, embedding, threshold=0.6):
    result = index.query(
        vector=embedding.tolist(),
        top_k=1
    )

    if not result["matches"]:
        return False, None, 0.0

    match = result["matches"][0]
    score = match["score"]

    if score >= threshold:
        return True, match["id"], score

    return False, None, score
