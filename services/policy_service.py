from database.collections import policies_collection

def get_policy():
    policy = policies_collection.find_one({})
    if not policy:
        # fallback default policy
        return {
            "max_amount": 50000,
            "required_documents": ["bill", "discharge_summary"]
        }
    return policy