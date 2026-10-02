import os
import re
import time
import logging
import smtplib

from email.message import EmailMessage
from flask import Flask, request, jsonify
from flask_cors import CORS


app = Flask(__name__)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)


# Allow your Live Server website to connect to Flask
FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://127.0.0.1:5500"
)

CORS(
    app,
    resources={
        r"/send-message": {
            "origins": [FRONTEND_ORIGIN]
        }
    }
)


# Gmail settings
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
RECEIVER_EMAIL = os.getenv("RECEIVER_EMAIL")


# Rate limiting
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

    if not isinstance(visitor_email, str):
        return jsonify({
            "success": False,
            "error": "Please enter a valid email address."
        }), 400

    visitor_email = visitor_email.strip()

    if not valid_email(visitor_email):
        return jsonify({
            "success": False,
            "error": "Please enter a valid email address."
        }), 400

    if not isinstance(visitor_message, str):
        return jsonify({
            "success": False,
            "error": "Please enter a message."
        }), 400

    visitor_message = visitor_message.strip()

    if not visitor_message:
        return jsonify({
            "success": False,
            "error": "Message cannot be empty."
        }), 400

    if not SENDER_EMAIL or not SENDER_PASSWORD or not RECEIVER_EMAIL:
        app.logger.error("Email settings are missing.")

        return jsonify({
            "success": False,
            "error": "Email service is not configured."
        }), 500

    # Prevent repeated submissions
    client_ip = request.remote_addr or "unknown"
    current_time = time.time()
    last_request = request_history.get(client_ip, 0)

    if current_time - last_request < RATE_LIMIT_WINDOW:
        return jsonify({
            "success": False,
            "error": "Please wait one minute before sending another message."
        }), 429

    request_history[client_ip] = current_time

    # Create email
    email = EmailMessage()

    email["From"] = SENDER_EMAIL
    email["To"] = RECEIVER_EMAIL
    email["Subject"] = "New Portfolio Contact Message"

    email.set_content(
        "New message from your portfolio website.\n\n"
        f"Visitor email: {visitor_email}\n\n"
        "Message:\n"
        f"{visitor_message}"
    )

    try:

        with smtplib.SMTP(
            SMTP_SERVER,
            SMTP_PORT,
            timeout=15
        ) as server:

            server.ehlo()
            server.starttls()
            server.ehlo()

            server.login(
                SENDER_EMAIL,
                SENDER_PASSWORD
            )

            server.send_message(email)

        app.logger.info("Email sent successfully.")

        return jsonify({
            "success": True,
            "message": "Your message has been sent successfully!"
        }), 200

    except smtplib.SMTPAuthenticationError:

        app.logger.error("Gmail authentication failed.")

        return jsonify({
            "success": False,
            "error": "Gmail authentication failed."
        }), 500

    except Exception:

        app.logger.exception("Email sending failed.")

        return jsonify({
            "success": False,
            "error": "Unable to send the message right now."
        }), 500


if __name__ == "__main__":
    print("Starting Flask contact backend...")
    print("Server: http://127.0.0.1:5000")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=False
    )
