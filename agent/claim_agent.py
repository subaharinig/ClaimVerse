def ai_reasoning(claim):
    # mock AI logic
    if claim["amount"] > 40000:
        return {"risk": "HIGH"}
    return {"risk": "LOW"}