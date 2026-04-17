from models.claim import create_claim_model
from services.policy_service import get_policy
from agent.agent_controller import run_agent
from database.collections import claims_collection, decisions_collection

def process_claim(data):
    # Create claim
    claim = create_claim_model(data)

    # Store claim
    claims_collection.insert_one(claim)

    # Fetch policy
    policy = get_policy()

    # Run agent
    decision = run_agent(claim, policy)

    # Store decision
    decisions_collection.insert_one({
        "claim": claim,
        "decision": decision
    })

    return decision