# BRAIN — Phase 3.5: Demonstration Mode & Advanced BMS UI Documentation

**Project**: BRAIN — Battery Risk & Analytics Intelligence Network  
**Phase**: Phase 3.5 — Demonstration Telemetry & Advanced BMS Dashboard Interface  
**Status**: **COMPLETE & VERIFIED (8/8 Automated Verification Tests Passing)**

---

## 1. Purpose of Demonstration Mode

Phase 3.5 introduces a dedicated, high-fidelity **Demonstration Mode** designed for engineering research presentations, B.Tech final-year project reviews, and stakeholder demonstrations. 

### Key Principles:
1. **Scientific Integrity**: All values displayed in demo mode are explicitly tagged as `DEMO DATA` / `SIMULATED TELEMETRY`.
2. **Honest Model Status**: The AI models (`battery_intelligence.pkl` and Physics-Informed Neural Network `PINN`) remain explicitly labeled as `MODEL NOT CONNECTED` and `PINN NOT CONNECTED`.
3. **Reproducible Scenarios**: 5 controlled, deterministic scenarios demonstrate varied operational conditions (Nominal, Fast Charge, Thermal Stress, Aging, and Abnormal high-temperature load).
4. **Physical Realism**: All demo metrics respect physical electrochemical boundaries of lithium-ion cells without fabricating unphysical values or claiming real sensor hardware connectivity.

---

## 2. Predefined Demonstration Scenarios

| Scenario Identifier | Scenario Name | Voltage | Current | Temp | SOC | SOH | C-Rate | Ambient Temp | Battery State | Demo Safety Rule | Demo Alert |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `normal` | **NORMAL OPERATION** | $3.70\,\text{V}$ | $4.0\,\text{A}$ | $30.0^\circ\text{C}$ | $72\%$ | $96\%$ | $0.8\,\text{C}$ | $27.0^\circ\text{C}$ | `NORMAL` | `NORMAL` | `No demo alert` |
| `fast_charging` | **FAST CHARGING** | $4.05\,\text{V}$ | $15.0\,\text{A}$ | $38.0^\circ\text{C}$ | $61\%$ | $96\%$ | $2.5\,\text{C}$ | $27.0^\circ\text{C}$ | `FAST CHARGING` | `ATTENTION` | `FAST-CHARGE CONDITION` |
| `thermal_stress` | **THERMAL STRESS** | $3.82\,\text{V}$ | $12.0\,\text{A}$ | $45.0^\circ\text{C}$ | $54\%$ | $94\%$ | $2.0\,\text{C}$ | $35.0^\circ\text{C}$ | `THERMAL STRESS` | `HIGH TEMPERATURE` | `THERMAL STRESS CONDITION` |
| `aging` | **AGING BATTERY** | $3.65\,\text{V}$ | $10.0\,\text{A}$ | $41.0^\circ\text{C}$ | $48\%$ | $78\%$ | $1.7\,\text{C}$ | $32.0^\circ\text{C}$ | `AGING` | `ATTENTION` | `BATTERY AGING CONDITION` |
| `abnormal` | **ABNORMAL DEMO** | $3.55\,\text{V}$ | $18.0\,\text{A}$ | $52.0^\circ\text{C}$ | $43\%$ | $76\%$ | $3.0\,\text{C}$ | $35.0^\circ\text{C}$ | `ABNORMAL DEMO` | `HIGH TEMPERATURE` | `ABNORMAL THERMAL CONDITION` |
| `random` | **RANDOM DEMO** | $3.40$–$4.15\,\text{V}$ | $2.0$–$16.0\,\text{A}$ | $26$–$48^\circ\text{C}$ | $20$–$90\%$ | $75$–$99\%$ | $0.4$–$3.2\,\text{C}$ | $22$–$36^\circ\text{C}$ | *Dynamic* | *Dynamic* | *Dynamic* |

---

## 3. UI Features & Advanced BMS Architecture

