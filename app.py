"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 4: Model & Dataset Integration Application

A physics-informed AI system data pipeline and multi-model inference server
for lithium-ion EV battery safety and state estimation.
"""

import os
import json
import logging
from flask import Flask, request, jsonify, render_template, send_from_directory

from utils.json_validator import validate_incoming_battery_data
from utils.data_processor import process_battery_data
from utils.model_service import ModelService

# Initialize Flask application with explicit template and static paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
TEMPLATES_DIR = os.path.join(BASE_DIR, "templates")

app = Flask(__name__, template_folder=TEMPLATES_DIR, static_folder=STATIC_DIR)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("BRAIN_PIPELINE")

# Initialize Model Service Singleton at server startup
model_service = ModelService.get_instance()


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


@app.route("/static/<path:filename>")
def serve_static_files(filename):
    """Serves static assets explicitly."""
    return send_from_directory(STATIC_DIR, filename)


@app.route("/css/<path:filename>")
def serve_css_files(filename):
    """Fallback route to serve CSS files if requested directly from /css/."""
    css_dir = os.path.join(STATIC_DIR, "css")
    return send_from_directory(css_dir, filename)


@app.route("/js/<path:filename>")
def serve_js_files(filename):
    """Fallback route to serve JS files if requested directly from /js/."""
    js_dir = os.path.join(STATIC_DIR, "js")
    return send_from_directory(js_dir, filename)


@app.route("/health", methods=["GET", "OPTIONS"])
def health_check():
    """
    Health check endpoint.
    Confirms backend availability, pipeline readiness, and model status.
    """
    if request.method == "OPTIONS":
        return "", 204

    return jsonify({
        "status": "ok",
        "model_status": model_service.status,
        "model_verified": model_service.verified
    }), 200


@app.route("/api/model-status", methods=["GET", "OPTIONS"])
def get_model_status():
    """
    Returns the real-time operational status, submodels, features, and verification state
    of the battery_intelligence.pkl model ensemble.
    """
    if request.method == "OPTIONS":
        return "", 204

    status_data = model_service.get_status()
    return jsonify({
        "success": True,
        "data": status_data
    }), 200


@app.route("/api/dataset-status", methods=["GET", "OPTIONS"])
def get_dataset_status():
    """
    Returns metadata about supplied datasets and available demonstration sample sequences.
    """
    if request.method == "OPTIONS":
        return "", 204

    base_dir = os.path.dirname(__file__)
    profile_path = os.path.join(base_dir, "data", "dataset_profile.json")
    samples_path = os.path.join(base_dir, "data", "dataset_samples.json")

    profile_data = {}
    if os.path.exists(profile_path):
        try:
            with open(profile_path, "r", encoding="utf-8") as f:
                profile_data = json.load(f)
        except Exception as err:
            logger.warning(f"Failed to read dataset_profile.json: {err}")

    samples_data = []
    if os.path.exists(samples_path):
        try:
            with open(samples_path, "r", encoding="utf-8") as f:
                samples_data = json.load(f)
        except Exception as err:
            logger.warning(f"Failed to read dataset_samples.json: {err}")

    return jsonify({
        "success": True,
        "status": "ok",
        "dataset_name": profile_data.get("dataset_name", "sample_input.json"),
        "profile": profile_data,
        "sample_count": len(samples_data),
        "samples": samples_data
    }), 200


@app.route("/api/battery-data", methods=["POST", "OPTIONS"])
def receive_battery_data():
    """
    Primary Ingestion Endpoint: POST /api/battery-data
    
    1. Ingests raw JSON telemetry payload.
    2. Runs independent server-side validation.
    3. Transforms validated payload into standardized model-ready structure.
    4. Returns structured confirmation.
    """
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

    # 3. Data Processing & Structuring
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


@app.route("/api/predict", methods=["POST", "OPTIONS"])
def predict():
    """
    Phase 4 Multi-Model Prediction Endpoint: POST /api/predict

    Receives battery telemetry, validates features, executes submodel inference
    (SOC, SOH, Isolation Forest Anomaly Detection, and Physics Boundary Rules),
    and returns verified scientific predictions with latency metrics.
    """
    if request.method == "OPTIONS":
        return "", 204

    if not request.is_json:
        return jsonify({
            "success": False,
            "status": "INVALID_DATA",
            "message": "Prediction request payload must be valid JSON."
        }), 400

    try:
        payload = request.get_json(silent=True)
    except Exception as err:
        return jsonify({
            "success": False,
            "status": "INVALID_DATA",
            "message": "Invalid JSON syntax."
        }), 400

    if not payload or not isinstance(payload, dict):
        return jsonify({
            "success": False,
            "status": "INVALID_DATA",
            "message": "Prediction payload cannot be empty."
        }), 400

    # Execute inference through ModelService
    prediction_result = model_service.predict(payload)

    status_code = 200 if prediction_result.get("success") else 400
    return jsonify(prediction_result), status_code


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    logger.info(f"Starting BRAIN Phase 4 Application on http://127.0.0.1:{port}")
    app.run(host="127.0.0.1", port=port, debug=True)
