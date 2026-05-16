import React from 'react';
import { Eye, MousePointerClick, TrendingUp, DollarSign } from 'lucide-react';

const AnalyticsPreviewCard = ({ analytics, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  const metrics = [
    {
      label: 'Impressions',
      value: analytics?.impressions?.toLocaleString() || '0',
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Clicks',
      value: analytics?.clicks?.toLocaleString() || '0',
      icon: MousePointerClick,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Engagement',
      value: analytics?.engagement?.toLocaleString() || '0',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Spend',
      value: `₹${analytics?.spend?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div key={index} className={`${metric.bgColor} rounded-lg p-3`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon size={14} className={metric.color} />
              <span className="text-xs text-gray-600">{metric.label}</span>
            </div>
            <div className={`text-lg font-semibold ${metric.color}`}>
              {metric.value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnalyticsPreviewCard;
