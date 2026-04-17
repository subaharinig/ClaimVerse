def execute_workflow(status, claim):
    print(f"🚀 Executing UiPath workflow for {status}")

    if status == "APPROVED":
        print("Approved workflow triggered")

    elif status == "REJECTED":
        print("Rejected workflow triggered")

    else:
        print("Request info workflow triggered")