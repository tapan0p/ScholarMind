from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
import faiss
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_core.tools import tool
from langchain_groq import ChatGroq
import os
import requests
import tempfile
from typing import Dict, List, Optional
from langchain_core.documents import Document
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize embedding model
embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Initialize LLM
llm = ChatGroq(model_name="llama3-70b-8192")

# Initialize vector store
vector_store_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vector_store")
os.makedirs(vector_store_path, exist_ok=True)

# Try to load existing vector store or create a new one
try:
    vectorstore = FAISS.load_local(vector_store_path, embedding_model,allow_dangerous_deserialization=True)
    print("Loaded existing vector store")
except Exception as e:
    print(f"Creating new vector store: {e}")
    # Create a dummy document to initialize the vector store
    dummy_doc = Document(page_content="Initialization document", metadata={"source": "init"})
    vectorstore = FAISS.from_documents([dummy_doc], embedding_model)
    vectorstore.save_local(vector_store_path)

# Create retriever
retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 4})

# Create RAG chain
rag_chain = RetrievalQA.from_chain_type(
    llm=llm,
    retriever=retriever,
    return_source_documents=True,
    chain_type="stuff"
)

def download_pdf(url: str) -> str:
    """Download a PDF from a URL and save it to a temporary file"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Create a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        temp_file_path = temp_file.name
        
        # Write the PDF content to the file
        with open(temp_file_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return temp_file_path
    except Exception as e:
        print(f"Error downloading PDF: {e}")
        return None

def process_pdf(file_path: str) -> bool:
    """Process a PDF file and replace the existing vector store with new document embeddings."""
    try:
        # Load PDF
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        # Split into chunks
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)

        # Create a new FAISS vector store from the chunks
        new_vectorstore = FAISS.from_documents(chunks, embedding_model)

        # Save the new vector store (overwrite existing one)
        new_vectorstore.save_local(vector_store_path)

        # Replace the global vectorstore and retriever
        global vectorstore, retriever, rag_chain
        vectorstore = new_vectorstore
        retriever = vectorstore.as_retriever(search_type="similarity", search_kwargs={"k": 4})
        rag_chain = RetrievalQA.from_chain_type(
            llm=llm,
            retriever=retriever,
            return_source_documents=True,
            chain_type="stuff"
        )

        return True
    except Exception as e:
        print(f"Error processing PDF: {e}")
        return False


def index_paper_from_url(url: str) -> bool:
    """Download and index a paper from a URL"""
    try:
        # Download the PDF
        pdf_path = download_pdf(url)
        if not pdf_path:
            return False
        
        # Process the PDF
        success = process_pdf(pdf_path)
        print(f"Processing result: {success}")
        # Clean up the temporary file
        try:
            os.unlink(pdf_path)
        except:
            pass
        
        return success
    except Exception as e:
        print(f"Error indexing paper: {e}")
        return False

@tool
def query_rag(query: str) -> str:
    """Query the RAG system with a question"""
    try:
        print("Tool called = query rag")
        result = rag_chain.invoke({"query": query})
        return result["result"]
    except Exception as e:
        return f"Error querying RAG: {e}"