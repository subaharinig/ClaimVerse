def create_claim_model(data):
    return {
        "treatment": data.get("treatment"),
        "amount": data.get("amount"),
        "documents": data.get("documents", []),
    }