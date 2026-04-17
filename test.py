from services.claim_service import process_claim

test_claim = {
    "treatment": "Appendix Surgery",
    "amount": 45000,
    "documents": ["bill"]
}

result = process_claim(test_claim)

print("\n🎯 FINAL DECISION:")
print(result)