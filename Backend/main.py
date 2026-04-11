from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Chatbot backend is running!"}

@app.get("/logs")
def get_logs():
    logs = []
    with open("dataset.log", "r") as file:
        for line in file:
            logs.append(line.strip())
    return {"total": len(logs), "logs": logs}

@app.get("/logs/failed")
def get_failed_logins():
    logs = []
    with open("dataset.log", "r") as file:
        for line in file:
            if "Failed password" in line:
                logs.append(line.strip())
    return {"total": len(logs), "failed_logins": logs}

@app.get("/logs/success")
def get_success_logins():
    logs = []
    with open("dataset.log", "r") as file:
        for line in file:
            if "Accepted password" in line:
                logs.append(line.strip())
    return {"total": len(logs), "successful_logins": logs}

@app.get("/logs/invalid")
def get_invalid_users():
    logs = []
    with open("dataset.log", "r") as file:
        for line in file:
            if "Invalid user" in line:
                logs.append(line.strip())
    return {"total": len(logs), "invalid_users": logs}

@app.get("/logs/summary")
def get_summary():
    all_logs = []
    failed = []
    success = []
    invalid = []
    with open("dataset.log", "r") as file:
        for line in file:
            line = line.strip()
            all_logs.append(line)
            if "Failed password" in line:
                failed.append(line)
            elif "Accepted password" in line:
                success.append(line)
            elif "Invalid user" in line:
                invalid.append(line)
    return {
        "total_logs": len(all_logs),
        "total_failed": len(failed),
        "total_success": len(success),
        "total_invalid": len(invalid),
        "failed_logins": failed,
        "successful_logins": success,
        "invalid_users": invalid
    }
