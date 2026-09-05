"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 4: Model Adapter & Feature Mapping Engine

Maps incoming battery telemetry into the exact physical feature representations
required by each submodel in `battery_intelligence.pkl`.
CRITICAL: NEVER fabricates missing features with artificial defaults.
"""

import math
from typing import Dict, Any, Tuple, Optional, List
import numpy as np


class ModelAdapter:
    """
    Adapter bridging BRAIN telemetry and multi-model ensemble input matrices.
    """

    @staticmethod
    def validate_numeric(val: Any, field_name: str) -> Tuple[bool, Optional[float], Optional[str]]:
        """Validates that a value is a finite, non-null numeric float."""
        if val is None:
            return False, None, f"Missing required value for '{field_name}'."
        if isinstance(val, bool) or not isinstance(val, (int, float)):
            return False, None, f"Field '{field_name}' must be numeric (received {type(val).__name__})."
        if math.isnan(val) or math.isinf(val):
            return False, None, f"Field '{field_name}' contains NaN or infinite value."
        return True, float(val), None

    @classmethod
    def prepare_soc_features(cls, data: Dict[str, Any]) -> Tuple[bool, Optional[np.ndarray], List[str], List[str]]:
        """
        Prepares input vector for SOC Random Forest Regressor.
        Expected order: [voltage_V, current_A, temperature_C, time_s, cycle_number] (5 features)
        """
        feature_names = ["voltage_V", "current_A", "temperature_C", "time_s", "cycle_number"]
        mapping = {
            "voltage_V": data.get("voltage") if data.get("voltage") is not None else data.get("voltage_V"),
            "current_A": data.get("current") if data.get("current") is not None else data.get("current_A"),
            "temperature_C": data.get("temperature") if data.get("temperature") is not None else data.get("temperature_C"),
            "time_s": data.get("time_s") if data.get("time_s") is not None else data.get("time"),
            "cycle_number": data.get("cycle_number") if data.get("cycle_number") is not None else data.get("cycle"),
        }

        missing_features = []
        feature_values = []

        for name in feature_names:
            val = mapping[name]
            if val is None:
                missing_features.append(name)
            else:
                ok, num_val, _ = cls.validate_numeric(val, name)
                if not ok:
                    missing_features.append(name)
                else:
                    feature_values.append(num_val)

        if missing_features:
            return False, None, feature_names, missing_features

        feature_matrix = np.array([feature_values], dtype=np.float64)
        return True, feature_matrix, feature_names, []

    @classmethod
    def prepare_soh_features(cls, data: Dict[str, Any]) -> Tuple[bool, Optional[np.ndarray], List[str], List[str]]:
        """
        Prepares input vector for SOH Gradient Boosting Regressor.
        Expected order: [cycle_number, mean_voltage, min_voltage, max_voltage, voltage_std, mean_current, mean_temperature] (7 features)
        """
        feature_names = [
            "cycle_number", "mean_voltage", "min_voltage", "max_voltage",
            "voltage_std", "mean_current", "mean_temperature"
        ]

        # Extract from cycle_stats if present, or top-level fields
        cycle_stats = data.get("cycle_stats", {})
        if not isinstance(cycle_stats, dict):
            cycle_stats = {}

        mapping = {
            "cycle_number": data.get("cycle_number") or data.get("cycle") or cycle_stats.get("cycle_number"),
            "mean_voltage": cycle_stats.get("mean_voltage") or data.get("mean_voltage"),
            "min_voltage": cycle_stats.get("min_voltage") or data.get("min_voltage"),
            "max_voltage": cycle_stats.get("max_voltage") or data.get("max_voltage"),
            "voltage_std": cycle_stats.get("voltage_std") if cycle_stats.get("voltage_std") is not None else data.get("voltage_std"),
            "mean_current": cycle_stats.get("mean_current") or data.get("mean_current"),
            "mean_temperature": cycle_stats.get("mean_temperature") or data.get("mean_temperature"),
        }

        missing_features = []
        feature_values = []

        for name in feature_names:
            val = mapping[name]
            if val is None:
                missing_features.append(name)
            else:
                ok, num_val, _ = cls.validate_numeric(val, name)
                if not ok:
                    missing_features.append(name)
                else:
                    feature_values.append(num_val)

        if missing_features:
            return False, None, feature_names, missing_features

        feature_matrix = np.array([feature_values], dtype=np.float64)
        return True, feature_matrix, feature_names, []

    @classmethod
    def prepare_anomaly_features(cls, data: Dict[str, Any]) -> Tuple[bool, Optional[np.ndarray], List[str], List[str]]:
        """
        Prepares input vector for Anomaly Isolation Forest Model.
        Expected order: [voltage_V, current_A, temperature_C, cycle_number] (4 features)
        """
        feature_names = ["voltage_V", "current_A", "temperature_C", "cycle_number"]
        mapping = {
            "voltage_V": data.get("voltage") if data.get("voltage") is not None else data.get("voltage_V"),
            "current_A": data.get("current") if data.get("current") is not None else data.get("current_A"),
            "temperature_C": data.get("temperature") if data.get("temperature") is not None else data.get("temperature_C"),
            "cycle_number": data.get("cycle_number") if data.get("cycle_number") is not None else data.get("cycle"),
        }

        missing_features = []
        feature_values = []

        for name in feature_names:
            val = mapping[name]
            if val is None:
                missing_features.append(name)
            else:
                ok, num_val, _ = cls.validate_numeric(val, name)
                if not ok:
                    missing_features.append(name)
                else:
                    feature_values.append(num_val)

        if missing_features:
            return False, None, feature_names, missing_features

        feature_matrix = np.array([feature_values], dtype=np.float64)
        return True, feature_matrix, feature_names, []

    @classmethod
    def evaluate_physics_rules(cls, data: Dict[str, Any], rules: Dict[str, float]) -> Dict[str, Any]:
        """
        Evaluates deterministic physics boundary rules.
        """
        v = data.get("voltage") if data.get("voltage") is not None else data.get("voltage_V")
        i = data.get("current") if data.get("current") is not None else data.get("current_A")
        t = data.get("temperature") if data.get("temperature") is not None else data.get("temperature_C")

        violations = []
        warnings = []

        v_max = rules.get("v_max", 4.25)
        v_min = rules.get("v_min", 2.50)
        i_max = rules.get("i_max", 3.50)
        t_max = rules.get("t_max", 45.0)

        if v is not None:
            if v > v_max:
                violations.append(f"Over-voltage limit exceeded: {v:.2f}V > {v_max:.2f}V")
            elif v < v_min:
                violations.append(f"Under-voltage limit reached: {v:.2f}V < {v_min:.2f}V")

        if i is not None:
            if abs(i) > i_max:
                violations.append(f"Over-current threshold exceeded: {abs(i):.2f}A > {i_max:.2f}A")

        if t is not None:
            if t > t_max:
                violations.append(f"Thermal upper safety threshold exceeded: {t:.1f}°C > {t_max:.1f}°C")
            elif t > 40.0:
                warnings.append(f"Elevated thermal operating condition: {t:.1f}°C")

        return {
            "evaluated": True,
            "rules_checked": {"v_max": v_max, "v_min": v_min, "i_max": i_max, "t_max": t_max},
            "violations": violations,
            "warnings": warnings,
            "status": "RULE_VIOLATION" if violations else ("RULE_WARNING" if warnings else "NORMAL")
        }
