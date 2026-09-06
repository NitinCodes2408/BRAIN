"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 3.6: Manual Battery Telemetry & Test Mode Automated Test Suite
"""

import unittest
import json
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from utils.json_validator import validate_incoming_battery_data


class TestPhase36ManualDemoMode(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_01_default_manual_telemetry_submission(self):
        """Test submission of default manual input values."""
        payload = {
            "voltage": 3.70,
            "current": 5.00,
            "temperature": 32.5,
            "soc": 70,
            "soh": 95,
            "c_rate": 1.0,
            "ambient_temperature": 25.0
        }
        res = self.app.post("/api/battery-data", json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("status"), "DATA_ACCEPTED")
        self.assertEqual(data["data"]["structured"]["voltage"], 3.70)
        self.assertEqual(data["data"]["structured"]["temperature"], 32.5)

    def test_02_all_preset_payloads_accepted(self):
        """Verify all 5 manual presets are fully accepted by the backend pipeline."""
        presets = [
            # Normal
            {"voltage": 3.70, "current": 4.0, "temperature": 30.0, "soc": 72, "soh": 96, "c_rate": 0.8, "ambient_temperature": 27.0},
            # Fast Charging
            {"voltage": 4.05, "current": 15.0, "temperature": 38.0, "soc": 61, "soh": 96, "c_rate": 2.5, "ambient_temperature": 27.0},
            # Thermal Stress
            {"voltage": 3.82, "current": 12.0, "temperature": 45.0, "soc": 54, "soh": 94, "c_rate": 2.0, "ambient_temperature": 35.0},
            # Aging
            {"voltage": 3.65, "current": 10.0, "temperature": 41.0, "soc": 48, "soh": 78, "c_rate": 1.7, "ambient_temperature": 32.0},
            # Abnormal
            {"voltage": 3.55, "current": 18.0, "temperature": 52.0, "soc": 43, "soh": 76, "c_rate": 3.0, "ambient_temperature": 35.0}
        ]
        for p in presets:
            res = self.app.post("/api/battery-data", json=p)
            self.assertEqual(res.status_code, 200)
            data = json.loads(res.data)
            self.assertTrue(data.get("success"))
            self.assertEqual(data["data"]["structured"]["voltage"], p["voltage"])

    def test_03_validation_rejects_negative_voltage(self):
        """Ensure voltage <= 0 is rejected."""
        payload = {"voltage": 0.0, "current": 5.0, "temperature": 30.0}
        res = self.app.post("/api/battery-data", json=payload)
        self.assertEqual(res.status_code, 400)
        data = json.loads(res.data)
        self.assertFalse(data.get("success"))
        self.assertIn("positive", data.get("message", "").lower())

        payload_neg = {"voltage": -3.7, "current": 5.0, "temperature": 30.0}
        res_neg = self.app.post("/api/battery-data", json=payload_neg)
        self.assertEqual(res_neg.status_code, 400)

    def test_04_validation_rejects_invalid_soc(self):
        """Ensure SOC outside 0-100 is rejected."""
        payload_high = {"voltage": 3.7, "current": 5.0, "temperature": 30.0, "soc": 105}
        res_high = self.app.post("/api/battery-data", json=payload_high)
        self.assertEqual(res_high.status_code, 400)

        payload_low = {"voltage": 3.7, "current": 5.0, "temperature": 30.0, "soc": -5}
        res_low = self.app.post("/api/battery-data", json=payload_low)
        self.assertEqual(res_low.status_code, 400)

    def test_05_validation_rejects_invalid_soh(self):
        """Ensure SOH outside 0-100 is rejected."""
        payload_high = {"voltage": 3.7, "current": 5.0, "temperature": 30.0, "soh": 120}
        res_high = self.app.post("/api/battery-data", json=payload_high)
        self.assertEqual(res_high.status_code, 400)

        payload_low = {"voltage": 3.7, "current": 5.0, "temperature": 30.0, "soh": -1}
        res_low = self.app.post("/api/battery-data", json=payload_low)
        self.assertEqual(res_low.status_code, 400)

    def test_06_validation_rejects_negative_crate(self):
        """Ensure C-rate < 0 is rejected."""
        payload = {"voltage": 3.7, "current": 5.0, "temperature": 30.0, "c_rate": -0.5}
        res = self.app.post("/api/battery-data", json=payload)
        self.assertEqual(res.status_code, 400)

    def test_07_validation_rejects_non_numeric_and_empty(self):
        """Ensure string values, booleans, and empty objects are rejected."""
        res_empty = self.app.post("/api/battery-data", json={})
        self.assertEqual(res_empty.status_code, 400)

        res_str = self.app.post("/api/battery-data", json={"voltage": "high", "current": 5.0, "temperature": 30.0})
        self.assertEqual(res_str.status_code, 400)

        res_bool = self.app.post("/api/battery-data", json={"voltage": True, "current": 5.0, "temperature": 30.0})
        self.assertEqual(res_bool.status_code, 400)

    def test_08_sequential_submissions_tracking(self):
        """Test sequential submissions with temperature progression."""
        temps = [30.0, 32.5, 35.0, 39.5, 45.0]
        for t in temps:
            payload = {
                "voltage": 3.70,
                "current": 5.0,
                "temperature": t,
                "soc": 70,
                "soh": 95,
                "c_rate": 1.0,
                "ambient_temperature": 25.0
            }
            res = self.app.post("/api/battery-data", json=payload)
            self.assertEqual(res.status_code, 200)
            data = json.loads(res.data)
            self.assertEqual(data["data"]["structured"]["temperature"], t)


if __name__ == "__main__":
    unittest.main()
