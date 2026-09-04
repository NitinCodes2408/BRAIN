"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 3: Flask Backend Pipeline Application

A physics-informed AI system data pipeline for lithium-ion EV battery safety.
IMPORTANT:
- .pkl model is NOT loaded in this phase.
- No machine learning prediction, PINN inference, or risk calculation is executed.
- Serves the frontend dashboard and exposes POST /api/battery-data and GET /health.
- Full CORS support to allow seamless requests from VS Code Live Server (port 5500) and localhost.
"""

import os
import logging
from flask import Flask, request, jsonify, render_template
from utils.json_validator import validate_incoming_battery_data
from utils.data_processor import process_battery_data

# Initialize Flask application with explicit template and static paths
app = Flask(__name__, template_folder="templates", static_folder="static")

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("BRAIN_PIPELINE")


@app.after_request
def add_cors_headers(response):
    """Enables CORS to support requests from VS Code Live Server (port 5500) and other origins."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response


@app.route("/")
def index():
    """Serves the main BRAIN research dashboard."""
    return render_template("index.html")


@app.route("/health", methods=["GET", "OPTIONS"])
def health_check():
    """
    Phase 3 Health check endpoint.
    Confirms backend availability and pipeline readiness.
    """
    if request.method == "OPTIONS":
        return "", 204
    return jsonify({"status": "ok"}), 200


@app.route("/api/battery-data", methods=["POST", "OPTIONS"])
def receive_battery_data():
    """
    Phase 3 Primary API Endpoint: POST /api/battery-data
    
    1. Ingests raw JSON telemetry payload.
    2. Runs independent server-side validation.
    3. Transforms validated payload into standardized model-ready structure.
    4. Returns structured confirmation without executing .pkl model.
    """
    # Handle preflight CORS request
    if request.method == "OPTIONS":
        return "", 204

    # 1. Verify that request contains JSON
    if not request.is_json:
        logger.warning("Rejected non-JSON request.")
        return jsonify({
            "success": False,
            "status": "INVALID_DATA",
            "message": "Request payload must be valid JSON."
        }), 400

    try:
        payload = request.get_json(silent=True)
    except Exception as err:
        logger.error(f"Malformed JSON syntax during parsing: {err}")
        return jsonify({
            "success": False,
            "status": "INVALID_DATA",
            "message": "Invalid JSON syntax."
        }), 400

    if payload is None:
        logger.warning("Rejected null or empty JSON payload.")
        return jsonify({
            "success": False,
            "status": "INVALID_DATA",
            "message": "Please enter battery JSON data."
        }), 400

    # 2. Independent Backend Validation
    is_valid, validation_msg, validated_data = validate_incoming_battery_data(payload)
    if not is_valid:
        logger.warning(f"Backend validation rejected payload: {validation_msg}")
        return jsonify({
            "success": False,
            "status": "INVALID_DATA",
            "message": validation_msg
        }), 400

    # 3. Data Processing & Structuring (No model prediction executed)
    try:
        processed_result = process_battery_data(validated_data)
        logger.info(f"Battery data accepted and structured. Voltage: {processed_result['structured']['voltage']}V, "
                    f"Current: {processed_result['structured']['current']}A, "
                    f"Temp: {processed_result['structured']['temperature']}°C")

        return jsonify({
            "success": True,
            "status": "DATA_ACCEPTED",
            "message": "Battery data successfully received.",
            "data": processed_result
        }), 200

    except Exception as proc_err:
        logger.error(f"Internal processing error: {proc_err}", exc_info=True)
        return jsonify({
            "success": False,
            "status": "SERVER_ERROR",
            "message": "An error occurred while structuring battery data."
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting BRAIN Phase 3 Backend on http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=True)
