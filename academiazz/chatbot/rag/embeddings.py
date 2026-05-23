from langchain_huggingface import HuggingFaceEmbeddings

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
embeddings = None

def getembeddings():
    global embeddings
    if embeddings is None:
        print("Loading embedding model...")
        embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        print("Embedding model loaded")
    return embeddings