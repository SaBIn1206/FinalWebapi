'use client';

import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function AdminDashboardTab({
  statsData,
  comparisonAnalytics,
  cakeAnalytics,
  comboAnalytics,
  statsError,
  analyticsError,
}: {
  statsData: any;
  comparisonAnalytics: any;
  cakeAnalytics: any;
  comboAnalytics: any;
  statsError?: any;
  analyticsError?: any;
}) {
  if (statsError) {
    return (
      <div className="p-8 text-center text-night-ink-soft bg-night-elevated rounded-3xl border border-night-border">
        <p className="font-medium">Failed to load dashboard stats.</p>
      </div>
    );
  }

  if (analyticsError) {
    return (
      <div className="p-8 text-center text-night-ink-soft bg-night-elevated rounded-3xl border border-night-border">
        <p className="font-medium">Failed to load analytics data.</p>
      </div>
    );
  }
  return (
    <AnalyticsDashboard
      statsData={statsData}
      comparisonAnalytics={comparisonAnalytics}
      cakeAnalytics={cakeAnalytics}
      comboAnalytics={comboAnalytics}
    />
  );
}
