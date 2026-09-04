"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 3: Data Processing & Structuring Pipeline

Prepares ingested telemetry data into a standardized model-ready structure.
DO NOT calculate missing values or perform artificial model preprocessing.
"""

from datetime import datetime, timezone
from typing import Dict, Any, Optional


def process_battery_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transforms validated battery JSON data into a standardized internal representation.
    Missing optional values strictly remain None (null).
    Does NOT calculate or estimate missing fields (e.g., C-rate, SOC, SOH).
    """
    # 1. Standard internal dictionary structure
    structured_data = {
        "voltage": float(data["voltage"]) if data.get("voltage") is not None else None,
        "current": float(data["current"]) if data.get("current") is not None else None,
        "temperature": float(data["temperature"]) if data.get("temperature") is not None else None,
        "soc": float(data["soc"]) if data.get("soc") is not None else None,
        "soh": float(data["soh"]) if data.get("soh") is not None else None,
        "c_rate": float(data["c_rate"]) if data.get("c_rate") is not None else None,
        "ambient_temperature": float(data["ambient_temperature"]) if data.get("ambient_temperature") is not None else None,
    }

    # 2. Extract any unmodeled/additional custom fields for non-destructive inspection
    standard_keys = {"voltage", "current", "temperature", "soc", "soh", "c_rate", "ambient_temperature"}
    additional_fields = {k: v for k, v in data.items() if k not in standard_keys}

    # 3. Generate ISO 8601 server timestamp (Server Received Time)
    server_received_time = datetime.now(timezone.utc).astimezone().isoformat()

    # 4. Model-ready pipeline payload (clearly marked as proposed model features)
    model_ready_payload = {
        "features": {
            "voltage": structured_data["voltage"],
            "current": structured_data["current"],
            "temperature": structured_data["temperature"],
            "soc": structured_data["soc"],
            "soh": structured_data["soh"],
            "c_rate": structured_data["c_rate"],
            "ambient_temperature": structured_data["ambient_temperature"],
        },
        "metadata": {
            "received_at": server_received_time,
            "source": "json_input",
            "feature_status": "PROPOSED MODEL FEATURES",
            "note": "Awaiting battery_intelligence.pkl interface verification in Phase 4"
        }
    }

    return {
        "structured": structured_data,
        "model_ready": model_ready_payload,
        "additional_fields": additional_fields if additional_fields else None,
        "received_at": server_received_time,
        "source": "JSON INPUT"
    }
