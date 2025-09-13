// src/components/Layout.jsx
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { http, clearAuth } from "../lib/http";

export default function Layout() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await http.get("/modules/active");
        setModules(data.modules || []);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Menü yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const logout = () => {
    clearAuth();
    nav("/login", { replace: true });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui" }}>
      <Sidebar modules={modules} />
      <main style={{ flex: 1, padding: 20 }}>
        <header style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <strong>Panel</strong> {loading ? "• yükleniyor..." : ""}
            {err && <span style={{ color: "crimson", marginLeft: 8 }}>({err})</span>}
          </div>
          <button onClick={logout}>Çıkış</button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
