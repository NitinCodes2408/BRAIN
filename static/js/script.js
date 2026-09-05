/**
 * BRAIN — Battery Risk & Analytics Intelligence Network
 * Phase 4: Model & Dataset Integration Engine
 * 
 * Pipeline flow:
 * 1. Telemetry Ingestion (Live JSON or Dataset Demo Sample)
 * 2. Client-Side Validation
 * 3. Server-Side Pipeline (`POST /api/battery-data`)
 * 4. Multi-Model Inference (`POST /api/predict`)
 * 5. Dynamic UI Updates (SOC, SOH, Isolation Forest Anomaly, Physics Rules, Risk & Early Warning)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const jsonTextarea = document.getElementById('batteryJsonInput');
  const loadJsonBtn = document.getElementById('loadJsonBtn');
  const validateJsonBtn = document.getElementById('validateJsonBtn');
  const runPredictBtn = document.getElementById('runPredictBtn');
  const sampleJsonBtn = document.getElementById('sampleJsonBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Mode Switcher Elements
  const modeJsonBtn = document.getElementById('modeJsonBtn');
  const modeDemoBtn = document.getElementById('modeDemoBtn');
  const demoControlsContainer = document.getElementById('demoControlsContainer');
  const demoSampleBadge = document.getElementById('demoSampleBadge');
  const demoSampleId = document.getElementById('demoSampleId');
  const demoSampleDesc = document.getElementById('demoSampleDesc');
  const demoPrevBtn = document.getElementById('demoPrevBtn');
  const demoNextBtn = document.getElementById('demoNextBtn');
  const demoLoadBtn = document.getElementById('demoLoadBtn');

  // Header & Source Elements
  const systemStatusBadge = document.getElementById('systemStatusBadge') || document.querySelector('.status-indicator');
  const systemStatusText = document.getElementById('systemStatusText') || document.querySelector('.status-text');
  const dataSourceBadge = document.getElementById('dataSourceBadge');

  // Status & Feedback Elements
  const dataStatusBadge = document.getElementById('dataStatusBadge');
  const lastDataUpdate = document.getElementById('lastDataUpdate');
  const validationFeedback = document.getElementById('validationFeedback');
  const additionalDataContainer = document.getElementById('additionalDataContainer');
  const additionalDataContent = document.getElementById('additionalDataContent');

  // Section 1: Battery Overview Cards
  const overviewVoltage = document.getElementById('overviewVoltage');
  const overviewCurrent = document.getElementById('overviewCurrent');
  const overviewTemperature = document.getElementById('overviewTemperature');
  const overviewSoc = document.getElementById('overviewSoc');
  const overviewSoh = document.getElementById('overviewSoh');
  const overviewCrate = document.getElementById('overviewCrate');

  // Section 2: Thermal Monitoring Cards
  const thermalCurrentTemp = document.getElementById('thermalCurrentTemp');
  const thermalCurrentSub = document.getElementById('thermalCurrentSub');
  const thermalPredictedBadge = document.getElementById('thermalPredictedBadge');
  const thermalPredictedSub = document.getElementById('thermalPredictedSub');
  const thermalTrendBadge = document.getElementById('thermalTrendBadge');

  // Section 3: Battery Health Card
  const healthSoc = document.getElementById('healthSoc');
  const healthSoh = document.getElementById('healthSoh');
  const healthBatteryState = document.getElementById('healthBatteryState');

  // Section 4 & 5: Risk Assessment & Early Warning
  const riskPill = document.getElementById('riskPill');
  const riskStatusDisplay = document.getElementById('riskStatusDisplay');
  const riskMainText = document.getElementById('riskMainText');
  const riskDescText = document.getElementById('riskDescText');

  const warningPill = document.getElementById('warningPill');
  const warningStatusDisplay = document.getElementById('warningStatusDisplay');
  const warningMainText = document.getElementById('warningMainText');
  const warningDescText = document.getElementById('warningDescText');

  // Section 7: Model Status Panel
  const modelNameTag = document.getElementById('modelNameTag');
  const modelTypeTag = document.getElementById('modelTypeTag');
  const modelVerifyTag = document.getElementById('modelVerifyTag');
  const modelPredTag = document.getElementById('modelPredTag');
  const modelStatusTag = document.getElementById('modelStatusTag');

  // Section 15: Received Data Preview Card
  const recvVoltage = document.getElementById('recvVoltage');
  const recvCurrent = document.getElementById('recvCurrent');
  const recvTemperature = document.getElementById('recvTemperature');
  const recvSoc = document.getElementById('recvSoc');
  const recvSoh = document.getElementById('recvSoh');
  const recvCrate = document.getElementById('recvCrate');
  const recvCycle = document.getElementById('recvCycle');
  const recvTime = document.getElementById('recvTime');
  const recvSource = document.getElementById('recvSource');
  const recvServerTime = document.getElementById('recvServerTime');

  // Section 17: Model Prediction Panel
  const predModelName = document.getElementById('predModelName');
  const predStatusBadge = document.getElementById('predStatusBadge');
  const predLatency = document.getElementById('predLatency');
  const predSocVal = document.getElementById('predSocVal');
  const predSocSub = document.getElementById('predSocSub');
  const predSohVal = document.getElementById('predSohVal');
  const predSohSub = document.getElementById('predSohSub');
  const predAnomalyBadge = document.getElementById('predAnomalyBadge');
  const predAnomalyScore = document.getElementById('predAnomalyScore');
  const predPhysicsBadge = document.getElementById('predPhysicsBadge');
  const predPhysicsSub = document.getElementById('predPhysicsSub');
  const predConfidence = document.getElementById('predConfidence');
  const predFeaturesList = document.getElementById('predFeaturesList');

  // Section 8: System Log Terminal
  const systemLogTerminal = document.getElementById('systemLogTerminal');

  // State Variables
  let datasetSamples = [];
  let currentSampleIndex = 0;
  let currentMode = 'json'; // 'json' or 'demo'

  // Predefined Demonstration Sample JSON
  const SAMPLE_JSON = `{
  "voltage": 3.70,
  "current": 1.10,
  "temperature": 25.0,
  "time_s": 120.0,
  "cycle_number": 1,
  "soc": 85.0,
  "soh": 100.0,
  "c_rate": 1.0,
  "ambient_temperature": 25.0,
  "cycle_stats": {
    "mean_voltage": 3.75,
    "min_voltage": 3.00,
    "max_voltage": 4.20,
    "voltage_std": 0.28,
    "mean_current": 1.10,
    "mean_temperature": 25.8
  }
}`;

  // --------------------------------------------------------------------------
  // Backend Health & System Status
  // --------------------------------------------------------------------------

  function setSystemStatus(isOnline) {
    if (!systemStatusBadge || !systemStatusText) return;
    if (isOnline) {
      systemStatusBadge.className = 'status-indicator online';
      systemStatusText.textContent = 'SYSTEM ONLINE';
    } else {
      systemStatusBadge.className = 'status-indicator offline';
      systemStatusText.textContent = 'SYSTEM OFFLINE';
    }
  }

  async function checkHealth() {
    try {
      const response = await fetch('/health');
      if (response.ok) {
        const data = await response.json();
        if (data && data.status === 'ok') {
          setSystemStatus(true);
          return true;
        }
      }
      setSystemStatus(false);
      return false;
    } catch (err) {
      setSystemStatus(false);
      return false;
    }
  }

  // --------------------------------------------------------------------------
  // Model Status & Dataset Status Fetching
  // --------------------------------------------------------------------------

  async function fetchModelStatus() {
    try {
      const response = await fetch('/api/model-status');
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.data) {
          const m = res.data;
          if (modelNameTag) modelNameTag.textContent = m.model_file;
          if (modelTypeTag) modelTypeTag.textContent = 'Multi-Model Ensemble';
          if (modelVerifyTag) {
            modelVerifyTag.textContent = m.verified ? 'VERIFIED' : 'NOT VERIFIED';
            modelVerifyTag.className = m.verified ? 'status-value-tag valid' : 'status-value-tag pending';
          }
          if (modelPredTag) {
            modelPredTag.textContent = m.prediction_available ? 'AVAILABLE' : 'UNAVAILABLE';
            modelPredTag.className = m.prediction_available ? 'status-value-tag valid' : 'status-value-tag muted';
          }
          if (modelStatusTag) {
            modelStatusTag.textContent = m.status;
            modelStatusTag.className = m.status === 'MODEL_READY' ? 'status-value-tag valid' : 'status-value-tag pending';
          }

          if (predModelName) predModelName.textContent = m.model_file;
          if (m.status === 'MODEL_READY') {
            appendLog('MODEL', `Model ensemble verified: ${m.model_file} (SOC, SOH, Anomaly, Physics Rules)`);
          }
        }
      }
    } catch (err) {
      console.warn('[BRAIN Phase 4] Could not fetch model status:', err);
    }
  }

  async function fetchDatasetStatus() {
    try {
      const response = await fetch('/api/dataset-status');
      if (response.ok) {
        const res = await response.json();
        if (res.success && res.samples && res.samples.length > 0) {
          datasetSamples = res.samples;
          appendLog('DATA', `Dataset profile loaded: ${datasetSamples.length} CALCE sequential demonstration samples available.`);
        }
      }
    } catch (err) {
      console.warn('[BRAIN Phase 4] Could not fetch dataset status:', err);
    }
  }

  // --------------------------------------------------------------------------
  // UI Helper Functions
  // --------------------------------------------------------------------------

  function setDataStatus(statusText, stateClass) {
    if (!dataStatusBadge) return;
    dataStatusBadge.textContent = statusText;
    dataStatusBadge.className = `data-status-badge ${stateClass}`;
  }

  function showFeedback(message, isSuccess = false) {
    if (!validationFeedback) return;
    validationFeedback.textContent = message;
    validationFeedback.className = isSuccess 
      ? 'validation-feedback success' 
      : 'validation-feedback error';
    validationFeedback.style.display = 'block';
  }

  function hideFeedback() {
    if (!validationFeedback) return;
    validationFeedback.style.display = 'none';
    validationFeedback.textContent = '';
  }

  function appendLog(prefix, message, isWaiting = false) {
    if (!systemLogTerminal) return;
    const entry = document.createElement('div');
    entry.className = isWaiting ? 'log-entry log-entry-waiting' : 'log-entry';
    entry.innerHTML = `<span class="log-prefix">[${prefix}]</span> ${message}`;
    systemLogTerminal.appendChild(entry);
    systemLogTerminal.scrollTop = systemLogTerminal.scrollHeight;
  }

  function formatVoltage(val) {
    if (val === undefined || val === null) return '--';
    const s = val.toString();
    const decimals = s.includes('.') ? s.split('.')[1].length : 0;
    return (decimals > 2 ? val.toFixed(decimals) : val.toFixed(2)) + ' V';
  }

  function formatCurrent(val) {
    if (val === undefined || val === null) return '--';
    const s = val.toString();
    const decimals = s.includes('.') ? s.split('.')[1].length : 0;
    return (decimals > 2 ? val.toFixed(decimals) : val.toFixed(2)) + ' A';
  }

  function formatTemperature(val) {
    if (val === undefined || val === null) return '--';
    const s = val.toString();
    const decimals = s.includes('.') ? s.split('.')[1].length : 0;
    return (decimals > 1 ? val.toFixed(decimals) : val.toFixed(1)) + ' °C';
  }

  function formatPercentage(val) {
    if (val === undefined || val === null) return 'N/A';
    return `${val} %`;
  }

  function formatCrate(val) {
    if (val === undefined || val === null) return 'N/A';
    const s = val.toString();
    const decimals = s.includes('.') ? s.split('.')[1].length : 0;
    return (decimals > 1 ? val.toFixed(decimals) : val.toFixed(1)) + ' C';
  }

  function formatServerTimestamp(isoStr) {
    if (!isoStr) return '--';
    try {
      const d = new Date(isoStr);
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return isoStr;
    }
  }

  // --------------------------------------------------------------------------
  // Dataset Demo Controls
  // --------------------------------------------------------------------------

  function renderDemoSample(index) {
    if (!datasetSamples || datasetSamples.length === 0) return;
    const sample = datasetSamples[index];
    if (!sample) return;

    if (demoSampleBadge) demoSampleBadge.textContent = `SAMPLE ${index + 1} OF ${datasetSamples.length}`;
    if (demoSampleId) demoSampleId.textContent = sample.sample_id || `Sample_${index + 1}`;
    if (demoSampleDesc) demoSampleDesc.textContent = sample.description || 'CALCE telemetry demonstration sample.';

    if (jsonTextarea) {
      jsonTextarea.value = JSON.stringify(sample, null, 2);
    }
    setDataStatus('SAMPLE LOADED', 'pending');
    showFeedback(`Dataset sample ${index + 1} (${sample.sample_id}) loaded into editor. Ready for pipeline ingestion or model inference.`, true);
    appendLog('DATA', `Selected dataset sample ${index + 1}: ${sample.sample_id}`);
  }

  if (modeJsonBtn && modeDemoBtn) {
    modeJsonBtn.addEventListener('click', () => {
      currentMode = 'json';
      modeJsonBtn.classList.add('active');
      modeDemoBtn.classList.remove('active');
      if (demoControlsContainer) demoControlsContainer.style.display = 'none';
      if (dataSourceBadge) {
        dataSourceBadge.textContent = 'DATA SOURCE: JSON INPUT';
      }
      appendLog('APP', 'Switched to LIVE JSON INPUT mode.');
    });

    modeDemoBtn.addEventListener('click', () => {
      currentMode = 'demo';
      modeDemoBtn.classList.add('active');
      modeJsonBtn.classList.remove('active');
      if (demoControlsContainer) demoControlsContainer.style.display = 'flex';
      if (dataSourceBadge) {
        dataSourceBadge.textContent = 'DATA SOURCE: DATASET DEMO (CALCE)';
      }
      appendLog('APP', 'Switched to DATASET DEMO mode.');
      if (datasetSamples.length > 0) {
        renderDemoSample(currentSampleIndex);
      }
    });
  }

  if (demoPrevBtn) {
    demoPrevBtn.addEventListener('click', () => {
      if (datasetSamples.length === 0) return;
      currentSampleIndex = (currentSampleIndex - 1 + datasetSamples.length) % datasetSamples.length;
      renderDemoSample(currentSampleIndex);
    });
  }

  if (demoNextBtn) {
    demoNextBtn.addEventListener('click', () => {
      if (datasetSamples.length === 0) return;
      currentSampleIndex = (currentSampleIndex + 1) % datasetSamples.length;
      renderDemoSample(currentSampleIndex);
    });
  }

  if (demoLoadBtn) {
    demoLoadBtn.addEventListener('click', () => {
      renderDemoSample(currentSampleIndex);
    });
  }

  // --------------------------------------------------------------------------
  // Client-Side Pre-validation
  // --------------------------------------------------------------------------
  function prevalidateClientJson(rawText) {
    if (!rawText || rawText.trim() === '') {
      return { isValid: false, status: 'JSON INVALID', message: 'Please enter battery JSON data.', parsed: null };
    }

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      return { isValid: false, status: 'JSON INVALID', message: 'Invalid JSON syntax formatting.', parsed: null };
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { isValid: false, status: 'JSON INVALID', message: 'JSON root must be an object.', parsed: null };
    }

    const requiredFields = ['voltage', 'current', 'temperature'];
    for (const f of requiredFields) {
      if (parsed[f] === undefined && parsed[`${f}_V`] === undefined && parsed[`${f}_A`] === undefined && parsed[`${f}_C`] === undefined) {
        return { isValid: false, status: 'INVALID_DATA', message: `Missing required telemetry field: ${f}.`, parsed: null };
      }
    }

    return { isValid: true, status: 'VALID', message: 'JSON VALID', parsed };
  }

  // --------------------------------------------------------------------------
  // Event Listeners
  // --------------------------------------------------------------------------

  // 1. VALIDATE JSON BUTTON
  if (validateJsonBtn) {
    validateJsonBtn.addEventListener('click', () => {
      const rawText = jsonTextarea ? jsonTextarea.value : '';
      const check = prevalidateClientJson(rawText);

      if (check.isValid) {
        setDataStatus('JSON VALID', 'valid');
        showFeedback('JSON VALID — Schema verified. Ready for backend submission or model inference.', true);
        appendLog('VAL', 'Client-side JSON validation successful.');
      } else {
        setDataStatus(check.status, 'invalid');
        showFeedback(check.message, false);
        appendLog('VAL', `Validation failed: ${check.message}`);
        appendLog('NET', 'Waiting for valid battery data.', true);
      }
    });
  }

  // 2. LOAD JSON BUTTON (Sends to Flask Backend: POST /api/battery-data)
  if (loadJsonBtn) {
    loadJsonBtn.addEventListener('click', async () => {
      const rawText = jsonTextarea ? jsonTextarea.value : '';
      const check = prevalidateClientJson(rawText);

      if (!check.isValid) {
        setDataStatus(check.status, 'invalid');
        showFeedback(check.message, false);
        appendLog('VAL', `JSON validation failed: ${check.message}`);
        return;
      }

      try {
        const response = await fetch('/api/battery-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(check.parsed)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setDataStatus(result.status || 'INVALID_DATA', 'invalid');
          showFeedback(result.message || 'Backend validation rejected payload.', false);
          appendLog('VAL', `Backend validation failed: ${result.message}`);
          return;
        }

        // Successful Ingestion
        const processed = result.data;
        const structured = processed.structured;

        setDataStatus('DATA INGESTED', 'received');
        showFeedback('Battery telemetry successfully ingested into backend pipeline.', true);

        // Update Overview Cards
        if (overviewVoltage) overviewVoltage.textContent = formatVoltage(structured.voltage);
        if (overviewCurrent) overviewCurrent.textContent = formatCurrent(structured.current);
        if (overviewTemperature) overviewTemperature.textContent = formatTemperature(structured.temperature);
        if (overviewSoc) overviewSoc.textContent = formatPercentage(structured.soc);
        if (overviewSoh) overviewSoh.textContent = formatPercentage(structured.soh);
        if (overviewCrate) overviewCrate.textContent = formatCrate(structured.c_rate);

        // Update Thermal Monitoring
        if (thermalCurrentTemp) thermalCurrentTemp.textContent = formatTemperature(structured.temperature);
        if (thermalCurrentSub) thermalCurrentSub.textContent = 'Backend Data Ingested';

        // Update Battery Health
        if (healthSoc) healthSoc.textContent = formatPercentage(structured.soc);
        if (healthSoh) healthSoh.textContent = formatPercentage(structured.soh);

        // Update Received Data Preview
        if (recvVoltage) recvVoltage.textContent = formatVoltage(structured.voltage);
        if (recvCurrent) recvCurrent.textContent = formatCurrent(structured.current);
        if (recvTemperature) recvTemperature.textContent = formatTemperature(structured.temperature);
        if (recvSoc) recvSoc.textContent = formatPercentage(structured.soc);
        if (recvSoh) recvSoh.textContent = formatPercentage(structured.soh);
        if (recvCrate) recvCrate.textContent = formatCrate(structured.c_rate);
        if (recvCycle) recvCycle.textContent = check.parsed.cycle_number !== undefined ? check.parsed.cycle_number : 'N/A';
        if (recvTime) recvTime.textContent = check.parsed.time_s !== undefined ? check.parsed.time_s : 'N/A';
        if (recvSource) recvSource.textContent = currentMode === 'demo' ? 'DATASET DEMO' : 'JSON INPUT';
        if (recvServerTime) recvServerTime.textContent = `SERVER TIME: ${formatServerTimestamp(processed.received_at)}`;

        if (lastDataUpdate) lastDataUpdate.textContent = formatServerTimestamp(processed.received_at);

        // Display unmodeled/unexpected fields if present
        if (processed.additional_fields && additionalDataContainer && additionalDataContent) {
          additionalDataContent.textContent = JSON.stringify(processed.additional_fields, null, 2);
          additionalDataContainer.style.display = 'block';
        } else if (additionalDataContainer) {
          additionalDataContainer.style.display = 'none';
        }

        appendLog('SYS', 'Battery telemetry accepted by backend.');
        setSystemStatus(true);

      } catch (netErr) {
        console.error('[BRAIN Phase 4] Pipeline network error:', netErr);
        setSystemStatus(false);
        setDataStatus('SERVER_ERROR', 'invalid');
        showFeedback('Unable to reach backend API endpoint. Ensure Flask server is running.', false);
        appendLog('NET', 'Backend connection error: Server unreachable.', true);
      }
    });
  }

  // 3. RUN MODEL INFERENCE BUTTON (Sends to: POST /api/predict)
  if (runPredictBtn) {
    runPredictBtn.addEventListener('click', async () => {
      const rawText = jsonTextarea ? jsonTextarea.value : '';
      const check = prevalidateClientJson(rawText);

      if (!check.isValid) {
        setDataStatus(check.status, 'invalid');
        showFeedback(check.message, false);
        appendLog('VAL', `Inference request rejected: ${check.message}`);
        return;
      }

      setDataStatus('RUNNING MODEL...', 'pending');
      if (predStatusBadge) {
        predStatusBadge.textContent = 'COMPUTING INFERENCE...';
        predStatusBadge.className = 'pred-badge pending';
      }

      try {
        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(check.parsed)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setDataStatus('MODEL_ERROR', 'invalid');
          showFeedback(result.message || 'Model prediction failed.', false);
          if (predStatusBadge) {
            predStatusBadge.textContent = 'INFERENCE FAILED';
            predStatusBadge.className = 'pred-badge anomaly';
          }
          appendLog('ERR', `Inference error: ${result.message}`);
          return;
        }

        const preds = result.prediction;
        const latency = result.inference_time_ms;

        // 1. Update Data Status Badge
        setDataStatus('PREDICTION SUCCESS', 'received');
        showFeedback(`Multi-model inference successfully executed in ${latency} ms.`, true);

        // 2. Update Prediction Panel
        if (predStatusBadge) {
          predStatusBadge.textContent = 'PREDICTION SUCCESS';
          predStatusBadge.className = 'pred-badge valid';
        }
        if (predLatency) {
          predLatency.textContent = `Latency: ${latency} ms`;
        }

        // SOC Prediction (Random Forest)
        if (preds.soc && preds.soc.status === 'PREDICTION_SUCCESS') {
          if (predSocVal) predSocVal.textContent = `${preds.soc.value} %`;
          if (predSocSub) predSocSub.textContent = `RandomForestRegressor (${preds.soc.features_used.length} features)`;
          if (overviewSoc) overviewSoc.textContent = `${preds.soc.value} %`;
          if (healthSoc) healthSoc.textContent = `${preds.soc.value} %`;
        } else if (preds.soc && preds.soc.status === 'MODEL_INPUT_INCOMPLETE') {
          if (predSocVal) predSocVal.textContent = 'N/A (Incomplete)';
          if (predSocSub) predSocSub.textContent = `Missing: ${preds.soc.missing_features.join(', ')}`;
        }

        // SOH Prediction (Gradient Boosting)
        if (preds.soh && preds.soh.status === 'PREDICTION_SUCCESS') {
          if (predSohVal) predSohVal.textContent = `${preds.soh.value} %`;
          if (predSohSub) predSohSub.textContent = `GradientBoostingRegressor (${preds.soh.features_used.length} features)`;
          if (overviewSoh) overviewSoh.textContent = `${preds.soh.value} %`;
          if (healthSoh) healthSoh.textContent = `${preds.soh.value} %`;
        } else if (preds.soh && preds.soh.status === 'MODEL_INPUT_INCOMPLETE') {
          if (predSohVal) predSohVal.textContent = 'N/A (Incomplete)';
          if (predSohSub) predSohSub.textContent = `Missing: ${preds.soh.missing_features.join(', ')}`;
        }

        // Anomaly Model (Isolation Forest)
        if (preds.anomaly && preds.anomaly.status === 'PREDICTION_SUCCESS') {
          const isAnomaly = preds.anomaly.is_anomaly;
          if (predAnomalyBadge) {
            predAnomalyBadge.textContent = isAnomaly ? 'ANOMALOUS' : 'NORMAL';
            predAnomalyBadge.className = isAnomaly ? 'pred-badge anomaly' : 'pred-badge valid';
          }
          if (predAnomalyScore) {
            predAnomalyScore.textContent = `IsolationForest Score: ${preds.anomaly.score}`;
          }
        } else if (preds.anomaly && preds.anomaly.status === 'MODEL_INPUT_INCOMPLETE') {
          if (predAnomalyBadge) {
            predAnomalyBadge.textContent = 'N/A (Incomplete)';
            predAnomalyBadge.className = 'pred-badge muted';
          }
          if (predAnomalyScore) {
            predAnomalyScore.textContent = `Missing: ${preds.anomaly.missing_features.join(', ')}`;
          }
        }

        // Physics Boundary Rules
        if (preds.physics_rules) {
          const pStatus = preds.physics_rules.status;
          if (predPhysicsBadge) {
            predPhysicsBadge.textContent = pStatus;
            predPhysicsBadge.className = pStatus === 'NORMAL' ? 'pred-badge valid' : 'pred-badge violation';
          }
          if (predPhysicsSub) {
            if (preds.physics_rules.violations.length > 0) {
              predPhysicsSub.textContent = preds.physics_rules.violations[0];
            } else if (preds.physics_rules.warnings.length > 0) {
              predPhysicsSub.textContent = preds.physics_rules.warnings[0];
            } else {
              predPhysicsSub.textContent = 'All physical boundaries respected';
            }
          }
        }

        // Features Utilized List
        if (predFeaturesList && result.input && result.input.features_used) {
          predFeaturesList.textContent = result.input.features_used.join(', ') || 'None';
        }

        // 3. Update Thermal Monitoring
        const rawTemp = check.parsed.temperature !== undefined ? check.parsed.temperature : check.parsed.temperature_C;
        if (thermalCurrentTemp && rawTemp !== undefined) {
          thermalCurrentTemp.textContent = formatTemperature(rawTemp);
        }
        if (thermalCurrentSub) {
          thermalCurrentSub.textContent = 'Model Telemetry Ingested';
        }
        if (thermalTrendBadge) {
          thermalTrendBadge.textContent = 'CALCE DYNAMICS ACTIVE';
          thermalTrendBadge.className = 'stat-status-badge';
        }

        // 4. Update Battery Overview
        const rawVolt = check.parsed.voltage !== undefined ? check.parsed.voltage : check.parsed.voltage_V;
        const rawCurr = check.parsed.current !== undefined ? check.parsed.current : check.parsed.current_A;
        if (overviewVoltage && rawVolt !== undefined) overviewVoltage.textContent = formatVoltage(rawVolt);
        if (overviewCurrent && rawCurr !== undefined) overviewCurrent.textContent = formatCurrent(rawCurr);
        if (overviewTemperature && rawTemp !== undefined) overviewTemperature.textContent = formatTemperature(rawTemp);
        if (overviewCrate && check.parsed.c_rate !== undefined) overviewCrate.textContent = formatCrate(check.parsed.c_rate);

        // 5. Update Risk Assessment Card
        if (preds.risk_assessment) {
          const risk = preds.risk_assessment;
          if (riskMainText) riskMainText.textContent = risk.status.replace(/_/g, ' ');
          if (riskDescText) riskDescText.textContent = risk.summary;
          if (riskStatusDisplay) {
            riskStatusDisplay.className = risk.risk_level === 'CRITICAL' 
              ? 'risk-status-display critical'
              : (risk.risk_level === 'HIGH' || risk.risk_level === 'MEDIUM' ? 'risk-status-display warning' : 'risk-status-display normal');
          }
          if (riskPill) {
            riskPill.className = risk.risk_level === 'CRITICAL'
              ? 'status-pill status-pill-critical'
              : (risk.risk_level === 'HIGH' || risk.risk_level === 'MEDIUM' ? 'status-pill status-pill-warning' : 'status-pill status-pill-success');
            riskPill.textContent = `${risk.risk_level} RISK`;
          }
        }

        // 6. Update Early Warning Card
        if (preds.early_warning) {
          const warn = preds.early_warning;
          if (warningMainText) {
            warningMainText.textContent = warn.source === 'RULE_BASED' 
              ? 'RULE-BASED ALARM' 
              : (warn.source === 'MODEL_BASED' ? 'MODEL-BASED WARNING' : 'NO ACTIVE HAZARD');
          }
          if (warningDescText) warningDescText.textContent = warn.message;
          if (warningStatusDisplay) {
            warningStatusDisplay.className = warn.level === 'CRITICAL'
              ? 'warning-status-display critical'
              : (warn.level === 'WARNING' || warn.level === 'ADVISORY' ? 'warning-status-display warning' : 'warning-status-display normal');
          }
          if (warningPill) {
            warningPill.className = warn.level === 'CRITICAL'
              ? 'status-pill status-pill-critical'
              : (warn.level === 'WARNING' || warn.level === 'ADVISORY' ? 'status-pill status-pill-warning' : 'status-pill status-pill-success');
            warningPill.textContent = warn.level;
          }
        }

        // 7. Update Battery State
        if (healthBatteryState) {
          if (preds.risk_assessment.risk_level === 'CRITICAL') {
            healthBatteryState.textContent = 'CRITICAL LIMIT EXCEEDED';
          } else if (preds.anomaly && preds.anomaly.is_anomaly) {
            healthBatteryState.textContent = 'ANOMALY DETECTED';
          } else if (preds.soh && preds.soh.value < 85.0) {
            healthBatteryState.textContent = 'DEGRADED (AGED CELL)';
          } else {
            healthBatteryState.textContent = 'NOMINAL HEALTH';
          }
        }

        // 8. Update Received Data Panel
        if (recvVoltage && rawVolt !== undefined) recvVoltage.textContent = formatVoltage(rawVolt);
        if (recvCurrent && rawCurr !== undefined) recvCurrent.textContent = formatCurrent(rawCurr);
        if (recvTemperature && rawTemp !== undefined) recvTemperature.textContent = formatTemperature(rawTemp);
        if (recvSoc) recvSoc.textContent = preds.soc && preds.soc.value ? `${preds.soc.value} %` : (check.parsed.soc ? `${check.parsed.soc} %` : 'N/A');
        if (recvSoh) recvSoh.textContent = preds.soh && preds.soh.value ? `${preds.soh.value} %` : (check.parsed.soh ? `${check.parsed.soh} %` : 'N/A');
        if (recvCrate) recvCrate.textContent = check.parsed.c_rate ? formatCrate(check.parsed.c_rate) : 'N/A';
        if (recvCycle) recvCycle.textContent = check.parsed.cycle_number !== undefined ? check.parsed.cycle_number : 'N/A';
        if (recvTime) recvTime.textContent = check.parsed.time_s !== undefined ? check.parsed.time_s : 'N/A';
        if (recvSource) recvSource.textContent = currentMode === 'demo' ? 'DATASET DEMO' : 'JSON INPUT';
        if (recvServerTime) recvServerTime.textContent = `SERVER TIME: ${formatServerTimestamp(result.timestamp)}`;

        // Log to terminal
        appendLog('INFER', `Multi-model prediction completed in ${latency} ms.`);
        if (preds.soc && preds.soc.value) appendLog('SOC', `Estimated SOC: ${preds.soc.value}% (Random Forest)`);
        if (preds.soh && preds.soh.value) appendLog('SOH', `Estimated SOH: ${preds.soh.value}% (Gradient Boosting)`);
        if (preds.anomaly && preds.anomaly.classification) appendLog('ANOM', `Anomaly status: ${preds.anomaly.classification} (Isolation Forest score: ${preds.anomaly.score})`);

        setSystemStatus(true);

      } catch (inferErr) {
        console.error('[BRAIN Phase 4] Inference network error:', inferErr);
        setDataStatus('SERVER_ERROR', 'invalid');
        showFeedback('Unable to reach prediction endpoint. Ensure Flask server is running.', false);
        appendLog('NET', 'Prediction connection error: Server unreachable.', true);
      }
    });
  }

  // 4. LOAD SAMPLE JSON BUTTON
  if (sampleJsonBtn) {
    sampleJsonBtn.addEventListener('click', () => {
      if (jsonTextarea) {
        jsonTextarea.value = SAMPLE_JSON;
      }
      setDataStatus('SAMPLE LOADED', 'pending');
      showFeedback('Demonstration sample JSON loaded. Click RUN MODEL INFERENCE or LOAD JSON.', true);
      appendLog('SYS', 'Demonstration sample JSON loaded into editor.');
    });
  }

  // 5. CLEAR BUTTON
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (jsonTextarea) jsonTextarea.value = '';

      // Reset Battery Overview
      if (overviewVoltage) overviewVoltage.textContent = '--';
      if (overviewCurrent) overviewCurrent.textContent = '--';
      if (overviewTemperature) overviewTemperature.textContent = '--';
      if (overviewSoc) overviewSoc.textContent = '--';
      if (overviewSoh) overviewSoh.textContent = '--';
      if (overviewCrate) overviewCrate.textContent = '--';

      // Reset Thermal Monitoring
      if (thermalCurrentTemp) thermalCurrentTemp.textContent = '--';
      if (thermalCurrentSub) thermalCurrentSub.textContent = 'Sensor Ingestion Pending';
      if (thermalTrendBadge) {
        thermalTrendBadge.textContent = 'WAITING FOR MODEL/DATA';
        thermalTrendBadge.className = 'stat-status-badge neutral';
      }

      // Reset Battery Health
      if (healthSoc) healthSoc.textContent = '--';
      if (healthSoh) healthSoh.textContent = '--';
      if (healthBatteryState) healthBatteryState.textContent = 'WAITING FOR DATA';

      // Reset Prediction Panel
      if (predStatusBadge) {
        predStatusBadge.textContent = 'AWAITING INFERENCE';
        predStatusBadge.className = 'pred-badge pending';
      }
      if (predLatency) predLatency.textContent = 'Latency: -- ms';
      if (predSocVal) predSocVal.textContent = '--';
      if (predSocSub) predSocSub.textContent = 'RandomForestRegressor (5 features)';
      if (predSohVal) predSohVal.textContent = '--';
      if (predSohSub) predSohSub.textContent = 'GradientBoostingRegressor (7 features)';
      if (predAnomalyBadge) {
        predAnomalyBadge.textContent = 'NOT RUN';
        predAnomalyBadge.className = 'pred-badge muted';
      }
      if (predAnomalyScore) predAnomalyScore.textContent = 'IsolationForest Score: --';
      if (predPhysicsBadge) {
        predPhysicsBadge.textContent = 'NOT EVALUATED';
        predPhysicsBadge.className = 'pred-badge muted';
      }
      if (predPhysicsSub) predPhysicsSub.textContent = 'Deterministic Rules';
      if (predFeaturesList) predFeaturesList.textContent = 'None (Execute inference to inspect feature vectors)';

      // Reset Risk & Early Warning
      if (riskMainText) riskMainText.textContent = 'SYSTEM NOT CONNECTED';
      if (riskDescText) riskDescText.textContent = 'Autonomous risk indexing and runaway hazard classification are disabled until backend validation.';
      if (riskStatusDisplay) riskStatusDisplay.className = 'risk-status-display';
      if (riskPill) {
        riskPill.className = 'status-pill status-pill-inactive';
        riskPill.textContent = 'Safety Logic';
      }

      if (warningMainText) warningMainText.textContent = 'WAITING FOR MODEL';
      if (warningDescText) warningDescText.textContent = '"Prediction and safety assessment will become available after model integration."';
      if (warningStatusDisplay) warningStatusDisplay.className = 'warning-status-display';
      if (warningPill) {
        warningPill.className = 'status-pill status-pill-warning';
        warningPill.textContent = 'Pre-Hazard Detection';
      }

      // Reset RECEIVED DATA Inspection Preview
      if (recvVoltage) recvVoltage.textContent = '--';
      if (recvCurrent) recvCurrent.textContent = '--';
      if (recvTemperature) recvTemperature.textContent = '--';
      if (recvSoc) recvSoc.textContent = '--';
      if (recvSoh) recvSoh.textContent = '--';
      if (recvCrate) recvCrate.textContent = '--';
      if (recvCycle) recvCycle.textContent = '--';
      if (recvTime) recvTime.textContent = '--';
      if (recvServerTime) recvServerTime.textContent = 'SERVER TIME: --';

      setDataStatus('WAITING FOR INPUT', 'pending');
      if (lastDataUpdate) lastDataUpdate.textContent = '--';
      hideFeedback();
      if (additionalDataContainer) additionalDataContainer.style.display = 'none';

      appendLog('APP', 'Dashboard inputs and model prediction states cleared.');
    });
  }

  // --- Initial System Boot Sequence ---
  checkHealth();
  fetchModelStatus();
  fetchDatasetStatus();
  setInterval(checkHealth, 5000);

  console.log('[BRAIN Phase 4] Model & Dataset Integration active.');
});
