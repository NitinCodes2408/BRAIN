# BRAIN Model Inspection Report

## 1. File Information

- **Filename**: `battery_intelligence.pkl`
- **Location**: `D:\Web Page\BRAIN\models\battery_intelligence.pkl` (also located at `D:\Web Page\BRAIN\battery_intelligence.pkl`)
- **File Size**: `2,952,240` bytes (~2.81 MB)
- **Last Modified**: `2026-09-04 23:09:31` (local timestamp)
- **SHA-256 Checksum**: `525fd17dd0e02fdd6883e8155954edde4fe78372d2153452fe6d1f01015c45cd`
- **Pickle Protocol**: **Protocol 5** (`\x80\x05`), utilizing protocol-5 framing (`\x95`) and 8-byte bytearray buffer storage (`BYTEARRAY8` / `\x96`).

---

## 2. Object Type

- **Root Object Class**: `battery_intelligence.model.BatteryIntelligenceModel`
- **Container Structure**: Composite model container holding an internal sub-container attribute `_calce` of type `battery_intelligence.model._CALCEModels`.
- **Contained Submodels**:
  - `soc_model`: `sklearn.ensemble._forest.RandomForestRegressor`
  - `soh_model`: `sklearn.ensemble._gb.GradientBoostingRegressor`
  - `anomaly_model`: `sklearn.ensemble._iforest.IsolationForest`
  - `anomaly_rules`: `dict` (Physical bounds: `v_max`, `v_min`, `i_max`, `t_max`)
  - `rul_model`: `batteryml.models.rul_predictors.xgb.XGBoostRULPredictor` wrapping an `xgboost.sklearn.XGBRegressor` with underlying `xgboost.core.Booster`.

---

## 3. Framework / Library

The serialized object is a **multi-framework composite ensemble**:
1. **`scikit-learn`** (Serialized under version signature `1.9.0`):
   - Implements `RandomForestRegressor`, `GradientBoostingRegressor`, and `IsolationForest`.
2. **`XGBoost`**:
   - Implements `xgboost.sklearn.XGBRegressor` and `xgboost.core.Booster` with `reg:squarederror` objective.
3. **`BatteryML`** (Open-source battery degradation modeling library):
   - Defines `batteryml.models.rul_predictors.xgb.XGBoostRULPredictor`.
4. **`battery_intelligence`** (Custom project package):
   - Defines `BatteryIntelligenceModel` and `_CALCEModels`.
5. **`NumPy`** & **`Pathlib`**:
   - `numpy.ndarray`, `numpy.dtype`, `pathlib.WindowsPath`.

---

## 4. Model Architecture

| Model Component | Framework | Class / Estimator | Key Hyperparameters / Structure |
|---|---|---|---|
| **SOC Estimator** | scikit-learn | `RandomForestRegressor` | `n_estimators=100`, `max_depth=15`, `criterion='squared_error'`, `n_features_in_=5` |
| **SOH Estimator** | scikit-learn | `GradientBoostingRegressor` | `n_estimators=120`, `learning_rate=0.08`, `loss='squared_error'`, `n_features_in_=7` |
| **Anomaly Detector** | scikit-learn | `IsolationForest` | `n_estimators=100`, `contamination=0.02`, `n_features_in_=4` |
| **Anomaly Rules** | Python dict | Physics threshold boundary dictionary | `{'v_max': 4.25, 'v_min': 2.5, 'i_max': 3.5, 't_max': 45.0}` |
| **RUL Predictor** | BatteryML / XGBoost | `XGBoostRULPredictor` (`XGBRegressor`) | `objective='reg:squarederror'`, tree booster `gbtree`, `num_feature=6`, `num_target=1`, 86KB tree binary buffer |

---

## 5. Input Features

The `.pkl` file explicitly defines feature lists for each individual model component:

