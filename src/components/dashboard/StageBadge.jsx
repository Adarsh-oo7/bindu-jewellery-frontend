import React from 'react';

export const STAGE_META = {
  new:        { label: 'New',       color: '#3B82F6', bg: '#EFF6FF' },
  contacted:  { label: 'Contacted', color: '#8B5CF6', bg: '#F5F3FF' },
  interested: { label: 'Interested',color: '#F59E0B', bg: '#FFFBEB' },
  scheduled:  { label: 'Scheduled', color: '#0EA5E9', bg: '#F0F9FF' },
  converted:  { label: 'Converted', color: '#10B981', bg: '#ECFDF5' },
  lost:       { label: 'Lost',      color: '#EF4444', bg: '#FEF2F2' },
};

export const StageBadge = ({ stage }) => {
  const meta = STAGE_META[stage] || { label: stage, color: '#6B7280', bg: '#F3F4F6' };
  return (
    <span style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30` }}
      className="stage-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
      {meta.label}
    </span>
  );
};

export default StageBadge;
