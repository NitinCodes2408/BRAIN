/**
 * BRAIN — Battery Risk & Analytics Intelligence Network
 * Phase 3.5: Advanced BMS Demonstration Dashboard Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // DOM Elements Selection
  // --------------------------------------------------------------------------

  // Header & System Health Elements
  const headerSystemStatus = document.getElementById('headerSystemStatus');
  const headerSystemDot = document.getElementById('headerSystemDot');
  const headerModeBadge = document.getElementById('headerModeBadge');
  const headerBackendBadge = document.getElementById('headerBackendBadge');
  const headerModelBadge = document.getElementById('headerModelBadge');
  const headerPinnBadge = document.getElementById('headerPinnBadge');
  const dataSourceBadge = document.getElementById('dataSourceBadge');
  const healthDataSourceVal = document.getElementById('healthDataSourceVal');
  const healthPipelineVal = document.getElementById('healthPipelineVal');

  // Overview BMS Metric Cards
  const valVoltage = document.getElementById('valVoltage');
  const tagVoltage = document.getElementById('tagVoltage');
  const timeVoltage = document.getElementById('timeVoltage');

  const valCurrent = document.getElementById('valCurrent');
  const tagCurrent = document.getElementById('tagCurrent');
  const timeCurrent = document.getElementById('timeCurrent');

  const valTemperature = document.getElementById('valTemperature');
  const tagTemperature = document.getElementById('tagTemperature');
  const timeTemperature = document.getElementById('timeTemperature');

  const valSoc = document.getElementById('valSoc');
  const tagSoc = document.getElementById('tagSoc');
  const timeSoc = document.getElementById('timeSoc');

  const valSoh = document.getElementById('valSoh');
  const tagSoh = document.getElementById('tagSoh');
  const timeSoh = document.getElementById('timeSoh');

  const valCrate = document.getElementById('valCrate');
  const tagCrate = document.getElementById('tagCrate');
  const timeCrate = document.getElementById('timeCrate');

  // Circular Gauges
  const socCircle = document.getElementById('socProgressCircle');
  const socNumber = document.getElementById('socNumber');
  const sohCircle = document.getElementById('sohProgressCircle');
  const sohNumber = document.getElementById('sohNumber');

  // State & Classification Blocks
  const stateBatteryVal = document.getElementById('stateBatteryVal');
  const stateBatterySub = document.getElementById('stateBatterySub');
  const stateSafetyVal = document.getElementById('stateSafetyVal');
  const stateSafetySub = document.getElementById('stateSafetySub');
  const stateAlertVal = document.getElementById('stateAlertVal');
  const stateAlertSub = document.getElementById('stateAlertSub');

  // Thermal Monitoring Panel
  const thermalCurrentVal = document.getElementById('thermalCurrentVal');
  const thermalCurrentSub = document.getElementById('thermalCurrentSub');
  const thermalPredictedVal = document.getElementById('thermalPredictedVal');
  const thermalTrendVal = document.getElementById('thermalTrendVal');

  // Demo Controls & Scenario Buttons
  const tabDemoMode = document.getElementById('tabDemoMode');
  const tabJsonMode = document.getElementById('tabJsonMode');
  const demoControlsContainer = document.getElementById('demoControlsContainer');
  const jsonControlsContainer = document.getElementById('jsonControlsContainer');

  const btnNormal = document.getElementById('btnScenarioNormal');
  const btnFastCharge = document.getElementById('btnScenarioFastCharge');
  const btnThermalStress = document.getElementById('btnScenarioThermalStress');
  const btnAging = document.getElementById('btnScenarioAging');
  const btnAbnormal = document.getElementById('btnScenarioAbnormal');
  const btnRandom = document.getElementById('btnScenarioRandom');
  const btnReset = document.getElementById('btnScenarioReset');

  const scenarioBannerTitle = document.getElementById('scenarioBannerTitle');
  const scenarioBannerDesc = document.getElementById('scenarioBannerDesc');
  const scenarioMetaAmbient = document.getElementById('scenarioMetaAmbient');
  const scenarioMetaCrate = document.getElementById('scenarioMetaCrate');

  // JSON Input Section Elements
  const jsonTextarea = document.getElementById('batteryJsonInput');
  const btnValidateJson = document.getElementById('btnValidateJson');
  const btnLoadJson = document.getElementById('btnLoadJson');
  const btnSampleJson = document.getElementById('btnSampleJson');
  const btnClearJson = document.getElementById('btnClearJson');
  const jsonFeedback = document.getElementById('jsonFeedback');

  // Received Data Panel Elements
  const recvVoltage = document.getElementById('recvVoltage');
  const recvCurrent = document.getElementById('recvCurrent');
  const recvTemperature = document.getElementById('recvTemperature');
  const recvSoc = document.getElementById('recvSoc');
  const recvSoh = document.getElementById('recvSoh');
  const recvCrate = document.getElementById('recvCrate');
  const recvAmbient = document.getElementById('recvAmbient');
  const recvSource = document.getElementById('recvSource');
  const recvServerTime = document.getElementById('recvServerTime');

  // System Log Terminal
  const systemLogTerminal = document.getElementById('systemLogTerminal');

  // Chart Canvas
  const canvas = document.getElementById('tempTrendCanvas');
  let currentTrendData = [];

  // Local State
  let activeMode = 'demo'; // 'demo' or 'json'
  let activeScenarioId = null;

  // Predefined Sample JSON
  const SAMPLE_INPUT_JSON = `{
  "voltage": 3.70,
  "current": 4.0,
  "temperature": 30.0,
  "soc": 72,
  "soh": 96,
  "c_rate": 0.8,
  "ambient_temperature": 27.0
}`;

  // --------------------------------------------------------------------------
  // Utility Functions
  // --------------------------------------------------------------------------

  function getTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
  }

  function appendLog(prefix, message, typeClass = '') {
    if (!systemLogTerminal) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${typeClass}`;
    entry.innerHTML = `<span class="log-prefix ${prefix.toLowerCase()}">[${prefix.toUpperCase()}]</span> ${message}`;
    systemLogTerminal.appendChild(entry);
    systemLogTerminal.scrollTop = systemLogTerminal.scrollHeight;
  }

  function updateGauge(circleElement, numberElement, value, maxVal = 100) {
    if (!circleElement || !numberElement) return;
    const circumference = 440;
    const clamped = Math.max(0, Math.min(maxVal, value));
    const offset = circumference - (circumference * clamped / maxVal);
    circleElement.style.strokeDashoffset = offset;
    numberElement.textContent = `${Math.round(clamped)}%`;
  }

  // --------------------------------------------------------------------------
  // Canvas Temperature Trend Line Chart
  // --------------------------------------------------------------------------

  function drawTemperatureChart(dataPoints) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, width, height);

    if (!dataPoints || dataPoints.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Awaiting demonstration time-series telemetry...', width / 2, height / 2);
      return;
    }

    const padLeft = 45;
    const padRight = 25;
    const padTop = 25;
    const padBottom = 35;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    // Determine scale limits
    const temps = dataPoints.map(d => d.temp_c);
    const minTemp = Math.floor(Math.min(...temps, 20) / 5) * 5;
    const maxTemp = Math.ceil(Math.max(...temps, 55) / 5) * 5;

    // Draw Grid Lines & Y-Axis Labels
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px SFMono-Regular, monospace';
    ctx.textAlign = 'right';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const yVal = minTemp + (i / ySteps) * (maxTemp - minTemp);
      const yPos = padTop + plotHeight - (i / ySteps) * plotHeight;
      ctx.beginPath();
      ctx.moveTo(padLeft, yPos);
      ctx.lineTo(width - padRight, yPos);
      ctx.stroke();
      ctx.fillText(`${yVal.toFixed(0)}°C`, padLeft - 8, yPos + 3);
    }

    // Coordinates mapper
    const points = dataPoints.map((d, index) => {
      const x = padLeft + (index / (dataPoints.length - 1)) * plotWidth;
      const y = padTop + plotHeight - ((d.temp_c - minTemp) / (maxTemp - minTemp)) * plotHeight;
      return { x, y, temp: d.temp_c, offset: d.time_offset_s };
    });

    // Draw Gradient Area Under Line
    const grad = ctx.createLinearGradient(0, padTop, 0, padTop + plotHeight);
    grad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, padTop + plotHeight);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padTop + plotHeight);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Draw Line
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    points.forEach((p, index) => {
      if (index === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // Draw Points & Labels
    points.forEach((p, index) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0e17';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Time X labels
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      const timeLabel = p.offset === 0 ? 'Now' : `${p.offset / 60}m`;
      ctx.fillText(timeLabel, p.x, height - 12);
    });
  }

  // Handle window resize for chart responsiveness
  window.addEventListener('resize', () => {
    if (currentTrendData && currentTrendData.length > 0) {
      drawTemperatureChart(currentTrendData);
    }
  });

  // --------------------------------------------------------------------------
  // Apply Telemetry Scenario to UI
  // --------------------------------------------------------------------------

  function applyScenario(scenario, isDemo = true) {
    if (!scenario || !scenario.telemetry) return;

    const t = scenario.telemetry;
    const c = scenario.classification || {
      battery_state: 'TELEMETRY INGESTED',
      safety_rule_status: 'NORMAL',
      demo_alert: 'Custom JSON Ingestion',
      alert_level: 'NOMINAL',
      description: 'Live payload ingested via client/server pipeline.'
    };

    const timeStr = getTimestamp();

    // 1. Update Battery Overview Cards
    if (valVoltage) valVoltage.textContent = `${t.voltage.toFixed(2)} V`;
    if (timeVoltage) timeVoltage.textContent = `Updated: ${timeStr}`;

    if (valCurrent) valCurrent.textContent = `${t.current.toFixed(1)} A`;
    if (tagCurrent) tagCurrent.textContent = `${t.c_rate.toFixed(1)} C`;
    if (timeCurrent) timeCurrent.textContent = `Updated: ${timeStr}`;

    if (valTemperature) valTemperature.textContent = `${t.temperature.toFixed(1)} °C`;
    if (tagTemperature) {
      tagTemperature.textContent = t.temperature >= 45.0 ? 'HIGH TEMP' : 'NORMAL';
      tagTemperature.className = t.temperature >= 45.0 ? 'bms-card-tag critical' : 'bms-card-tag normal';
    }
    if (timeTemperature) timeTemperature.textContent = `Updated: ${timeStr}`;

    if (valSoc) valSoc.textContent = `${Math.round(t.soc)} %`;
    if (timeSoc) timeSoc.textContent = `Updated: ${timeStr}`;

    if (valSoh) valSoh.textContent = `${Math.round(t.soh)} %`;
    if (tagSoh) {
      tagSoh.textContent = t.soh >= 90 ? 'EXCELLENT' : (t.soh >= 80 ? 'GOOD' : 'AGED CELL');
      tagSoh.className = t.soh >= 90 ? 'bms-card-tag normal' : (t.soh >= 80 ? 'bms-card-tag warning' : 'bms-card-tag critical');
    }
    if (timeSoh) timeSoh.textContent = `Updated: ${timeStr}`;

    if (valCrate) valCrate.textContent = `${t.c_rate.toFixed(1)} C`;
    if (tagCrate) {
      tagCrate.textContent = t.c_rate >= 2.0 ? 'HIGH RATE' : 'CONTINUOUS';
      tagCrate.className = t.c_rate >= 2.0 ? 'bms-card-tag warning' : 'bms-card-tag normal';
    }
    if (timeCrate) timeCrate.textContent = `Updated: ${timeStr}`;

    // 2. Update Circular Gauges
    updateGauge(socCircle, socNumber, t.soc);
    updateGauge(sohCircle, sohNumber, t.soh);

    // 3. Update Battery State & Safety Blocks
    if (stateBatteryVal) stateBatteryVal.textContent = c.battery_state;
    if (stateBatterySub) stateBatterySub.textContent = isDemo ? 'PREDEFINED DEMO SCENARIO STATE' : 'CLIENT INGESTION STATE';

    if (stateSafetyVal) {
      stateSafetyVal.textContent = c.safety_rule_status;
      stateSafetyVal.style.color = c.safety_rule_status === 'HIGH TEMPERATURE' ? '#f87171' : (c.safety_rule_status === 'ATTENTION' ? '#fbbf24' : '#4ade80');
    }

    if (stateAlertVal) {
      stateAlertVal.textContent = c.demo_alert;
      stateAlertVal.style.color = c.alert_level === 'CRITICAL' || c.alert_level === 'WARNING' ? '#f87171' : (c.alert_level === 'ATTENTION' ? '#fbbf24' : '#4ade80');
    }

    // 4. Update Thermal Monitoring
    if (thermalCurrentVal) thermalCurrentVal.textContent = `${t.temperature.toFixed(1)} °C`;
    if (thermalCurrentSub) thermalCurrentSub.textContent = isDemo ? 'Demo Thermocouple Reading' : 'Ingested Sensor Reading';
    if (thermalPredictedVal) thermalPredictedVal.textContent = 'MODEL NOT CONNECTED';
    if (thermalTrendVal) thermalTrendVal.textContent = isDemo ? 'DEMO TREND' : 'TELEMETRY TREND';

    // 5. Update Received Data Panel
    if (recvVoltage) recvVoltage.textContent = `${t.voltage.toFixed(2)} V`;
    if (recvCurrent) recvCurrent.textContent = `${t.current.toFixed(1)} A`;
    if (recvTemperature) recvTemperature.textContent = `${t.temperature.toFixed(1)} °C`;
    if (recvSoc) recvSoc.textContent = `${Math.round(t.soc)} %`;
    if (recvSoh) recvSoh.textContent = `${Math.round(t.soh)} %`;
    if (recvCrate) recvCrate.textContent = `${t.c_rate.toFixed(1)} C`;
    if (recvAmbient) recvAmbient.textContent = t.ambient_temperature !== undefined ? `${t.ambient_temperature.toFixed(1)} °C` : '--';
    if (recvSource) recvSource.textContent = isDemo ? 'DEMO / SIMULATED' : 'JSON INPUT';
    if (recvServerTime) recvServerTime.textContent = timeStr;

    // 6. Update Temperature Trend Chart
    if (scenario.temperature_trend) {
      currentTrendData = scenario.temperature_trend;
      drawTemperatureChart(currentTrendData);
    } else {
      // Create synthetic 6-point trend for custom JSON
      currentTrendData = [
        { time_offset_s: -300, temp_c: Math.max(20, t.temperature - 3.2) },
        { time_offset_s: -240, temp_c: Math.max(20, t.temperature - 2.4) },
        { time_offset_s: -180, temp_c: Math.max(20, t.temperature - 1.8) },
        { time_offset_s: -120, temp_c: Math.max(20, t.temperature - 1.0) },
        { time_offset_s: -60, temp_c: Math.max(20, t.temperature - 0.4) },
        { time_offset_s: 0, temp_c: t.temperature }
      ];
      drawTemperatureChart(currentTrendData);
    }

    // 7. Update Banner Meta
    if (scenarioBannerTitle) scenarioBannerTitle.textContent = scenario.name || 'DEMO SCENARIO';
    if (scenarioBannerDesc) scenarioBannerDesc.textContent = c.description || '';
    if (scenarioMetaAmbient) scenarioMetaAmbient.textContent = `Ambient: ${t.ambient_temperature || 27}°C`;
    if (scenarioMetaCrate) scenarioMetaCrate.textContent = `Rate: ${t.c_rate}C`;

    // 8. System Log Records
    if (isDemo) {
      appendLog('DEMO', `Scenario loaded: ${scenario.name || 'DEMO SCENARIO'}`);
      appendLog('DATA', `Voltage: ${t.voltage.toFixed(2)} V | Current: ${t.current.toFixed(1)} A | Temp: ${t.temperature.toFixed(1)} °C`);
      appendLog('DATA', `SOC: ${t.soc}% | SOH: ${t.soh}% | C-Rate: ${t.c_rate}C`);
      appendLog('DEMO', `Safety rule status: ${c.safety_rule_status}`);
    } else {
      appendLog('DATA', `Custom JSON ingested. Voltage: ${t.voltage}V, Temp: ${t.temperature}°C, SOC: ${t.soc}%`);
    }
  }

  // --------------------------------------------------------------------------
  // Demo Scenario Loading Buttons Handlers
  // --------------------------------------------------------------------------

  const scenarioButtons = [
    { btn: btnNormal, id: 'normal' },
    { btn: btnFastCharge, id: 'fast_charging' },
    { btn: btnThermalStress, id: 'thermal_stress' },
    { btn: btnAging, id: 'aging' },
    { btn: btnAbnormal, id: 'abnormal' }
  ];

  function setActiveButton(activeBtn) {
    scenarioButtons.forEach(item => {
      if (item.btn) item.btn.classList.remove('active');
    });
    if (btnRandom) btnRandom.classList.remove('active');
    if (activeBtn) activeBtn.classList.add('active');
  }

  async function loadScenarioFromServer(scenarioId, buttonElement) {
    try {
      const response = await fetch(`/api/demo/scenario/${scenarioId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.scenario) {
          activeScenarioId = scenarioId;
          setActiveButton(buttonElement);
          setDataSourceMode('demo');
          applyScenario(data.scenario, true);
        }
      } else {
        appendLog('ERR', `Failed to load demo scenario: ${scenarioId}`);
      }
    } catch (err) {
      appendLog('ERR', `Demo API connection error: ${err.message}`);
    }
  }

  scenarioButtons.forEach(item => {
    if (item.btn) {
      item.btn.addEventListener('click', () => {
        loadScenarioFromServer(item.id, item.btn);
      });
    }
  });

  if (btnRandom) {
    btnRandom.addEventListener('click', () => {
      loadScenarioFromServer('random', btnRandom);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      resetDashboard();
    });
  }

  function resetDashboard() {
    activeScenarioId = null;
    setActiveButton(null);

    // Reset metric values
    if (valVoltage) valVoltage.textContent = '-- V';
    if (valCurrent) valCurrent.textContent = '-- A';
    if (valTemperature) valTemperature.textContent = '-- °C';
    if (valSoc) valSoc.textContent = '-- %';
    if (valSoh) valSoh.textContent = '-- %';
    if (valCrate) valCrate.textContent = '-- C';

    if (tagVoltage) tagVoltage.textContent = 'AWAITING DATA';
    if (tagCurrent) tagCurrent.textContent = '--';
    if (tagTemperature) { tagTemperature.textContent = '--'; tagTemperature.className = 'bms-card-tag'; }
    if (tagSoc) tagSoc.textContent = '--';
    if (tagSoh) { tagSoh.textContent = '--'; tagSoh.className = 'bms-card-tag'; }
    if (tagCrate) { tagCrate.textContent = '--'; tagCrate.className = 'bms-card-tag'; }

    // Reset gauges
    updateGauge(socCircle, socNumber, 0);
    updateGauge(sohCircle, sohNumber, 0);

    // Reset states
    if (stateBatteryVal) stateBatteryVal.textContent = 'STANDBY';
    if (stateBatterySub) stateBatterySub.textContent = 'Select a demo scenario or load JSON';
    if (stateSafetyVal) { stateSafetyVal.textContent = 'STANDBY'; stateSafetyVal.style.color = '#94a3b8'; }
    if (stateAlertVal) { stateAlertVal.textContent = 'No active demo scenario'; stateAlertVal.style.color = '#94a3b8'; }

    // Reset thermal
    if (thermalCurrentVal) thermalCurrentVal.textContent = '-- °C';
    if (thermalPredictedVal) thermalPredictedVal.textContent = 'MODEL NOT CONNECTED';
    if (thermalTrendVal) thermalTrendVal.textContent = 'WAITING FOR DATA';

    // Reset received
    if (recvVoltage) recvVoltage.textContent = '--';
    if (recvCurrent) recvCurrent.textContent = '--';
    if (recvTemperature) recvTemperature.textContent = '--';
    if (recvSoc) recvSoc.textContent = '--';
    if (recvSoh) recvSoh.textContent = '--';
    if (recvCrate) recvCrate.textContent = '--';
    if (recvAmbient) recvAmbient.textContent = '--';
    if (recvServerTime) recvServerTime.textContent = '--';

    // Clear chart
    currentTrendData = [];
    drawTemperatureChart([]);

    if (scenarioBannerTitle) scenarioBannerTitle.textContent = 'DEMO STANDBY — NO ACTIVE SCENARIO';
    if (scenarioBannerDesc) scenarioBannerDesc.textContent = 'Select one of the controlled demonstration scenarios above to simulate real-time battery behavior.';

    appendLog('SYS', 'Dashboard reset to standby state.');
  }

  // --------------------------------------------------------------------------
  // Mode Switcher (Demo Scenarios vs Custom JSON)
  // --------------------------------------------------------------------------

  function setDataSourceMode(mode) {
    activeMode = mode;
    if (mode === 'demo') {
      if (tabDemoMode) tabDemoMode.classList.add('active');
      if (tabJsonMode) tabJsonMode.classList.remove('active');
      if (demoControlsContainer) demoControlsContainer.style.display = 'block';
      if (jsonControlsContainer) jsonControlsContainer.style.display = 'none';
      if (dataSourceBadge) {
        dataSourceBadge.textContent = 'DATA SOURCE: DEMO / SIMULATED';
        dataSourceBadge.classList.remove('json-mode');
      }
      if (healthDataSourceVal) healthDataSourceVal.textContent = 'DEMO';
      if (headerModeBadge) headerModeBadge.textContent = 'MODE: DEMO';
    } else {
      if (tabJsonMode) tabJsonMode.classList.add('active');
      if (tabDemoMode) tabDemoMode.classList.remove('active');
      if (demoControlsContainer) demoControlsContainer.style.display = 'none';
      if (jsonControlsContainer) jsonControlsContainer.style.display = 'block';
      if (dataSourceBadge) {
        dataSourceBadge.textContent = 'DATA SOURCE: JSON INPUT';
        dataSourceBadge.classList.add('json-mode');
      }
      if (healthDataSourceVal) healthDataSourceVal.textContent = 'JSON INPUT';
      if (headerModeBadge) headerModeBadge.textContent = 'MODE: JSON';
    }
  }

  if (tabDemoMode) {
    tabDemoMode.addEventListener('click', () => {
      setDataSourceMode('demo');
      appendLog('SYS', 'Switched to DEMO / SIMULATION mode.');
    });
  }

  if (tabJsonMode) {
    tabJsonMode.addEventListener('click', () => {
      setDataSourceMode('json');
      appendLog('SYS', 'Switched to CUSTOM JSON INPUT mode.');
    });
  }

  // --------------------------------------------------------------------------
  // Custom JSON Input Actions
  // --------------------------------------------------------------------------

  if (btnSampleJson) {
    btnSampleJson.addEventListener('click', () => {
      if (jsonTextarea) jsonTextarea.value = SAMPLE_INPUT_JSON;
      if (jsonFeedback) {
        jsonFeedback.textContent = 'Demonstration sample JSON loaded. Click VALIDATE or LOAD JSON.';
        jsonFeedback.className = 'disclaimer-box';
        jsonFeedback.style.color = '#4ade80';
      }
    });
  }

  if (btnClearJson) {
    btnClearJson.addEventListener('click', () => {
      if (jsonTextarea) jsonTextarea.value = '';
      if (jsonFeedback) jsonFeedback.textContent = '';
    });
  }

  if (btnValidateJson) {
    btnValidateJson.addEventListener('click', () => {
      const raw = jsonTextarea ? jsonTextarea.value.trim() : '';
      if (!raw) {
        showJsonFeedback('Please provide JSON payload to validate.', false);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed.voltage || !parsed.current || !parsed.temperature) {
          showJsonFeedback('Validation error: Required fields missing (voltage, current, temperature).', false);
          return;
        }
        showJsonFeedback('JSON schema valid! Ready for backend ingestion.', true);
        appendLog('VAL', 'Client-side JSON schema validation passed.');
      } catch (err) {
        showJsonFeedback(`Syntax error: ${err.message}`, false);
      }
    });
  }

  if (btnLoadJson) {
    btnLoadJson.addEventListener('click', async () => {
      const raw = jsonTextarea ? jsonTextarea.value.trim() : '';
      if (!raw) {
        showJsonFeedback('Please provide JSON payload to load.', false);
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        const response = await fetch('/api/battery-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed)
        });
        const result = await response.json();
        if (response.ok && result.success) {
          showJsonFeedback('Telemetry successfully ingested into backend pipeline!', true);
          setDataSourceMode('json');
          applyScenario({
            name: 'CUSTOM TELEMETRY PAYLOAD',
            telemetry: result.data.structured,
            classification: {
              battery_state: 'TELEMETRY INGESTED',
              safety_rule_status: result.data.structured.temperature >= 45 ? 'HIGH TEMPERATURE' : 'NORMAL',
              demo_alert: 'Custom JSON Received',
              alert_level: 'NOMINAL',
              description: 'Standard JSON telemetry structured through Flask backend validator.'
            }
          }, false);
        } else {
          showJsonFeedback(`Backend validation error: ${result.message}`, false);
        }
      } catch (err) {
        showJsonFeedback(`Ingestion error: ${err.message}`, false);
      }
    });
  }

  function showJsonFeedback(msg, isSuccess) {
    if (!jsonFeedback) return;
    jsonFeedback.textContent = msg;
    jsonFeedback.style.color = isSuccess ? '#4ade80' : '#f87171';
  }

  // --------------------------------------------------------------------------
  // Health & Liveness Check
  // --------------------------------------------------------------------------

  async function checkHealth() {
    try {
      const response = await fetch('/health');
      if (response.ok) {
        const data = await response.json();
        if (headerSystemStatus) headerSystemStatus.textContent = 'SYSTEM: ONLINE';
        if (headerSystemDot) headerSystemDot.className = 'status-dot online';
        if (headerBackendBadge) {
          headerBackendBadge.textContent = 'BACKEND: CONNECTED';
          headerBackendBadge.className = 'badge badge-online';
        }
        if (healthPipelineVal) {
          healthPipelineVal.textContent = 'READY';
          healthPipelineVal.style.color = '#4ade80';
        }
        return true;
      }
    } catch (err) {
      if (headerSystemStatus) headerSystemStatus.textContent = 'SYSTEM: OFFLINE';
      if (headerSystemDot) headerSystemDot.className = 'status-dot offline';
      if (headerBackendBadge) {
        headerBackendBadge.textContent = 'BACKEND: OFFLINE';
        headerBackendBadge.className = 'badge badge-offline';
      }
      if (healthPipelineVal) {
        healthPipelineVal.textContent = 'ERROR';
        healthPipelineVal.style.color = '#f87171';
      }
    }
    return false;
  }

  // --------------------------------------------------------------------------
  // System Initialization Sequence
  // --------------------------------------------------------------------------

  appendLog('SYS', 'BRAIN initialized');
  appendLog('SYS', 'Flask backend connected');
  appendLog('DATA', 'Demo mode enabled');
  appendLog('MODEL', 'Prediction unavailable (Model not connected)');
  appendLog('PINN', 'Thermal model not connected');

  checkHealth();
  setInterval(checkHealth, 5000);

  // Load Scenario 1 (Normal Operation) by default on initial startup
  loadScenarioFromServer('normal', btnNormal);
});
