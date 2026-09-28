import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Bell,
  Cpu,
  Save,
  CheckCircle2,
  Radio,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SettingsView: React.FC = () => {
  const [farmName, setFarmName] = useState('Green Valley Agro');
  const [farmerName, setFarmerName] = useState('Johnathan Miller');
  const [edgeIp, setEdgeIp] = useState('192.168.1.142');
  const [minConfidenceAlert, setMinConfidenceAlert] = useState(85);
  const [autoSaveDetections, setAutoSaveDetections] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10b981'],
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <SettingsIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard & Edge Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Configure edge device parameters, alert triggers, and farm profile
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Farm Profile & Cultivation Metadata
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Farm / Facility Name</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Lead Operator / Farmer</label>
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-600" />
            Edge Inference Node Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Raspberry Pi Host IP</label>
              <input
                type="text"
                value={edgeIp}
                onChange={(e) => setEdgeIp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Minimum Alert Confidence Threshold: {minConfidenceAlert}%
              </label>
              <input
                type="range"
                min="50"
                max="98"
                value={minConfidenceAlert}
                onChange={(e) => setMinConfidenceAlert(parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer mt-3"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer text-xs font-bold text-slate-800">
            <input
              type="checkbox"
              checked={autoSaveDetections}
              onChange={(e) => setAutoSaveDetections(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <span>Automatically persist high-confidence detections to local SQLite database</span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {savedSuccess ? (
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Settings updated successfully!
            </span>
          ) : (
            <span className="text-xs text-slate-400">Settings stored locally in browser state</span>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
