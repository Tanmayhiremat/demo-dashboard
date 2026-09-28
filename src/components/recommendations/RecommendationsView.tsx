import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  ShieldAlert,
  Sprout,
  Leaf,
  Droplets,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DiseaseRecommendation, NavigationPage } from '../../types';
import { Modal } from '../common/Modal';

interface RecommendationsViewProps {
  recommendations: DiseaseRecommendation[];
  onNavigate: (page: NavigationPage) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onNavigate,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRec, setSelectedRec] = useState<DiseaseRecommendation | null>(null);

  const handleGenerateReport = (rec: DiseaseRecommendation) => {
    setSelectedRec(rec);
    setShowReportModal(true);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.8 },
      colors: ['#10b981', '#3b82f6'],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              AI Agronomy Recommendations
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Evidence-based pathology containment and biological plant protection strategies
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('reports')}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 self-start md:self-auto transition-all"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Full Farm PDF Report</span>
        </button>
      </div>

      {/* Recommendations Cards List or Offline Empty State */}
      {recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-base font-extrabold text-slate-900">
            No Active Disease Containment Actions
          </h2>
          <p className="text-xs text-slate-500 max-w-md">
            System is in Offline Mode. When crop pathology infections or leaf anomalies are diagnosed during AI scans, targeted organic sprays, ICAR biological controls, and cultural management steps will appear here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('detect')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20"
            >
              Scan Plant Leaf for Diagnosis
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6"
          >
            {/* Title & Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {rec.crop}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {rec.severity} Severity
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  {rec.crop} – {rec.disease}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right sm:text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    AI Confidence
                  </span>
                  <span className="font-mono text-base font-extrabold text-emerald-700">
                    {rec.confidence}% Top-1
                  </span>
                </div>
                <button
                  onClick={() => handleGenerateReport(rec)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Generate Detailed Report
                </button>
              </div>
            </div>

            {/* Recommended Action Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Immediate Actions */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
                <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  1. Immediate Actions
                </h3>
                <ul className="space-y-1.5 text-xs text-rose-900">
                  {rec.immediateActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold mt-0.5">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preventive Actions */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  2. Preventive Actions & Canopy Care
                </h3>
                <ul className="space-y-1.5 text-xs text-emerald-900">
                  {rec.preventiveActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold mt-0.5">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Monitoring & Sanitation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Surveillance Cadence
                </span>
                <p className="font-semibold text-slate-800">{rec.monitoringFrequency}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Bio-Fungicide / Organic Control
                </span>
                <p className="font-semibold text-slate-800">{rec.organicControls[0]}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">
                  Verified Agronomy Reference
                </span>
                <p className="font-semibold text-slate-800">{rec.verifiedSource}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title={`Agronomy Action Certificate: ${selectedRec?.crop} – ${selectedRec?.disease}`}
        subtitle="AgriRakshak Pathology Diagnostic & Treatment Advisory"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
            <h4 className="font-bold text-emerald-950 text-sm">Pathology Prescription Summary</h4>
            <p className="leading-relaxed">
              Target crop {selectedRec?.crop} diagnosed with {selectedRec?.disease} ({selectedRec?.confidence}% confidence). Recommended immediate containment via selective foliar sanitation and airflow optimization.
            </p>
          </div>

          <div className="space-y-2">
            <strong className="text-slate-900 block font-bold">Approved Organic Biological Treatments:</strong>
            <ul className="list-disc pl-5 space-y-1">
              {selectedRec?.organicControls.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Certified reference: {selectedRec?.verifiedSource}
          </p>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              onClick={() => setShowReportModal(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
            >
              Close Prescription
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
