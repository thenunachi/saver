import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import api from "../api/client";

const PIE_COLORS = ["#6366f1","#10b981","#f59e0b","#ef4444","#ec4899","#3b82f6","#8b5cf6","#06b6d4","#84cc16","#f97316"];

const tooltipStyle = {
  contentStyle: { background: "#1a1d2e", border: "1px solid #2a2d3d", borderRadius: 8, color: "#e2e8f0" },
  labelStyle:   { color: "#8892a4" },
};

function fmt(v) { return `$${Number(v).toLocaleString()}`; }

export default function Analytics() {
  const [stats,  setStats]  = useState(null);
  const [goals,  setGoals]  = useState([]);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/stats"), api.get("/goals")])
      .then(([sRes, gRes]) => { setStats(sRes.data); setGoals(gRes.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!stats)  return null;

  // Goal progress for radial / bar
  const goalProgressData = goals.map(g => ({
    name:    g.name.length > 20 ? g.name.slice(0, 18) + "…" : g.name,
    pct:     g.progress_pct,
    saved:   g.saved_amount,
    target:  g.target_amount,
    fill:    g.color,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Visualise your savings journey</p>
        </div>
      </div>

      {/* Top stats */}
      <div className="stats-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-label">Total Saved</div>
          <div className="stat-value" style={{ color: "var(--green)" }}>${stats.total_saved.toLocaleString()}</div>
          <div className="stat-sub">across {stats.total_goals} goals</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overall Progress</div>
          <div className="stat-value" style={{ color: "var(--accent-h)" }}>{stats.overall_pct}%</div>
          <div className="stat-sub">to target</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Remaining</div>
          <div className="stat-value" style={{ color: "var(--yellow)" }}>
            ${(stats.total_target - stats.total_saved).toLocaleString()}
          </div>
          <div className="stat-sub">still to save</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{stats.completed_goals}</div>
          <div className="stat-sub">of {stats.total_goals} goals</div>
        </div>
      </div>

      <div className="chart-grid">
        {/* Monthly savings trend */}
        <div className="chart-card" style={{ gridColumn: "1 / -1" }}>
          <h3 className="chart-title">Monthly Savings (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.monthly_savings} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="gradSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" />
              <XAxis dataKey="month" tick={{ fill: "#8892a4", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmt} tick={{ fill: "#8892a4", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={fmt} {...tooltipStyle} />
              <Area type="monotone" dataKey="saved" stroke="#6366f1" strokeWidth={2} fill="url(#gradSaved)" name="Saved" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Goal Progress Bar chart */}
        {goalProgressData.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Goal Progress (%)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={goalProgressData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8892a4", fontSize: 11 }} tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fill: "#8892a4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `${v}%`} {...tooltipStyle} />
                <Bar dataKey="pct" radius={[0, 4, 4, 0]} name="Progress">
                  {goalProgressData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category breakdown pie */}
        {stats.category_breakdown.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Savings by Category</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.category_breakdown}
                  dataKey="saved"
                  nameKey="category"
                  cx="50%" cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {stats.category_breakdown.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={fmt} {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Saved vs Target bar */}
        {goalProgressData.length > 0 && (
          <div className="chart-card">
            <h3 className="chart-title">Saved vs Target ($)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={goalProgressData} margin={{ top: 5, right: 20, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" />
                <XAxis dataKey="name" tick={{ fill: "#8892a4", fontSize: 10, angle: -30, textAnchor: "end" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmt} tick={{ fill: "#8892a4", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={fmt} {...tooltipStyle} />
                <Legend wrapperStyle={{ color: "#8892a4", fontSize: 12 }} />
                <Bar dataKey="saved"  name="Saved"  fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="target" name="Target" fill="#6366f1" radius={[4,4,0,0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
