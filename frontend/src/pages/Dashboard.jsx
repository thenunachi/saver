import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, TrendingUp, Target, CheckCircle2, DollarSign } from "lucide-react";
import api from "../api/client";
import GoalCard      from "../components/GoalCard";
import GoalModal     from "../components/GoalModal";
import DepositModal  from "../components/DepositModal";

export default function Dashboard() {
  const [goals,     setGoals]     = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [goalModal, setGoalModal] = useState(false);
  const [editGoal,  setEditGoal]  = useState(null);
  const [depGoal,   setDepGoal]   = useState(null);
  const navigate = useNavigate();

  const fetchAll = useCallback(async () => {
    try {
      const [gRes, sRes] = await Promise.all([
        api.get("/goals?sort=created_at"),
        api.get("/stats"),
      ]);
      setGoals(gRes.data);
      setStats(sRes.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleCreateGoal(data) {
    await api.post("/goals", data);
    fetchAll();
  }
  async function handleEditGoal(data) {
    await api.put(`/goals/${editGoal.id}`, data);
    fetchAll();
  }
  async function handleDeleteGoal(goal) {
    if (!confirm(`Delete "${goal.name}"? All deposits will be removed.`)) return;
    await api.delete(`/goals/${goal.id}`);
    fetchAll();
  }
  async function handleDeposit(data) {
    await api.post(`/goals/${depGoal.id}/deposits`, data);
    fetchAll();
  }
  async function handleToggleComplete(goal) {
    await api.put(`/goals/${goal.id}`, { is_completed: !goal.is_completed });
    fetchAll();
  }

  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <p>Loading dashboard…</p>
    </div>
  );

  const recentGoals = goals.slice(0, 6);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your savings overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => setGoalModal(true)}>
          <Plus size={16} /> New Goal
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Saved</div>
            <div className="stat-value" style={{ color: "var(--green)" }}>
              ${stats.total_saved.toLocaleString()}
            </div>
            <div className="stat-sub">of ${stats.total_target.toLocaleString()} target</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overall Progress</div>
            <div className="stat-value" style={{ color: "var(--accent-h)" }}>
              {stats.overall_pct}%
            </div>
            <div className="stat-sub">across all goals</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active Goals</div>
            <div className="stat-value">{stats.active_goals}</div>
            <div className="stat-sub">{stats.completed_goals} completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Goals</div>
            <div className="stat-value">{stats.total_goals}</div>
            <div className="stat-sub">goals tracked</div>
          </div>
        </div>
      )}

      {/* Overall progress bar */}
      {stats && stats.total_target > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <span style={{ fontWeight: 600 }}>Overall Savings Progress</span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>{stats.overall_pct}%</span>
          </div>
          <div className="progress-bar-wrap" style={{ height: 12 }}>
            <div className="progress-bar-fill" style={{ width: `${stats.overall_pct}%`, background: "var(--accent)" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.83rem", color: "var(--text-muted)" }}>
            <span>${stats.total_saved.toLocaleString()} saved</span>
            <span>${(stats.total_target - stats.total_saved).toLocaleString()} remaining</span>
          </div>
        </div>
      )}

      {/* Goals */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600 }}>Recent Goals</h2>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate("/goals")}>View all →</button>
      </div>

      {goals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎯</div>
          <h3>No goals yet</h3>
          <p>Create your first savings goal to get started.</p>
          <button className="btn btn-primary" onClick={() => setGoalModal(true)}>
            <Plus size={16} /> Create Goal
          </button>
        </div>
      ) : (
        <div className="goals-grid">
          {recentGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDeposit={setDepGoal}
              onEdit={setEditGoal}
              onDelete={handleDeleteGoal}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {goalModal && (
        <GoalModal onClose={() => setGoalModal(false)} onSave={handleCreateGoal} />
      )}
      {editGoal && (
        <GoalModal goal={editGoal} onClose={() => setEditGoal(null)} onSave={handleEditGoal} />
      )}
      {depGoal && (
        <DepositModal goal={depGoal} onClose={() => setDepGoal(null)} onSave={handleDeposit} />
      )}
    </div>
  );
}
