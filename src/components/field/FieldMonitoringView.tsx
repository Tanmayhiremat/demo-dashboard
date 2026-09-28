import React, { useState } from 'react';
import {
  MapPin,
  Sprout,
  Droplets,
  Thermometer,
  Wind,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bug,
  Info,
  ChevronRight,
  Maximize2,
  WifiOff
} from 'lucide-react';
import { FieldZone, NavigationPage } from '../../types';
import { Modal } from '../common/Modal';

interface FieldMonitoringViewProps {
  fields: FieldZone[];
  onNavigate: (page: NavigationPage) => void;
}

export const FieldMonitoringView: React.FC<FieldMonitoringViewProps> = ({
  fields,
  onNavigate,
}) => {
  const [selectedFieldId, setSelectedFieldId] = useState(fields[0]?.id || 'field-01');
  const [activeCellModal, setActiveCellModal] = useState<any | null>(null);

  if (fields.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Field Spatial Map & Telemetry
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <WifiOff className="w-3 h-3 text-amber-600" />
                  Offline Mode
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                Micro-climate telemetry and zoned disease risk mapping
              </p>
            </div>
          </div>
        </div>

        {/* Offline Empty State Card */}
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">
            Field IoT Telemetry Mesh Offline
          </h2>
          <p className="text-xs text-slate-500 max-w-md">
            No wireless soil moisture probes or greenhouse environmental micro-climate nodes are currently synchronized. Connect IoT field gateways or configure cultivation plots in settings.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('detect')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20"
            >
              Perform Manual Leaf Diagnosis
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeField = fields.find(f => f.id === selectedFieldId) || fields[0];

  const getStatusMarker = (status: string) => {
    switch (status) {
      case 'Disease Detected':
        return {
          bg: 'bg-rose-500 hover:bg-rose-600',
          ring: 'ring-rose-200 ring-4',
          label: '🔴 Disease Detected',
          textColor: 'text-rose-700',
          dot: 'bg-rose-500',
        };
      case 'At Risk':
        return {
          bg: 'bg-amber-400 hover:bg-amber-500',
          ring: 'ring-amber-100 ring-4',
          label: '🟡 At Risk',
          textColor: 'text-amber-700',
          dot: 'bg-amber-500',
        };
      case 'Healthy':
      default:
        return {
          bg: 'bg-emerald-500 hover:bg-emerald-600',
          ring: 'ring-emerald-100 ring-4',
          label: '🟢 Healthy',
          textColor: 'text-emerald-700',
          dot: 'bg-emerald-500',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Field Overview Selector Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Field Status & Spatial Map
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {fields.length} Active Plots
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Micro-climate telemetry and zoned disease risk mapping
            </p>
          </div>
        </div>

        {/* Field Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          {fields.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFieldId(f.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedFieldId === f.id
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Field Metrics & Status Card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Target Crop</span>
          <span className="text-lg font-black text-slate-900 mt-1 block">{activeField.crop}</span>
          <span className="text-[11px] text-slate-500">Area: {activeField.areaAcres} acres</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Health Score</span>
          <span className="text-lg font-black text-emerald-600 mt-1 block font-mono">
            {activeField.overallHealthPct}%
          </span>
          <span className="text-[11px] text-slate-500">{activeField.activeDetectionsCount} alerts</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Soil Moisture</span>
          <span className="text-lg font-black text-blue-600 mt-1 block font-mono">
            {activeField.soilMoisturePct}%
          </span>
          <span className="text-[11px] text-slate-500">Optimal Range</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Ambient Temp</span>
          <span className="text-lg font-black text-amber-600 mt-1 block font-mono">
            {activeField.ambientTempC}°C
          </span>
          <span className="text-[11px] text-slate-500">Relative Humidity: {activeField.humidityPct}%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-slate-400 block text-[10px] font-bold uppercase">Last Scan</span>
          <span className="text-sm font-bold text-slate-800 mt-1 block">{activeField.lastScanTime}</span>
          <span className="text-[11px] text-emerald-700 font-semibold">Autonomous Patrol</span>
        </div>
      </div>

      {/* Interactive Spatial Grid Heatmap */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              Spatial Micro-Zone Health Grid ({activeField.name})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Click individual greenhouse cells to inspect camera telemetry and spore contagion risk
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Healthy
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> At Risk
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Diseased
            </span>
          </div>
        </div>

        {/* 2D Grid Cells Container */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {activeField.gridCells.map((cell, idx) => {
            const marker = getStatusMarker(cell.status);
            return (
              <div
                key={idx}
                onClick={() => setActiveCellModal(cell)}
                className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer hover:scale-[1.02] shadow-xs flex flex-col justify-between ${
                  cell.status === 'Disease Detected'
                    ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                    : cell.status === 'At Risk'
                    ? 'bg-amber-50/70 border-amber-200 hover:border-amber-400'
                    : 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs text-slate-900">{cell.label}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${marker.dot}`} />
                </div>

                <p className="text-xs text-slate-600 font-medium line-clamp-1">{cell.details}</p>

                <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                  <span className={`font-bold ${marker.textColor}`}>{cell.status}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid Cell Inspection Modal */}
      <Modal
        isOpen={!!activeCellModal}
        onClose={() => setActiveCellModal(null)}
        title={`Micro-Zone Inspection: ${activeCellModal?.label}`}
        subtitle={`Field: ${activeField.name} | Crop: ${activeField.crop}`}
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Current Health Diagnosis</span>
              <span className="px-2.5 py-0.5 rounded-full font-bold bg-white border text-slate-800">
                {activeCellModal?.status}
              </span>
            </div>
            <p className="text-slate-600">{activeCellModal?.details}</p>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => {
                setActiveCellModal(null);
                onNavigate('detect');
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold"
            >
              Trigger Direct AI Scan
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
