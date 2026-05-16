import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const AnimatedCounter = ({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  const isNumber = !isNaN(parseFloat(value)) && isFinite(value);

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const end = parseFloat(value) || 0;
    if (end === 0) { setDisplay(0); return; }
    const duration = 1000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(start);
    }, 16);
    return () => clearInterval(timer);
  }, [value, isNumber]);

  if (!isNumber) return <span>{value}</span>;

  return (
    <span>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString('en-IN')}{suffix}
    </span>
  );
};

export const KPICard = ({ title, value, sub, icon: Icon, color, gradient, trend, trendVal, prefix = '', suffix = '', decimals = 0, className }) => (
  <div className={cn("kpi-card group", className)} style={{ '--accent-color': color }}>
    <div className="kpi-icon-wrap" style={{ background: gradient }}>
      <Icon size={22} color="#fff" />
    </div>
    <div className="kpi-body">
      <p className="kpi-label">{title}</p>
      <h2 className="kpi-value">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
      </h2>
      <p className="kpi-sub">{sub}</p>
    </div>
    {trendVal != null && (
      <div className={`kpi-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
        {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{trendVal}%</span>
      </div>
    )}
    <div className="kpi-shine" />
  </div>
);

export default KPICard;
