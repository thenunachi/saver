import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/client";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate session from stored token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    api.get("/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", r.data.token);
    setUser(r.data.user);
    return r.data;
  }

  async function register(name, email, password) {
    const r = await api.post("/auth/register", { name, email, password });
    localStorage.setItem("token", r.data.token);
    setUser(r.data.user);
    return r.data;
  }

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
