from fastapi import APIRouter

router = APIRouter()

# Placeholder for RAG pipeline endpoint

@router.post("/query")
async def rag_query():
    return {"message": "Not implemented in MVP"}
