# BRAIN — Battery Risk & Analytics Intelligence Network

> **A physics-informed AI system for lithium-ion EV battery thermal behavior, battery health analysis, abnormal-condition detection, and early safety warning.**

---

## Architecture Overview

```
[Web Dashboard (Dual Mode: Live JSON / CALCE Dataset Demo)]
       │
       ├──► GET /health               (Liveness Check)
       ├──► GET /api/model-status     (Model Profile & Safety Thresholds)
       ├──► GET /api/dataset-status   (CALCE Benchmark Samples)
       │
       ├──► POST /api/battery-data    (Telemetry Ingestion & Preprocessing)
       │         │
       │         ▼
       │     [Server Validation & Structuring (utils/json_validator.py, data_processor.py)]
       │
       └──► POST /api/predict         (Multi-Model Real-Time Inference)
                 │
                 ▼
             [Feature Extraction & Adapter Layer (utils/model_adapter.py)]
                 │
                 ├──► RandomForestRegressor       ──► SOC (%)
                 ├──► GradientBoostingRegressor   ──► SOH (%)
                 ├──► IsolationForest + Rules     ──► Anomaly & Risk Level
                 └──► XGBoostRULPredictor         ──► RUL Cycles
```

---

## Project Structure

```
BRAIN/
├── app.py                      # Flask backend application & API routes
├── requirements.txt            # Python dependencies (Flask, scikit-learn, numpy)
├── README.md                   # Project documentation & architecture
│
├── models/
│   ├── battery_intelligence.pkl# Serialized composite model (2.95 MB)
│   └── model_profile.json      # Structured introspection schema
│
├── data/
│   ├── sample_input.json       # Telemetry sample JSON
│   ├── dataset_profile.json    # CALCE telemetry specification
│   └── dataset_samples.json    # 8 authentic CALCE benchmark samples
│
├── utils/
│   ├── json_validator.py       # Server-side validation
│   ├── data_processor.py       # Telemetry standardization
│   ├── model_loader.py         # Resilient unpickler with 11-byte patch & namespace shims
│   ├── model_adapter.py        # Feature matrix transformation & physics rule engine
│   └── model_service.py        # Singleton model manager with lifecycle tracking
│
├── templates/
│   └── index.html              # Flask Jinja2 Template (Mission-Critical Dark Theme)
│
├── static/
│   ├── css/
│   │   └── style.css           # Mission-critical dashboard styling
│   └── js/
│       └── script.js           # Client-side validation, API dispatch & dual-mode state
│
├── docs/
│   └── PHASE4_REPORT.md        # Comprehensive Phase 4 Technical Integration Report
│
└── tests/
    └── test_phase4.py          # 14 automated verification tests (100% pass rate)
```

---

## API Endpoints

### 1. Health Check
- **Route**: `GET /health`
- **Response**: `{"status": "ok"}`

### 2. Model Status
- **Route**: `GET /api/model-status`
- **Response**:
```json
{
  "status": "ready",
  "model_loaded": true,
  "model_type": "Composite Battery Intelligence Model (CALCE)",
  "submodels": {
    "soc_model": "RandomForestRegressor",
    "soh_model": "GradientBoostingRegressor",
    "anomaly_model": "IsolationForest",
    "rul_model": "XGBoostRULPredictor"
  },
  "physics_rules": {
    "v_max": 4.25,
    "v_min": 2.50,
    "i_max": 3.50,
    "t_max": 45.0
  },
  "thermal_model_included": false,
  "notes": "Temperature is an input feature, not an output prediction."
}
```

### 3. Dataset Status
- **Route**: `GET /api/dataset-status`
- **Response**:
```json
{
  "status": "available",
  "dataset_name": "CALCE Lithium-ion Battery Telemetry",
  "total_samples": 8,
  "features": ["voltage", "current", "temperature", "time_s", "cycle_number"]
}
```

### 4. Battery Data Ingestion
- **Route**: `POST /api/battery-data`
- **Content-Type**: `application/json`

### 5. Multi-Model Prediction
- **Route**: `POST /api/predict`
- **Content-Type**: `application/json`
- **Sample Request**:
```json
{
  "voltage": 3.85,
  "current": 1.50,
  "temperature": 25.2,
  "time_s": 600.0,
  "cycle_number": 10
}
```
- **Success Response (HTTP 200)**:
```json
{
  "status": "success",
  "inference_time_ms": 1.45,
  "predictions": {
    "soc_percent": 84.12,
    "soh_percent": 98.45,
    "rul_cycles": 1180,
    "anomaly_detected": false,
    "anomaly_score": -0.1245,
    "predicted_temperature": null,
    "thermal_note": "NOT INCLUDED IN MODEL"
  },
  "safety_assessment": {
    "risk_level": "NOMINAL",
    "rule_violations": [],
    "warning_type": "NONE",
    "early_warning_message": "All parameters within safe operating envelope."
  }
}
```

---

## Quick Start & Verification

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Flask Server
```bash
python app.py
```
Open your browser at `http://127.0.0.1:5000`.

### 3. Run Automated Tests
```bash
python tests/test_phase4.py
```
All 14 tests will execute and verify model loading, safety bounds, API responses, and edge cases.

---

## Scientific Integrity & Safety Guarantees

1. **No Fake Predictions**: Missing features return `MODEL_INPUT_INCOMPLETE` instead of hallucinated metrics.
2. **Thermal Truth**: Temperature is strictly an **input feature**. The UI explicitly displays `NOT INCLUDED IN MODEL`.
3. **Safety Attribution**: Distinguishes deterministic physics envelope violations (`RULE-BASED ALARM`) from statistical anomalies (`MODEL-BASED WARNING`).
