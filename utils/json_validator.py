"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 3: Backend JSON Validation Engine

Independent server-side validation for incoming battery telemetry JSON.
Ensures schema integrity, presence of required physics fields, and numeric constraints.
"""

import math
from typing import Tuple, Dict, Any, Optional

# Required physical telemetry fields
REQUIRED_FIELDS = [
    ("voltage", "Voltage"),
    ("current", "Current"),
    ("temperature", "Temperature"),
]

# Recognized numerical fields (Required + Optional)
NUMERICAL_FIELDS = [
    ("voltage", "Voltage"),
    ("current", "Current"),
    ("temperature", "Temperature"),
    ("soc", "SOC"),
    ("soh", "SOH"),
    ("c_rate", "C-rate"),
    ("ambient_temperature", "Ambient Temperature"),
]


def validate_incoming_battery_data(payload: Any) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
    """
    Validates the incoming JSON request payload.
    
    Returns:
        (is_valid, error_message_or_status, validated_data)
    """
    # 1. Ensure payload exists and is not None or empty
    if payload is None:
        return False, "Request payload must be valid JSON.", None

    # 2. Ensure root is a JSON object (dict), not a list or primitive
    if not isinstance(payload, dict):
        return False, "JSON root must be an object.", None

    if len(payload) == 0:
        return False, "Missing required fields: voltage, current, temperature.", None

    # 3. Check for required fields
    for field_key, field_label in REQUIRED_FIELDS:
        if field_key not in payload or payload[field_key] is None:
            return False, f"Missing required field: {field_key}.", None

    # 4. Check numerical data types for all present recognized fields
    for field_key, field_label in NUMERICAL_FIELDS:
        if field_key in payload:
            val = payload[field_key]
            # Must not be None for required fields; if None for optional, handle
            if val is None:
                # Required fields checked above, but if explicitly None:
                return False, f"{field_label} must be numeric.", None
            
            # Python booleans are subclasses of int, so reject bool
            if isinstance(val, bool) or not isinstance(val, (int, float)):
                return False, f"{field_label} must be numeric.", None
            
            # Check for NaN / Infinity
            if math.isnan(val) or math.isinf(val):
                return False, f"{field_label} must be a finite numeric value.", None

    # 5. Physical boundary constraints validation
    voltage_val = payload.get("voltage")
    if voltage_val is not None and voltage_val <= 0:
        return False, "Voltage must be a positive numeric value greater than 0.", None

    soc_val = payload.get("soc")
    if soc_val is not None and (soc_val < 0 or soc_val > 100):
        return False, "SOC must be between 0 and 100.", None

    soh_val = payload.get("soh")
    if soh_val is not None and (soh_val < 0 or soh_val > 100):
        return False, "SOH must be between 0 and 100.", None

    crate_val = payload.get("c_rate")
    if crate_val is not None and crate_val < 0:
        return False, "C-rate must be greater than or equal to 0.", None

    return True, "VALID", payload
