import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  ShieldAlert,
  ArrowRight,
  Eye,
  BookmarkCheck,
  Share2,
  FileCheck,
  Leaf,
  Scan,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DetectionResult, NavigationPage } from '../../types';
import { Modal } from '../common/Modal';

interface DetectionResultCardProps {
  result: DetectionResult | null;
  onNavigate?: (page: NavigationPage) => void;
  onSaveDetection?: (detection: DetectionResult) => Promise<void>;
}

export const DetectionResultCard: React.FC<DetectionResultCardProps> = ({
  result,
  onNavigate,
  onSaveDetection,
}) => {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  if (!result) return null;

  const isHealthy = result.severity === 'Healthy' || result.disease.toLowerCase().includes('healthy');

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Severe':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          indicatorBg: 'bg-rose-500',
          meterWidth: 'w-full',
          label: 'Severe Infection',
          color: '#ef4444',
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          indicatorBg: 'bg-amber-500',
          meterWidth: 'w-2/3',
          label: 'Moderate Severity',
          color: '#f59e0b',
        };
      case 'Low':
        return {
          bg: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          indicatorBg: 'bg-yellow-500',
          meterWidth: 'w-1/3',
          label: 'Low Severity',
          color: '#eab308',
        };
      case 'Healthy':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          indicatorBg: 'bg-emerald-500',
          meterWidth: 'w-0',
          label: 'Healthy Foliage',
          color: '#10b981',
        };
    }
  };

  const severityStyle = getSeverityStyle(result.severity);

  const handleSave = async () => {
    if (onSaveDetection) {
      await onSaveDetection(result);
    }
    setIsSaved(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10b981', '#059669', '#34d399'],
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/80 shadow-md shadow-emerald-500/5 relative overflow-hidden transition-all animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            AI Diagnosis Verified
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-xs text-slate-400">{result.timestamp}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaved}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSaved
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            {isSaved ? 'Saved to History' : 'Save Detection'}
          </button>
        </div>
      </div>

      {/* Main Diagnosis Content: Left Image / Right Info */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Image with AI segmentation/bounding box */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-4/3 group border border-slate-200 shadow-inner">
            <img
              src={result.imageUrl}
              alt={`${result.crop} ${result.disease}`}
              className="w-full h-full object-cover"
            />

            {/* AI Bounding Box & Hotspot Overlay */}
            {showBoundingBox && !isHealthy && (
              <div className="absolute inset-0 pointer-events-none p-6">
                <div className="relative w-full h-full border-2 border-dashed border-rose-500/80 rounded-xl bg-rose-500/10 backdrop-blur-[0.5px] flex items-start justify-start p-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-mono text-[10px] font-bold shadow">
                    {result.disease} ({result.confidence}%)
                  </span>
                </div>
              </div>
            )}

            {/* Toggle Overlay Button */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <button
                onClick={() => setShowBoundingBox(!showBoundingBox)}
                className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[10px] font-semibold backdrop-blur-xs transition-colors flex items-center gap-1"
              >
                <Eye className="w-3 h-3" />
                {showBoundingBox ? 'Hide AI Bounding Box' : 'Show AI Bounding Box'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Camera Source: {result.cameraSource || 'Field Optical Sensor'}</span>
            <span className="font-mono">ID: {result.id}</span>
          </div>
        </div>

        {/* Right Column: Prediction Details & Confidence */}
        <div className="lg:col-span-7 space-y-5">
          {/* Main Title & Confidence Bar */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                {result.crop} Cultivar
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${severityStyle.bg}`}
              >
                {severityStyle.label}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {result.crop} – {result.disease}
            </h3>

            {/* Confidence Bar */}
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Model Confidence</span>
                <span className="text-emerald-700 font-mono text-sm">{result.confidence}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${result.confidence}%` }}
                />
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-y border-slate-100 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Crop</span>
              <span className="font-bold text-slate-800">{result.crop}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Disease</span>
              <span className="font-bold text-slate-800 truncate block" title={result.disease}>
                {result.disease}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Latency</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-600" />
                {result.detectionTimeSeconds}s
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Model</span>
              <span className="font-bold text-slate-800 truncate block">
                {result.model}
              </span>
            </div>
          </div>

          {/* Section 7: Disease Severity & Affected Area */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Disease Severity Level
              </span>
              <span className="text-xs font-extrabold text-slate-800">
                {result.severity}
              </span>
            </div>

            {/* Horizontal Severity Meter */}
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold text-slate-500">
                <span className={result.severity === 'Low' ? 'text-yellow-700 font-extrabold' : ''}>
                  Low
                </span>
                <span className={result.severity === 'Moderate' ? 'text-amber-700 font-extrabold' : ''}>
                  Moderate
                </span>
                <span className={result.severity === 'Severe' ? 'text-rose-700 font-extrabold' : ''}>
                  Severe
                </span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className={`h-full transition-all duration-700 ${
                    result.severity === 'Severe'
                      ? 'w-full bg-rose-500'
                      : result.severity === 'Moderate'
                      ? 'w-2/3 bg-amber-500'
                      : result.severity === 'Low'
                      ? 'w-1/3 bg-yellow-500'
                      : 'w-0 bg-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Affected Area Specification */}
            <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-200/60">
              <span className="text-slate-500 font-medium">Estimated Affected Canopy Area:</span>
              <span className="font-bold text-slate-800">
                {result.affectedAreaPercentage !== null ? (
                  <span className="text-rose-700 font-mono font-bold">
                    {result.affectedAreaPercentage}%
                  </span>
                ) : (
                  <span className="text-slate-400 italic">Not available</span>
                )}
              </span>
            </div>
          </div>

          {/* Section 8: Recommended Action Card */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-700" />
                Recommended Action
              </h4>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <strong className="text-emerald-950 font-bold block">Immediate Action:</strong>
                <p className="text-emerald-900 mt-0.5">{result.immediateAction}</p>
              </div>

              <div>
                <strong className="text-emerald-950 font-bold block">Preventive Action:</strong>
                <p className="text-emerald-900 mt-0.5">{result.preventiveAction}</p>
              </div>

              <div>
                <strong className="text-emerald-950 font-bold block">Monitoring:</strong>
                <p className="text-emerald-900 mt-0.5">{result.monitoringRecommendation}</p>
              </div>
            </div>

            <p className="text-[10px] text-emerald-700/80 italic pt-1 border-t border-emerald-200/60">
              Note: Dosages and chemical treatments require consultation with certified local agronomists.
            </p>
          </div>

          {/* Buttons: View Detailed Analysis & View Full Recommendation */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setShowDetailModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileCheck className="w-4 h-4" /> View Detailed Analysis
            </button>

            <button
              onClick={() => onNavigate?.('recommendations')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 text-xs font-bold transition-colors flex items-center gap-2"
            >
              View Full Recommendation <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Analysis Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title={`Pathology Diagnostic Report: ${result.crop} – ${result.disease}`}
        subtitle={`Sample Reference: ${result.id} | Inference Model: ${result.model}`}
        maxWidth="2xl"
      >
        <div className="space-y-5 text-slate-700 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">Crop Taxonomy</span>
              <span className="font-bold text-slate-800">{result.crop}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">Classified Pathogen</span>
              <span className="font-bold text-slate-800">{result.disease}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">Confidence Score</span>
              <span className="font-bold text-emerald-700">{result.confidence}% Top-1</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-bold">Severity Rating</span>
              <span className="font-bold text-slate-800">{result.severity}</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-1.5">Pathological Profile & Symptoms</h4>
            <p className="text-slate-600 leading-relaxed">
              Early diagnosis of {result.disease} on {result.crop} reveals characteristic chlorotic margins and necrotic focal points. In humid environments above 70% RH, fungal mycelia can spread to adjacent vegetative rows within 48–72 hours.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">Recommended Intervention Protocol</h4>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Immediate foliar inspection within a 5-meter perimeter.</li>
              <li>Pruning of infected foliage using sanitized tools (70% isopropyl alcohol).</li>
              <li>Adjustment of irrigation schedules to early morning hours to reduce night-time leaf wetness duration.</li>
              <li>Automated surveillance via AgriRakshak USB Camera Feeds to detect secondary lesions.</li>
            </ul>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Agronomist Advisory:</strong> This prediction was generated by the {result.model} edge classifier. If severe defoliation is observed, consult your local agricultural extension service for certified biological fungicide applications.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowDetailModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold"
            >
              Close Analysis
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
