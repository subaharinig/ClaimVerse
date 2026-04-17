from datetime import datetime
from typing import Any, Dict, Optional
import json
import re

def format_currency(amount: float) -> str:
    return f"${amount:,.2f}"

def parse_date(date_string: str) -> Optional[datetime]:
    formats = ["%Y-%m-%d", "%m/%d/%Y", "%d-%m-%Y"]
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    return None

def sanitize_input(text: str) -> str:
    return re.sub(r'[<>]', '', text)

def validate_policy_number(policy_number: str) -> bool:
    return bool(re.match(r'^POL\d{3,6}$', policy_number))

def load_json_file(file_path: str) -> Dict[str, Any]:
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def format_response(success: bool, data: Any = None, message: str = "") -> Dict[str, Any]:
    return {
        "success": success,
        "data": data,
        "message": message
    }

def calculate_days_eligible(claim_date: str, policy_start: str) -> int:
    claim = parse_date(claim_date)
    policy = parse_date(policy_start)
    if claim and policy:
        return (claim - policy).days
    return 0