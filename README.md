# BRAIN — Battery Risk & Analytics Intelligence Network

> **A physics-informed AI system for lithium-ion EV battery thermal behavior, battery health analysis, abnormal-condition detection, and early safety warning.**

---

## Phase 3: JSON Backend Pipeline

Phase 3 introduces a robust, independent Python/Flask backend pipeline that bridges client-side JSON telemetry ingestion and the upcoming machine-learning inference engine.

### Pipeline Architecture

```
[JSON Input (Web UI)]
       │
       ▼
[Client-Side Validation]
       │
       ▼
[POST /api/battery-data]
       │
       ▼
[Server-Side Independent Validation (utils/json_validator.py)]
       │
       ▼
[Data Structuring & Standardization (utils/data_processor.py)]
       │
       ▼
[Model-Ready Proposed Features (Standard Dictionary + Metadata)]
       │
       ▼
[Response 200 DATA_ACCEPTED] ───► [Dashboard & RECEIVED DATA Preview Updated]
       │
       ▼
[Future Phase 4: battery_intelligence.pkl Integration] (NOT LOADED YET)
```

---

## Project Structure

```
BRAIN/
│
├── app.py                      # Flask backend application & API routes
├── requirements.txt            # Python dependencies (Flask>=2.0.0)
├── README.md                   # Project documentation & architecture
│
├── models/                     # Reserved for battery_intelligence.pkl in Phase 4
│   └── .gitkeep
│
├── data/
│   └── sample_input.json       # Predefined demonstration telemetry JSON
│
├── utils/
│   ├── json_validator.py       # Independent server-side JSON schema validation
│   └── data_processor.py       # Standardized data structuring and model-ready payload
│
├── templates/
│   └── index.html              # Dashboard frontend markup (Jinja2 / Flask template)
│
└── static/
    ├── css/
    │   └── style.css           # Mission-critical dark theme styling
    └── js/
        └── script.js           # Client-side validation, API fetch, and state handling
```

---

## API Endpoints

### 1. Health Check
- **Route**: `GET /health`
- **Response**:
```json
{
  "status": "ok"
}
```

### 2. Battery Data Ingestion
- **Route**: `POST /api/battery-data`
- **Content-Type**: `application/json`
- **Sample Request**:
```json
{
  "voltage": 3.70,
  "current": 5.00,
  "temperature": 32.5,
  "soc": 70,
  "soh": 95,
  "c_rate": 1.0,
  "ambient_temperature": 25.0
}
```
- **Validation Rules**:
  - **Required**: `voltage`, `current`, `temperature` (must be finite numbers)
  - **Optional**: `soc`, `soh`, `c_rate`, `ambient_temperature` (must be finite numbers if provided)
- **Success Response (HTTP 200)**:
```json
{
  "success": true,
  "status": "DATA_ACCEPTED",
  "message": "Battery data successfully received.",
  "data": {
    "structured": {
      "voltage": 3.70,
      "current": 5.00,
      "temperature": 32.5,
      "soc": 70.0,
      "soh": 95.0,
      "c_rate": 1.0,
      "ambient_temperature": 25.0
    },
    "model_ready": {
      "features": { ... },
      "metadata": {
        "received_at": "2026-09-05T00:30:00.123456+05:30",
        "source": "json_input",
        "feature_status": "PROPOSED MODEL FEATURES"
      }
    },
    "received_at": "2026-09-05T00:30:00.123456+05:30",
    "source": "JSON INPUT"
  }
}
```
- **Rejection Response (HTTP 400)**:
```json
{
  "success": false,
  "status": "INVALID_DATA",
  "message": "Voltage must be numeric."
}
```

---

## How to Run the Application

1. **Install Requirements**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the Flask Backend**:
   ```bash
   python app.py
   ```

3. **Open the Dashboard**:
   Navigate to `http://127.0.0.1:5000` in your web browser.

---

## Scientific Integrity & Phase Restrictions

- **Model Status**: `battery_intelligence.pkl` is **NOT** loaded in Phase 3.
- **Predictions**: `Predicted Temperature` strictly remains `MODEL NOT CONNECTED`.
- **Trends**: `Temperature Trend` strictly remains `WAITING FOR MODEL/DATA`.
- **Risk System**: `Risk Assessment` strictly remains `SYSTEM NOT CONNECTED`.
- **Early Warning**: `Early Warning` strictly remains `WAITING FOR MODEL`.
- **Data Source**: Labeled explicitly as `JSON INPUT` (not live telemetry).
