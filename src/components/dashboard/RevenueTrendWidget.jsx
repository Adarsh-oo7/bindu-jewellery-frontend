import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartCard, ChartTooltip, EmptyChart } from './ChartWidget';

export const RevenueTrendWidget = ({ data, timeRange, onTimeRangeChange }) => (
  <ChartCard 
    title="Sales Trend" 
    subtitle="Gold Weight (g) & sales volume over time"
    wide
    extra={
      <div className="time-tabs">
        {['daily','weekly','monthly'].map(t => (
          <button 
            key={t} 
            className={`time-tab ${timeRange === t ? 'active' : ''}`} 
            onClick={() => onTimeRangeChange(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    }
  >
    {data && data.length > 0 ? (
      <ResponsiveContainer width="100%" height={260} minWidth={0}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#C9972A" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#C9972A" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="cntGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1A5490" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1A5490" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="r" orientation="left"  tick={{ fontSize: 11 }} stroke="#C9972A" />
          <YAxis yAxisId="c" orientation="right" tick={{ fontSize: 11 }} stroke="#1A5490" />
          <Tooltip content={<ChartTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area yAxisId="r" type="monotone" dataKey="weight" stroke="#C9972A" strokeWidth={2} fill="url(#revGrad)" name="Gold Weight (g)" />
          <Area yAxisId="c" type="monotone" dataKey="count"   stroke="#1A5490" strokeWidth={2} fill="url(#cntGrad)" name="Sales Count" />
        </AreaChart>
      </ResponsiveContainer>
    ) : <EmptyChart message="No sales data for selected period" />}
  </ChartCard>
);

export default RevenueTrendWidget;
