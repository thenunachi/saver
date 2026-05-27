import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import Login       from "./pages/Login";
import Register    from "./pages/Register";
import Layout      from "./components/Layout";
import Dashboard   from "./pages/Dashboard";
import Goals       from "./pages/Goals";
import Deposits    from "./pages/Deposits";
import Analytics   from "./pages/Analytics";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="loading-page">
      <div className="spinner" />
      <p>Loading…</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <Routes>
        <Route path="/login"    element={<GuestOnly><Login /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />

        <Route element={<RequireAuth><Layout /></RequireAuth>}>
          <Route index           element={<Dashboard />} />
          <Route path="goals"    element={<Goals />} />
          <Route path="deposits" element={<Deposits />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
