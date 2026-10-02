import os
import re
import time
import resend
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://127.0.0.1:5500")
CORS(app, resources={r"/send-message": {"origins": [FRONTEND_ORIGIN]}})

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")

RATE_LIMIT_WINDOW = 60
request_history = {}


def valid_email(email):
    pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    return re.fullmatch(pattern, email) is not None


@app.route("/send-message", methods=["POST"])
def send_message():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "success": False,
            "error": "Invalid request."
        }), 400

    visitor_email = data.get("email")
    visitor_message = data.get("message")

    if not isinstance(visitor_email, str) or not valid_email(visitor_email.strip()):
        return jsonify({
            "success": False,
            "error": "Please enter a valid email address."
        }), 400

    if not isinstance(visitor_message, str) or not visitor_message.strip():
        return jsonify({
            "success": False,
            "error": "Message cannot be empty."
        }), 400

    if not RESEND_API_KEY or not RECEIVER_EMAIL:
        return jsonify({
            "success": False,
            "error": "Email service is not configured."
        }), 500

    client_ip = request.remote_addr or "unknown"
    current_time = time.time()

    if current_time - request_history.get(client_ip, 0) < RATE_LIMIT_WINDOW:
        return jsonify({
            "success": False,
            "error": "Please wait one minute before sending another message."
        }), 429

    request_history[client_ip] = current_time

    resend.api_key = RESEND_API_KEY

    try:
        resend.Emails.send({
            "from": "Portfolio <onboarding@resend.dev>",
            "to": [RECEIVER_EMAIL],
            "reply_to": visitor_email.strip(),
            "subject": "New Portfolio Contact Message",
            "text": (
                f"Visitor email: {visitor_email.strip()}\n\n"
                f"Message:\n{visitor_message.strip()}"
            )
        })

        return jsonify({
            "success": True,
            "message": "Your message has been sent successfully!"
        }), 200

    except Exception:
        app.logger.exception("Email sending failed.")

        return jsonify({
            "success": False,
            "error": "Unable to send the message right now."
        }), 500


if __name__ == "__main__":
    print("Starting Flask contact backend...")
    print("Server: http://127.0.0.1:5000")
    app.run(host="127.0.0.1", port=5000, debug=False)
