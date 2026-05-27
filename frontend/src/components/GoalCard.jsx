import { useState, useRef, useEffect } from "react";
import { MoreVertical, Edit2, Trash2, PlusCircle, CheckCircle } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";

export default function GoalCard({ goal, onDeposit, onEdit, onDelete, onToggleComplete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysLeft = goal.deadline
    ? differenceInDays(parseISO(goal.deadline), new Date())
    : null;

  const deadlineColor =
    daysLeft === null  ? "var(--text-muted)" :
    daysLeft < 0       ? "var(--red)" :
    daysLeft < 30      ? "var(--yellow)" :
                         "var(--text-muted)";

  return (
    <div className="goal-card">
      {/* accent stripe */}
      <div className="goal-card-accent" style={{ background: goal.color }} />

      {/* top row */}
      <div className="goal-card-top">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span className="goal-icon">{goal.icon}</span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h3 className="goal-title">{goal.name}</h3>
              {goal.is_completed && <span className="completed-ribbon">✓ Done</span>}
            </div>
            <span className="goal-cat">{goal.category}</span>
          </div>
        </div>

        <div className="dropdown" ref={menuRef}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: "0.3rem 0.5rem" }}
            onClick={() => setMenuOpen(v => !v)}
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => { onDeposit(goal); setMenuOpen(false); }}>
                <PlusCircle size={14} /> Add Deposit
              </button>
              <button className="dropdown-item" onClick={() => { onEdit(goal); setMenuOpen(false); }}>
                <Edit2 size={14} /> Edit Goal
              </button>
              <button className="dropdown-item" onClick={() => { onToggleComplete(goal); setMenuOpen(false); }}>
                <CheckCircle size={14} /> {goal.is_completed ? "Mark Active" : "Mark Complete"}
              </button>
              <button className="dropdown-item danger" onClick={() => { onDelete(goal); setMenuOpen(false); }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* progress */}
      <div className="progress-label">
        <span>{goal.progress_pct}%</span>
        <span>${goal.saved_amount.toLocaleString()} saved</span>
      </div>
      <div className="progress-bar-wrap">
        <div
          className="progress-bar-fill"
          style={{ width: `${goal.progress_pct}%`, background: goal.color }}
        />
      </div>

      {/* amounts */}
      <div className="goal-amounts">
        <span className="goal-saved">${goal.saved_amount.toLocaleString()}</span>
        <span className="goal-target">of ${goal.target_amount.toLocaleString()}</span>
      </div>

      {/* deadline */}
      {goal.deadline && (
        <div className="goal-deadline" style={{ color: deadlineColor }}>
          {daysLeft === null ? "" :
           daysLeft < 0     ? `${Math.abs(daysLeft)} days overdue` :
           daysLeft === 0   ? "Due today!" :
                              `${daysLeft} days left`}
          {" · "}
          {new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      )}

      {/* quick deposit button */}
      {!goal.is_completed && (
        <button
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}
          onClick={() => onDeposit(goal)}
        >
          <PlusCircle size={14} /> Add Deposit
        </button>
      )}
    </div>
  );
}
