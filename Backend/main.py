from flask import Flask
from flask_cors import CORS

from Backend.config import PORT, MAX_CONTENT_LENGTH, CORS_ORIGINS
from Backend.routes import api

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH
CORS(app, origins=CORS_ORIGINS)

app.register_blueprint(api)

@app.route("/", methods=["GET"])
def root():
    return {"status": "ok", "message": "Secure Ops AI backend is running."}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT)
