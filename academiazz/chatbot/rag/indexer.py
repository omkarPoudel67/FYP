import os
from django.conf import settings
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from dotenv import load_dotenv

load_dotenv()


BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FAISS_DIR = os.path.join(BASE_DIR, "faiss_indexes")
MODULES_DIR = os.path.join(FAISS_DIR, "modules")

os.makedirs(MODULES_DIR, exist_ok=True)


EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
embeddings = None
_llm = None

def getembeddings():
    global embeddings
    if embeddings is None:
        print("Loading embedding model...")
        embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        print("Embedding model loaded")
    return embeddings

def get_llm():
    global _llm
    if _llm is None:
        _llm = ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model="openai/gpt-oss-120b",
            temperature=0.3
        )
    return _llm


def get_index_path(resource) -> str:

    return os.path.join(MODULES_DIR, f"resource_{resource.id}")


# ── Summarize a single chunk ───────────────────────────────────────────────
def summarize_chunk(chunk_text: str) -> str:
    llm = get_llm()
    prompt = f"""Summarize the following lecture content in 2-3 clear sentences.
Focus on the key concepts and topics covered.
Do not add any introduction like 'This chunk discusses...' just give the summary directly.

Content:
{chunk_text}"""

    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()



def summarize_resource(chunk_summaries: list[str]) -> str:
    """
    Takes all chunk summaries and combines them into
    one overall summary of the entire PDF.
    This is what the chatbot uses when student asks
    'what did we learn in week 3?'
    """
    llm = get_llm()
    combined = "\n\n".join(chunk_summaries)

    prompt = f"""Below are summaries of different sections of a lecture/tutorial/workshop PDF.
Combine them into one clear, well structured overall summary of what was covered.
Write it as if you are explaining to a student what they learned in this session.
Keep it under 200 words.

Section Summaries:
{combined}"""

    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()



def index_resource(resource):

    pdf_path = os.path.join(settings.MEDIA_ROOT, str(resource.file))

    if not os.path.exists(pdf_path):
        print(f"PDF not found: {pdf_path}")
        return

    loader = PyPDFLoader(pdf_path)
    pages = loader.load()

    if not pages:
        print(f"Could not extract content from: {pdf_path}")
        return

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(pages)

    if not chunks:
        print(f"No chunks extracted from: {pdf_path}")
        return

    download_url = f"{settings.MEDIA_URL}{resource.file}"

    print(f"Summarizing {len(chunks)} chunks for resource {resource.id}...")
    chunk_summaries = []

    for i, chunk in enumerate(chunks):
        print(f"  Summarizing chunk {i+1}/{len(chunks)}...")
        chunk_summary = summarize_chunk(chunk.page_content)
        chunk_summaries.append(chunk_summary)

        chunk.metadata.update({
            "resource_id"   : resource.id,
            "title"         : resource.title,
            "module"        : resource.module.name,
            "module_code"   : resource.module.code,
            "week"          : resource.week,
            "type"          : resource.type,
            "download_url"  : download_url,
            "chunk_summary" : chunk_summary,  
        })

    print(f"Building overall summary for resource {resource.id}...")
    overall_summary = summarize_resource(chunk_summaries)

    
    for chunk in chunks:
        chunk.metadata["overall_summary"] = overall_summary

   
    vectorstore = FAISS.from_documents(chunks, getembeddings())


    index_path = get_index_path(resource)
    vectorstore.save_local(index_path)
    print(f"Index saved for resource {resource.id} — {len(chunks)} chunks indexed")


def query_resource(resource, question: str, k: int = 4) -> dict:
    """
    Called every time a student asks a question.
    Loads the saved FAISS index and returns:
    - overall_summary (for general 'what did we learn' questions)
    - relevant chunk content (for specific questions)
    - metadata (download url, week, type etc)
    """

    index_path = get_index_path(resource)

   
    if not os.path.exists(index_path):
        print(f"Index not found for resource {resource.id}, building now...")
        index_resource(resource)


    vectorstore = FAISS.load_local(
        index_path,
        getembeddings(),
        allow_dangerous_deserialization=True
    )

  
    docs = vectorstore.similarity_search(question, k=k)

    if not docs:
        return {
            "overall_summary" : "No content found.",
            "chunk_content"   : "",
            "metadata"        : {}
        }

   
    metadata = docs[0].metadata
    overall_summary = metadata.get("overall_summary", "No summary available.")


    chunk_content = "\n\n".join([doc.page_content for doc in docs])

    return {
        "overall_summary" : overall_summary,  
        "chunk_content"   : chunk_content,    
        "metadata"        : metadata          
    }