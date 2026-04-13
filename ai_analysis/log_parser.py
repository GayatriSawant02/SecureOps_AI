import re

from .utils import clean_line, extract_ip, extract_timestamp, extract_username


def detect_action(line: str) -> str:
    lowercase = line.lower()
    if "failed password" in lowercase or "failed login" in lowercase or "authentication failure" in lowercase:
        return "failed_login"
    if "accepted password" in lowercase or "login success" in lowercase or "session opened" in lowercase:
        return "successful_login"
    if "invalid user" in lowercase or "unknown user" in lowercase:
        return "invalid_user"
    if "connection closed" in lowercase or "timeout" in lowercase:
        return "connection_issue"
    return "other"


def parse_log_text(raw_text: str) -> list[dict]:
    raw_text = raw_text or ""
    lines = raw_text.splitlines()
    parsed = []

    for line_number, line in enumerate(lines, start=1):
        cleaned = clean_line(line)
        if not cleaned:
            continue

        parsed.append({
            "line_number": line_number,
            "timestamp": extract_timestamp(cleaned),
            "ip": extract_ip(cleaned),
            "action": detect_action(cleaned),
            "user": extract_username(cleaned),
            "raw_line": cleaned,
        })

    return parsed