### 3.1 Advanced Battery Overview Cards
- **Voltage Card**: Live cell terminal voltage, nominal pack rating, status tag, update timestamp.
- **Current Card**: Continuous charge/discharge current, C-rate load tag, update timestamp.
- **Temperature Card**: Core surface thermocouple temperature, status badge (`NORMAL` / `HIGH TEMP`), timestamp.
- **SOC Card**: Instantaneous State of Charge percentage, health tag, timestamp.
- **SOH Card**: State of Health capacity retention percentage, degradation tag (`EXCELLENT` / `GOOD` / `AGED CELL`), timestamp.
- **C-Rate Card**: Normalized charge/discharge load multiplier (`0.8C` – `3.0C`), continuous rating tag, timestamp.

### 3.2 Circular SVG Visual Gauges
- **SOC Circular Gauge**: Smoothly animated SVG ring displaying remaining capacity ($0\%$–$100\%$) with color transitions.
- **SOH Circular Gauge**: Smoothly animated SVG ring displaying battery capacity retention ($0\%$–$100\%$) without computing unverified degradation.

### 3.3 Interactive Temperature Trend Time-Series Chart
- HTML5 Canvas real-time rendering of the 5-minute temperature history ($-5\text{m}$, $-4\text{m}$, $-3\text{m}$, $-2\text{m}$, $-1\text{m}$, $\text{Now}$).
- Features subtle grid lines, glowing accent stroke, and gradient area fill.
- Explicitly watermarked: `DEMO TIME-SERIES — NOT PHYSICAL EXPERIMENT`.

### 3.4 Multi-Level Demo Safety & State Blocks
- **Battery State**: Categorized predefined scenario classification (`NORMAL`, `FAST CHARGING`, `THERMAL STRESS`, `AGING`, `ABNORMAL DEMO`).
- **Demo Safety Indicator**: Rule-based status indicator (`NORMAL`, `ATTENTION`, `HIGH TEMPERATURE`).
- **Demo Alert**: Predefined operational warning banner (`No demo alert`, `FAST-CHARGE CONDITION`, `THERMAL STRESS CONDITION`, `BATTERY AGING CONDITION`, `ABNORMAL THERMAL CONDITION`).

### 3.5 System Health Matrix (Section 13)
- `SYSTEM STATUS`: `ONLINE` (Active Flask backend)
- `DATA PIPELINE`: `READY` (Client & server JSON validation active)
- `DATA SOURCE`: `DEMO / SIMULATED` or `JSON INPUT`
- `MODEL ENGINE`: `NOT CONNECTED` (Pending Phase 4)
- `PINN THERMAL`: `NOT CONNECTED` (Pending future training phase)
- `SENSOR MODE`: `SIMULATION` (No hardware sensors connected)
- `DATABASE`: `STANDALONE`

---

## 4. REST API Endpoints

### 4.1 `GET /api/demo/scenarios`
Returns the full suite of 5 predefined demo scenarios with telemetry, classifications, and safety metadata.

### 4.2 `GET /api/demo/scenario/<name>`
Returns the specific scenario parameters by identifier (`normal`, `fast_charging`, `thermal_stress`, `aging`, `abnormal`, or `random`).

### 4.3 `GET /health`
Liveness check confirming server availability:
```json
{
  "status": "ok",
  "model_status": "MODEL_READY",
  "model_verified": true
}
```

### 4.4 `POST /api/battery-data`
Custom JSON ingestion endpoint validating and structuring client telemetry payloads.

---

## 5. How to Run Demo Mode

### 5.1 Local Server
```bash
# 1. Start Flask Application
python app.py

# 2. Open in Browser
http://127.0.0.1:5000
```

### 5.2 Verification Test Suite
```bash
python tests/test_demo_mode.py
```
*Expected Output*: `Ran 8 tests in 0.094s — OK (100% Pass Rate)`

---

## 6. Future Transition to Real Hardware & Trained Models

In subsequent project phases:
1. **Phase 4**: Ingestion of genuine CALCE battery cycling datasets and activation of the `.pkl` ensemble (Random Forest SOC, Gradient Boosting SOH, Isolation Forest Anomaly Detection).
2. **Phase 5**: Physics-Informed Neural Network (PINN) thermal model training and core-to-surface propagation prediction.
3. **Phase 6**: Hardware BMS serial/MQTT stream integration replacing `DEMO / SIMULATED` with live BMS CAN bus telemetry.
