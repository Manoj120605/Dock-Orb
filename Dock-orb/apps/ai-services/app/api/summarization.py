from fastapi import APIRouter

router = APIRouter()

# Mock endpoints for MVP

@router.post("/conversation")
async def summarize_conversation():
    return {"summary": "Mock conversation summary."}

@router.post("/capsule")
async def summarize_capsule():
    return {"updates": {"history": {"completedTasks": []}}}
