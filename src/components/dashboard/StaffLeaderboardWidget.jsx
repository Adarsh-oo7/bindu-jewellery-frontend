import React from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import { ChartCard, EmptyChart } from './ChartWidget';

export const StaffLeaderboardWidget = ({ data }) => (
  <ChartCard title="Staff Leaderboard" subtitle="Top performers by sales">
    <div className="leaderboard-list">
      {data && data.length > 0 ? data.map((s, i) => (
        <div key={i} className={`leader-row ${i < 3 ? 'leader-top' : ''}`}>
          <div className="leader-rank">
            {i === 0 ? <Trophy size={16} color="#C9972A" /> : i === 1 ? <Medal size={16} color="#9CA3AF" /> : i === 2 ? <Award size={16} color="#C97E2A" /> : <span className="leader-num">{i + 1}</span>}
          </div>
          <div className="leader-name">{s.name}</div>
          <div className="leader-stats">
            <span className="leader-sales">{s.sales} sales</span>
            <span className="leader-leads">{s.leads} leads</span>
          </div>
        </div>
      )) : <EmptyChart message="No staff data available" />}
    </div>
  </ChartCard>
);

export default StaffLeaderboardWidget;
