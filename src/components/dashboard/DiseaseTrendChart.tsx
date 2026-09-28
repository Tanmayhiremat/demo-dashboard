import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Calendar, WifiOff } from 'lucide-react';
import { TrendDataPoint } from '../../types';

interface DiseaseTrendChartProps {
  trendData: TrendDataPoint[];
  selectedRange: '7d' | '30d' | '3m';
  onRangeChange: (range: '7d' | '30d' | '3m') => void;
}

export const DiseaseTrendChart: React.FC<DiseaseTrendChartProps> = ({
  trendData,
  selectedRange,
  onRangeChange,
}) => {
  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[380px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Disease Detection Trend
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Temporal rate of disease incidence vs healthy baseline scans
            </p>
          </div>

          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 self-start sm:self-auto">
            Offline Mode
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-8 text-center my-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
            <TrendingUp className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No Temporal Telemetry Logged</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Historical trend curves will dynamically render as optical camera frames and manual leaf uploads are diagnosed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
              Disease Detection Trend
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Temporal rate of disease incidence vs healthy baseline scans
          </p>
        </div>

        {/* Range Filters */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 self-start sm:self-auto">
          {(['7d', '30d', '3m'] as const).map((range) => (
            <button
              key={range}
              onClick={() => onRangeChange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedRange === range
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '3 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDetections" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-2xl shadow-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-slate-300 border-b border-slate-800 pb-1 mb-1">
                        Timeline: {label}
                      </p>
                      <p className="text-rose-400 font-semibold flex items-center justify-between gap-4">
                        <span>Diseased Detections:</span>
                        <span className="font-mono font-bold">{payload[0]?.value}</span>
                      </p>
                      <p className="text-emerald-400 font-semibold flex items-center justify-between gap-4">
                        <span>Healthy Scans:</span>
                        <span className="font-mono font-bold">{payload[1]?.value}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="detections"
              name="Diseased Detections"
              stroke="#ef4444"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorDetections)"
            />
            <Area
              type="monotone"
              dataKey="healthyScans"
              name="Healthy Scans"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorHealthy)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-rose-500 rounded-full" />
          <span className="text-slate-600 font-medium">Diseased Detections</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-1 bg-emerald-500 rounded-full border-b border-dashed border-emerald-500" />
          <span className="text-slate-600 font-medium">Healthy Routine Scans</span>
        </div>
      </div>
    </div>
  );
};
