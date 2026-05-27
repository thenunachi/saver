import { useEffect, useState } from "react";
import { X, AlertTriangle, AlertCircle, CheckCircle, Info } from "lucide-react";

const META = {
  warning: { Icon: AlertTriangle, color: "var(--yellow)",  bg: "rgba(245,158,11,.1)",  border: "rgba(245,158,11,.35)" },
  error:   { Icon: AlertCircle,   color: "var(--red)",     bg: "rgba(239,68,68,.1)",   border: "rgba(239,68,68,.35)"  },
  success: { Icon: CheckCircle,   color: "var(--green)",   bg: "rgba(16,185,129,.1)",  border: "rgba(16,185,129,.35)" },
  info:    { Icon: Info,          color: "var(--accent-h)", bg: "rgba(99,102,241,.1)", border: "rgba(99,102,241,.35)" },
};

function Toast({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const { Icon, color, bg, border } = META[toast.type] ?? META.info;

  // Slide-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / toast.duration) * 100);
      setProgress(pct);
      if (pct <= 0) clearInterval(tick);
    }, 50);
    return () => clearInterval(tick);
  }, [toast.duration]);

  function dismiss() {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 250);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: "var(--radius-sm)",
        overflow: "hidden",
        boxShadow: "var(--shadow)",
        transform: visible ? "translateX(0)" : "translateX(110%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.28s cubic-bezier(.22,1,.36,1), opacity 0.28s ease",
        maxWidth: 360,
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem", padding: "0.85rem 0.9rem" }}>
        <Icon size={17} style={{ color, flexShrink: 0, marginTop: 1 }} />
        <span style={{ flex: 1, fontSize: "0.875rem", lineHeight: 1.45, color: "var(--text)" }}>
          {toast.message}
        </span>
        <button
          onClick={dismiss}
          style={{
            background: "transparent", border: "none", color: "var(--text-muted)",
            cursor: "pointer", padding: "0 2px", flexShrink: 0, lineHeight: 1,
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* progress bar — only shown when auto-dismissing */}
      {toast.duration > 0 && (
        <div style={{ height: 3, background: "rgba(255,255,255,.1)" }}>
          <div style={{
            height: "100%",
            background: color,
            width: `${progress}%`,
            transition: "width 0.05s linear",
          }} />
        </div>
      )}
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: "fixed",
      bottom: "1.5rem",
      right: "1.5rem",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
      pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{ pointerEvents: "auto" }}>
          <Toast toast={t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
