import { useState, useEffect } from "react";
import { X } from "lucide-react";

const CATEGORIES = [
  "Emergency Fund","Vacation","Home","Car","Education",
  "Retirement","Wedding","Tech","Health","Other",
];
const COLORS = [
  "#6366f1","#3b82f6","#10b981","#f59e0b","#ef4444",
  "#ec4899","#8b5cf6","#06b6d4","#84cc16","#f97316",
];
const ICONS = ["🎯","🏖️","🏠","🚗","📚","🌴","💍","💻","❤️","💰","✈️","🛡️","⭐","🎁","🏆"];

export default function GoalModal({ goal, onClose, onSave }) {
  const editing = !!goal;

  const [form, setForm] = useState({
    name:          goal?.name          ?? "",
    description:   goal?.description   ?? "",
    target_amount: goal?.target_amount ?? "",
    category:      goal?.category      ?? "Other",
    color:         goal?.color         ?? "#6366f1",
    icon:          goal?.icon          ?? "🎯",
    deadline:      goal?.deadline      ?? "",
  });
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!form.name.trim())    return setErr("Name is required");
    if (!form.target_amount)  return setErr("Target amount is required");
    if (isNaN(Number(form.target_amount)) || Number(form.target_amount) <= 0)
      return setErr("Target amount must be a positive number");

    setLoading(true);
    try {
      await onSave({
        ...form,
        target_amount: Number(form.target_amount),
        deadline:      form.deadline || null,
      });
      onClose();
    } catch (e) {
      setErr(e.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // close on Escape
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{editing ? "Edit Goal" : "New Savings Goal"}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {err && <div className="auth-error" style={{ marginBottom: "1rem" }}>{err}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Icon row */}
            <div className="form-group">
              <label>Icon</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {ICONS.map(ic => (
                  <button
                    key={ic} type="button"
                    onClick={() => set("icon", ic)}
                    style={{
                      fontSize: "1.3rem", width: 38, height: 38,
                      borderRadius: 8, border: form.icon === ic ? "2px solid var(--accent)" : "1px solid var(--border)",
                      background: form.icon === ic ? "rgba(99,102,241,.15)" : "transparent",
                      cursor: "pointer",
                    }}
                  >{ic}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Goal Name *</label>
              <input className="form-control" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Japan Vacation" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Amount ($) *</label>
                <input className="form-control" type="number" min="1" step="0.01" value={form.target_amount} onChange={e => set("target_amount", e.target.value)} placeholder="5000" />
              </div>
              <div className="form-group">
                <label>Deadline (optional)</label>
                <input className="form-control" type="date" value={form.deadline ?? ""} onChange={e => set("deadline", e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={form.category} onChange={e => set("category", e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Colour</label>
                <div className="color-row" style={{ marginTop: "0.3rem" }}>
                  {COLORS.map(c => (
                    <div
                      key={c}
                      className={`color-swatch${form.color === c ? " selected" : ""}`}
                      style={{ background: c }}
                      onClick={() => set("color", c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description (optional)</label>
              <textarea className="form-control" rows={2} value={form.description} onChange={e => set("description", e.target.value)} placeholder="What is this goal for?" style={{ resize: "vertical" }} />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : editing ? "Save Changes" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
