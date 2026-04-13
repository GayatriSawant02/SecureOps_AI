from collections import Counter

from .rules import (
    FAILED_LOGIN_THRESHOLD,
    INVALID_USER_THRESHOLD,
    MINIMUM_ENTRIES_FOR_ANALYSIS,
    SUSPICIOUS_REQUEST_THRESHOLD,
)
from .utils import group_by_field


def detect_threats(entries: list[dict]) -> dict:
    if not entries:
        return {
            "entries": [],
            "totals": {
                "total_lines": 0,
                "total_ips": 0,
                "failed_logins": 0,
                "successful_logins": 0,
                "invalid_users": 0,
            },
            "threats": [],
        }

    ip_list = [entry.get("ip") or "unknown" for entry in entries]
    unique_ips = set(ip_list)
    action_counts = Counter(entry.get("action") for entry in entries)

    totals = {
        "total_lines": len(entries),
        "total_ips": len(unique_ips),
        "failed_logins": action_counts.get("failed_login", 0),
        "successful_logins": action_counts.get("successful_login", 0),
        "invalid_users": action_counts.get("invalid_user", 0),
    }

    threats = []
    failed_by_ip = group_by_field(entries, "ip", action="failed_login")
    invalid_by_ip = group_by_field(entries, "ip", action="invalid_user")
    request_by_ip = group_by_field(entries, "ip")

    for ip, count in failed_by_ip.items():
        if count >= FAILED_LOGIN_THRESHOLD:
            threats.append({
                "type": "brute_force",
                "ip": ip,
                "count": count,
                "description": f"{count} failed login attempts detected from {ip}.",
            })

    for ip, count in request_by_ip.items():
        if count >= SUSPICIOUS_REQUEST_THRESHOLD:
            threats.append({
                "type": "high_traffic",
                "ip": ip,
                "count": count,
                "description": f"{count} total requests from {ip} suggest unusually high activity.",
            })

    for ip, count in invalid_by_ip.items():
        if count >= INVALID_USER_THRESHOLD:
            threats.append({
                "type": "invalid_user_activity",
                "ip": ip,
                "count": count,
                "description": f"{count} invalid user events from {ip} may indicate credential scanning.",
            })

    if not threats and len(entries) < MINIMUM_ENTRIES_FOR_ANALYSIS:
        threats.append({
            "type": "low_data",
            "description": "The log file contains too few entries for a reliable threat assessment.",
        })

    return {"entries": entries, "totals": totals, "threats": threats}
