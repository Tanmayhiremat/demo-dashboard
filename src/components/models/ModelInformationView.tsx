import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Scale,
  Zap,
  Info,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AIModelInfo } from '../../types';
import { Modal } from '../common/Modal';

interface ModelInformationViewProps {
  models: AIModelInfo[];
  activeModelId: string;
  onSelectModel: (modelId: string) => void;
}

export const ModelInformationView: React.FC<ModelInformationViewProps> = ({
  models,
  activeModelId,
  onSelectModel,
}) => {
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                AI Inference Neural Architectures
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                2 Neural Backends
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              Select and benchmark edge-optimized CNNs and cloud Vision Transformers
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowComparisonModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md self-start md:self-auto transition-all"
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Model Comparison</span>
        </button>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {models.map((model) => {
          const isActive = activeModelId === model.id;
          return (
            <div
              key={model.id}
              className={`bg-white rounded-3xl p-6 sm:p-7 border transition-all space-y-6 flex flex-col justify-between ${
                isActive
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {model.architecture}
                      </span>
                      {isActive && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Active Engine
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">
                      {model.name}
                    </h2>
                  </div>

                  <span className="p-2.5 rounded-2xl bg-slate-50 text-slate-700 border border-slate-200 shrink-0">
                    <Zap className="w-5 h-5 text-emerald-600" />
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Input Matrix</span>
                    <span className="font-bold text-slate-800">{model.inputSize}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Disease Classes</span>
                    <span className="font-bold text-slate-800">{model.classesCount} Classes</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Edge Latency</span>
                    <span className="font-bold text-emerald-700 font-mono">{model.latencyEdgeMs}ms</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Parameters</span>
                    <span className="font-bold text-slate-800">{model.parameterCount}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Hardware</span>
                    <span className="font-bold text-slate-800">{model.recommendedDeployment}</span>
                  </div>
                </div>

                {/* Warning note if heavy model */}
                {model.warningNote && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 flex items-start gap-2.5 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="font-semibold">{model.warningNote}</span>
                  </div>
                )}

                {/* Supported Crops List */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700">Supported Agricultural Crops:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {model.supportedCrops.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectModel(model.id)}
                  disabled={isActive}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Currently Activated for Live Scans
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Switch Inference Engine to {model.name.split(' ')[0]}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Comparison Modal */}
      <Modal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        title="Model Benchmark & Deployment Trade-off Comparison"
        subtitle="Edge inference profiling on Raspberry Pi 4 vs Cloud Tensor Accelerator"
        maxWidth="2xl"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <th className="p-3">Specification</th>
                  <th className="p-3 text-emerald-800">MobileNetV2 (Edge Default)</th>
                  <th className="p-3 text-blue-800">Vision Transformer (ViT2)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="p-3 text-slate-500 font-bold">Architecture Family</td>
                  <td className="p-3 font-semibold">Inverted Residual CNN</td>
                  <td className="p-3 font-semibold">Multi-Head Self-Attention</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-500 font-bold">Model File Size</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">14 MB (.tflite)</td>
                  <td className="p-3 font-mono text-blue-700 font-bold">340 MB (.onnx)</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-500 font-bold">RPi4 CPU Latency</td>
                  <td className="p-3 font-mono font-bold text-emerald-600">42 ms / frame</td>
                  <td className="p-3 font-mono font-bold text-rose-600">480 ms / frame</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-500 font-bold">Top-1 Accuracy</td>
                  <td className="p-3 font-mono">94.6%</td>
                  <td className="p-3 font-mono font-bold text-blue-600">97.4%</td>
                </tr>
                <tr>
                  <td className="p-3 text-slate-500 font-bold">Recommended Use</td>
                  <td className="p-3">Continuous 30FPS Edge Monitoring</td>
                  <td className="p-3">High-Resolution Cloud Diagnosis</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            <strong>Conclusion for Field Trials:</strong> MobileNetV2 is recommended for standalone Raspberry Pi edge deployment due to its lightweight memory footprint and real-time 30FPS camera stream synchronization.
          </p>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setShowComparisonModal(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
