from .log_parser import parse_log_text
from .threat_detector import detect_threats, detect_anomalies_ml
from .summarizer import summarize_threats


def analyze_logs(raw_text: str, google_api_key: str = None, google_model: str = None) -> dict:
    if not raw_text or not raw_text.strip():
        return {
            "summary": "No log content provided.",
            "findings": [],
            "metrics": {"total_lines": 0, "total_ips": 0}
        }

    parsed_entries = parse_log_text(raw_text)
    threat_data = detect_threats(parsed_entries)

    # Add ML-based anomaly detection
    ml_anomalies = detect_anomalies_ml(parsed_entries)
    if ml_anomalies:
        # Merge ML anomalies with rule-based threats
        existing_findings = threat_data.get("threats", [])
        combined_findings = existing_findings + ml_anomalies
        threat_data["threats"] = combined_findings
        threat_data["ml_anomalies_detected"] = len(ml_anomalies)

    return summarize_threats(threat_data, google_api_key=google_api_key, google_model=google_model)
