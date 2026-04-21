from .google_ai import generate_insight_summary


def summarize_threats(
    threat_data: dict,
    google_api_key: str = None,
    google_model: str = None,
) -> dict:
    threats = threat_data.get("threats", [])
    totals = threat_data.get("totals", {})

    if not threats:
        summary = "No suspicious activity detected in the uploaded log file."
        findings = []
    else:
        summary_lines = [item.get("description", "Suspicious activity found.") for item in threats]
        summary = " ".join(summary_lines)
        findings = threats

    if google_api_key:
        ai_summary = generate_insight_summary(
            threat_data,
            google_api_key=google_api_key,
            model_name=google_model,
        )
        if ai_summary:
            summary = f"{summary} {ai_summary}" if summary else ai_summary

    return {
        "summary": summary,
        "findings": findings,
        "metrics": totals,
    }
