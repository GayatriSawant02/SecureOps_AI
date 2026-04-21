from collections import Counter
import statistics
from datetime import datetime, timedelta

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


def detect_anomalies_ml(entries: list[dict]) -> list[dict]:
    """ML-based anomaly detection using statistical analysis."""
    if len(entries) < 10:  # Need minimum data for statistical analysis
        return []

    anomalies = []

    # Time-based anomaly detection
    time_anomalies = detect_time_based_anomalies(entries)
    anomalies.extend(time_anomalies)

    # Frequency-based anomaly detection
    frequency_anomalies = detect_frequency_anomalies(entries)
    anomalies.extend(frequency_anomalies)

    # Pattern-based anomaly detection
    pattern_anomalies = detect_pattern_anomalies(entries)
    anomalies.extend(pattern_anomalies)

    return anomalies


def detect_time_based_anomalies(entries: list[dict]) -> list[dict]:
    """Detect anomalies based on timing patterns."""
    anomalies = []

    # Parse timestamps and group by time windows
    timestamps = []
    for entry in entries:
        try:
            # Assume format like "2023-10-27 14:02:11"
            timestamp_str = entry.get("timestamp", entry.get("date", ""))
            if timestamp_str:
                # Extract hour for analysis
                hour = int(timestamp_str.split()[1].split(":")[0]) if len(timestamp_str.split()) > 1 else 0
                timestamps.append(hour)
        except (ValueError, IndexError):
            continue

    if len(timestamps) < 5:
        return anomalies

    # Detect unusual activity times (e.g., activity during off-hours)
    off_hours_activity = [t for t in timestamps if t < 6 or t > 22]  # Outside 6 AM - 10 PM

    if len(off_hours_activity) > len(timestamps) * 0.3:  # More than 30% off-hours activity
        anomalies.append({
            "type": "unusual_timing",
            "severity": "medium",
            "description": f"Unusual activity pattern detected: {len(off_hours_activity)} events during off-hours (before 6 AM or after 10 PM).",
            "confidence": min(len(off_hours_activity) / len(timestamps) * 100, 95)
        })

    return anomalies


def detect_frequency_anomalies(entries: list[dict]) -> list[dict]:
    """Detect anomalies based on frequency patterns."""
    anomalies = []

    # Analyze request frequency by IP
    ip_counts = Counter(entry.get("ip", "unknown") for entry in entries)
    if len(ip_counts) > 1:
        counts = list(ip_counts.values())
        mean_count = statistics.mean(counts)
        std_dev = statistics.stdev(counts) if len(counts) > 1 else 0

        # Find IPs with unusually high frequency (more than 2 standard deviations above mean)
        threshold = mean_count + (2 * std_dev)
        high_frequency_ips = [ip for ip, count in ip_counts.items() if count > threshold]

        for ip in high_frequency_ips:
            anomalies.append({
                "type": "high_frequency_activity",
                "severity": "high",
                "ip": ip,
                "description": f"IP {ip} shows unusually high activity ({ip_counts[ip]} requests) compared to average ({mean_count:.1f}).",
                "confidence": min((ip_counts[ip] - mean_count) / std_dev * 25, 95) if std_dev > 0 else 80
            })

    # Analyze action type distribution
    action_counts = Counter(entry.get("action", "unknown") for entry in entries)
    total_actions = sum(action_counts.values())

    for action, count in action_counts.items():
        percentage = (count / total_actions) * 100
        if percentage > 70:  # More than 70% of actions are the same type
            anomalies.append({
                "type": "monotonous_activity",
                "severity": "medium",
                "description": f"Unusually high concentration of '{action}' actions ({percentage:.1f}%) suggests automated activity.",
                "confidence": min(percentage - 50, 95)
            })

    return anomalies


def detect_pattern_anomalies(entries: list[dict]) -> list[dict]:
    """Detect anomalies based on behavioral patterns."""
    anomalies = []

    # Detect sequential failed logins (brute force patterns)
    failed_logins = [entry for entry in entries if entry.get("action") == "failed_login"]

    if len(failed_logins) >= 3:
        # Check for rapid sequential failures from same IP
        ip_sequences = {}
        for entry in failed_logins:
            ip = entry.get("ip", "unknown")
            if ip not in ip_sequences:
                ip_sequences[ip] = []
            ip_sequences[ip].append(entry)

        for ip, ip_entries in ip_sequences.items():
            if len(ip_entries) >= 5:  # At least 5 failed attempts
                # Check if they occurred within a short time window
                try:
                    timestamps = []
                    for entry in ip_entries:
                        timestamp_str = entry.get("timestamp", entry.get("date", ""))
                        if timestamp_str:
                            # Simple time parsing - in production, use proper datetime parsing
                            time_part = timestamp_str.split()[1] if len(timestamp_str.split()) > 1 else "00:00:00"
                            hour, minute, second = map(int, time_part.split(":"))
                            total_seconds = hour * 3600 + minute * 60 + second
                            timestamps.append(total_seconds)

                    if len(timestamps) >= 2:
                        time_diffs = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]
                        avg_time_diff = statistics.mean(time_diffs)

                        if avg_time_diff < 60:  # Less than 1 minute between attempts
                            anomalies.append({
                                "type": "rapid_brute_force",
                                "severity": "critical",
                                "ip": ip,
                                "description": f"Rapid sequential failed login attempts from {ip} (avg {avg_time_diff:.1f}s between attempts) indicate automated attack.",
                                "confidence": 90
                            })
                except (ValueError, IndexError):
                    continue

    # Detect unusual user agent patterns
    user_agents = [entry.get("user_agent", "") for entry in entries if entry.get("user_agent")]
    if user_agents:
        # Check for identical user agents (could indicate bot activity)
        ua_counts = Counter(user_agents)
        total_entries = len(user_agents)

        for ua, count in ua_counts.items():
            percentage = (count / total_entries) * 100
            if percentage > 50 and ua:  # More than 50% same user agent
                anomalies.append({
                    "type": "uniform_user_agent",
                    "severity": "medium",
                    "description": f"Unusually uniform user agent pattern: '{ua[:50]}...' appears in {percentage:.1f}% of requests.",
                    "confidence": min(percentage, 95)
                })

    return anomalies
