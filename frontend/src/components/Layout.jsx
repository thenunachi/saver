import { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { differenceInDays, parseISO } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/client";
import {
  LayoutDashboard, Target, ArrowDownCircle,
  BarChart3, LogOut
} from "lucide-react";

export default function Layout() {
  const { user, logout } = useAuth();
  const { add: addToast } = useToast();
  const navigate = useNavigate();
  const [urgentCount, setUrgentCount] = useState(0);
  const checkedRef = useRef(false); // only alert once per session

  useEffect(() => {
    // Only run once per browser session
    if (checkedRef.current) return;
    const alreadyShown = sessionStorage.getItem("deadline-alerts-shown");
    if (alreadyShown) return;
    checkedRef.current = true;

    api.get("/goals").then((r) => {
      const today = new Date();
      let count = 0;

      // Small delay so the page renders before toasts pop up
      let delay = 600;
      r.data.forEach((goal) => {
        if (!goal.deadline || goal.is_completed) return;

        const daysLeft = differenceInDays(parseISO(goal.deadline), today);

        if (daysLeft < 0) {
          count++;
          setTimeout(() =>
            addToast(
              `${goal.icon} "${goal.name}" is overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? "s" : ""}!`,
              "error",
              0       // persistent — must dismiss manually
            ), delay
          );
          delay += 300;
        } else if (daysLeft <= 7) {
          count++;
          setTimeout(() =>
            addToast(
              `${goal.icon} "${goal.name}" — deadline in ${daysLeft === 0 ? "less than a day" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""}`}`,
              "warning",
              0       // persistent
            ), delay
          );
          delay += 300;
        }
      });

      setUrgentCount(count);
      sessionStorage.setItem("deadline-alerts-shown", "1");
    }).catch(() => {});
  }, [addToast]);

  function handleLogout() {
    sessionStorage.removeItem("deadline-alerts-shown"); // reset on logout
    logout();
    navigate("/login");
  }

  const NAV = [
    { to: "/",          label: "Dashboard", Icon: LayoutDashboard, badge: 0           },
    { to: "/goals",     label: "Goals",     Icon: Target,          badge: urgentCount  },
    { to: "/deposits",  label: "Deposits",  Icon: ArrowDownCircle, badge: 0           },
    { to: "/analytics", label: "Analytics", Icon: BarChart3,       badge: 0           },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span>💰</span> Savr
        </div>

        {NAV.map(({ to, label, Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
          >
            <Icon size={17} />
            {label}
            {badge > 0 && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}

        <div className="sidebar-bottom">
          <div style={{ padding: "0.5rem 0.85rem", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.4rem" }}>
            {user?.name}
          </div>
          <button className="nav-item" onClick={handleLogout}>
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
