'use client';

import React from 'react';
import { formatPrice } from '@/lib/format';
import { Card } from '@/components/ui';
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart as ReLineChart,
  Line,
} from 'recharts';

/** Brand palette mirrored from the design-system tokens for charts. */
const CHART = {
  brand: '#be123c',
  accent: '#f59e0b',
  grid: '#292524',
  axis: '#a8a29e',
  tooltipBg: '#1c1917',
  tooltipBorder: '#44403c',
  tooltipText: '#f5f5f4',
};

const chartTooltip = {
  contentStyle: { backgroundColor: CHART.tooltipBg, border: `1px solid ${CHART.tooltipBorder}`, borderRadius: '12px' },
  labelStyle: { color: CHART.tooltipText },
  formatter: (value: any) => formatPrice(value),
};

interface AnalyticsDashboardProps {
  statsData: any;
  comparisonAnalytics: any;
  cakeAnalytics: any;
  comboAnalytics: any;
}

/**
 * Admin "Dashboard Stats" tab. Extracted from the monolithic admin page into
 * its own module so the analytics view is independently maintainable. Renders
 * exclusively with design-system `Card` (dark tone) and token-based chart colors.
 */
export default function AnalyticsDashboard({
  statsData,
  comparisonAnalytics,
  cakeAnalytics,
  comboAnalytics,
}: AnalyticsDashboardProps) {
  if (!statsData) {
    return <div className="p-8 text-center text-night-ink-soft">Loading analytics…</div>;
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi label="Total Revenue" value={formatPrice(statsData.totalRevenue)} />
        <Kpi label="Total Orders" value={statsData.totalOrders} />
        <Kpi label="Pending Orders" value={statsData.pendingOrders} accent />
        <Kpi label="Total Users" value={statsData.totalUsers} />
      </div>

      {/* Revenue Breakdown by Order Status */}
      <Card tone="dark" className="p-8">
        <h3 className="text-lg font-bold mb-6">Revenue Breakdown by Order Status</h3>
        <div className="space-y-4">
          {statsData.statusCounts?.map((s: any) => (
            <div key={s.status} className="flex items-center justify-between text-sm">
              <span className="font-semibold text-night-ink-soft">{s.status}</span>
              <div className="flex gap-8 text-night-ink-soft">
                <span>Orders: <span className="font-bold text-night-ink">{s.count}</span></span>
                <span>Sales: <span className="font-bold text-brand">{formatPrice(s.revenue)}</span></span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Cake vs Combo Comparison KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Kpi label="Cake Revenue" value={comparisonAnalytics ? formatPrice(comparisonAnalytics.cakeRevenue) : '—'} accent />
        <Kpi label="Combo Revenue" value={comparisonAnalytics ? formatPrice(comparisonAnalytics.comboRevenue) : '—'} />
        <Kpi label="Cake Units Sold" value={comparisonAnalytics ? comparisonAnalytics.cakeUnits : '—'} accent />
        <Kpi label="Combo Units Sold" value={comparisonAnalytics ? comparisonAnalytics.comboUnits : '—'} />
      </div>

      {/* Charts Row: Revenue Share Pie + Sales Trend Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card tone="dark" className="p-6">
          <h3 className="text-lg font-bold mb-4">Revenue Share: Cakes vs Combos</h3>
          {comparisonAnalytics ? (
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={[
                    { name: 'Cakes', value: comparisonAnalytics.cakeRevenue },
                    { name: 'Combos', value: comparisonAnalytics.comboRevenue },
                  ]}
                  cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                  outerRadius={100} dataKey="value"
                >
                  <Cell fill={CHART.brand} />
                  <Cell fill={CHART.accent} />
                </Pie>
                <Tooltip formatter={(value: any) => formatPrice(value)} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <ChartFallback label="Loading chart data..." />
          )}
        </Card>

        <Card tone="dark" className="p-6">
          <h3 className="text-lg font-bold mb-4">Sales Trend Over Time</h3>
          {comparisonAnalytics?.trend && comparisonAnalytics.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ReLineChart data={comparisonAnalytics.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                <XAxis dataKey="date" stroke={CHART.axis} fontSize={10} />
                <YAxis stroke={CHART.axis} fontSize={10} />
                <Tooltip {...chartTooltip} />
                <Legend />
                <Line type="monotone" dataKey="cake" stroke={CHART.brand} strokeWidth={2} name="Cake Revenue" />
                <Line type="monotone" dataKey="combo" stroke={CHART.accent} strokeWidth={2} name="Combo Revenue" />
              </ReLineChart>
            </ResponsiveContainer>
          ) : (
            <ChartFallback label="Loading trend data..." />
          )}
        </Card>
      </div>

      {/* Top Products Row: Top Cakes Bar Chart + Top Combos Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card tone="dark" className="p-6">
          <h3 className="text-lg font-bold mb-4">Top Selling Cakes</h3>
          {cakeAnalytics?.topCakes && cakeAnalytics.topCakes.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={cakeAnalytics.topCakes.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                <XAxis type="number" stroke={CHART.axis} fontSize={10} />
                <YAxis dataKey="name" type="category" stroke={CHART.axis} fontSize={10} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: CHART.tooltipBg, border: `1px solid ${CHART.tooltipBorder}`, borderRadius: '12px' }}
                  labelStyle={{ color: CHART.tooltipText }}
                  formatter={(value: any, name: any) => [name === 'unitsSold' ? `${value} units` : formatPrice(value), name === 'unitsSold' ? 'Units Sold' : 'Revenue']}
                />
                <Bar dataKey="unitsSold" fill={CHART.brand} radius={[0, 4, 4, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          ) : (
            <ChartFallback label="No cake data yet" />
          )}
        </Card>

        <Card tone="dark" className="p-6">
          <h3 className="text-lg font-bold mb-4">Top Selling Combos</h3>
          {comboAnalytics?.combos && comboAnalytics.combos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ReBarChart data={comboAnalytics.combos.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                <XAxis type="number" stroke={CHART.axis} fontSize={10} />
                <YAxis dataKey="name" type="category" stroke={CHART.axis} fontSize={10} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: CHART.tooltipBg, border: `1px solid ${CHART.tooltipBorder}`, borderRadius: '12px' }}
                  labelStyle={{ color: CHART.tooltipText }}
                  formatter={(value: any, name: any) => [name === 'unitsSold' ? `${value} units` : formatPrice(value), name === 'unitsSold' ? 'Units Sold' : 'Revenue']}
                />
                <Bar dataKey="unitsSold" fill={CHART.accent} radius={[0, 4, 4, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          ) : (
            <ChartFallback label="No combo data yet" />
          )}
        </Card>
      </div>

      {/* Top Cakes Table */}
      <Card tone="dark" className="overflow-hidden">
        <div className="p-6 border-b border-night-border">
          <h3 className="font-bold">Top Performing Cakes</h3>
        </div>
        {cakeAnalytics?.topCakes && cakeAnalytics.topCakes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-night text-night-ink-soft">
                <tr>
                  <th className="p-4">Cake</th>
                  <th className="p-4 text-right">Units Sold</th>
                  <th className="p-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-border">
                {cakeAnalytics.topCakes.map((cake: any, idx: number) => (
                  <tr key={cake.id || idx} className="hover:bg-night-border/40">
                    <td className="p-4 font-semibold text-night-ink">{cake.name}</td>
                    <td className="p-4 text-right font-bold text-brand">{cake.unitsSold}</td>
                    <td className="p-4 text-right font-bold text-night-ink">{formatPrice(cake.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-night-ink-soft text-sm">No cake sales data yet</div>
        )}
      </Card>

      {/* Top Combos Table */}
      <Card tone="dark" className="overflow-hidden">
        <div className="p-6 border-b border-night-border">
          <h3 className="font-bold">Top Performing Combos</h3>
        </div>
        {comboAnalytics?.combos && comboAnalytics.combos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-night text-night-ink-soft">
                <tr>
                  <th className="p-4">Combo Name</th>
                  <th className="p-4 text-right">Orders</th>
                  <th className="p-4 text-right">Units</th>
                  <th className="p-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-border">
                {comboAnalytics.combos.slice(0, 5).map((combo: any) => (
                  <tr key={combo.id} className="hover:bg-night-border/40">
                    <td className="p-4 font-semibold text-night-ink">{combo.name}</td>
                    <td className="p-4 text-right font-bold text-accent">{combo.orders}</td>
                    <td className="p-4 text-right font-bold text-night-ink">{combo.units}</td>
                    <td className="p-4 text-right font-bold text-night-ink">{formatPrice(combo.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-night-ink-soft text-sm">No combo sales data yet</div>
        )}
      </Card>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <Card tone="dark" className="p-6">
      <span className={`text-[10px] uppercase font-bold ${accent ? 'text-accent' : 'text-night-ink-soft'}`}>{label}</span>
      <div className="text-3xl font-black text-night-ink mt-1">{value}</div>
    </Card>
  );
}

function ChartFallback({ label }: { label: string }) {
  return <div className="h-[300px] flex items-center justify-center text-night-ink-soft text-sm">{label}</div>;
}
