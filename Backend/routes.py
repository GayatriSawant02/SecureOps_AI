from flask import Blueprint, request, jsonify

from Backend.file_handler import read_uploaded_log
from Backend.analyzer import analyze_logs

api = Blueprint("api", __name__)

@api.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "message": "Backend healthy"})

@api.route("/upload", methods=["POST"])
def upload_log():
    uploaded_file = request.files.get("file")
    try:
        raw_text = read_uploaded_log(uploaded_file)
        analysis_result = analyze_logs(raw_text)
        return jsonify(analysis_result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception:
        return jsonify({"error": "Unable to process uploaded file."}), 500

@api.route("/analyze", methods=["POST"])
def analyze_text():
    payload = request.get_json(silent=True) or {}
    raw_text = payload.get("text", "")
    if not raw_text:
        return jsonify({"error": "Missing text to analyze."}), 400
    try:
        analysis_result = analyze_logs(raw_text)
        return jsonify(analysis_result)
    except Exception:
        return jsonify({"error": "Unable to analyze provided text."}), 500
