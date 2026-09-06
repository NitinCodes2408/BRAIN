"""
BRAIN — Battery Risk & Analytics Intelligence Network
Phase 3.5: Demo Mode & Advanced BMS UI Automated Verification Test Suite
"""

import unittest
import json
import os
import sys

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import app
from utils.demo_scenarios import DEMO_SCENARIOS, get_all_scenarios, get_scenario_by_id, generate_random_demo_scenario


class TestPhase35DemoMode(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_01_all_5_scenarios_defined(self):
        """Verify all 5 required demo scenarios exist with exact keys."""
        required = ["normal", "fast_charging", "thermal_stress", "aging", "abnormal"]
        for req in required:
            self.assertIn(req, DEMO_SCENARIOS, f"Missing scenario: {req}")
            sc = DEMO_SCENARIOS[req]
            self.assertIn("telemetry", sc)
            self.assertIn("classification", sc)
            self.assertIn("temperature_trend", sc)

    def test_02_scenario_values_exact(self):
        """Verify exact scenario values from Phase 3.5 specification."""
        # Scenario 1: Normal
        normal = DEMO_SCENARIOS["normal"]["telemetry"]
        self.assertEqual(normal["voltage"], 3.70)
        self.assertEqual(normal["current"], 4.0)
        self.assertEqual(normal["temperature"], 30.0)
        self.assertEqual(normal["soc"], 72)
        self.assertEqual(normal["soh"], 96)
        self.assertEqual(normal["c_rate"], 0.8)
        self.assertEqual(normal["ambient_temperature"], 27)

        # Scenario 2: Fast Charging
        fc = DEMO_SCENARIOS["fast_charging"]["telemetry"]
        self.assertEqual(fc["voltage"], 4.05)
        self.assertEqual(fc["current"], 15.0)
        self.assertEqual(fc["temperature"], 38.0)
        self.assertEqual(fc["soc"], 61)
        self.assertEqual(fc["soh"], 96)
        self.assertEqual(fc["c_rate"], 2.5)

        # Scenario 3: Thermal Stress
        ts = DEMO_SCENARIOS["thermal_stress"]["telemetry"]
        self.assertEqual(ts["voltage"], 3.82)
        self.assertEqual(ts["current"], 12.0)
        self.assertEqual(ts["temperature"], 45.0)
        self.assertEqual(ts["soc"], 54)
        self.assertEqual(ts["soh"], 94)
        self.assertEqual(ts["c_rate"], 2.0)

        # Scenario 4: Aging
        ag = DEMO_SCENARIOS["aging"]["telemetry"]
        self.assertEqual(ag["voltage"], 3.65)
        self.assertEqual(ag["current"], 10.0)
        self.assertEqual(ag["temperature"], 41.0)
        self.assertEqual(ag["soc"], 48)
        self.assertEqual(ag["soh"], 78)
        self.assertEqual(ag["c_rate"], 1.7)

        # Scenario 5: Abnormal
        ab = DEMO_SCENARIOS["abnormal"]["telemetry"]
        self.assertEqual(ab["voltage"], 3.55)
        self.assertEqual(ab["current"], 18.0)
        self.assertEqual(ab["temperature"], 52.0)
        self.assertEqual(ab["soc"], 43)
        self.assertEqual(ab["soh"], 76)
        self.assertEqual(ab["c_rate"], 3.0)

    def test_03_api_demo_scenarios_list(self):
        """Test GET /api/demo/scenarios endpoint."""
        res = self.app.get("/api/demo/scenarios")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get("success"))
        self.assertEqual(len(data["data"]["scenarios"]), 5)
        self.assertEqual(data["data"]["metadata"]["model_status"], "NOT CONNECTED")
        self.assertEqual(data["data"]["metadata"]["pinn_status"], "NOT CONNECTED")

    def test_04_api_demo_scenario_individual(self):
        """Test GET /api/demo/scenario/<name> for each scenario."""
        for name in ["normal", "fast_charging", "thermal_stress", "aging", "abnormal"]:
            res = self.app.get(f"/api/demo/scenario/{name}")
            self.assertEqual(res.status_code, 200)
            data = json.loads(res.data)
            self.assertTrue(data.get("success"))
            self.assertEqual(data["scenario"]["id"], name)

    def test_05_api_demo_scenario_random(self):
        """Test GET /api/demo/scenario/random generates physically bounded values."""
        res = self.app.get("/api/demo/scenario/random")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get("success"))
        sc = data["scenario"]["telemetry"]
        self.assertTrue(3.20 <= sc["voltage"] <= 4.25)
        self.assertTrue(0.0 <= sc["current"] <= 25.0)
        self.assertTrue(20.0 <= sc["temperature"] <= 60.0)
        self.assertTrue(0.0 <= sc["soc"] <= 100.0)
        self.assertTrue(50.0 <= sc["soh"] <= 100.0)

    def test_06_api_demo_scenario_not_found(self):
        """Test GET /api/demo/scenario/<invalid> returns 404."""
        res = self.app.get("/api/demo/scenario/unknown_xyz")
        self.assertEqual(res.status_code, 404)
        data = json.loads(res.data)
        self.assertFalse(data.get("success"))

    def test_07_health_endpoint_intact(self):
        """Test GET /health still works properly."""
        res = self.app.get("/health")
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data.get("status"), "ok")

    def test_08_battery_data_endpoint_intact(self):
        """Test POST /api/battery-data still works with valid telemetry."""
        payload = {
            "voltage": 3.75,
            "current": 4.5,
            "temperature": 29.5,
            "soc": 80.0,
            "soh": 98.0,
            "c_rate": 0.9,
            "ambient_temperature": 25.0
        }
        res = self.app.post("/api/battery-data", json=payload)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("status"), "DATA_ACCEPTED")


if __name__ == "__main__":
    unittest.main()
