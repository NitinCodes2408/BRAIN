"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 4: Model Service & Inference Execution Engine

Orchestrates model lifecycle, validates inputs via ModelAdapter, executes
submodel inference, evaluates physics safety boundaries, and computes latency.
"""

import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from utils.model_loader import load_battery_model
from utils.model_adapter import ModelAdapter

logger = logging.getLogger("BRAIN_MODEL_SERVICE")


class ModelService:
    """
    Singleton service managing the lifecycle and inference execution of
    the composite `battery_intelligence.pkl` ensemble.
    """

    _instance: Optional["ModelService"] = None

    def __init__(self):
        self.status = "MODEL_LOADING"
        self.verified = False
        self.model_file = "battery_intelligence.pkl"
        self.root_model = None
        self.submodels: Dict[str, Any] = {}
        self.load_error: Optional[str] = None
        self.initialize_model()

    @classmethod
    def get_instance(cls) -> "ModelService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def initialize_model(self) -> bool:
        """Loads and verifies the model ensemble."""
        self.status = "MODEL_LOADING"
        success, status_msg, root_obj, submodels = load_battery_model()

        if not success or submodels is None:
            self.status = status_msg
            self.verified = False
            self.load_error = status_msg
            logger.error(f"Model initialization failed: {status_msg}")
            return False

        self.root_model = root_obj
        self.submodels = submodels
        self.status = "MODEL_READY"
        self.verified = True
        self.load_error = None
        logger.info("ModelService initialized successfully with MODEL_READY state.")
        return True

    def get_status(self) -> Dict[str, Any]:
        """Returns comprehensive metadata about model availability and submodels."""
        submodel_summary = {}
        if self.submodels:
            for name, obj in self.submodels.items():
                if hasattr(obj, "__class__") and not isinstance(obj, (list, dict)):
                    submodel_summary[name] = {
                        "class": obj.__class__.__name__,
                        "n_features_in": getattr(obj, "n_features_in_", None),
                        "available": True
                    }
                elif isinstance(obj, list):
                    submodel_summary[name] = obj
                elif isinstance(obj, dict):
                    submodel_summary[name] = obj

        return {
            "model_file": self.model_file,
            "status": self.status,
            "verified": self.verified,
            "prediction_available": self.verified and self.status == "MODEL_READY",
            "temperature_prediction": {
                "supported": False,
                "note": "Temperature is strictly an INPUT feature to models, not an output."
            },
            "submodels": submodel_summary,
            "timestamp": datetime.now(timezone.utc).astimezone().isoformat()
        }

    def predict(self, telemetry: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes inference across all active submodels using incoming telemetry.
        Never creates fake features; returns MODEL_INPUT_INCOMPLETE if required fields are missing.
        """
        start_time = time.perf_counter()

        if not self.verified or self.status != "MODEL_READY":
            return {
                "success": False,
                "status": self.status or "MODEL_NOT_READY",
                "message": f"Model is currently not ready for inference (Status: {self.status}).",
                "prediction": None,
                "inference_time_ms": 0.0,
                "timestamp": datetime.now(timezone.utc).astimezone().isoformat()
            }

        try:
            results: Dict[str, Any] = {
                "soc": None,
                "soh": None,
                "anomaly": None,
                "physics_rules": None,
                "temperature_prediction": {
                    "supported": False,
                    "status": "NOT_INCLUDED_IN_MODEL",
                    "note": "Model does not forecast future temperature. Temperature is an input feature."
                },
                "risk_assessment": {
                    "status": "NORMAL_OPERATING_STATE",
                    "risk_level": "LOW",
                    "summary": "Nominal operational telemetry."
                },
                "early_warning": {
                    "active": False,
                    "level": "NORMAL",
                    "source": "NONE",
                    "message": "All parameters within verified operating range."
                }
            }

            features_used = []

            # ------------------------------------------------------------------
            # 1. SOC Model Inference (RandomForestRegressor)
            # ------------------------------------------------------------------
            soc_model = self.submodels.get("soc_model")
            if soc_model:
                ok, soc_x, req_feat, missing = ModelAdapter.prepare_soc_features(telemetry)
                if ok and soc_x is not None:
                    raw_soc = float(soc_model.predict(soc_x)[0])
                    clamped_soc = max(0.0, min(100.0, raw_soc))
                    results["soc"] = {
                        "status": "PREDICTION_SUCCESS",
                        "value": round(clamped_soc, 2),
                        "unit": "%",
                        "model": "RandomForestRegressor",
                        "features_used": req_feat
                    }
                    features_used.extend(req_feat)
                else:
                    results["soc"] = {
                        "status": "MODEL_INPUT_INCOMPLETE",
                        "value": None,
                        "missing_features": missing,
                        "required_features": req_feat
                    }

            # ------------------------------------------------------------------
            # 2. SOH Model Inference (GradientBoostingRegressor)
            # ------------------------------------------------------------------
            soh_model = self.submodels.get("soh_model")
            if soh_model:
                ok, soh_x, req_feat, missing = ModelAdapter.prepare_soh_features(telemetry)
                if ok and soh_x is not None:
                    raw_soh = float(soh_model.predict(soh_x)[0])
                    clamped_soh = max(0.0, min(120.0, raw_soh))
                    results["soh"] = {
                        "status": "PREDICTION_SUCCESS",
                        "value": round(clamped_soh, 2),
                        "unit": "%",
                        "model": "GradientBoostingRegressor",
                        "features_used": req_feat
                    }
                    features_used.extend(req_feat)
                else:
                    results["soh"] = {
                        "status": "MODEL_INPUT_INCOMPLETE",
                        "value": None,
                        "missing_features": missing,
                        "required_features": req_feat
                    }

            # ------------------------------------------------------------------
            # 3. Anomaly Model Inference (IsolationForest)
            # ------------------------------------------------------------------
            anomaly_model = self.submodels.get("anomaly_model")
            if anomaly_model:
                ok, anom_x, req_feat, missing = ModelAdapter.prepare_anomaly_features(telemetry)
                if ok and anom_x is not None:
                    pred_class = int(anomaly_model.predict(anom_x)[0])  # +1 Normal, -1 Anomaly
                    decision_score = float(anomaly_model.decision_function(anom_x)[0])
                    is_anomaly = pred_class == -1

                    results["anomaly"] = {
                        "status": "PREDICTION_SUCCESS",
                        "classification": "ANOMALY" if is_anomaly else "NORMAL",
                        "is_anomaly": is_anomaly,
                        "score": round(decision_score, 6),
                        "model": "IsolationForest",
                        "features_used": req_feat
                    }
                    features_used.extend(req_feat)
                else:
                    results["anomaly"] = {
                        "status": "MODEL_INPUT_INCOMPLETE",
                        "is_anomaly": None,
                        "missing_features": missing,
                        "required_features": req_feat
                    }

            # ------------------------------------------------------------------
            # 4. Physics Safety Envelope Rules
            # ------------------------------------------------------------------
            rules = self.submodels.get("anomaly_rules", {})
            physics_res = ModelAdapter.evaluate_physics_rules(telemetry, rules)
            results["physics_rules"] = physics_res

            # ------------------------------------------------------------------
            # 5. Integrated Risk Assessment & Early Warning Interpretation
            # ------------------------------------------------------------------
            has_physics_violation = len(physics_res.get("violations", [])) > 0
            has_physics_warning = len(physics_res.get("warnings", [])) > 0
            has_model_anomaly = (
                results["anomaly"] is not None
                and results["anomaly"].get("status") == "PREDICTION_SUCCESS"
                and results["anomaly"].get("is_anomaly") is True
            )

            if has_physics_violation:
                violation_str = "; ".join(physics_res["violations"])
                results["risk_assessment"] = {
                    "status": "CRITICAL_HAZARD_DETECTED",
                    "risk_level": "CRITICAL",
                    "summary": f"Deterministic safety rule violation: {violation_str}"
                }
                results["early_warning"] = {
                    "active": True,
                    "level": "CRITICAL",
                    "source": "RULE_BASED",
                    "message": f"RULE-BASED ALARM: {violation_str}"
                }
            elif has_model_anomaly:
                score = results["anomaly"].get("score", 0.0)
                results["risk_assessment"] = {
                    "status": "ANOMALOUS_CONDITION_DETECTED",
                    "risk_level": "HIGH",
                    "summary": f"Isolation Forest detected abnormal multi-feature state (score: {score})."
                }
                results["early_warning"] = {
                    "active": True,
                    "level": "WARNING",
                    "source": "MODEL_BASED",
                    "message": f"MODEL-BASED WARNING: Cell behavior deviates from nominal CALCE baseline (Anomaly score: {score})."
                }
            elif has_physics_warning:
                warn_str = "; ".join(physics_res["warnings"])
                results["risk_assessment"] = {
                    "status": "ELEVATED_RISK_MONITORED",
                    "risk_level": "MEDIUM",
                    "summary": f"Operating parameter warning: {warn_str}"
                }
                results["early_warning"] = {
                    "active": True,
                    "level": "ADVISORY",
                    "source": "RULE_BASED",
                    "message": f"RULE-BASED ADVISORY: {warn_str}"
                }
            else:
                results["risk_assessment"] = {
                    "status": "NOMINAL_OPERATING_CONDITION",
                    "risk_level": "LOW",
                    "summary": "Model and physics envelope indicate normal battery operational conditions."
                }
                results["early_warning"] = {
                    "active": False,
                    "level": "NORMAL",
                    "source": "NONE",
                    "message": "No active hazard detected. Operational parameters within safety boundaries."
                }

            # Remove duplicates in features_used
            unique_features = sorted(list(set(features_used)))

            elapsed_ms = (time.perf_counter() - start_time) * 1000.0

            return {
                "success": True,
                "status": "PREDICTION_SUCCESS",
                "model": {
                    "name": self.model_file,
                    "type": "Composite Multi-Model Ensemble (CALCE)",
                    "verified": True
                },
                "input": {
                    "features_used": unique_features,
                    "telemetry_received": telemetry
                },
                "prediction": results,
                "inference_time_ms": round(elapsed_ms, 3),
                "timestamp": datetime.now(timezone.utc).astimezone().isoformat()
            }

        except Exception as err:
            logger.error(f"Inference execution failed safely: {err}", exc_info=True)
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return {
                "success": False,
                "status": "INFERENCE_ERROR",
                "message": "An error occurred during model inference computation.",
                "prediction": None,
                "inference_time_ms": round(elapsed_ms, 3),
                "timestamp": datetime.now(timezone.utc).astimezone().isoformat()
            }
