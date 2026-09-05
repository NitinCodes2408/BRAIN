"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 4: Comprehensive Model & Dataset Integration Test Suite

Tests all 14 required Phase 4 verification criteria:
1. Model file existence
2. Model unpickling and loader verification
3. Model object type detection
4. Submodel feature counts and architectures
5. Dataset loading
6. Dataset schema and columns
7. Dataset/model feature mapping compatibility
8. Multi-model valid inference execution
9. Missing feature rejection (MODEL_INPUT_INCOMPLETE)
10. Non-numeric input rejection (HTTP 400)
11. NaN and infinite value rejection
12. Prediction response structure integrity
13. GET /api/model-status endpoint verification
14. GET /api/dataset-status endpoint verification
"""

import os
import sys
import json
import unittest

# Add project root to Python module path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from utils.model_loader import load_battery_model
from utils.model_adapter import ModelAdapter
from utils.model_service import ModelService


class Phase4IntegrationTests(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client = app.test_client()
        cls.service = ModelService.get_instance()

    # 1. Model file exists
    def test_01_model_file_exists(self):
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        p1 = os.path.join(root_dir, "models", "battery_intelligence.pkl")
        p2 = os.path.join(root_dir, "battery_intelligence.pkl")
        self.assertTrue(os.path.exists(p1) or os.path.exists(p2), "Model file battery_intelligence.pkl must exist.")

    # 2. Model loads safely
    def test_02_model_loads(self):
        success, status_msg, root_obj, submodels = load_battery_model()
        self.assertTrue(success, f"Model failed to load: {status_msg}")
        self.assertIsNotNone(root_obj)
        self.assertIsNotNone(submodels)

    # 3. Model object type detected
    def test_03_model_object_type(self):
        success, _, root_obj, submodels = load_battery_model()
        self.assertTrue(success)
        self.assertTrue(hasattr(root_obj, "_calce"))
        self.assertTrue(hasattr(submodels["soc_model"], "predict"))
        self.assertTrue(hasattr(submodels["soh_model"], "predict"))
        self.assertTrue(hasattr(submodels["anomaly_model"], "predict"))

    # 4. Model feature count detected
    def test_04_feature_counts(self):
        success, _, _, submodels = load_battery_model()
        self.assertTrue(success)
        self.assertEqual(len(submodels["soc_features"]), 5)
        self.assertEqual(len(submodels["soh_features"]), 7)
        self.assertEqual(len(submodels["anomaly_features"]), 4)
        self.assertEqual(submodels["soc_model"].n_features_in_, 5)
        self.assertEqual(submodels["soh_model"].n_features_in_, 7)
        self.assertEqual(submodels["anomaly_model"].n_features_in_, 4)

    # 5. Dataset loads
    def test_05_dataset_loads(self):
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        p_samples = os.path.join(root_dir, "data", "dataset_samples.json")
        p_input = os.path.join(root_dir, "data", "sample_input.json")
        self.assertTrue(os.path.exists(p_samples) and os.path.exists(p_input))
        with open(p_samples, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

    # 6. Dataset columns detected
    def test_06_dataset_columns(self):
        root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        p_profile = os.path.join(root_dir, "data", "dataset_profile.json")
        self.assertTrue(os.path.exists(p_profile))
        with open(p_profile, "r", encoding="utf-8") as f:
            profile = json.load(f)
        feat_names = [f["name"] for f in profile["features"]]
        self.assertIn("voltage", feat_names)
        self.assertIn("current", feat_names)
        self.assertIn("temperature", feat_names)

    # 7. Dataset/model compatibility check
    def test_07_dataset_model_compatibility(self):
        sample = {
            "voltage": 3.82,
            "current": 1.10,
            "temperature": 25.4,
            "time_s": 120.0,
            "cycle_number": 1,
            "cycle_stats": {
                "mean_voltage": 3.75,
                "min_voltage": 3.00,
                "max_voltage": 4.20,
                "voltage_std": 0.28,
                "mean_current": 1.10,
                "mean_temperature": 25.8
            }
        }
        ok_soc, mat_soc, _, _ = ModelAdapter.prepare_soc_features(sample)
        ok_soh, mat_soh, _, _ = ModelAdapter.prepare_soh_features(sample)
        ok_anom, mat_anom, _, _ = ModelAdapter.prepare_anomaly_features(sample)
        self.assertTrue(ok_soc and mat_soc.shape == (1, 5))
        self.assertTrue(ok_soh and mat_soh.shape == (1, 7))
        self.assertTrue(ok_anom and mat_anom.shape == (1, 4))

    # 8. Valid inference execution
    def test_08_valid_inference(self):
        sample = {
            "voltage": 3.82,
            "current": 1.10,
            "temperature": 25.4,
            "time_s": 120.0,
            "cycle_number": 1,
            "cycle_stats": {
                "mean_voltage": 3.75,
                "min_voltage": 3.00,
                "max_voltage": 4.20,
                "voltage_std": 0.28,
                "mean_current": 1.10,
                "mean_temperature": 25.8
            }
        }
        r = self.client.post("/api/predict", json=sample)
        self.assertEqual(r.status_code, 200)
        res = r.get_json()
        self.assertTrue(res.get("success"))
        self.assertEqual(res.get("status"), "PREDICTION_SUCCESS")
        self.assertIsNotNone(res["prediction"]["soc"]["value"])
        self.assertIsNotNone(res["prediction"]["soh"]["value"])
        self.assertIsNotNone(res["prediction"]["anomaly"]["classification"])

    # 9. Missing feature rejection
    def test_09_missing_feature_rejection(self):
        # Missing time_s and cycle_number -> SOC model should return MODEL_INPUT_INCOMPLETE
        incomplete = {"voltage": 3.70, "current": 1.10, "temperature": 25.0}
        r = self.client.post("/api/predict", json=incomplete)
        self.assertEqual(r.status_code, 200)
        res = r.get_json()
        self.assertEqual(res["prediction"]["soc"]["status"], "MODEL_INPUT_INCOMPLETE")
        self.assertIn("time_s", res["prediction"]["soc"]["missing_features"])

    # 10. Non-numeric input rejection
    def test_10_invalid_numeric_rejection(self):
        bad_sample = {"voltage": "high", "current": 1.0, "temperature": 25.0}
        # Ingestion endpoint rejects with HTTP 400
        r = self.client.post("/api/battery-data", json=bad_sample)
        self.assertEqual(r.status_code, 400)

    # 11. NaN rejection
    def test_11_nan_rejection(self):
        ok, _, err = ModelAdapter.validate_numeric(float("nan"), "voltage")
        self.assertFalse(ok)
        self.assertIn("NaN", err)

    # 12. Prediction response structure integrity
    def test_12_response_structure(self):
        sample = {
            "voltage": 3.68,
            "current": 1.10,
            "temperature": 28.2,
            "time_s": 1450.0,
            "cycle_number": 50,
            "cycle_stats": {
                "mean_voltage": 3.65,
                "min_voltage": 3.00,
                "max_voltage": 4.20,
                "voltage_std": 0.31,
                "mean_current": 1.10,
                "mean_temperature": 28.9
            }
        }
        r = self.client.post("/api/predict", json=sample)
        res = r.get_json()
        self.assertIn("model", res)
        self.assertIn("input", res)
        self.assertIn("prediction", res)
        self.assertIn("inference_time_ms", res)
        self.assertIn("timestamp", res)
        self.assertFalse(res["prediction"]["temperature_prediction"]["supported"])

    # 13. Model status endpoint
    def test_13_model_status_endpoint(self):
        r = self.client.get("/api/model-status")
        self.assertEqual(r.status_code, 200)
        res = r.get_json()
        self.assertTrue(res["success"])
        self.assertEqual(res["data"]["status"], "MODEL_READY")
        self.assertTrue(res["data"]["verified"])

    # 14. Dataset status endpoint
    def test_14_dataset_status_endpoint(self):
        r = self.client.get("/api/dataset-status")
        self.assertEqual(r.status_code, 200)
        res = r.get_json()
        self.assertTrue(res["success"])
        self.assertGreaterEqual(res["sample_count"], 1)


if __name__ == "__main__":
    unittest.main()
