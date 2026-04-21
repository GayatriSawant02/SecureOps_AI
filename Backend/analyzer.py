from Backend.config import GOOGLE_API_KEY, GOOGLE_AI_MODEL
from ai_analysis.analyzer import analyze_logs as analyze_logs_internal


def analyze_logs(raw_text: str) -> dict:
    return analyze_logs_internal(
        raw_text,
        google_api_key=GOOGLE_API_KEY,
        google_model=GOOGLE_AI_MODEL,
    )


__all__ = ["analyze_logs"]
