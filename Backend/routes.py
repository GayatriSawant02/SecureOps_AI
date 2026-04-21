import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from Backend.file_handler import read_uploaded_log
from Backend.analyzer import analyze_logs
from Backend.auth import authenticate_user, register_user, generate_token, get_current_user
from Backend.config import GOOGLE_API_KEY
from ai_analysis.google_ai import generate_insight_summary

logger = logging.getLogger(__name__)
api = Blueprint("api", __name__)

@api.route("/auth/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            logger.warning("Login attempt with missing credentials")
            return jsonify({"error": "Email and password are required"}), 400

        user = authenticate_user(email, password)
        if not user:
            logger.warning(f"Failed login attempt for email: {email}")
            return jsonify({"error": "Invalid credentials"}), 401

        token = generate_token(user)
        logger.info(f"Successful login for user: {email}")
        return jsonify({
            "token": token,
            "user": user
        })
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({"error": "Login failed"}), 500

@api.route("/auth/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), 400

        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        if not name or not email or not password:
            return jsonify({"error": "Name, email, and password are required"}), 400

        user = register_user(name, email, password)
        token = generate_token(user)
        logger.info(f"New user registered: {email}")
        return jsonify({
            "token": token,
            "user": user
        })
    except ValueError as e:
        logger.warning(f"Signup validation error: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Signup error: {str(e)}", exc_info=True)
        return jsonify({"error": "Registration failed"}), 500

@api.route("/auth/me", methods=["GET"])
@jwt_required()
def get_me():
    try:
        user = get_current_user()
        if not user:
            logger.warning("User not found for token")
            return jsonify({"error": "User not found"}), 404
        return jsonify({"user": user})
    except Exception as e:
        logger.error(f"Get user error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to get user information"}), 500

@api.route("/upload", methods=["POST"])
@jwt_required()
def upload_log():
    try:
        uploaded_file = request.files.get("file")
        if not uploaded_file:
            return jsonify({"error": "No file provided"}), 400

        logger.info(f"File upload attempt: {uploaded_file.filename}")
        raw_text = read_uploaded_log(uploaded_file)
        analysis_result = analyze_logs(raw_text)

        # Add AI insights if Google API key is available
        if GOOGLE_API_KEY:
            try:
                ai_summary = generate_insight_summary(analysis_result, GOOGLE_API_KEY)
                if ai_summary:
                    analysis_result["ai_insights"] = ai_summary
            except Exception as e:
                logger.warning(f"AI insights generation failed: {str(e)}")
                # Continue without AI insights

        logger.info("File analysis completed successfully")
        return jsonify(analysis_result)
    except ValueError as exc:
        logger.warning(f"File processing error: {str(exc)}")
        return jsonify({"error": str(exc)}), 400
    except Exception as e:
        logger.error(f"File upload error: {str(e)}", exc_info=True)
        return jsonify({"error": "Unable to process uploaded file."}), 500

@api.route("/analyze", methods=["POST"])
@jwt_required()
def analyze_text():
    try:
        payload = request.get_json(silent=True) or {}
        raw_text = payload.get("text", "")
        if not raw_text:
            return jsonify({"error": "Missing text to analyze."}), 400

        logger.info("Text analysis request received")
        analysis_result = analyze_logs(raw_text)

        # Add AI insights if Google API key is available
        if GOOGLE_API_KEY:
            try:
                ai_summary = generate_insight_summary(analysis_result, GOOGLE_API_KEY)
                if ai_summary:
                    analysis_result["ai_insights"] = ai_summary
            except Exception as e:
                logger.warning(f"AI insights generation failed: {str(e)}")
                # Continue without AI insights

        logger.info("Text analysis completed successfully")
        return jsonify(analysis_result)
    except Exception as e:
        logger.error(f"Text analysis error: {str(e)}", exc_info=True)
        return jsonify({"error": "Unable to analyze provided text."}), 500

@api.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON payload"}), 400

        message = data.get("message", "")
        context = data.get("context", {})

        if not message:
            return jsonify({"error": "Message is required"}), 400

        logger.info("Chat request received")

        # Generate AI response using Google Generative AI
        if GOOGLE_API_KEY:
            from ai_analysis.google_ai import generate_chat_response
            response = generate_chat_response(message, context, GOOGLE_API_KEY)
        else:
            # Fallback response if no API key
            response = "AI features are not configured. Please set GOOGLE_API_KEY to enable intelligent responses."

        logger.info("Chat response generated successfully")
        return jsonify({"response": response})
    except Exception as e:
        logger.error(f"Chat error: {str(e)}", exc_info=True)
        return jsonify({"error": f"Failed to generate response: {str(e)}"}), 500
