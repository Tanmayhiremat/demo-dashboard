import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { PieChart as PieIcon, Info, WifiOff } from 'lucide-react';
import { DiseaseDistributionItem } from '../../types';

interface DiseaseDistributionChartProps {
  data: DiseaseDistributionItem[];
  totalDetections?: number;
}

export const DiseaseDistributionChart: React.FC<DiseaseDistributionChartProps> = ({
  data,
  totalDetections = 0,
}) => {
  const calculatedTotal = data.reduce((acc, curr) => acc + curr.count, 0);
  const displayTotal = totalDetections !== undefined ? totalDetections : calculatedTotal;

  if (data.length === 0 || displayTotal === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[380px]">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-slate-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Disease Detection Distribution
              </h2>
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Offline Standby
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mb-4">
            Categorized prevalence across monitored cultivation beds
          </p>
        </div>

        <div className="flex flex-col items-center justify-center p-8 text-center my-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <PieIcon className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Pathology Detections Recorded</h3>
          <p className="text-xs text-slate-400 max-w-xs mt-1">
            System is in Offline Mode. Run AI diagnostics on crop leaf images to generate distribution metrics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Disease Detection Distribution
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400">Live Breakdown</span>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-4">
          Categorized prevalence across monitored cultivation beds
        </p>
      </div>

      {/* Donut Chart with Centered Total */}
      <div className="relative h-60 w-full flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as DiseaseDistributionItem;
                  const pct = ((item.count / calculatedTotal) * 100).toFixed(1);
                  return (
                    <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl border border-slate-800">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-emerald-400 font-mono">
                        {item.count} detections ({pct}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={95}
              paddingAngle={4}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Count Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {displayTotal}
          </span>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Total Detections
          </span>
        </div>
      </div>

      {/* Category Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4 border-t border-slate-100">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-600 truncate font-medium">{item.name}</span>
            <span className="text-slate-900 font-bold ml-auto">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
