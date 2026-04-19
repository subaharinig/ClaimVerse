from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "claimverse")

client = None
db = None
claims_collection = None
policies_collection = None
logs_collection = None

try:
    client = AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    client.admin.command("ping")

    db = client[DB_NAME]
    claims_collection = db["claims"]
    policies_collection = db["policies"]
    logs_collection = db["logs"]

    print("MongoDB Connected")

except Exception as e:
    print("MongoDB Connection Failed:", e)