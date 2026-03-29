import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FAISS_DIR = os.path.join(BASE_DIR, "faiss_indexes")
MODULES_DIR = os.path.join(FAISS_DIR, "modules")
ANNOUNCEMENTS_DIR = os.path.join(FAISS_DIR, "announcements")

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
_embeddings = None

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        print("Loading embedding model...")
        _embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL
        )
        print("Embedding model loaded")
    return _embeddings