### A. SOC Model Features (`soc_features` — 5 features)
1. `voltage_V` (Instantaneous cell voltage in Volts)
2. `current_A` (Instantaneous current in Amperes)
3. `temperature_C` (Cell temperature in °C)
4. `time_s` (Elapsed test timestamp in seconds)
5. `cycle_number` (Charge-discharge cycle index)

### B. SOH Model Features (`soh_features` — 7 features)
1. `cycle_number` (Current cycle index)
2. `mean_voltage` (Average voltage across the cycle)
3. `min_voltage` (Minimum cycle voltage)
4. `max_voltage` (Peak cycle voltage)
5. `voltage_std` (Voltage standard deviation over the cycle)
6. `mean_current` (Average cycle current)
7. `mean_temperature` (Average cycle temperature)

### C. Anomaly Model Features (`anomaly_features` — 4 features)
1. `voltage_V` (Voltage in Volts)
2. `current_A` (Current in Amperes)
3. `temperature_C` (Temperature in °C)
4. `cycle_number` (Current cycle count)

### D. Anomaly Rule Limits (`anomaly_rules`)
- `v_max`: `4.25 V` (Over-voltage cutoff)
- `v_min`: `2.50 V` (Under-voltage cutoff)
- `i_max`: `3.50 A` (Over-current limit)
- `t_max`: `45.0 °C` (Thermal upper safety threshold)

---

## 6. Input Shape

- **SOC Model Input**: Matrix of shape `(N, 5)` (float64)
- **SOH Model Input**: Matrix of shape `(N, 7)` (float64)
- **Anomaly Model Input**: Matrix of shape `(N, 4)` (float64)
- **RUL Model Input**: Feature vector of `6` features expected by underlying booster.

---

## 7. Preprocessing

- **Scalers**: No `StandardScaler`, `MinMaxScaler`, or `RobustScaler` pipeline objects were serialized within the `.pkl` stream.
- **Encoders**: No categorical encoders are present (all models consume raw float numerical features directly).
- **Imputers**: No missing-value imputers are included; all inputs must be provided as valid non-null floats.
- **Aggregation**: SOH features require statistical cycle aggregations (`mean_voltage`, `voltage_std`, etc.) before inference.

---

## 8. Output

- **SOC Model**: Continuous regression prediction `float` representing estimated State of Charge percentage (e.g. `86.01%`).
- **SOH Model**: Continuous regression prediction `float` representing State of Health / Capacity Retention percentage (e.g. `100.9%`).
- **Anomaly Model**: Binary classification integer: `+1` (Normal) or `-1` (Anomaly), along with decision function / anomaly score.
- **RUL Model**: Continuous regression prediction `float` representing Remaining Useful Life in cycle count.
- **IMPORTANT FINDING**: The model **DOES NOT OUTPUT TEMPERATURE PREDICTIONS** and **DOES NOT CONTAIN A PINN (Physics-Informed Neural Network)**. Temperature is strictly used as an **input feature** for SOC, SOH, and Anomaly models.

---

## 9. Dependencies

To execute the models natively, the Python environment requires:
- `python >= 3.8` (supports pickle protocol 5)
- `scikit-learn >= 1.7.0` (trained with `1.9.0`)
- `numpy >= 1.24.0`
- `xgboost >= 1.7.0` (required for RUL Booster deserialization)
- Custom module definitions:
  - `battery_intelligence.model` (defining `BatteryIntelligenceModel` and `_CALCEModels`)
  - `batteryml.models.rul_predictors.xgb` (defining `XGBoostRULPredictor`)

---

## 10. Compatibility

- **Direct `pickle.load()` on Unmodified File**: Fails with `EOFError: Ran out of input`.
  - **Root Cause**: The physical file `battery_intelligence.pkl` (2,952,240 bytes) was truncated before writing the final 11 bytes (`b'sbubububub.'`) needed to close the nested dictionary stack.
- **With 11-byte Closing Patch (`data + b'sbubububub.'`)**:
  - The pickle stream decodes successfully and reconstitutes all objects.
