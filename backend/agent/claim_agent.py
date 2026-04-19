import json
import re
import logging

from backend.engine.rule_engine import validate_rules
from backend.engine.decision_engine import make_decision
from backend.agent.prompts import ANALYSIS_PROMPT, DECISION_PROMPT

from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate


# ----------------------------
# 📊 LOGGING SETUP
# ----------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("claimverse")


# ----------------------------
# 🧠 ROBUST JSON EXTRACTOR
# ----------------------------
def extract_json(text: str):
    """
    Robust JSON extractor for LLM outputs
    Handles:
    - markdown blocks
    - extra explanation text
    - malformed outputs
    """

    if not text:
        return None

    text = text.strip()

    # remove markdown code blocks
    text = re.sub(r"```json", "", text)
    text = re.sub(r"```", "", text)

    # 1️⃣ direct parse attempt
    try:
        return json.loads(text)
    except:
        pass

    # 2️⃣ extract largest JSON block
    try:
        start = text.find("{")
        end = text.rfind("}")

        if start != -1 and end != -1 and end > start:
            candidate = text[start:end + 1]
            return json.loads(candidate)

    except Exception as e:
        logger.error(f"JSON extraction error: {e}")

    return None


# ----------------------------
# 🧾 SCHEMA VALIDATION
# ----------------------------
def validate_analysis_schema(data):
    required = [
        "risk_level",
        "coverage_valid",
        "missing_documents",
        "fraud_suspected",
        "auto_process"
    ]
    return isinstance(data, dict) and all(k in data for k in required)


def validate_decision_schema(data):
    required = ["decision", "reason", "confidence"]
    return isinstance(data, dict) and all(k in data for k in required)


# ----------------------------
# 🤖 LLM INIT
# ----------------------------
llm = ChatOllama(
    model="phi3",
    temperature=0,
    base_url="http://localhost:11434",
    timeout=60
)


# ----------------------------
# 🧠 STEP 1: ANALYSIS AGENT
# ----------------------------
def run_analysis(claim, policy):
    try:
        prompt = ChatPromptTemplate.from_template(
            ANALYSIS_PROMPT + "\n\nIMPORTANT: Return ONLY valid JSON. No explanation. No markdown."
        )

        chain = prompt | llm

        response = chain.invoke({
            "claim_type": claim.get("treatment"),
            "claim_amount": claim.get("amount"),
            "description": json.dumps(claim),
            "policy": json.dumps(policy)
        })

        raw = response.content.strip()
        logger.info(f"🧠 ANALYSIS RAW: {raw}")

        parsed = extract_json(raw)

        if not parsed or not validate_analysis_schema(parsed):
            raise ValueError("Invalid analysis JSON structure")

        return parsed

    except Exception as e:
        logger.error(f"❌ ANALYSIS ERROR: {e}")

        return {
            "risk_level": "MEDIUM",
            "coverage_valid": False,
            "missing_documents": [],
            "fraud_suspected": False,
            "auto_process": False,
            "notes": "analysis failed"
        }


# ----------------------------
# 🎯 STEP 2: DECISION AGENT
# ----------------------------
def run_decision(analysis_json):
    try:
        prompt = ChatPromptTemplate.from_template(
            DECISION_PROMPT + "\n\nIMPORTANT: Return ONLY valid JSON. No explanation. No markdown."
        )

        chain = prompt | llm

        response = chain.invoke({
            "analysis": json.dumps(analysis_json)
        })

        raw = response.content.strip()
        logger.info(f"🎯 DECISION RAW: {raw}")

        parsed = extract_json(raw)

        if not parsed or not validate_decision_schema(parsed):
            raise ValueError("Invalid decision JSON structure")

        return parsed

    except Exception as e:
        logger.error(f"❌ DECISION ERROR: {e}")

        return {
            "decision": "REQUEST_INFO",
            "reason": "Decision generation failed",
            "confidence": 0.5
        }


# ----------------------------
# ⚖️ RULE ENGINE
# ----------------------------
def run_rules(claim, policy):
    return validate_rules(claim, policy)


# ----------------------------
# 🔀 MERGE ENGINE
# ----------------------------
def merge_outputs(rule_result, llm_result):
    return make_decision(rule_result, llm_result)


# ----------------------------
# 🚀 MAIN AGENT PIPELINE
# ----------------------------
def process_claim(claim: dict, policy: dict = None):

    if policy is None:
        policy = {}

    try:
        # 1️⃣ RULE ENGINE FIRST (hard stop logic)
        rule_result = run_rules(claim, policy)
        logger.info(f"⚖️ RULE RESULT: {rule_result}")

        if rule_result["status"] in ["REJECT", "REQUEST_INFO"]:
            return {
                "final_output": {
                    "status": rule_result["status"],
                    "reason": rule_result["reason"],
                    "confidence": 1.0,
                    "source": "RULE_ENGINE"
                }
            }

        # 2️⃣ LLM ANALYSIS
        analysis_json = run_analysis(claim, policy)

        # 3️⃣ LLM DECISION
        llm_decision = run_decision(analysis_json)

        # 4️⃣ FINAL MERGE
        final_result = merge_outputs(rule_result, llm_decision)

        return {
            "claim_id": claim.get("id"),
            "rule_result": rule_result,
            "analysis": analysis_json,
            "llm_decision": llm_decision,
            "final_output": final_result
        }

    except Exception as e:
        logger.error(f"❌ AGENT CRITICAL ERROR: {e}")

        return {
            "final_output": {
                "status": "REQUEST_INFO",
                "reason": "Critical agent failure",
                "confidence": 0.5,
                "source": "SYSTEM"
            }
        }