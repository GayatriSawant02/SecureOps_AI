import logging
import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import HTTPException

from Backend.config import PORT, MAX_CONTENT_LENGTH, CORS_ORIGINS, JWT_SECRET_KEY
from Backend.routes import api
from Backend.monitoring import init_monitoring

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('secureops.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["PROPAGATE_EXCEPTIONS"] = True

CORS(app, origins=CORS_ORIGINS)

jwt = JWTManager(app)
app.register_blueprint(api)

# Initialize monitoring
init_monitoring(app)

@app.route("/", methods=["GET"])
def root():
    logger.info("Root endpoint accessed")
    return {"status": "ok", "message": "Secure Ops AI backend is running."}

@app.errorhandler(HTTPException)
def handle_http_exception(e):
    logger.error(f"HTTP Exception: {e.code} - {e.description}")
    return jsonify({
        "error": e.description,
        "code": e.code
    }), e.code

@app.errorhandler(Exception)
def handle_unexpected_error(e):
    logger.error(f"Unexpected error: {str(e)}", exc_info=True)
    return jsonify({
        "error": "An unexpected error occurred",
        "code": 500
    }), 500

@jwt.invalid_token_loader
def invalid_token_callback(error_string):
    logger.warning(f"Invalid token: {error_string}")
    return jsonify({"error": "Invalid token", "code": 401}), 401

@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    logger.warning("Expired token used")
    return jsonify({"error": "Token has expired", "code": 401}), 401

@jwt.unauthorized_loader
def unauthorized_callback(error_string):
    logger.warning(f"Unauthorized access: {error_string}")
    return jsonify({"error": "Missing authorization header", "code": 401}), 401

if __name__ == "__main__":
    logger.info(f"Starting Secure Ops AI backend on port {PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=os.getenv("FLASK_DEBUG", "False").lower() == "true")
