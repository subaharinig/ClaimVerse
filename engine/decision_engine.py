def make_decision(rule_result, ai_result):
    if rule_result["status"] == "REJECTED":
        return rule_result

    if rule_result["status"] == "NEED_INFO":
        return rule_result

    if ai_result["risk"] == "HIGH":
        return {"status": "NEED_INFO", "reason": "High risk claim"}

    return {"status": "APPROVED", "reason": "Valid claim"}