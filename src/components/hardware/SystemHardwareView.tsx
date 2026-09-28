import React from 'react';
import {
  Cpu,
  Radio,
  Camera,
  Activity,
  Wifi,
  Thermometer,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Info,
  Clock
} from 'lucide-react';
import { SystemHardwareStatus } from '../../types';

interface SystemHardwareViewProps {
  hardware: SystemHardwareStatus;
  onRefresh: () => void;
}

export const SystemHardwareView: React.FC<SystemHardwareViewProps> = ({
  hardware,
  onRefresh,
}) => {
  const { metrics, edgeDevice, cameras, inferenceEngine, network } = hardware;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <Radio className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Edge Node Hardware & Telemetry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Raspberry Pi 4 Cluster
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Live telemetry and peripheral health from field-deployed IoT hub
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-semibold border border-amber-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-amber-600" />
            <span>Hardware Status: Offline (Standby)</span>
          </div>
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-xs"
            title="Refresh sensor metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hardware Telemetry Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CPU Usage */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              CPU Utilization
            </span>
            <Cpu className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">
              {metrics.cpuUsagePct > 0 ? `${metrics.cpuUsagePct}%` : '-- %'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {metrics.cpuUsagePct > 0 ? 'Quad Cortex-A72' : 'Processor Offline'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.cpuUsagePct}%` }}
            />
          </div>
        </div>

        {/* RAM Usage */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              RAM Memory
            </span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">
              {metrics.ramUsageGb > 0 ? metrics.ramUsageGb : '--'} <span className="text-base font-normal text-slate-400">/ {metrics.ramTotalGb} GB</span>
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {metrics.ramUsageGb > 0 ? 'LPDDR4 System Memory' : 'Memory Telemetry Standby'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${(metrics.ramUsageGb / metrics.ramTotalGb) * 100}%` }}
            />
          </div>
        </div>

        {/* SoC Temperature */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              SoC Temperature
            </span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">
              {metrics.temperatureC > 0 ? `${metrics.temperatureC}°C` : '-- °C'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {metrics.temperatureC > 0 ? 'Thermal Sensor Reading' : 'Thermal Sensor Standby'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (metrics.temperatureC / 85) * 100)}%` }}
            />
          </div>
        </div>

        {/* Storage Disk */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              MicroSD / eMMC
            </span>
            <HardDrive className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 font-mono">
              {metrics.diskUsagePct > 0 ? `${metrics.diskUsagePct}%` : '-- %'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              {metrics.diskUsagePct > 0 ? 'Root Partition Usage' : 'Storage Standby'}
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${metrics.diskUsagePct}%` }}
            />
          </div>
        </div>

        {/* Inference Latency */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Inference Latency
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-700 font-mono">
              {inferenceEngine.averageLatencyMs} <span className="text-base font-normal text-slate-400">ms</span>
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Per-frame classification</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: '35%' }}
            />
          </div>
        </div>
      </div>

      {/* Connected Subsystems Status Grid (Requirement 19) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Edge Device & Network */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-600" />
            Edge Device & Host Architecture
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-sm block">{edgeDevice.name}</span>
                <span className="text-slate-400">{edgeDevice.model}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {edgeDevice.status}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-sm block">Network Uplink</span>
                <span className="text-slate-400">{network.type} (Signal: {network.signalStrength})</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                {network.status} ({network.latencyMs}ms)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-sm block">Host Uptime</span>
                <span className="text-slate-400">Node IP: {edgeDevice.ipAddress}</span>
              </div>
              <span className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {edgeDevice.uptime}
              </span>
            </div>
          </div>
        </div>

        {/* Optical Sensor Peripherals */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Connected Optical Peripherals
          </h2>

          <div className="space-y-3 text-xs">
            {cameras.map((cam, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <span className="font-bold text-slate-800 text-sm block">{cam.name}</span>
                  <span className="text-slate-400">{cam.type} • USB V4L2 Bridge</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {cam.fps} FPS
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {cam.status}
                  </span>
                </div>
              </div>
            ))}

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-sm block">AI Inference Accelerator</span>
                <span className="text-slate-400">{inferenceEngine.name} • {inferenceEngine.currentModel}</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <Activity className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                {inferenceEngine.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
