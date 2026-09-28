import React from 'react';
import { LucideIcon, Info } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
    label: string;
  };
  circularProgress?: {
    percentage: number;
    color?: string;
  };
  accentColor?: 'emerald' | 'amber' | 'rose' | 'blue';
  liveBadge?: string;
  tooltip?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  circularProgress,
  accentColor = 'emerald',
  liveBadge,
  tooltip,
  onClick,
}) => {
  const accentStyles = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      border: 'hover:border-emerald-300',
      ring: 'stroke-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-700',
      iconBg: 'bg-amber-100 text-amber-700 border-amber-200',
      border: 'hover:border-amber-300',
      ring: 'stroke-amber-600',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-700',
      iconBg: 'bg-rose-100 text-rose-700 border-rose-200',
      border: 'hover:border-rose-300',
      ring: 'stroke-rose-600',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-700',
      iconBg: 'bg-blue-100 text-blue-700 border-blue-200',
      border: 'hover:border-blue-300',
      ring: 'stroke-blue-600',
    },
  }[accentColor];

  // SVG circular calculation
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circularProgress
    ? circumference - (circularProgress.percentage / 100) * circumference
    : 0;

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${accentStyles.border}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {title}
            </span>
            {tooltip && (
              <span title={tooltip} className="text-slate-400 hover:text-slate-600 cursor-help">
                <Info className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {value}
            </span>
            {liveBadge && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                {liveBadge}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 font-medium">
              {subtitle}
            </p>
          )}

          {trend && (
            <div className="mt-3 flex items-center gap-1.5 text-xs">
              <span
                className={`font-bold inline-flex items-center px-1.5 py-0.5 rounded ${
                  trend.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-slate-400 text-[11px]">{trend.label}</span>
            </div>
          )}
        </div>

        {/* Circular Progress or Standard Icon */}
        <div className="shrink-0 ml-3">
          {circularProgress ? (
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="5"
                  fill="transparent"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  className={`${accentStyles.ring} transition-all duration-1000 ease-out`}
                  strokeWidth="5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Icon className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          ) : (
            <div className={`p-3 rounded-2xl border ${accentStyles.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
