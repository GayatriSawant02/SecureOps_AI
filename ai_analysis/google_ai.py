import logging
from typing import Optional

try:
    import google.generativeai as genai
except ImportError:  # pragma: no cover
    genai = None

LOGGER = logging.getLogger(__name__)


def generate_insight_summary(
    threat_data: dict,
    google_api_key: Optional[str] = None,
    model_name: str = "models/text-bison-001",
) -> Optional[str]:
    if not google_api_key or not genai:
        return None

    findings = threat_data.get("threats", [])
    totals = threat_data.get("totals", {})
    if not findings and not totals:
        return None

    prompt_lines = [
        "You are a security analysis assistant.",
        "Summarize the detected threats and recommend the most important next steps for a SOC analyst.",
        "Use the following threat details:",
        "- Total lines: {total_lines}".format(total_lines=totals.get("total_lines", 0)),
        "- Total unique IPs: {total_ips}".format(total_ips=totals.get("total_ips", 0)),
        "- Failed logins: {failed_logins}".format(failed_logins=totals.get("failed_logins", 0)),
        "- Successful logins: {successful_logins}".format(successful_logins=totals.get("successful_logins", 0)),
        "- Invalid users: {invalid_users}".format(invalid_users=totals.get("invalid_users", 0)),
        "Threat findings:",
    ]

    for item in findings:
        prompt_lines.append(
            f"* {item.get('type', 'unknown')} from {item.get('ip', 'unknown')} - {item.get('description', '')}"
        )

    prompt_lines.append("Provide a concise security summary and the top three remediation suggestions.")
    prompt = "\n".join(prompt_lines)

    try:
        genai.configure(api_key=google_api_key)
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)

        if hasattr(response, "text") and response.text:
            return response.text.strip()
        candidates = getattr(response, "candidates", None)
        if candidates:
            first = candidates[0]
            content = getattr(first, "content", None)
            if content:
                return content.strip()
    except Exception as exc:  # pragma: no cover
        LOGGER.warning("Google AI summary generation failed: %s", exc)

    return None


def generate_chat_response(
    message: str,
    context: dict = None,
    google_api_key: str = None,
    model_name: str = "models/text-bison-001",
) -> str:
    """Generate a chat response using Google Generative AI."""
    if not google_api_key or not genai:
        return "AI features are not configured. Please set GOOGLE_API_KEY to enable intelligent responses."

    context = context or {}

    # Build context-aware prompt
    prompt_lines = [
        "You are SecureOps AI, an advanced cybersecurity assistant.",
        "You help security analysts with threat detection, log analysis, and security recommendations.",
        "Always be helpful, concise, and focus on actionable security insights.",
        "",
        f"User message: {message}",
    ]

    # Add context if available
    if context.get("recent_threats"):
        prompt_lines.append(f"Recent threats: {context['recent_threats']}")

    if context.get("current_analysis"):
        prompt_lines.append(f"Current analysis context: {context['current_analysis']}")

    prompt_lines.append("")
    prompt_lines.append("Provide a helpful, security-focused response:")

    prompt = "\n".join(prompt_lines)

    try:
        genai.configure(api_key=google_api_key)
        model = genai.GenerativeModel(model_name)
        response = model.generate_content(prompt)

        if hasattr(response, "text") and response.text:
            return response.text.strip()
        candidates = getattr(response, "candidates", None)
        if candidates:
            first = candidates[0]
            content = getattr(first, "content", None)
            if content:
                return content.strip()
    except Exception as exc:
        LOGGER.warning("Google AI chat response generation failed: %s", exc)
        return "I apologize, but I'm having trouble generating a response right now. Please try again or contact support if the issue persists."

    return "I'm processing your request. Please wait for my analysis to complete."
