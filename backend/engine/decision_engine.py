def make_decision(rule_result, ai_result):
    """
    Final decision engine:
    Rule Engine (hard safety) + AI Agent (reasoning)
    """

    # ----------------------------
    # 1. SAFE NORMALIZATION
    # ----------------------------
    rule_status = str(rule_result.get("status", "")).upper()
    rule_reason = rule_result.get("reason", "No rule reason")

    ai_decision = str(ai_result.get("decision", "REQUEST_INFO")).upper()
    ai_reason = ai_result.get("reason", "No AI reasoning")

    # 🧠 safe confidence parsing
    try:
        ai_confidence = float(ai_result.get("confidence", 0.5))
    except:
        ai_confidence = 0.5

    # clamp confidence (VERY IMPORTANT)
    ai_confidence = max(0.0, min(ai_confidence, 1.0))

    # normalize naming
    if ai_decision == "APPROVED":
        ai_decision = "APPROVE"
    if ai_decision == "REJECTED":
        ai_decision = "REJECT"

    # ----------------------------
    # 2. RULE ENGINE PRIORITY (HARD SAFETY)
    # ----------------------------
    if rule_status in ["REJECT", "REJECTED"]:
        return {
            "status": "REJECT",
            "reason": rule_reason,
            "confidence": 1.0,
            "source": "RULE_ENGINE"
        }

    if rule_status in ["REQUEST_INFO", "PENDING"]:
        return {
            "status": "REQUEST_INFO",
            "reason": rule_reason,
            "confidence": 1.0,
            "source": "RULE_ENGINE"
        }

    # ----------------------------
    # 3. AI CONFIDENCE SAFETY FILTER
    # ----------------------------
    if ai_confidence < 0.4:
        return {
            "status": "REQUEST_INFO",
            "reason": "Low AI confidence — manual review required",
            "confidence": ai_confidence,
            "source": "AI_AGENT"
        }

    # ----------------------------
    # 4. AI DECISION APPLICATION
    # ----------------------------
    if ai_decision == "APPROVE":
        return {
            "status": "APPROVED",
            "reason": ai_reason,
            "confidence": ai_confidence,
            "source": "AI_AGENT"
        }

    if ai_decision == "REJECT":
        return {
            "status": "REJECTED",
            "reason": ai_reason,
            "confidence": ai_confidence,
            "source": "AI_AGENT"
        }

    if ai_decision == "REQUEST_INFO":
        return {
            "status": "REQUEST_INFO",
            "reason": ai_reason,
            "confidence": ai_confidence,
            "source": "AI_AGENT"
        }

    # ----------------------------
    # 5. FINAL FALLBACK (SYSTEM SAFETY)
    # ----------------------------
    return {
        "status": "REQUEST_INFO",
        "reason": "Unrecognized AI decision — fallback triggered",
        "confidence": 0.5,
        "source": "FALLBACK_ENGINE"
    }