/**
 * BRAIN — Battery Risk & Analytics Intelligence Network
 * Phase 3.6: Manual Battery Telemetry & BMS Test Dashboard Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. DOM Elements Selection
  // --------------------------------------------------------------------------

  // Header & Health Badges
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

  // Manual Input Form Fields
  const inputVoltage = document.getElementById('manualVoltage');
  const inputCurrent = document.getElementById('manualCurrent');
  const inputTemperature = document.getElementById('manualTemperature');
  const inputSoc = document.getElementById('manualSoc');
  const inputSoh = document.getElementById('manualSoh');
  const inputCrate = document.getElementById('manualCrate');
  const inputAmbient = document.getElementById('manualAmbient');

  // Manual Controls & Buttons
  const btnSubmitManual = document.getElementById('btnSubmitManual');
  const btnResetManual = document.getElementById('btnResetManual');
  const manualFeedback = document.getElementById('manualFeedback');

  // Quick Scenario Preset Buttons
  const presetNormal = document.getElementById('presetNormal');
  const presetFastCharge = document.getElementById('presetFastCharge');
  const presetThermalStress = document.getElementById('presetThermalStress');
  const presetAging = document.getElementById('presetAging');
  const presetAbnormal = document.getElementById('presetAbnormal');

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

  // Temperature Trend Canvas
  const canvas = document.getElementById('tempTrendCanvas');

  // --------------------------------------------------------------------------
  // 2. In-Memory State & History Storage
  // --------------------------------------------------------------------------
  let manualReadingsHistory = [];
  let currentPresetTag = 'MANUAL TELEMETRY RECEIVED';

  const DEFAULT_MANUAL_INPUTS = {
    voltage: 3.70,
    current: 5.00,
    temperature: 32.5,
    soc: 70,
    soh: 95,
    c_rate: 1.0,
    ambient_temperature: 25.0
  };

  const PRESETS = {
    normal: {
      voltage: 3.70,
      current: 4.0,
      temperature: 30.0,
      soc: 72,
      soh: 96,
      c_rate: 0.8,
      ambient_temperature: 27.0,
      stateLabel: 'NORMAL'
    },
    fast_charge: {
      voltage: 4.05,
      current: 15.0,
      temperature: 38.0,
      soc: 61,
      soh: 96,
      c_rate: 2.5,
      ambient_temperature: 27.0,
      stateLabel: 'FAST CHARGING'
    },
    thermal_stress: {
      voltage: 3.82,
      current: 12.0,
      temperature: 45.0,
      soc: 54,
      soh: 94,
      c_rate: 2.0,
      ambient_temperature: 35.0,
      stateLabel: 'THERMAL STRESS'
    },
    aging: {
      voltage: 3.65,
      current: 10.0,
      temperature: 41.0,
      soc: 48,
      soh: 78,
      c_rate: 1.7,
      ambient_temperature: 32.0,
      stateLabel: 'AGING'
    },
    abnormal: {
      voltage: 3.55,
      current: 18.0,
      temperature: 52.0,
      soc: 43,
      soh: 76,
      c_rate: 3.0,
      ambient_temperature: 35.0,
      stateLabel: 'ABNORMAL DEMO'
    }
  };

  // --------------------------------------------------------------------------
  // 3. Helper Functions
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

  function showFeedback(message, isSuccess = true) {
    if (!manualFeedback) return;
    manualFeedback.textContent = message;
    manualFeedback.className = isSuccess 
      ? 'manual-feedback-banner success' 
      : 'manual-feedback-banner error';
    manualFeedback.style.display = 'block';
  }

  function hideFeedback() {
    if (!manualFeedback) return;
    manualFeedback.style.display = 'none';
    manualFeedback.textContent = '';
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
  // 4. Interactive Temperature Trend Canvas
  // --------------------------------------------------------------------------

  function drawManualTemperatureChart() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = canvas.parentElement.clientHeight;

    ctx.clearRect(0, 0, width, height);

    if (manualReadingsHistory.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No manual telemetry readings recorded yet.', width / 2, height / 2 - 8);
      ctx.fillText('Enter values and click SUBMIT TELEMETRY.', width / 2, height / 2 + 12);
      return;
    }

    if (manualReadingsHistory.length === 1) {
      const r = manualReadingsHistory[0];
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Reading 1: ${r.temp.toFixed(1)}°C at ${r.time}`, width / 2, height / 2 - 10);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px SFMono-Regular, monospace';
      ctx.fillText('Waiting for additional manual readings to plot trend line...', width / 2, height / 2 + 12);
      return;
    }

    // Multiple readings: Plot time-series line chart
    const padLeft = 45;
    const padRight = 35;
    const padTop = 25;
    const padBottom = 35;
    const plotWidth = width - padLeft - padRight;
    const plotHeight = height - padTop - padBottom;

    const temps = manualReadingsHistory.map(d => d.temp);
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

    // Map data points
    const points = manualReadingsHistory.map((d, index) => {
      const x = padLeft + (index / (manualReadingsHistory.length - 1)) * plotWidth;
      const y = padTop + plotHeight - ((d.temp - minTemp) / (maxTemp - minTemp)) * plotHeight;
      return { x, y, temp: d.temp, label: `R${d.index}`, time: d.time };
    });

    // Draw Area Gradient Under Line
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

    // Draw Points & Point Labels
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#0a0e17';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Top Temp Label
      ctx.fillStyle = '#f1f5f9';
      ctx.font = 'bold 10px SFMono-Regular, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.temp.toFixed(1)}°`, p.x, p.y - 8);

      // Bottom Reading Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px SFMono-Regular, monospace';
      ctx.fillText(p.label, p.x, height - 12);
    });
  }

  window.addEventListener('resize', drawManualTemperatureChart);

  // --------------------------------------------------------------------------
  // 5. Input Validation & Form Reading
  // --------------------------------------------------------------------------

  function validateManualInputs() {
    const rawV = inputVoltage ? inputVoltage.value.trim() : '';
    const rawI = inputCurrent ? inputCurrent.value.trim() : '';
    const rawT = inputTemperature ? inputTemperature.value.trim() : '';
    const rawSoc = inputSoc ? inputSoc.value.trim() : '';
    const rawSoh = inputSoh ? inputSoh.value.trim() : '';
    const rawCrate = inputCrate ? inputCrate.value.trim() : '';
    const rawAmb = inputAmbient ? inputAmbient.value.trim() : '';

    // Check required presence
    if (!rawV || !rawI || !rawT) {
      return { valid: false, message: 'INVALID INPUT: Voltage, Current, and Temperature are required.' };
    }

    const v = parseFloat(rawV);
    const i = parseFloat(rawI);
    const t = parseFloat(rawT);
    const soc = rawSoc !== '' ? parseFloat(rawSoc) : 70.0;
    const soh = rawSoh !== '' ? parseFloat(rawSoh) : 95.0;
    const crate = rawCrate !== '' ? parseFloat(rawCrate) : 1.0;
    const amb = rawAmb !== '' ? parseFloat(rawAmb) : 25.0;

    // Check NaN / IsFinite
    if (isNaN(v) || isNaN(i) || isNaN(t) || isNaN(soc) || isNaN(soh) || isNaN(crate) || isNaN(amb)) {
      return { valid: false, message: 'INVALID INPUT: All fields must be valid numeric values.' };
    }

    if (!isFinite(v) || !isFinite(i) || !isFinite(t) || !isFinite(soc) || !isFinite(soh) || !isFinite(crate) || !isFinite(amb)) {
      return { valid: false, message: 'INVALID INPUT: Infinity or non-finite numbers are rejected.' };
    }

    // Physical constraints
    if (v <= 0) {
      return { valid: false, message: 'INVALID INPUT: Voltage must be a positive number greater than 0.' };
    }

    if (soc < 0 || soc > 100) {
      return { valid: false, message: 'INVALID INPUT: SOC must be between 0 and 100.' };
    }

    if (soh < 0 || soh > 100) {
      return { valid: false, message: 'INVALID INPUT: SOH must be between 0 and 100.' };
    }

    if (crate < 0) {
      return { valid: false, message: 'INVALID INPUT: C-Rate must be greater than or equal to 0.' };
    }

    return {
      valid: true,
      data: {
        voltage: v,
        current: i,
        temperature: t,
        soc: soc,
        soh: soh,
        c_rate: crate,
        ambient_temperature: amb
      }
    };
  }

  // --------------------------------------------------------------------------
  // 6. Submit Telemetry to Backend (POST /api/battery-data)
  // --------------------------------------------------------------------------

  async function submitManualTelemetry() {
    const check = validateManualInputs();
    if (!check.valid) {
      showFeedback(check.message, false);
      appendLog('VAL', check.message);
      return;
    }

    hideFeedback();
    const payload = check.data;

    try {
      const response = await fetch('/api/battery-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showFeedback(`Backend Error: ${result.message || 'Validation failed.'}`, false);
        appendLog('ERR', `Submission rejected: ${result.message}`);
        return;
      }

      // Success Ingestion: Update UI Components
      showFeedback('Manual telemetry successfully validated and ingested by backend!', true);
      const timeStr = getTimestamp();

      // 1. Update Battery Overview Cards
      if (valVoltage) valVoltage.textContent = `${payload.voltage.toFixed(2)} V`;
      if (timeVoltage) timeVoltage.textContent = `Updated: ${timeStr}`;

      if (valCurrent) valCurrent.textContent = `${payload.current.toFixed(2)} A`;
      if (tagCurrent) tagCurrent.textContent = `${payload.c_rate.toFixed(1)} C`;
      if (timeCurrent) timeCurrent.textContent = `Updated: ${timeStr}`;

      if (valTemperature) valTemperature.textContent = `${payload.temperature.toFixed(1)} °C`;
      if (tagTemperature) {
        tagTemperature.textContent = payload.temperature >= 45.0 ? 'HIGH TEMP' : 'NORMAL';
        tagTemperature.className = payload.temperature >= 45.0 ? 'bms-card-tag critical' : 'bms-card-tag normal';
      }
      if (timeTemperature) timeTemperature.textContent = `Updated: ${timeStr}`;

      if (valSoc) valSoc.textContent = `${Math.round(payload.soc)} %`;
      if (timeSoc) timeSoc.textContent = `Updated: ${timeStr}`;

      if (valSoh) valSoh.textContent = `${Math.round(payload.soh)} %`;
      if (tagSoh) {
        tagSoh.textContent = payload.soh >= 90 ? 'EXCELLENT' : (payload.soh >= 80 ? 'GOOD' : 'AGED CELL');
        tagSoh.className = payload.soh >= 90 ? 'bms-card-tag normal' : (payload.soh >= 80 ? 'bms-card-tag warning' : 'bms-card-tag critical');
      }
      if (timeSoh) timeSoh.textContent = `Updated: ${timeStr}`;

      if (valCrate) valCrate.textContent = `${payload.c_rate.toFixed(1)} C`;
      if (tagCrate) {
        tagCrate.textContent = payload.c_rate >= 2.0 ? 'HIGH RATE' : 'CONTINUOUS';
        tagCrate.className = payload.c_rate >= 2.0 ? 'bms-card-tag warning' : 'bms-card-tag normal';
      }
      if (timeCrate) timeCrate.textContent = `Updated: ${timeStr}`;

      // 2. Animate Circular Gauges
      updateGauge(socCircle, socNumber, payload.soc);
      updateGauge(sohCircle, sohNumber, payload.soh);

      // 3. Update Battery State & Safety Status
      if (stateBatteryVal) stateBatteryVal.textContent = currentPresetTag;
      if (stateBatterySub) stateBatterySub.textContent = 'MANUAL DEMO STATE';

      if (stateSafetyVal) {
        const isHighTemp = payload.temperature >= 45.0;
        stateSafetyVal.textContent = isHighTemp ? 'HIGH TEMPERATURE' : (payload.c_rate >= 2.0 ? 'ATTENTION' : 'NORMAL');
        stateSafetyVal.style.color = isHighTemp ? '#f87171' : (payload.c_rate >= 2.0 ? '#fbbf24' : '#4ade80');
      }

      if (stateAlertVal) {
        if (payload.temperature >= 45.0) {
          stateAlertVal.textContent = 'HIGH TEMPERATURE DEMO ALERT';
          stateAlertVal.style.color = '#f87171';
        } else if (payload.c_rate >= 2.0) {
          stateAlertVal.textContent = 'HIGH C-RATE LOAD CONDITION';
          stateAlertVal.style.color = '#fbbf24';
        } else {
          stateAlertVal.textContent = 'DEMO SCENARIO ACTIVE';
          stateAlertVal.style.color = '#4ade80';
        }
      }

      // 4. Update Thermal Monitoring
      if (thermalCurrentVal) thermalCurrentVal.textContent = `${payload.temperature.toFixed(1)} °C`;
      if (thermalCurrentSub) thermalCurrentSub.textContent = 'Manually Submitted Reading';
      if (thermalPredictedVal) thermalPredictedVal.textContent = 'MODEL NOT CONNECTED';
      if (thermalTrendVal) thermalTrendVal.textContent = 'MANUAL DEMO TREND';

      // 5. Update Received Data Panel
      if (recvVoltage) recvVoltage.textContent = `${payload.voltage.toFixed(2)} V`;
      if (recvCurrent) recvCurrent.textContent = `${payload.current.toFixed(2)} A`;
      if (recvTemperature) recvTemperature.textContent = `${payload.temperature.toFixed(1)} °C`;
      if (recvSoc) recvSoc.textContent = `${Math.round(payload.soc)} %`;
      if (recvSoh) recvSoh.textContent = `${Math.round(payload.soh)} %`;
      if (recvCrate) recvCrate.textContent = `${payload.c_rate.toFixed(1)} C`;
      if (recvAmbient) recvAmbient.textContent = `${payload.ambient_temperature.toFixed(1)} °C`;
      if (recvSource) recvSource.textContent = 'MANUAL DEMO INPUT';
      if (recvServerTime) recvServerTime.textContent = timeStr;

      // 6. Append to Manual Temperature History & Redraw Chart
      manualReadingsHistory.push({
        index: manualReadingsHistory.length + 1,
        temp: payload.temperature,
        time: timeStr
      });
      drawManualTemperatureChart();

      // 7. Data Source Badge
      if (dataSourceBadge) {
        dataSourceBadge.textContent = 'DATA SOURCE: MANUAL DEMO INPUT';
        dataSourceBadge.className = 'data-source-badge manual-mode';
      }
      if (healthDataSourceVal) healthDataSourceVal.textContent = 'MANUAL DEMO';

      // 8. Log Detailed Real Events
      appendLog('DATA', 'Manual telemetry received');
      appendLog('DATA', `Voltage: ${payload.voltage.toFixed(2)} V`);
      appendLog('DATA', `Current: ${payload.current.toFixed(2)} A`);
      appendLog('DATA', `Temperature: ${payload.temperature.toFixed(1)} °C`);
      appendLog('DATA', `SOC: ${Math.round(payload.soc)} %`);
      appendLog('DATA', `SOH: ${Math.round(payload.soh)} %`);
      appendLog('DATA', 'Source: MANUAL DEMO INPUT');

    } catch (netErr) {
      showFeedback(`Network Error: ${netErr.message}`, false);
      appendLog('ERR', `Pipeline network error: ${netErr.message}`);
    }
  }

  // --------------------------------------------------------------------------
  // 7. Preset Button Handlers (Populate Fields Only — Do NOT Auto-Submit)
  // --------------------------------------------------------------------------

  function populatePreset(presetKey) {
    const p = PRESETS[presetKey];
    if (!p) return;

    if (inputVoltage) inputVoltage.value = p.voltage.toFixed(2);
    if (inputCurrent) inputCurrent.value = p.current.toFixed(1);
    if (inputTemperature) inputTemperature.value = p.temperature.toFixed(1);
    if (inputSoc) inputSoc.value = p.soc;
    if (inputSoh) inputSoh.value = p.soh;
    if (inputCrate) inputCrate.value = p.c_rate.toFixed(1);
    if (inputAmbient) inputAmbient.value = p.ambient_temperature.toFixed(1);

    currentPresetTag = p.stateLabel;
    showFeedback(`Preset '${p.stateLabel}' populated into fields. Click SUBMIT TELEMETRY to send.`, true);
    appendLog('UI', `Preset values populated: ${p.stateLabel}`);
  }

  if (presetNormal) presetNormal.addEventListener('click', () => populatePreset('normal'));
  if (presetFastCharge) presetFastCharge.addEventListener('click', () => populatePreset('fast_charge'));
  if (presetThermalStress) presetThermalStress.addEventListener('click', () => populatePreset('thermal_stress'));
  if (presetAging) presetAging.addEventListener('click', () => populatePreset('aging'));
  if (presetAbnormal) presetAbnormal.addEventListener('click', () => populatePreset('abnormal'));

  // --------------------------------------------------------------------------
  // 8. Submit & Reset Actions
  // --------------------------------------------------------------------------

  if (btnSubmitManual) {
    btnSubmitManual.addEventListener('click', submitManualTelemetry);
  }

  if (btnResetManual) {
    btnResetManual.addEventListener('click', () => {
      // Restore default input values
      if (inputVoltage) inputVoltage.value = DEFAULT_MANUAL_INPUTS.voltage.toFixed(2);
      if (inputCurrent) inputCurrent.value = DEFAULT_MANUAL_INPUTS.current.toFixed(2);
      if (inputTemperature) inputTemperature.value = DEFAULT_MANUAL_INPUTS.temperature.toFixed(1);
      if (inputSoc) inputSoc.value = DEFAULT_MANUAL_INPUTS.soc;
      if (inputSoh) inputSoh.value = DEFAULT_MANUAL_INPUTS.soh;
      if (inputCrate) inputCrate.value = DEFAULT_MANUAL_INPUTS.c_rate.toFixed(1);
      if (inputAmbient) inputAmbient.value = DEFAULT_MANUAL_INPUTS.ambient_temperature.toFixed(1);

      // Clear manual trend history
      manualReadingsHistory = [];
      drawManualTemperatureChart();

      // Reset Overview Cards
      if (valVoltage) valVoltage.textContent = '-- V';
      if (valCurrent) valCurrent.textContent = '-- A';
      if (valTemperature) valTemperature.textContent = '-- °C';
      if (valSoc) valSoc.textContent = '-- %';
      if (valSoh) valSoh.textContent = '-- %';
      if (valCrate) valCrate.textContent = '-- C';

      if (tagVoltage) tagVoltage.textContent = 'STANDBY';
      if (tagCurrent) tagCurrent.textContent = '--';
      if (tagTemperature) { tagTemperature.textContent = '--'; tagTemperature.className = 'bms-card-tag'; }
      if (tagSoc) tagSoc.textContent = '--';
      if (tagSoh) { tagSoh.textContent = '--'; tagSoh.className = 'bms-card-tag'; }
      if (tagCrate) { tagCrate.textContent = '--'; tagCrate.className = 'bms-card-tag'; }

      // Reset Gauges
      updateGauge(socCircle, socNumber, 0);
      updateGauge(sohCircle, sohNumber, 0);

      // Reset States
      if (stateBatteryVal) stateBatteryVal.textContent = 'STANDBY';
      if (stateBatterySub) stateBatterySub.textContent = 'Enter values & click SUBMIT TELEMETRY';
      if (stateSafetyVal) { stateSafetyVal.textContent = 'STANDBY'; stateSafetyVal.style.color = '#94a3b8'; }
      if (stateAlertVal) { stateAlertVal.textContent = 'No active demo telemetry'; stateAlertVal.style.color = '#94a3b8'; }

      // Reset Thermal
      if (thermalCurrentVal) thermalCurrentVal.textContent = '-- °C';
      if (thermalPredictedVal) thermalPredictedVal.textContent = 'MODEL NOT CONNECTED';
      if (thermalTrendVal) thermalTrendVal.textContent = 'WAITING FOR DATA';

      // Reset Received Data Panel
      if (recvVoltage) recvVoltage.textContent = '--';
      if (recvCurrent) recvCurrent.textContent = '--';
      if (recvTemperature) recvTemperature.textContent = '--';
      if (recvSoc) recvSoc.textContent = '--';
      if (recvSoh) recvSoh.textContent = '--';
      if (recvCrate) recvCrate.textContent = '--';
      if (recvAmbient) recvAmbient.textContent = '--';
      if (recvServerTime) recvServerTime.textContent = '--';

      currentPresetTag = 'MANUAL TELEMETRY RECEIVED';
      showFeedback('Dashboard and manual input fields reset to default.', true);
      appendLog('SYS', 'Manual telemetry reset to default standby values.');
    });
  }

  // --------------------------------------------------------------------------
  // 9. Health Liveness Polling
  // --------------------------------------------------------------------------

  async function checkHealth() {
    try {
      const response = await fetch('/health');
      if (response.ok) {
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
  // 10. Initial Boot Sequence
  // --------------------------------------------------------------------------

  appendLog('SYS', 'BRAIN initialized');
  appendLog('SYS', 'Flask backend connected');
  appendLog('DATA', 'Manual telemetry test mode ready');
  appendLog('MODEL', 'Prediction unavailable (Model not connected)');
  appendLog('PINN', 'Thermal model not connected');

  checkHealth();
  setInterval(checkHealth, 5000);

  // Automatically submit the default manual values on boot for instant demonstration
  submitManualTelemetry();
});
