import { useState, useEffect, useCallback } from "react";
import { Trash2, Plus } from "lucide-react";
import { format, parseISO } from "date-fns";
import api from "../api/client";
import DepositModal from "../components/DepositModal";

export default function Deposits() {
  const [deposits, setDeposits] = useState([]);
  const [goals,    setGoals]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [depGoal,  setDepGoal]  = useState(null);
  const [goalMap,  setGoalMap]  = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dRes, gRes] = await Promise.all([
        api.get("/deposits?limit=100"),
        api.get("/goals"),
      ]);
      setDeposits(dRes.data);
      setGoals(gRes.data);
      const map = {};
      gRes.data.forEach(g => { map[g.id] = g; });
      setGoalMap(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleDelete(deposit) {
    if (!confirm("Delete this deposit?")) return;
    await api.delete(`/deposits/${deposit.id}`);
    fetchAll();
  }

  async function handleDeposit(data) {
    await api.post(`/goals/${depGoal.id}/deposits`, data);
    fetchAll();
  }

  const totalDeposited = deposits.reduce((s, d) => s + d.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Deposits</h1>
          <p className="page-subtitle">{deposits.length} deposit{deposits.length !== 1 ? "s" : ""} · ${totalDeposited.toLocaleString()} total</p>
        </div>
        <div style={{ display: "flex", gap: "0.6rem" }}>
          {goals.length > 0 && (
            <select
              className="filter-select"
              onChange={e => {
                const g = goals.find(g => g.id === Number(e.target.value));
                if (g) setDepGoal(g);
                e.target.value = "";
              }}
              defaultValue=""
            >
              <option value="" disabled>+ Add Deposit…</option>
              {goals.filter(g => !g.is_completed).map(g => (
                <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-page"><div className="spinner" /></div>
      ) : deposits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💸</div>
          <h3>No deposits yet</h3>
          <p>Start by adding money to one of your goals.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Goal</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Note</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {deposits.map(d => {
                  const g = goalMap[d.goal_id];
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span>{g?.icon ?? "🎯"}</span>
                          <span style={{ fontWeight: 500 }}>{g?.name ?? "Unknown goal"}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: "var(--green)", fontWeight: 600 }}>
                          +${d.amount.toLocaleString()}
                        </span>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {d.date ? format(parseISO(d.date), "MMM d, yyyy") : "—"}
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {d.note || <span style={{ opacity: 0.4 }}>—</span>}
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: "var(--red)", borderColor: "transparent" }}
                          onClick={() => handleDelete(d)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {depGoal && <DepositModal goal={depGoal} onClose={() => setDepGoal(null)} onSave={handleDeposit} />}
    </div>
  );
}
