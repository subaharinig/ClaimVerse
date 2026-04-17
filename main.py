from fastapi import FastAPI
from api.claims import router as claim_router

app = FastAPI(title="ClaimVerse API")

app.include_router(claim_router, prefix="/claims", tags=["Claims"])


@app.get("/")
def root():
    return {"message": "ClaimVerse Backend Running 🚀"}