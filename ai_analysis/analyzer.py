from .log_parser import parse_log_text
from .threat_detector import detect_threats
from .summarizer import summarize_threats


def analyze_logs(raw_text: str) -> dict:
    if not raw_text or not raw_text.strip():
        return {
            "summary": "No log content provided.",
            "findings": [],
            "metrics": {"total_lines": 0, "total_ips": 0}
        }

    parsed_entries = parse_log_text(raw_text)
    threat_data = detect_threats(parsed_entries)
    return summarize_threats(threat_data)
