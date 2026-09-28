import React from 'react';
import {
  Camera,
  Layers,
  Cpu,
  Sparkles,
  FileCheck2,
  ArrowRight,
  CheckCircle2,
  Activity
} from 'lucide-react';

interface Stage {
  id: string;
  name: string;
  sub: string;
  icon: React.ElementType;
  status: 'active' | 'ready';
  latency: string;
}

export const AIProcessingPipeline: React.FC = () => {
  const stages: Stage[] = [
    {
      id: 's1',
      name: 'Camera Input',
      sub: '720p USB Feed (30 FPS)',
      icon: Camera,
      status: 'active',
      latency: '12ms',
    },
    {
      id: 's2',
      name: 'Preprocessing',
      sub: '224×224 RGB Normalization',
      icon: Layers,
      status: 'active',
      latency: '8ms',
    },
    {
      id: 's3',
      name: 'AI Inference',
      sub: 'MobileNetV2 PlantVillage',
      icon: Cpu,
      status: 'active',
      latency: '42ms',
    },
    {
      id: 's4',
      name: 'Classification',
      sub: '38 Pathogen Classes',
      icon: Sparkles,
      status: 'active',
      latency: '3ms',
    },
    {
      id: 's5',
      name: 'Recommendation',
      sub: 'Agronomy Protocol Engine',
      icon: FileCheck2,
      status: 'active',
      latency: '5ms',
    },
  ];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl overflow-hidden relative">
      {/* Laser glow background element */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              AI Processing Pipeline
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Active Edge Pipeline
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Synchronized 5-stage inference cycle (End-to-End Latency: ~70ms)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Continuous Frame Stream</span>
        </div>
      </div>

      {/* Responsive Pipeline Steps */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.id}
              className="relative p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/60 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-xl bg-slate-700 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {stage.latency}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {stage.name}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{stage.sub}</p>
              </div>

              {/* Arrow Connector on desktop */}
              {idx < stages.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600 group-hover:text-emerald-400 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
