from engine.rule_engine import validate_rules
from agent.claim_agent import ai_reasoning
from engine.decision_engine import make_decision
from rpa.uipath_client import execute_workflow

def run_agent(claim, policy):
    # Step 1: Rule check
    rule_result = validate_rules(claim, policy)

    # Step 2: AI reasoning
    ai_result = ai_reasoning(claim)

    # Step 3: Decision
    decision = make_decision(rule_result, ai_result)

    # Step 4: Execute action
    execute_workflow(decision["status"], claim)

    return decision