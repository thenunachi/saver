import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!form.name.trim())                  return setErr("Name is required");
    if (!form.email.trim())                 return setErr("Email is required");
    if (form.password.length < 6)           return setErr("Password must be at least 6 characters");
    if (form.password !== form.confirm)     return setErr("Passwords do not match");

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate("/");
    } catch (ex) {
      setErr(ex.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb3" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">💰</div>
          <h1>Create Account</h1>
          <p>Start tracking your savings goals</p>
        </div>

        {err && <div className="auth-error" style={{ marginBottom: "1rem" }}>{err}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Alex Smith" autoFocus />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min. 6 characters" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input className="form-control" type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)} placeholder="Repeat password" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }} disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
