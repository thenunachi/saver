import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [err,      setErr]      = useState("");
  const [loading,  setLoading]  = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (ex) {
      setErr(ex.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setErr(""); setDemoLoading(true);
    try {
      await login("demo@savings.app", "password123");
      navigate("/");
    } catch (ex) {
      setErr("Demo login failed — make sure the backend is running.");
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb3" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💰</div>
          <h1>Savr</h1>
          <p>Your personal savings tracker</p>
        </div>

        {err && <div className="auth-error" style={{ marginBottom: "1rem" }}>{err}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={email}
              onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={password}
              onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }} disabled={loading || demoLoading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

        {/* Demo login button */}
        <button
          type="button"
          className="btn btn-ghost"
          style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
          onClick={handleDemoLogin}
          disabled={loading || demoLoading}
        >
          {demoLoading ? "Logging in…" : "🚀 Try Demo Account"}
        </button>

        <div className="auth-footer" style={{ marginTop: "1.25rem" }}>
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
