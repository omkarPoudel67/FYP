from .embeddings import getembeddings
import os
from django.conf import settings
from langchain_community.vectorstores import FAISS
FAISS_DIR = os.path.join(settings.BASE_DIR, "faiss_indexes")


def retrieve_public_context(question: str, k: int = 8) -> str:
    PUBLIC_INDEX_PATH = os.path.join(FAISS_DIR, "public_knowledge")
    """
    Searches the public knowledge base FAISS index
    and returns the top k relevant chunks as a single string.
    """

    if not os.path.exists(PUBLIC_INDEX_PATH):
        return "Public knowledge base not found. Please index the documents first."

    vectorstore = FAISS.load_local(
        PUBLIC_INDEX_PATH,
        getembeddings(),
        allow_dangerous_deserialization=True
    )

    docs = vectorstore.similarity_search(question, k=k)

    if not docs:
        return "No relevant information found."

    context = "\n\n".join([doc.page_content for doc in docs])

    return context