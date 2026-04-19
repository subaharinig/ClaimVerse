from pydantic import BaseModel, Field, validator
from typing import List, Optional
from datetime import datetime


# ----------------------------
# 🧾 CLAIM MODELS
# ----------------------------

class Claim(BaseModel):
    """Full Claim Model (DB)"""
    id: Optional[str] = None

    policy_number: str
    patient_name: str
    treatment: str
    amount: float
    hospital: str

    documents: List[str] = []
    description: Optional[str] = None
    created_at: Optional[str] = None

    status: Optional[str] = "PENDING"
    decision: Optional[dict] = {}
    analysis: Optional[dict] = {}
    rule_result: Optional[dict] = {}


class ClaimCreate(BaseModel):
    """Claim Submission Request"""
    policy_number: str = Field(..., min_length=1, description="Insurance policy number")
    patient_name: str = Field(..., min_length=1, description="Patient full name")
    treatment: str = Field(..., min_length=1, description="Type of treatment/surgery")
    amount: float = Field(..., gt=0, description="Claim amount in USD")
    hospital: str = Field(..., min_length=1, description="Hospital/clinic name")
    documents: List[str] = Field(default=[], description="List of document URLs/names")
    description: Optional[str] = Field(None, description="Detailed description of treatment")

    class Config:
        schema_extra = {
            "example": {
                "policy_number": "POL101",
                "patient_name": "John Doe",
                "treatment": "Surgery",
                "amount": 15000.00,
                "hospital": "City General Hospital",
                "documents": ["invoice.pdf", "report.pdf"],
                "description": "Appendectomy surgery"
            }
        }


class ClaimUpdate(BaseModel):
    """Partial Claim Update"""
    status: Optional[str] = None
    description: Optional[str] = None
    documents: Optional[List[str]] = None
    decision: Optional[dict] = None

    class Config:
        arbitrary_types_allowed = True


class DecisionUpdate(BaseModel):
    """Decision Update for Admin"""
    status: Optional[str] = Field(None, description="APPROVED, REJECTED, REQUEST_INFO, PENDING")
    decision: Optional[dict] = None
    notes: Optional[str] = None


class ClaimResponse(BaseModel):
    """Single Claim Response"""
    success: bool
    data: Claim


class ClaimsListResponse(BaseModel):
    """Multiple Claims Response"""
    success: bool
    data: List[Claim]
    count: Optional[int] = None


# ----------------------------
# 📜 POLICY MODEL
# ----------------------------
class Policy(BaseModel):
    policy_number: str
    policy_limit: float
    covered_treatments: List[str]
    required_documents: List[str]
    active: bool = True
    created_at: Optional[str] = None


class PolicyCreate(BaseModel):
    """Create Policy Request"""
    policy_number: str
    policy_limit: float
    covered_treatments: List[str]
    required_documents: List[str]
    active: bool = True


# ----------------------------
# 🎯 DECISION MODEL
# ----------------------------
class Decision(BaseModel):
    claim_id: str
    status: str   # APPROVE / REJECT / REQUEST_INFO / PENDING
    reason: str
    confidence: float = Field(ge=0, le=1)
    source: Optional[str] = None


# ----------------------------
# 📊 ANALYSIS MODEL (Agent Output)
# ----------------------------
class ClaimAnalysis(BaseModel):
    risk_level: str
    coverage_valid: bool
    missing_documents: List[str]
    fraud_suspected: bool
    auto_process: bool
    notes: str


class AgentOutput(BaseModel):
    rule_result: dict
    analysis: ClaimAnalysis
    llm_decision: dict
    final_output: dict


# ----------------------------
# 📈 STATS MODEL
# ----------------------------
class Stats(BaseModel):
    total: int
    approved: int
    rejected: int
    pending: int
    request_info: int


class StatsResponse(BaseModel):
    success: bool
    data: Stats


# ----------------------------
# 🔍 SEARCH MODEL
# ----------------------------
class SearchParams(BaseModel):
    q: Optional[str] = ""
    status: Optional[str] = ""
    limit: int = 50

    @validator("status")
    def validate_status(cls, v):
        if v and v.upper() not in ["APPROVED", "REJECTED", "PENDING", "REQUEST_INFO"]:
            raise ValueError("Invalid status")
        return v.upper() if v else v