- **Environment Compatibility**:
  - `scikit-learn` 1.7.2 is installed in the current environment and successfully runs `RandomForestRegressor`, `GradientBoostingRegressor`, and `IsolationForest`.
  - `xgboost` is currently missing in the local environment (`ModuleNotFoundError: No module named 'xgboost'`).

---

## 11. Test Inference (Connectivity Verification)

A controlled local connectivity test was executed using test inputs:

### Test 1: SOC Estimator (`RandomForestRegressor`)
- **Input Vector**: `[[3.70, 1.00, 25.0, 100.0, 1.0]]` (`voltage_V`, `current_A`, `temperature_C`, `time_s`, `cycle_number`)
- **Output**: `np.ndarray([86.01010101])`
- **Result**: Successfully produced valid numeric output (SOC ~ 86.01%).

### Test 2: SOH Estimator (`GradientBoostingRegressor`)
- **Input Vector**: `[[1.0, 3.70, 3.20, 4.20, 0.25, 1.00, 25.0]]` (cycle, mean_v, min_v, max_v, std_v, mean_i, mean_t)
- **Output**: `np.ndarray([100.9038683])`
- **Result**: Successfully produced valid numeric output (SOH ~ 100.9%).

### Test 3: Anomaly Detection (`IsolationForest`)
- **Input Vector**: `[[3.70, 1.00, 25.0, 1.0]]` (`voltage_V`, `current_A`, `temperature_C`, `cycle_number`)
- **Output**: `predict = [-1]`, `anomaly_score = [-0.61385875]`
- **Result**: Successfully scored and flagged input condition.

*Note: These tests serve only as a model connectivity verification, not scientific validation of battery behavior.*

---

## 12. Known Limitations

1. **File Truncation**: The file was saved without the trailing 11 closing bytecode instructions. A lightweight loader or byte-level repair is mandatory to read it.
2. **Missing Temperature Forecaster / PINN**: The dashboard currently has a "Predicted Temperature" card, but this `.pkl` file **does not predict future temperature**; it predicts SOC, SOH, Anomaly, and RUL.
3. **Missing Cycle History**: SOH requires cycle statistics (`mean_voltage`, `voltage_std`), which cannot be computed from a single static instantaneous JSON reading alone.
4. **Missing Custom Packages**: `battery_intelligence` and `batteryml` packages are absent from standard pip repositories and must be provided or shimmed.

---

## 13. Unknown Information

- **Exact Training Hyperparameters of RUL XGBoost**: Underlying tree binary was extracted, but exact training objective weights and dataset split logs are external to the pickle.
- **Source Code of `battery_intelligence.model`**: The original Python source file that created `BatteryIntelligenceModel` is not in the workspace repository (provenance points to `C:\Users\daksh\.gemini\antigravity\scratch\BatteryML\workspaces\custom\xgb_calce`).

---

## 14. Recommendation for Phase 5

1. **Loader Shim**: Implement a dedicated `model_loader.py` in `utils/` that handles the 11-byte closing patch and provides class shims for `battery_intelligence.model` and `batteryml` without requiring full external repository installations.
2. **Feature Alignment**:
   - Update Phase 3 JSON ingestion to accept `time_s` and `cycle_number` alongside `voltage`, `current`, and `temperature` so `soc_model` and `anomaly_model` can receive all 5 required features.
   - For `soh_model`, provide single-point fallback heuristics or cycle-level buffering for statistical features (`mean_voltage`, `voltage_std`).
3. **UI Realignment**:
   - Route `soc_model` inference to the **SOC** card.
   - Route `soh_model` inference to the **SOH** card.
   - Route `anomaly_model` and `anomaly_rules` to the **RISK ASSESSMENT** and **EARLY WARNING** cards.
   - Keep **Predicted Temperature** strictly labeled as `NOT INCLUDED IN MODEL` or integrate an actual thermal PINN model when provided.
