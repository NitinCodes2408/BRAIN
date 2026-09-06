"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 3.5: Demonstration Telemetry & Scenario Engine

Provides controlled, deterministic demonstration scenarios for EV Battery
Management System (BMS) simulation without model or hardware fabrication.
"""

import time
import random
from typing import Dict, Any, List, Optional

# --------------------------------------------------------------------------
# Predefined Controlled Demo Scenarios
# --------------------------------------------------------------------------

DEMO_SCENARIOS: Dict[str, Dict[str, Any]] = {
    "normal": {
        "id": "normal",
        "name": "NORMAL OPERATION",
        "source": "DEMO / SIMULATED",
        "telemetry": {
            "voltage": 3.70,
            "current": 4.0,
            "temperature": 30.0,
            "soc": 72,
            "soh": 96,
            "c_rate": 0.8,
            "ambient_temperature": 27.0
        },
        "classification": {
            "battery_state": "NORMAL",
            "safety_rule_status": "NORMAL",
            "demo_alert": "No demo alert",
            "alert_level": "NOMINAL",
            "description": "Standard nominal discharge operation at moderate C-rate and ambient room temperature."
        },
        "temperature_trend": [
            {"time_offset_s": -300, "temp_c": 28.2},
            {"time_offset_s": -240, "temp_c": 28.6},
            {"time_offset_s": -180, "temp_c": 29.1},
            {"time_offset_s": -120, "temp_c": 29.5},
            {"time_offset_s": -60, "temp_c": 29.8},
            {"time_offset_s": 0, "temp_c": 30.0}
        ]
    },
    "fast_charging": {
        "id": "fast_charging",
        "name": "FAST CHARGING",
        "source": "DEMO / SIMULATED",
        "telemetry": {
            "voltage": 4.05,
            "current": 15.0,
            "temperature": 38.0,
            "soc": 61,
            "soh": 96,
            "c_rate": 2.5,
            "ambient_temperature": 27.0
        },
        "classification": {
            "battery_state": "FAST CHARGING",
            "safety_rule_status": "ATTENTION",
            "demo_alert": "FAST-CHARGE CONDITION",
            "alert_level": "ATTENTION",
            "description": "High-current fast charge pulse (2.5C) causing mild Joule self-heating."
        },
        "temperature_trend": [
            {"time_offset_s": -300, "temp_c": 29.0},
            {"time_offset_s": -240, "temp_c": 31.2},
            {"time_offset_s": -180, "temp_c": 33.5},
            {"time_offset_s": -120, "temp_c": 35.8},
            {"time_offset_s": -60, "temp_c": 37.1},
            {"time_offset_s": 0, "temp_c": 38.0}
        ]
    },
    "thermal_stress": {
        "id": "thermal_stress",
        "name": "THERMAL STRESS",
        "source": "DEMO / SIMULATED",
        "telemetry": {
            "voltage": 3.82,
            "current": 12.0,
            "temperature": 45.0,
            "soc": 54,
            "soh": 94,
            "c_rate": 2.0,
            "ambient_temperature": 35.0
        },
        "classification": {
            "battery_state": "THERMAL STRESS",
            "safety_rule_status": "HIGH TEMPERATURE",
            "demo_alert": "THERMAL STRESS CONDITION",
            "alert_level": "WARNING",
            "description": "Elevated thermal stress due to high ambient temperature (35°C) and heavy load."
        },
        "temperature_trend": [
            {"time_offset_s": -300, "temp_c": 36.5},
            {"time_offset_s": -240, "temp_c": 38.4},
            {"time_offset_s": -180, "temp_c": 40.8},
            {"time_offset_s": -120, "temp_c": 42.6},
            {"time_offset_s": -60, "temp_c": 44.1},
            {"time_offset_s": 0, "temp_c": 45.0}
        ]
    },
    "aging": {
        "id": "aging",
        "name": "AGING BATTERY",
        "source": "DEMO / SIMULATED",
        "telemetry": {
            "voltage": 3.65,
            "current": 10.0,
            "temperature": 41.0,
            "soc": 48,
            "soh": 78,
            "c_rate": 1.7,
            "ambient_temperature": 32.0
        },
        "classification": {
            "battery_state": "AGING",
            "safety_rule_status": "ATTENTION",
            "demo_alert": "BATTERY AGING CONDITION",
            "alert_level": "ATTENTION",
            "description": "Capacity fade (SOH 78%) with increased internal resistance heating under discharge."
        },
        "temperature_trend": [
            {"time_offset_s": -300, "temp_c": 34.0},
            {"time_offset_s": -240, "temp_c": 35.8},
            {"time_offset_s": -180, "temp_c": 37.5},
            {"time_offset_s": -120, "temp_c": 39.2},
            {"time_offset_s": -60, "temp_c": 40.4},
            {"time_offset_s": 0, "temp_c": 41.0}
        ]
    },
    "abnormal": {
        "id": "abnormal",
        "name": "ABNORMAL DEMO CONDITION",
        "source": "DEMO / SIMULATED",
        "telemetry": {
            "voltage": 3.55,
            "current": 18.0,
            "temperature": 52.0,
            "soc": 43,
            "soh": 76,
            "c_rate": 3.0,
            "ambient_temperature": 35.0
        },
        "classification": {
            "battery_state": "ABNORMAL DEMO",
            "safety_rule_status": "HIGH TEMPERATURE",
            "demo_alert": "ABNORMAL THERMAL CONDITION",
            "alert_level": "CRITICAL",
            "description": "Extreme C-rate load (3.0C) pushing cell temperature past 50°C into high temperature demo warning."
        },
        "temperature_trend": [
            {"time_offset_s": -300, "temp_c": 37.0},
            {"time_offset_s": -240, "temp_c": 40.5},
            {"time_offset_s": -180, "temp_c": 44.2},
            {"time_offset_s": -120, "temp_c": 47.8},
            {"time_offset_s": -60, "temp_c": 50.1},
            {"time_offset_s": 0, "temp_c": 52.0}
        ]
    }
}


def get_all_scenarios() -> Dict[str, Any]:
    """Returns all predefined demonstration scenarios with metadata."""
    return {
        "status": "ok",
        "source": "DEMO / SIMULATED",
        "scenarios": [
            {
                "id": s["id"],
                "name": s["name"],
                "telemetry": s["telemetry"],
                "classification": s["classification"]
            }
            for s in DEMO_SCENARIOS.values()
        ],
        "metadata": {
            "total_scenarios": len(DEMO_SCENARIOS),
            "model_status": "NOT CONNECTED",
            "pinn_status": "NOT CONNECTED",
            "disclaimer": "Controlled demonstration telemetry only. Not physical sensor readings."
        }
    }


def get_scenario_by_id(scenario_id: str) -> Optional[Dict[str, Any]]:
    """Returns a specific scenario by its identifier."""
    clean_id = scenario_id.lower().replace("-", "_").strip()
    if clean_id in DEMO_SCENARIOS:
        scenario = dict(DEMO_SCENARIOS[clean_id])
        scenario["timestamp"] = time.time()
        return scenario
    return None


def generate_random_demo_scenario() -> Dict[str, Any]:
    """
    Generates a physically bounded random demo scenario within safe EV operating envelopes.
    Does not produce unphysical or impossible values.
    """
    voltage = round(random.uniform(3.40, 4.15), 2)
    current = round(random.uniform(2.0, 16.0), 1)
    temperature = round(random.uniform(26.0, 48.0), 1)
    soc = round(random.uniform(20.0, 90.0), 1)
    soh = round(random.uniform(75.0, 99.0), 1)
    c_rate = round(current / 5.0, 1)  # Assuming nominal 5Ah pack/cell
    ambient_temp = round(random.uniform(22.0, 36.0), 1)

    # Determine rule-based demo classification
    if temperature >= 45.0:
        b_state = "THERMAL STRESS"
        rule_status = "HIGH TEMPERATURE"
        alert = "THERMAL STRESS CONDITION"
        level = "WARNING"
    elif c_rate >= 2.2:
        b_state = "FAST CHARGING"
        rule_status = "ATTENTION"
        alert = "FAST-CHARGE CONDITION"
        level = "ATTENTION"
    elif soh < 80.0:
        b_state = "AGING"
        rule_status = "ATTENTION"
        alert = "BATTERY AGING CONDITION"
        level = "ATTENTION"
    else:
        b_state = "NORMAL"
        rule_status = "NORMAL"
        alert = "No demo alert"
        level = "NOMINAL"

    # Build smooth trend
    start_temp = round(temperature - random.uniform(2.0, 6.0), 1)
    trend = []
    for i, offset in enumerate([-300, -240, -180, -120, -60, 0]):
        fraction = i / 5.0
        t_val = round(start_temp + fraction * (temperature - start_temp), 1)
        trend.append({"time_offset_s": offset, "temp_c": t_val})

    return {
        "id": "random_demo",
        "name": f"RANDOM DEMO ({b_state})",
        "source": "DEMO / SIMULATED",
        "telemetry": {
            "voltage": voltage,
            "current": current,
            "temperature": temperature,
            "soc": soc,
            "soh": soh,
            "c_rate": c_rate,
            "ambient_temperature": ambient_temp
        },
        "classification": {
            "battery_state": b_state,
            "safety_rule_status": rule_status,
            "demo_alert": alert,
            "alert_level": level,
            "description": "Random demonstration parameters bounded within realistic lithium-ion operating limits."
        },
        "temperature_trend": trend,
        "timestamp": time.time()
    }
