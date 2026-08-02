from fastapi import APIRouter

router = APIRouter()

# Mock endpoints for MVP

@router.post("/classify")
async def classify_intent():
    # In reality, this would use a small local model to classify the user's message
    return {"intent": "general", "confidence": 0.8}
