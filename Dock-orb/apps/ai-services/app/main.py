from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import embeddings, summarization, intent, rag
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Capsule AI - AI Services",
    description="Python sidecar for ML operations (Embeddings, RAG, Intent Detection)",
    version="0.1.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(embeddings.router, prefix="/api/v1/embeddings", tags=["Embeddings"])
app.include_router(summarization.router, prefix="/api/v1/summarize", tags=["Summarization"])
app.include_router(intent.router, prefix="/api/v1/intent", tags=["Intent"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["RAG"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-services"}
