import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Database, RefreshCw, Power } from 'lucide-react';
import { batteryDataService, TelemetryServiceStatus } from '../../services/batteryDataService';

interface TelemetryControlsProps {
  status: TelemetryServiceStatus;
}

export const TelemetryControls: React.FC<TelemetryControlsProps> = ({ status }) => {
  const isStreaming = status.state === 'streaming';
  const isDisconnected = status.state === 'disconnected';

  return (
    <div className="controls-bar">
      <div className="controls-left">
        {/* Play/Pause Button */}
        <button
          className={`control-btn ${isStreaming ? 'streaming' : 'primary'}`}
          onClick={() => {
            if (isStreaming) {
              batteryDataService.pauseStreaming();
            } else {
              batteryDataService.startStreaming();
            }
          }}
        >
          {isStreaming ? <Pause size={15} /> : <Play size={15} />}
          <span>{isStreaming ? 'Pause Stream' : 'Start Stream'}</span>
        </button>

        {/* Step Prev/Next */}
        <button
          className="control-btn"
          onClick={() => batteryDataService.stepPrevious()}
          title="Previous Telemetry Frame"
        >
          <SkipBack size={14} />
          <span>Step Back</span>
        </button>

        <button
          className="control-btn"
          onClick={() => batteryDataService.stepNext()}
          title="Next Telemetry Frame"
        >
          <SkipForward size={14} />
          <span>Step Next</span>
        </button>

        {/* Disconnect/Reconnect Toggle */}
        <button
          className="control-btn"
          onClick={() => {
            if (isDisconnected) {
              batteryDataService.reconnect();
            } else {
              batteryDataService.disconnect();
            }
          }}
          title={isDisconnected ? 'Connect Telemetry' : 'Disconnect Telemetry'}
        >
          <Power size={14} color={isDisconnected ? '#FF3B30' : '#00E676'} />
          <span>{isDisconnected ? 'Connect Bus' : 'Disconnect'}</span>
        </button>
      </div>

      <div className="controls-right">
        {/* Dataset Selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={14} color="#00D9FF" />
          <select
            className="dataset-select"
            value={status.datasetName.includes('High Stress') ? 'high_stress' : 'sample'}
            onChange={(e) => batteryDataService.loadDataset(e.target.value as any)}
          >
            <option value="sample">Dataset: Nominal 16S Pack (Sample)</option>
            <option value="high_stress">Dataset: High Stress Thermal Run</option>
          </select>
        </div>

        {/* Frame Tracker */}
        <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
          Frame {status.frameIndex + 1}/{status.totalFrames}
        </div>
      </div>
    </div>
  );
};
