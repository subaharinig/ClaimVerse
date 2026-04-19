def validate_rules(claim, policy):
    """
    Rule-based validation layer for ClaimVerse.

    This is the SAFETY LAYER of the agentic system.
    It runs BEFORE any LLM reasoning.

    Returns:
        {
            "status": PASS | REJECT | REQUEST_INFO,
            "reason": str,
            "missing_fields": list (optional)
        }
    """

    # ----------------------------
    # 1. REQUIRED FIELD VALIDATION
    # ----------------------------
    required_fields = ["treatment", "amount", "documents"]

    missing_fields = [
        field for field in required_fields
        if field not in claim or claim[field] in [None, "", []]
    ]

    if missing_fields:
        return {
            "status": "REQUEST_INFO",
            "reason": f"Missing required fields: {', '.join(missing_fields)}",
            "missing_fields": missing_fields
        }

    # ----------------------------
    # 2. POLICY LIMIT VALIDATION
    # ----------------------------
    policy_limit = policy.get("policy_limit", float("inf"))

    if claim["amount"] > policy_limit:
        return {
            "status": "REJECT",
            "reason": "Claim amount exceeds policy limit"
        }

    # ----------------------------
    # 3. COVERED TREATMENT CHECK
    # ----------------------------
    covered_treatments = policy.get("covered_treatments", [])

    if claim["treatment"] not in covered_treatments:
        return {
            "status": "REJECT",
            "reason": "Treatment not covered under policy"
        }

    # ----------------------------
    # 4. DOCUMENT VALIDATION
    # ----------------------------
    required_docs = policy.get("required_documents", [])
    submitted_docs = claim.get("documents", [])

    missing_docs = [
        doc for doc in required_docs
        if doc not in submitted_docs
    ]

    if missing_docs:
        return {
            "status": "REQUEST_INFO",
            "reason": f"Missing required documents: {', '.join(missing_docs)}",
            "missing_documents": missing_docs
        }

    # ----------------------------
    # 5. PASSED ALL RULES
    # ----------------------------
    return {
        "status": "PASS",
        "reason": "All rule validations passed successfully"
    }