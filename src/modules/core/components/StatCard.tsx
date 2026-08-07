import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: 'navy' | 'teal' | 'amber' | 'emerald' | 'rose' | 'indigo';
  onClick?: () => void;
  id?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'navy',
  onClick,
  id,
}) => {
  const colorMap = {
    navy: { bg: 'bg-slate-50 border-slate-200 text-slate-800', iconBg: 'bg-slate-900 text-white' },
    teal: { bg: 'bg-teal-50/50 border-teal-200 text-teal-900', iconBg: 'bg-teal-600 text-white' },
    amber: { bg: 'bg-amber-50/50 border-amber-200 text-amber-900', iconBg: 'bg-amber-500 text-white' },
    emerald: { bg: 'bg-emerald-50/50 border-emerald-200 text-emerald-900', iconBg: 'bg-emerald-600 text-white' },
    rose: { bg: 'bg-rose-50/50 border-rose-200 text-rose-900', iconBg: 'bg-rose-600 text-white' },
    indigo: { bg: 'bg-indigo-50/50 border-indigo-200 text-indigo-900', iconBg: 'bg-indigo-600 text-white' },
  };

  const selected = colorMap[color];

  return (
    <div
      id={id || `stat-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
      onClick={onClick}
      className={`p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${selected.bg} ${
        onClick ? 'cursor-pointer hover:border-slate-400' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-600">{title}</span>
        <div className={`p-2.5 rounded-xl ${selected.iconBg} shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/80 border border-slate-200 text-slate-700">
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
