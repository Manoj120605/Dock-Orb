from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from ..services.embedding_service import embedding_service
from ..services.qdrant_service import qdrant_service

router = APIRouter()

class EmbedRequest(BaseModel):
    text: str

class EmbedBatchRequest(BaseModel):
    texts: List[str]

class IndexRequest(BaseModel):
    workspace_id: str
    capsule_id: str
    chunks: List[Dict[str, Any]] # {"id": "...", "text": "...", "metadata": {...}}

class SearchRequest(BaseModel):
    workspace_id: str
    query: str
    limit: int = 5
    capsule_id: Optional[str] = None

@router.post("/generate")
async def generate_embedding(req: EmbedRequest):
    embedding = embedding_service.embed_text(req.text)
    return {"embedding": embedding}

@router.post("/index")
async def index_capsule(req: IndexRequest):
    try:
        texts = [chunk["text"] for chunk in req.chunks]
        ids = [chunk.get("id") for chunk in req.chunks]
        payloads = []
        
        for chunk in req.chunks:
            payload = chunk.get("metadata", {})
            payload.update({
                "workspace_id": req.workspace_id,
                "capsule_id": req.capsule_id,
                "text": chunk["text"]
            })
            payloads.append(payload)

        embeddings = embedding_service.embed_batch(texts)
        qdrant_service.upsert_vectors("capsules", ids, embeddings, payloads)
        
        return {"success": True, "indexed": len(texts)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/search")
async def search_capsules(req: SearchRequest):
    try:
        query_vector = embedding_service.embed_text(req.query)
        
        # We would add filter for workspace_id and capsule_id here
        # Simplified for MVP
        
        results = qdrant_service.search("capsules", query_vector, req.limit)
        
        return {
            "results": [
                {
                    "id": str(res.id),
                    "score": res.score,
                    "payload": res.payload
                }
                for res in results
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
