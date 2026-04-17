ANALYSIS_PROMPT = """
You are an insurance claim analyst. Analyze the following claim data and extract key information:

Claim Type: {claim_type}
Claim Amount: {claim_amount}
Description: {description}

Identify:
1. Risk factors
2. Required documentation
3. Potential fraud indicators
4. Whether claim can be auto-processed
"""

DECISION_PROMPT = """
Based on the analysis, determine the appropriate action:
- APPROVE: Low risk, valid claim
- REJECT: High risk, invalid or fraudulent
- REVIEW: Needs human review
- MORE_INFO: Additional information required

Provide confidence score and reasoning.
"""

ESCALATION_PROMPT = """
This claim requires human review because:
{reasons}

Summarize key points for the claims adjuster.
"""