import React, { useState } from 'react';
import {
  Activity,
  SlidersHorizontal,
  ChevronRight,
  Sprout,
  Plus,
  RefreshCw,
  Check
} from 'lucide-react';
import { CropHealthStat } from '../../types';
import { Modal } from '../common/Modal';

interface CropHealthOverviewProps {
  crops: CropHealthStat[];
  onUpdateCrops?: (crops: CropHealthStat[]) => Promise<void>;
}

export const CropHealthOverview: React.FC<CropHealthOverviewProps> = ({
  crops,
  onUpdateCrops,
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editableCrops, setEditableCrops] = useState<CropHealthStat[]>(crops);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when props change
  React.useEffect(() => {
    setEditableCrops(crops);
  }, [crops]);

  const handleSliderChange = (
    index: number,
    field: 'healthyPct' | 'atRiskPct' | 'diseasedPct',
    value: number
  ) => {
    const updated = [...editableCrops];
    const item = { ...updated[index] };

    if (field === 'healthyPct') {
      item.healthyPct = value;
      // adjust remainder between atRisk and diseased proportionally
      const remainder = 100 - value;
      item.atRiskPct = Math.round(remainder * 0.6);
      item.diseasedPct = 100 - item.healthyPct - item.atRiskPct;
    } else if (field === 'atRiskPct') {
      item.atRiskPct = value;
      item.diseasedPct = Math.max(0, 100 - item.healthyPct - value);
    } else {
      item.diseasedPct = value;
      item.atRiskPct = Math.max(0, 100 - item.healthyPct - value);
    }

    updated[index] = item;
    setEditableCrops(updated);
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    if (onUpdateCrops) {
      await onUpdateCrops(editableCrops);
    }
    setIsSaving(false);
    setShowConfigModal(false);
  };

  const getCropIcon = (name: string) => {
    return <Sprout className="w-4 h-4 text-emerald-600" />;
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Crop Health Overview
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time health breakdown by cultivated crops
          </p>
        </div>

        <button
          onClick={() => setShowConfigModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Configure Metrics</span>
        </button>
      </div>

      {/* Horizontal Cards Grid for Crops or Offline Empty State */}
      {crops.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <Sprout className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Crop Health Scans Logged</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            System is in Offline Mode. Cultivar vitality breakdown will register here automatically as plant leaf inspections are conducted.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crops.map((crop) => (
          <div
            key={crop.id}
            className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all space-y-3"
          >
            {/* Header with Crop Name and Total Count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-200">
                  {crop.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {crop.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 italic">
                    {crop.scientificName}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {crop.totalPlants.toLocaleString()} Plants
              </span>
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                {/* Healthy */}
                <div
                  className="h-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${crop.healthyPct}%` }}
                  title={`Healthy: ${crop.healthyPct}%`}
                />
                {/* At Risk */}
                <div
                  className="h-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${crop.atRiskPct}%` }}
                  title={`At Risk: ${crop.atRiskPct}%`}
                />
                {/* Diseased */}
                <div
                  className="h-full bg-rose-500 transition-all duration-700"
                  style={{ width: `${crop.diseasedPct}%` }}
                  title={`Diseased: ${crop.diseasedPct}%`}
                />
              </div>

              {/* Legend with exact percentages */}
              <div className="flex items-center justify-between text-[11px] font-semibold pt-1">
                <div className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Healthy: {crop.healthyPct}%</span>
                </div>

                <div className="flex items-center gap-1 text-amber-700">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>At Risk: {crop.atRiskPct}%</span>
                </div>

                <div className="flex items-center gap-1 text-rose-700">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>Diseased: {crop.diseasedPct}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Config / Live Adjustment Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Configure Crop Health Distribution"
        subtitle="Adjust live field canopy health percentages across active cultivars"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {editableCrops.map((crop, idx) => (
            <div key={crop.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{crop.name} Health Ratio</span>
                <span className="text-emerald-700 font-mono">
                  {crop.healthyPct}% Healthy / {crop.atRiskPct}% Risk / {crop.diseasedPct}% Diseased
                </span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={crop.healthyPct}
                onChange={(e) => handleSliderChange(idx, 'healthyPct', parseInt(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          ))}

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setShowConfigModal(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-2"
            >
              <Check className="w-4 h-4" /> Save Metric Configuration
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
