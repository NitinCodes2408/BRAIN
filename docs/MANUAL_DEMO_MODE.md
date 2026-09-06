# BRAIN — Manual Battery Telemetry & Test Mode Guide (Phase 3.6)

## 1. Overview
The **Manual Battery Telemetry Mode** provides a dedicated, interactive control panel within the BRAIN Battery Risk & Analytics Intelligence Network. It allows engineers and evaluators to manually input custom battery telemetry values or populate quick scenario presets, validate them against physical boundaries, and submit them directly to the Flask backend pipeline via `POST /api/battery-data`.

---

## 2. Telemetry Fields & Validation Constraints

| Parameter | Unit | Default | Validation Constraints |
| :--- | :--- | :--- | :--- |
| **Voltage** | V | `3.70` | Numeric, strictly $> 0$ |
| **Current** | A | `5.00` | Numeric, finite |
| **Temperature** | °C | `32.5` | Numeric, finite |
| **State of Charge (SOC)** | % | `70` | Numeric, $0 \le \text{SOC} \le 100$ |
| **State of Health (SOH)** | % | `95` | Numeric, $0 \le \text{SOH} \le 100$ |
| **C-Rate** | C | `1.0` | Numeric, $\ge 0$ |
| **Ambient Temperature** | °C | `25.0` | Numeric, finite |

---

## 3. Quick Scenario Presets

Clicking any preset chip populates the input fields immediately without auto-submitting, allowing you to modify individual parameters before sending:

1. **[ NORMAL ]**: `3.70 V`, `4.0 A`, `30.0 °C`, `72% SOC`, `96% SOH`, `0.8 C`, `27.0 °C Amb`
2. **[ FAST CHARGING ]**: `4.05 V`, `15.0 A`, `38.0 °C`, `61% SOC`, `96% SOH`, `2.5 C`, `27.0 °C Amb`
3. **[ THERMAL STRESS ]**: `3.82 V`, `12.0 A`, `45.0 °C`, `54% SOC`, `94% SOH`, `2.0 C`, `35.0 °C Amb`
4. **[ AGING ]**: `3.65 V`, `10.0 A`, `41.0 °C`, `48% SOC`, `78% SOH`, `1.7 C`, `32.0 °C Amb`
5. **[ ABNORMAL ]**: `3.55 V`, `18.0 A`, `52.0 °C`, `43% SOC`, `76% SOH`, `3.0 C`, `35.0 °C Amb`

---

## 4. UI Indicators & Real-Time Responses

Upon clicking **[ ⚡ SUBMIT TELEMETRY ]**:
- **Overview Cards**: Voltage, Current, Temperature, SOC, SOH, and C-Rate cards update instantaneously with timestamp.
- **Circular SVG Gauges**: SOC and SOH gauges animate smoothly to target percentages.
- **Manual Demo Temperature Trend**: Tracks consecutive submissions in a client-side memory array and renders an interactive canvas time-series trend line.
- **Received Data Preview**: Displays structured server-parsed telemetry and server processing time.
- **System Log Terminal**: Emits live `[DATA]` events with detailed field values and data origin tags (`MANUAL DEMO INPUT`).

Clicking **[ ↺ RESET ]**:
- Restores input fields to default values.
- Clears temporary temperature trend history.
- Resets overview cards and gauges to standby mode.

---

## 5. Scientific & Model Status Transparency
- **AI Model Status**: `MODEL NOT CONNECTED` (Prediction engine not linked in Phase 3.6).
- **PINN Status**: `PINN NOT CONNECTED` (Physics-Informed Neural Network offline).
- **Data Source**: Clearly demarcated as `MANUAL DEMO INPUT` / `SIMULATION MODE`.
- **Classification**: Rule-based demonstration status, not a claim of machine-learned thermal runaway detection.

---

## 6. How to Run & Verify

1. **Start the Flask Application**:
   ```bash
   python app.py
   ```
2. **Open the Dashboard**:
   Navigate to `http://127.0.0.1:5000` in your browser.
3. **Execute Automated Test Suite**:
   ```bash
   python -m unittest tests/test_manual_demo.py
   ```
