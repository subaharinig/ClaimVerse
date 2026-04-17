from fastapi import APIRouter
from services.claim_service import process_claim

router = APIRouter()

@router.post("/")
def submit_claim(claim: dict):
    result = process_claim(claim)
    return result