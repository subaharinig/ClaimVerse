from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uuid

from backend.database.db import claims_collection, policies_collection, client
from backend.database.models import Claim, Policy, ClaimCreate, DecisionUpdate, PolicyCreate
from backend.agent.claim_agent import process_claim

app = FastAPI(
    title="ClaimVerse API",
    description="Agentic AI-powered Health Insurance Claim Processing System",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory fallback storage
IN_MEMORY_CLAIMS = []
IN_MEMORY_POLICIES = []


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize database indexes and connections"""
    try:
        if claims_collection is None:
            print("WARNING: MongoDB not connected - using in-memory storage")
        else:
            # Create indexes for better query performance
            await claims_collection.create_index([("id", 1)], unique=False)
            await claims_collection.create_index([("created_at", -1)])
            await claims_collection.create_index([("policy_number", 1)])
            await claims_collection.create_index([("status", 1)])
            print("MongoDB indexes created successfully")
    except Exception as e:
        print(f"Startup warning: {e}")

# ----------------------------
# 🚀 Submit Claim
# ----------------------------
@app.post("/api/v1/claims/")
async def submit_claim(claim_data: ClaimCreate):
    try:
        # Validate policy exists or create default
        if policies_collection is not None:
            policy = await policies_collection.find_one(
                {"policy_number": claim_data.policy_number}
            )

            if not policy:
                policy = {
                    "policy_number": claim_data.policy_number,
                    "policy_limit": 50000,
                    "covered_treatments": ["surgery", "consultation", "emergency", "diagnosis"],
                    "required_documents": ["invoice", "prescription"],
                    "active": True,
                    "created_at": datetime.now().isoformat()
                }
                await policies_collection.insert_one(policy)
            else:
                policy = Policy(**policy).dict()
        else:
            # In-memory fallback
            policy = next(
                (p for p in IN_MEMORY_POLICIES if p["policy_number"] == claim_data.policy_number),
                None
            )
            if not policy:
                policy = {
                    "policy_number": claim_data.policy_number,
                    "policy_limit": 50000,
                    "covered_treatments": ["surgery", "consultation", "emergency", "diagnosis"],
                    "required_documents": ["invoice", "prescription"],
                    "active": True
                }
                IN_MEMORY_POLICIES.append(policy)

        # Process through AI agent
        claim_dict = claim_data.dict()
        agent_result = process_claim(claim_dict, policy)

        final_output = agent_result.get("final_output", {})

        # Build claim object
        new_claim = {
            "id": str(uuid.uuid4())[:8],
            "policy_number": claim_data.policy_number,
            "patient_name": claim_data.patient_name,
            "treatment": claim_data.treatment,
            "amount": claim_data.amount,
            "hospital": claim_data.hospital,
            "documents": claim_data.documents or [],
            "description": claim_data.description,
            "status": final_output.get("status", "PENDING"),
            "created_at": datetime.now().isoformat(),
            "decision": final_output,
            "analysis": agent_result.get("analysis", {}),
            "rule_result": agent_result.get("rule_result", {})
        }

        # Store in MongoDB or memory
        if claims_collection is not None:
            result = await claims_collection.insert_one(new_claim)
            new_claim["_id"] = str(result.inserted_id)
        else:
            new_claim["_id"] = str(uuid.uuid4())
            IN_MEMORY_CLAIMS.insert(0, new_claim)

        return {
            "success": True,
            "data": new_claim
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# 📊 Get All Claims
# ----------------------------
@app.get("/api/v1/claims/")
async def get_claims(limit: int = 50, skip: int = 0):
    try:
        if claims_collection is not None:
            cursor = claims_collection.find().sort("created_at", -1).skip(skip).limit(limit)
            claims = await cursor.to_list(length=limit)

            # Convert ObjectId to string
            for claim in claims:
                claim["_id"] = str(claim["_id"])
        else:
            # In-memory fallback
            sorted_claims = sorted(IN_MEMORY_CLAIMS, key=lambda x: x["created_at"], reverse=True)
            claims = sorted_claims[skip:skip+limit]

        return {
            "success": True,
            "data": claims,
            "count": len(claims)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# 📄 Get Single Claim
# ----------------------------
@app.get("/api/v1/claims/{claim_id}")
async def get_claim(claim_id: str):
    try:
        if claims_collection is not None:
            claim = await claims_collection.find_one({"id": claim_id})

            if not claim:
                raise HTTPException(status_code=404, detail="Claim not found")

            claim["_id"] = str(claim["_id"])
        else:
            claim = next((c for c in IN_MEMORY_CLAIMS if c["id"] == claim_id), None)
            if not claim:
                raise HTTPException(status_code=404, detail="Claim not found")

        return {
            "success": True,
            "data": claim
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# ✏️ Update Claim (Admin)
# ----------------------------
@app.put("/api/v1/claims/{claim_id}")
async def update_claim(claim_id: str, update_data: DecisionUpdate):
    try:
        if claims_collection is not None:
            claim = await claims_collection.find_one({"id": claim_id})

            if not claim:
                raise HTTPException(status_code=404, detail="Claim not found")

            # Update fields
            update_dict = update_data.dict(exclude_unset=True)

            await claims_collection.update_one(
                {"id": claim_id},
                {"$set": update_dict}
            )

            # Fetch updated claim
            updated_claim = await claims_collection.find_one({"id": claim_id})
            updated_claim["_id"] = str(updated_claim["_id"])
        else:
            claim_idx = next((i for i, c in enumerate(IN_MEMORY_CLAIMS) if c["id"] == claim_id), None)
            if claim_idx is None:
                raise HTTPException(status_code=404, detail="Claim not found")

            update_dict = update_data.dict(exclude_unset=True)
            IN_MEMORY_CLAIMS[claim_idx].update(update_dict)
            updated_claim = IN_MEMORY_CLAIMS[claim_idx]

        return {
            "success": True,
            "data": updated_claim
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# 🗑️ Delete Claim
# ----------------------------
@app.delete("/api/v1/claims/{claim_id}")
async def delete_claim(claim_id: str):
    try:
        if claims_collection is not None:
            result = await claims_collection.delete_one({"id": claim_id})

            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Claim not found")
        else:
            idx = next((i for i, c in enumerate(IN_MEMORY_CLAIMS) if c["id"] == claim_id), None)
            if idx is None:
                raise HTTPException(status_code=404, detail="Claim not found")
            IN_MEMORY_CLAIMS.pop(idx)

        return {
            "success": True,
            "message": "Claim deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# 📊 Statistics
# ----------------------------
@app.get("/api/v1/stats/")
async def get_stats():
    try:
        if claims_collection is not None:
            total = await claims_collection.count_documents({})
            approved = await claims_collection.count_documents({"status": "APPROVED"})
            rejected = await claims_collection.count_documents({"status": "REJECTED"})
            pending = await claims_collection.count_documents({"status": "PENDING"})
            request_info = await claims_collection.count_documents({"status": "REQUEST_INFO"})
            return {
                "success": True,
                "data": {
                    "total": total,
                    "approved": approved,
                    "rejected": rejected,
                    "pending": pending,
                    "request_info": request_info
                }
            }
        else:
            total = len(IN_MEMORY_CLAIMS)
            approved = sum(1 for c in IN_MEMORY_CLAIMS if c.get("status") == "APPROVED")
            rejected = sum(1 for c in IN_MEMORY_CLAIMS if c.get("status") == "REJECTED")
            pending = sum(1 for c in IN_MEMORY_CLAIMS if c.get("status") == "PENDING")
            request_info = sum(1 for c in IN_MEMORY_CLAIMS if c.get("status") == "REQUEST_INFO")
            return {
                "success": True,
                "data": {
                    "total": total,
                    "approved": approved,
                    "rejected": rejected,
                    "pending": pending,
                    "request_info": request_info
                }
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}, claims_collection={claims_collection is not None}")
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# 🔍 Search Claims
# ----------------------------
@app.get("/api/v1/claims/search/")
async def search_claims(q: str = "", status: str = "", limit: int = 50):
    try:
        if claims_collection is not None:
            query = {}

            if q:
                query["$or"] = [
                    {"patient_name": {"$regex": q, "$options": "i"}},
                    {"policy_number": {"$regex": q, "$options": "i"}},
                    {"treatment": {"$regex": q, "$options": "i"}},
                    {"hospital": {"$regex": q, "$options": "i"}}
                ]

            if status:
                query["status"] = status.upper()

            cursor = claims_collection.find(query).sort("created_at", -1).limit(limit)
            claims = await cursor.to_list(length=limit)

            for claim in claims:
                claim["_id"] = str(claim["_id"])
        else:
            # In-memory search
            filtered = IN_MEMORY_CLAIMS

            if q:
                q_lower = q.lower()
                filtered = [
                    c for c in filtered
                    if q_lower in c.get("patient_name", "").lower()
                    or q_lower in c.get("policy_number", "").lower()
                    or q_lower in c.get("treatment", "").lower()
                    or q_lower in c.get("hospital", "").lower()
                ]

            if status:
                status_upper = status.upper()
                filtered = [c for c in filtered if c.get("status") == status_upper]

            claims = sorted(filtered, key=lambda x: x["created_at"], reverse=True)[:limit]

        return {
            "success": True,
            "data": claims
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# 📜 Policy Endpoints
# ----------------------------

@app.get("/api/v1/policies/{policy_number}")
async def get_policy(policy_number: str):
    try:
        if policies_collection is not None:
            policy = await policies_collection.find_one({"policy_number": policy_number})

            if not policy:
                raise HTTPException(status_code=404, detail="Policy not found")

            policy["_id"] = str(policy["_id"])
        else:
            policy = next((p for p in IN_MEMORY_POLICIES if p["policy_number"] == policy_number), None)
            if not policy:
                raise HTTPException(status_code=404, detail="Policy not found")

        return {
            "success": True,
            "data": policy
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/policies/")
async def create_policy(policy_data: PolicyCreate):
    try:
        # Check if exists
        if policies_collection is not None:
            existing = await policies_collection.find_one({"policy_number": policy_data.policy_number})
            if existing:
                raise HTTPException(status_code=400, detail="Policy already exists")
        else:
            existing = next((p for p in IN_MEMORY_POLICIES if p["policy_number"] == policy_data.policy_number), None)
            if existing:
                raise HTTPException(status_code=400, detail="Policy already exists")

        policy_dict = policy_data.dict()
        policy_dict["created_at"] = datetime.now().isoformat()

        if policies_collection is not None:
            result = await policies_collection.insert_one(policy_dict)
            policy_dict["_id"] = str(result.inserted_id)
        else:
            policy_dict["_id"] = str(uuid.uuid4())
            IN_MEMORY_POLICIES.append(policy_dict)

        return {
            "success": True,
            "data": policy_dict
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# ROOT
# ----------------------------
@app.get("/api/v1/claims/search/")
async def search_claims(q: str = "", status: str = "", limit: int = 50):
    try:
        query = {}

        if q:
            query["$or"] = [
                {"patient_name": {"$regex": q, "$options": "i"}},
                {"policy_number": {"$regex": q, "$options": "i"}},
                {"treatment": {"$regex": q, "$options": "i"}},
                {"hospital": {"$regex": q, "$options": "i"}}
            ]

        if status:
            query["status"] = status.upper()

        cursor = claims_collection.find(query).sort("created_at", -1).limit(limit)
        claims = await cursor.to_list(length=limit)

        for claim in claims:
            claim["_id"] = str(claim["_id"])

        return {
            "success": True,
            "data": claims
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# ROOT & HEALTH
# ----------------------------
@app.get("/")
def root():
    return {
        "message": "ClaimVerse API is running",
        "type": "Health Insurance Claim System",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    try:
        if client is not None:
            client.admin.command("ping")
            return {
                "status": "healthy",
                "database": "connected"
            }
        else:
            return {
                "status": "unhealthy",
                "database": "disconnected"
            }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }

@app.get("/api/v1/health")
async def api_health_check():
    return await health_check()
