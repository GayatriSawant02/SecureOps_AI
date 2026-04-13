import re
from collections import Counter

IP_PATTERN = re.compile(r"\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b")
TIMESTAMP_PATTERNS = [
    re.compile(r"^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}"),
    re.compile(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}"),
]
USERNAME_PATTERN = re.compile(r"for\s+([\w.@-]+)", re.IGNORECASE)


def clean_line(line: str) -> str:
    return line.strip()


def extract_ip(line: str) -> str:
    if not line:
        return "unknown"
    match = IP_PATTERN.search(line)
    return match.group(0) if match else "unknown"


def extract_timestamp(line: str) -> str:
    if not line:
        return "unknown"
    for pattern in TIMESTAMP_PATTERNS:
        match = pattern.search(line)
        if match:
            return match.group(0)
    return "unknown"


def extract_username(line: str) -> str:
    if not line:
        return "unknown"
    match = USERNAME_PATTERN.search(line)
    return match.group(1) if match else "unknown"


def group_by_field(entries: list[dict], field: str, action: str = None) -> Counter:
    counts = Counter()
    for entry in entries:
        if action and entry.get("action") != action:
            continue
        key = entry.get(field) or "unknown"
        counts[key] += 1
    return counts
