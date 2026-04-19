import os
from dotenv import load_dotenv

# ----------------------------
# 🌱 Load ENV
# ----------------------------
load_dotenv()


# ----------------------------
# ⚙️ CORE APP CONFIG
# ----------------------------
APP_NAME = "ClaimVerse"
APP_VERSION = "1.0.0"
API_PREFIX = "/api/v1"


# ----------------------------
# 🌐 CORS CONFIG
# ----------------------------
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")


# ----------------------------
# 🗄️ DATABASE CONFIG
# ----------------------------
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "claimverse")


# ----------------------------
# 🤖 LLM CONFIG
# ----------------------------
LLM_MODEL = os.getenv("LLM_MODEL", "phi3")

try:
    LLM_TEMPERATURE = float(os.getenv("LLM_TEMPERATURE", 0))
except:
    LLM_TEMPERATURE = 0.0


# ----------------------------
# 📊 FEATURE FLAGS
# ----------------------------
ENABLE_LOGGING = os.getenv("ENABLE_LOGGING", "true").lower() == "true"
ENABLE_RULE_ENGINE = os.getenv("ENABLE_RULE_ENGINE", "true").lower() == "true"
ENABLE_LLM_AGENT = os.getenv("ENABLE_LLM_AGENT", "true").lower() == "true"


# ----------------------------
# 🧠 HELPER: PRINT CONFIG (DEBUG)
# ----------------------------
def print_config():
    print("⚙️ ClaimVerse Config Loaded:")
    print(f"API_PREFIX: {API_PREFIX}")
    print(f"MONGO_URI: {MONGO_URI}")
    print(f"DB_NAME: {DB_NAME}")
    print(f"LLM_MODEL: {LLM_MODEL}")
    print(f"LLM_TEMPERATURE: {LLM_TEMPERATURE}")
    print(f"RULE_ENGINE: {ENABLE_RULE_ENGINE}")
    print(f"LLM_AGENT: {ENABLE_LLM_AGENT}")