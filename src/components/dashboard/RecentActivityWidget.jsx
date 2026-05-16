import React from 'react';
import { ChartCard, EmptyChart } from './ChartWidget';
import { StageBadge } from './StageBadge';

export const RecentActivityWidget = ({ activities }) => (
  <ChartCard title="Recent Activity" subtitle="Latest lead updates">
    <div className="activity-list">
      {activities && activities.length > 0 ? activities.map((a, i) => (
        <div key={i} className="activity-row">
          <div className="activity-dot" />
          <div className="activity-info">
            <p className="activity-name">{a.name}</p>
            <p className="activity-date">{a.date}</p>
          </div>
          <StageBadge stage={a.stage} />
        </div>
      )) : <EmptyChart message="No recent activity" />}
    </div>
  </ChartCard>
);

export default RecentActivityWidget;
