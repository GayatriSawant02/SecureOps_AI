import os
import bcrypt
from datetime import timedelta
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from werkzeug.exceptions import BadRequest
from typing import Dict, Optional

# Simple in-memory user store (in production, use a database)
users_db = {
    "admin@secureops.ai": {
        "password_hash": bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "name": "System Administrator",
        "role": "Admin"
    },
    "analyst@secureops.ai": {
        "password_hash": bcrypt.hashpw("analyst123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8'),
        "name": "Security Analyst",
        "role": "Analyst"
    }
}

def authenticate_user(email: str, password: str) -> Optional[Dict]:
    """Authenticate user with email and password."""
    user = users_db.get(email)
    if not user:
        return None

    if bcrypt.checkpw(password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        return {
            "email": email,
            "name": user["name"],
            "role": user["role"]
        }
    return None

def register_user(name: str, email: str, password: str) -> Dict:
    """Register a new user."""
    if email in users_db:
        raise BadRequest("User already exists")

    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    users_db[email] = {
        "password_hash": password_hash,
        "name": name,
        "role": "Analyst"
    }

    return {
        "email": email,
        "name": name,
        "role": "Analyst"
    }

def generate_token(user: Dict) -> str:
    """Generate JWT token for authenticated user."""
    expires = timedelta(hours=24)
    token = create_access_token(identity=user["email"], additional_claims={
        "name": user["name"],
        "role": user["role"]
    }, expires_delta=expires)
    return token

def get_current_user():
    """Get current authenticated user from JWT token."""
    current_user_email = get_jwt_identity()
    user = users_db.get(current_user_email)
    if not user:
        return None

    return {
        "email": current_user_email,
        "name": user["name"],
        "role": user["role"]
    }