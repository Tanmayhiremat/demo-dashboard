import React from 'react';
import {
  FileText,
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Calendar,
  Share2,
  ShieldCheck,
  TrendingDown,
  WifiOff
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DetectionResult, CropHealthStat } from '../../types';

interface ReportsViewProps {
  detections: DetectionResult[];
  crops: CropHealthStat[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  detections,
  crops,
}) => {
  const handlePrint = () => {
    window.print();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6'],
    });
  };

  const currentDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
  }).format(new Date());

  const diseasedDetections = detections.filter(d => d.severity !== 'Healthy');
  const avgHealth = crops.length > 0 
    ? Math.round(crops.reduce((acc, c) => acc + c.healthyPct, 0) / crops.length) 
    : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Farm Health & Pathology Audit Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Export comprehensive plant health certificates and diagnostic records for agronomists
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-emerald-600">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-emerald-950">AgriRakshak</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                AI CROP DOCTOR AUDIT
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Autonomous Plant Pathology Surveillance Platform</p>
          </div>

          <div className="text-left sm:text-right text-xs">
            <p className="font-bold text-slate-800">Farm: Green Valley Agro (GVA-8842)</p>
            <p className="text-slate-500">Generated on {currentDate}</p>
            <p className="text-emerald-700 font-mono font-bold">Audit ID: AGR-2026-SESSION</p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-3 text-xs text-slate-700">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            1. Executive Canopy Health Summary
          </h2>
          <p className="leading-relaxed">
            {crops.length > 0 || detections.length > 0 ? (
              <>
                During the active monitoring cycle, optical surveillance sensors scanned {crops.length} distinct crop cultivars. Current overall farm canopy health is rated at <strong>{avgHealth}% Healthy</strong>, with {diseasedDetections.length} localized disease detections successfully flagged for intervention.
              </>
            ) : (
              <>
                The surveillance system is currently in <strong>Offline Mode (Standby)</strong>. 0 disease infections have been recorded for this session. Scanned crop leaf diagnostics will automatically compile into this executive audit ledger.
              </>
            )}
          </p>

          {crops.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {crops.map((c) => (
                <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 block">{c.name}</span>
                  <span className="text-emerald-700 font-mono font-bold text-sm">{c.healthyPct}% Healthy</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{c.totalPlants} Plants Scanned</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Pathogen Detections Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            2. Verified Pathogen Detections & Prescriptions
          </h2>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Crop</th>
                  <th className="p-3">Disease Identified</th>
                  <th className="p-3">AI Confidence</th>
                  <th className="p-3">Prescribed Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detections.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No pathology anomalies recorded. System in offline standby.
                    </td>
                  </tr>
                ) : (
                  detections.slice(0, 10).map((d) => (
                    <tr key={d.id}>
                      <td className="p-3 text-slate-500 font-mono">{d.timestamp}</td>
                      <td className="p-3 font-bold text-slate-800">{d.crop}</td>
                      <td className="p-3 text-slate-900 font-semibold">{d.disease}</td>
                      <td className="p-3 font-mono text-emerald-700 font-bold">{d.confidence}%</td>
                      <td className="p-3 text-slate-600 max-w-xs">{d.immediateAction}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agronomy Sign-off Footer */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>AI Automated Diagnostic System • Verified Against ICAR Diagnostic Standards</span>
          </div>
          <div className="font-mono text-[11px]">
            Signature: __________________________
          </div>
        </div>
      </div>
    </div>
  );
};
