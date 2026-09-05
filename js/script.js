/**
 * BRAIN — Battery Risk & Analytics Intelligence Network
 * Phase 3: Flask Backend Pipeline Integration
 * 
 * Pipeline flow:
 * JSON Input -> Client Validation -> POST /api/battery-data ->
 * Server Validation -> Data Structuring -> UI Telemetry Update
 * 
 * IMPORTANT:
 * - NO .pkl model is loaded.
 * - NO artificial predictions or risk scores are computed.
 * - Predicted Temperature remains 'MODEL NOT CONNECTED'.
 * - Risk Assessment remains 'SYSTEM NOT CONNECTED'.
 * - Early Warning remains 'WAITING FOR MODEL'.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const jsonTextarea = document.getElementById('batteryJsonInput');
  const loadJsonBtn = document.getElementById('loadJsonBtn');
  const validateJsonBtn = document.getElementById('validateJsonBtn');
  const sampleJsonBtn = document.getElementById('sampleJsonBtn');
  const clearBtn = document.getElementById('clearBtn');

  // Header Status Elements
  const systemStatusBadge = document.getElementById('systemStatusBadge') || document.querySelector('.status-indicator');
  const systemStatusText = document.getElementById('systemStatusText') || document.querySelector('.status-text');

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

  // Section 2: Thermal Monitoring Card
  const thermalCurrentTemp = document.getElementById('thermalCurrentTemp');
  const thermalCurrentSub = document.getElementById('thermalCurrentSub');

  // Section 3: Battery Health Card
  const healthSoc = document.getElementById('healthSoc');
  const healthSoh = document.getElementById('healthSoh');
  const healthBatteryState = document.getElementById('healthBatteryState');

  // Section 15: Received Data Preview Card
  const recvVoltage = document.getElementById('recvVoltage');
  const recvCurrent = document.getElementById('recvCurrent');
  const recvTemperature = document.getElementById('recvTemperature');
  const recvSoc = document.getElementById('recvSoc');
  const recvSoh = document.getElementById('recvSoh');
  const recvCrate = document.getElementById('recvCrate');
  const recvSource = document.getElementById('recvSource');
  const recvServerTime = document.getElementById('recvServerTime');

  // Section 8: System Log Terminal
  const systemLogTerminal = document.getElementById('systemLogTerminal');

  // Predefined Demonstration Sample JSON
  const SAMPLE_JSON = `{
  "voltage": 3.70,
  "current": 5.00,
  "temperature": 32.5,
  "soc": 70,
  "soh": 95,
  "c_rate": 1.0,
  "ambient_temperature": 25.0
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

  function setLogEntries(entries) {
    if (!systemLogTerminal) return;
    systemLogTerminal.innerHTML = '';
    entries.forEach(({ prefix, message, isWaiting }) => {
      appendLog(prefix, message, isWaiting);
    });
  }

  function extractSyntaxErrorDetails(err, rawText) {
    const lineMatch = err.message.match(/line\s+(\d+)/i);
    if (lineMatch) {
      return `Invalid JSON syntax near line ${lineMatch[1]}.`;
    }
    const posMatch = err.message.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const lineNumber = rawText.slice(0, pos).split('\n').length;
      return `Invalid JSON syntax near line ${lineNumber}.`;
    }
    return 'Invalid JSON syntax. Please check formatting.';
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
      return { isValid: false, status: 'JSON INVALID', message: extractSyntaxErrorDetails(err, rawText), parsed: null };
    }

    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { isValid: false, status: 'JSON INVALID', message: 'JSON root must be an object.', parsed: null };
    }

    const requiredFields = [
      { key: 'voltage', label: 'Voltage' },
      { key: 'current', label: 'Current' },
      { key: 'temperature', label: 'Temperature' }
    ];

    for (const f of requiredFields) {
      if (parsed[f.key] === undefined) {
        return { isValid: false, status: 'INVALID_DATA', message: `Missing required field: ${f.key}.`, parsed: null };
      }
    }

    const numericalFields = [
      { key: 'voltage', label: 'Voltage' },
      { key: 'current', label: 'Current' },
      { key: 'temperature', label: 'Temperature' },
      { key: 'soc', label: 'SOC' },
      { key: 'soh', label: 'SOH' },
      { key: 'c_rate', label: 'C-rate' },
      { key: 'ambient_temperature', label: 'Ambient Temperature' }
    ];

    for (const f of numericalFields) {
      if (parsed[f.key] !== undefined) {
        const val = parsed[f.key];
        if (typeof val !== 'number' || isNaN(val) || !isFinite(val)) {
          return { isValid: false, status: 'INVALID_DATA', message: `${f.label} must be numeric.`, parsed: null };
        }
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
        showFeedback('JSON VALID — Client schema verified. Ready for backend submission.', true);
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
      
      // Basic check for empty or broken JSON before sending
      if (!rawText || rawText.trim() === '') {
        setDataStatus('JSON INVALID', 'invalid');
        showFeedback('Please enter battery JSON data.', false);
        appendLog('VAL', 'JSON validation failed: Please enter battery JSON data.');
        appendLog('NET', 'Waiting for valid battery data.', true);
        return;
      }

      let parsedPayload;
      try {
        parsedPayload = JSON.parse(rawText);
      } catch (err) {
        const msg = extractSyntaxErrorDetails(err, rawText);
        setDataStatus('JSON INVALID', 'invalid');
        showFeedback(msg, false);
        appendLog('VAL', `JSON validation failed: ${msg}`);
        appendLog('NET', 'Waiting for valid battery data.', true);
        return;
      }

      // Dispatch to Flask Backend
      const apiEndpoint = '/api/battery-data';

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(parsedPayload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          // Backend validation or server error
          setDataStatus(result.status || 'INVALID_DATA', 'invalid');
          showFeedback(result.message || 'Backend validation rejected payload.', false);
          appendLog('VAL', `Backend validation failed: ${result.message}`);
          appendLog('NET', 'Waiting for valid battery data.', true);
          return;
        }

        // --- SUCCESSFUL BACKEND INGESTION ---
        const processed = result.data;
        const structured = processed.structured;

        // Section 8: Display DATA RECEIVED
        setDataStatus('DATA RECEIVED', 'received');
        showFeedback(result.message, true);

        // Update Section 1: Battery Overview Cards
        if (overviewVoltage) overviewVoltage.textContent = formatVoltage(structured.voltage);
        if (overviewCurrent) overviewCurrent.textContent = formatCurrent(structured.current);
        if (overviewTemperature) overviewTemperature.textContent = formatTemperature(structured.temperature);
        if (overviewSoc) overviewSoc.textContent = formatPercentage(structured.soc);
        if (overviewSoh) overviewSoh.textContent = formatPercentage(structured.soh);
        if (overviewCrate) overviewCrate.textContent = formatCrate(structured.c_rate);

        // Update Section 2: Thermal Monitoring Card (Current Temperature only)
        if (thermalCurrentTemp) {
          thermalCurrentTemp.textContent = formatTemperature(structured.temperature);
        }
        if (thermalCurrentSub) {
          thermalCurrentSub.textContent = 'Backend Data Ingested';
        }
        // Note: Predicted Temperature remains 'MODEL NOT CONNECTED'
        // Note: Temperature Trend remains 'WAITING FOR MODEL/DATA'

        // Update Section 3: Battery Health Card
        if (healthSoc) healthSoc.textContent = formatPercentage(structured.soc);
        if (healthSoh) healthSoh.textContent = formatPercentage(structured.soh);
        // Note: Battery State remains 'WAITING FOR DATA'

        // Section 15: Update RECEIVED DATA Inspection Preview
        if (recvVoltage) recvVoltage.textContent = formatVoltage(structured.voltage);
        if (recvCurrent) recvCurrent.textContent = formatCurrent(structured.current);
        if (recvTemperature) recvTemperature.textContent = formatTemperature(structured.temperature);
        if (recvSoc) recvSoc.textContent = formatPercentage(structured.soc);
        if (recvSoh) recvSoh.textContent = formatPercentage(structured.soh);
        if (recvCrate) recvCrate.textContent = formatCrate(structured.c_rate);
        if (recvSource) recvSource.textContent = processed.source || 'JSON INPUT';
        if (recvServerTime) {
          recvServerTime.textContent = `SERVER TIME: ${formatServerTimestamp(processed.received_at)}`;
        }

        // Update timestamp display
        if (lastDataUpdate) {
          lastDataUpdate.textContent = formatServerTimestamp(processed.received_at);
        }

        // Display unmodeled/unexpected fields if present
        if (processed.additional_fields && additionalDataContainer && additionalDataContent) {
          additionalDataContent.textContent = JSON.stringify(processed.additional_fields, null, 2);
          additionalDataContainer.style.display = 'block';
        } else if (additionalDataContainer) {
          additionalDataContainer.style.display = 'none';
        }

        // Section 8: Update System Log
        setLogEntries([
          { prefix: 'SYS', message: 'System initialized.' },
          { prefix: 'NET', message: 'Battery JSON received.' },
          { prefix: 'VAL', message: 'Backend validation successful.' },
          { prefix: 'APP', message: 'Battery data accepted.' }
        ]);

        // Ensure system status reflects online backend
        setSystemStatus(true);

      } catch (netErr) {
        console.error('[BRAIN Phase 3] Network / Endpoint error:', netErr);
        setSystemStatus(false);
        setDataStatus('SERVER_ERROR', 'invalid');
        showFeedback('Unable to reach backend API endpoint. Ensure Flask server is running.', false);
        appendLog('NET', 'Backend connection error: Server unreachable.', true);
      }
    });
  }

  // 3. LOAD SAMPLE JSON BUTTON
  if (sampleJsonBtn) {
    sampleJsonBtn.addEventListener('click', () => {
      if (jsonTextarea) {
        jsonTextarea.value = SAMPLE_JSON;
      }
      setDataStatus('WAITING FOR INPUT', 'pending');
      showFeedback('Demonstration sample JSON loaded. Ready for backend submission.', true);
      appendLog('SYS', 'Sample demonstration JSON loaded into editor.');
    });
  }

  // 4. CLEAR BUTTON
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      // Clear input
      if (jsonTextarea) {
        jsonTextarea.value = '';
      }

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

      // Reset Battery Health
      if (healthSoc) healthSoc.textContent = '--';
      if (healthSoh) healthSoh.textContent = '--';
      if (healthBatteryState) healthBatteryState.textContent = 'WAITING FOR DATA';

      // Reset RECEIVED DATA Inspection Preview
      if (recvVoltage) recvVoltage.textContent = '--';
      if (recvCurrent) recvCurrent.textContent = '--';
      if (recvTemperature) recvTemperature.textContent = '--';
      if (recvSoc) recvSoc.textContent = '--';
      if (recvSoh) recvSoh.textContent = '--';
      if (recvCrate) recvCrate.textContent = '--';
      if (recvServerTime) recvServerTime.textContent = 'SERVER TIME: --';

      // Reset status & timestamp
      setDataStatus('WAITING FOR INPUT', 'pending');
      if (lastDataUpdate) lastDataUpdate.textContent = '--';

      // Hide feedback & additional data
      hideFeedback();
      if (additionalDataContainer) additionalDataContainer.style.display = 'none';

      // Reset System Log
      setLogEntries([
        { prefix: 'SYS', message: 'System initialized.' },
        { prefix: 'APP', message: 'Dashboard data cleared.' },
        { prefix: 'NET', message: 'Waiting for battery data...', isWaiting: true }
      ]);
    });
  }

  // --- Initialize Health Check & Connectivity ---
  // Initial health check against Flask backend
  checkHealth();

  // Periodic health check every 5 seconds to keep system status reactive
  setInterval(checkHealth, 5000);

  console.log('[BRAIN Phase 3] Flask backend pipeline initialized.');
});
