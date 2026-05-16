import React from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="font-semibold text-xs mb-1 text-[#C9972A]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: {typeof p.value === 'number' && (p.name?.toLowerCase().includes('weight') || p.name?.toLowerCase().includes('gold')) ? `${p.value.toLocaleString('en-IN')} g` : p.value}
        </p>
      ))}
    </div>
  );
};

export const EmptyChart = ({ message }) => (
  <div className="empty-chart h-full flex flex-col items-center justify-center p-8">
    <Activity size={32} className="opacity-20 mb-2" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

export const ChartCard = ({ title, subtitle, extra, children, className, bodyClassName, wide }) => (
  <div className={cn("chart-card", wide && "wide", className)}>
    <div className="chart-card-header">
      <div>
        <h3 className="chart-title">{title}</h3>
        {subtitle && <p className="chart-sub">{subtitle}</p>}
      </div>
      {extra}
    </div>
    <div className={cn("chart-body", bodyClassName)}>
      {children}
    </div>
  </div>
);
