def validate_rules(claim, policy):
    if claim["amount"] > policy["max_amount"]:
        return {"status": "REJECTED", "reason": "Exceeds policy limit"}

    for doc in policy["required_documents"]:
        if doc not in claim["documents"]:
            return {"status": "NEED_INFO", "reason": f"Missing {doc}"}

    return {"status": "PASS"}