from dotenv import load_dotenv
import os
from pinecone import Pinecone, ServerlessSpec
import numpy as np


load_dotenv("../.env") 


api_key = os.getenv("PINECONE_API_KEY")
print(api_key)
pc = Pinecone(api_key=api_key)

# Create or connect to an index
index_name = "face-embeddings"

if index_name not in pc.list_indexes().names():
    pc.create_index(
        name=index_name,
        dimension=512,  # ArcFace embeddings
        metric="cosine",  # similarity metric
        spec=ServerlessSpec(cloud="aws", region="us-east-1")  # change region if needed
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

def store_embedding(index, user_id, embedding):
    index.upsert([(str(user_id), embedding.tolist())])
