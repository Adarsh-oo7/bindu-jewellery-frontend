import React from 'react';
import { Camera, ThumbsUp, Globe, MapPin, GitBranch, MessageCircle, UserPlus } from 'lucide-react';
import { ChartCard, EmptyChart } from './ChartWidget';

export const SOURCE_META = {
  instagram: { label: 'Instagram', color: '#E1306C', icon: Camera },
  facebook:  { label: 'Facebook',  color: '#1877F2', icon: ThumbsUp },
  website:   { label: 'Website',   color: '#10B981', icon: Globe },
  walkin:    { label: 'Walk-in',   color: '#C9972A', icon: MapPin },
  referral:  { label: 'Referral',  color: '#8B5CF6', icon: GitBranch },
  whatsapp:  { label: 'WhatsApp',  color: '#25D366', icon: MessageCircle },
  other:     { label: 'Other',     color: '#9CA3AF', icon: UserPlus },
};

export const LeadsSourceWidget = ({ leads, totalCount }) => {
  const sourceCounts = {};
  leads.forEach(l => { const s = l.source || 'other'; sourceCounts[s] = (sourceCounts[s] || 0) + 1; });
  const sourceRows = Object.entries(sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([src, cnt]) => ({ src, cnt, pct: Math.round((cnt / (totalCount || leads.length || 1)) * 100) }));

  return (
    <ChartCard 
      title="Lead Sources" 
      subtitle="How leads are coming in"
      extra={
        <span style={{ fontSize: 11, fontWeight: 700, color: '#C9972A', background: '#FEF3C7', padding: '2px 8px', borderRadius: 6 }}>
          {totalCount || leads.length} total
        </span>
      }
    >
      <div style={{ padding: '4px 0 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sourceRows.length === 0 ? (
          <EmptyChart message="No lead source data" />
        ) : sourceRows.map(({ src, cnt, pct }) => {
          const meta = SOURCE_META[src] || SOURCE_META.other;
          const Icon = meta.icon;
          return (
            <div key={src}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    width: 28, height: 28, borderRadius: 8, background: `${meta.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 
                  }}>
                    <Icon size={13} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{meta.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{cnt}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', minWidth: 32, textAlign:'right' }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', width: `${pct}%`, background: meta.color,
                  borderRadius: 99, transition: 'width 0.6s ease' 
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
};

export default LeadsSourceWidget;
