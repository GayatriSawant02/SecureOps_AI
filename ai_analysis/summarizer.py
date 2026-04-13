def summarize_threats(threat_data: dict) -> dict:
    threats = threat_data.get("threats", [])
    totals = threat_data.get("totals", {})

    if not threats:
        summary = "No suspicious activity detected in the uploaded log file."
        findings = []
    else:
        summary_lines = [item.get("description", "Suspicious activity found.") for item in threats]
        summary = " ".join(summary_lines)
        findings = threats

    return {
        "summary": summary,
        "findings": findings,
        "metrics": totals,
    }
