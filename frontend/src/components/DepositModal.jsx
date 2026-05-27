import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DepositModal({ goal, onClose, onSave }) {
  const [amount,  setAmount]  = useState("");
  const [note,    setNote]    = useState("");
  const [depDate, setDepDate] = useState(new Date().toISOString().slice(0, 10));
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  const remaining = goal ? Math.max(0, goal.target_amount - goal.saved_amount) : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0)
      return setErr("Please enter a valid positive amount");

    setLoading(true);
    try {
      await onSave({ amount: Number(amount), note, date: depDate });
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Add Deposit</h2>
            {goal && (
              <p style={{ fontSize: "0.83rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                {goal.icon} {goal.name} — {goal.progress_pct}% funded
              </p>
            )}
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {err && <div className="auth-error" style={{ marginBottom: "1rem" }}>{err}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Quick-fill buttons */}
            {remaining > 0 && (
              <div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>Quick amounts</p>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {[50, 100, 250, 500, Math.round(remaining)].filter((v, i, a) => a.indexOf(v) === i && v > 0).map(v => (
                    <button key={v} type="button" className="btn btn-ghost btn-sm"
                      onClick={() => setAmount(String(v))}
                      style={{ borderColor: amount == v ? "var(--accent)" : undefined }}
                    >${v.toLocaleString()}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Amount ($) *</label>
                <input className="form-control" type="number" min="0.01" step="0.01"
                  value={amount} onChange={e => setAmount(e.target.value)} placeholder="100.00" autoFocus />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input className="form-control" type="date" value={depDate} onChange={e => setDepDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Note (optional)</label>
              <input className="form-control" value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Monthly transfer" />
            </div>

            {goal && (
              <div style={{ background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.2)", borderRadius: "var(--radius-sm)", padding: "0.75rem", fontSize: "0.83rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--text-muted)" }}>Current</span>
                  <span style={{ color: "var(--green)", fontWeight: 600 }}>${goal.saved_amount.toLocaleString()}</span>
                </div>
                {amount && !isNaN(Number(amount)) && Number(amount) > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>After deposit</span>
                    <span style={{ fontWeight: 600 }}>${(goal.saved_amount + Number(amount)).toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid rgba(99,102,241,.2)" }}>
                  <span style={{ color: "var(--text-muted)" }}>Remaining</span>
                  <span style={{ color: "var(--yellow)", fontWeight: 600 }}>${remaining.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Add Deposit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
