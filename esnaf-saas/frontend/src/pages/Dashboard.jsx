import { useEffect, useState } from "react";
import { http, clearAuth } from "../lib/http";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [modules, setModules] = useState([]);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        const { data } = await http.get("/modules/active");
        setModules(data.modules || []);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Veri alınamadı");
      }
    })();
  }, []);

  const logout = () => {
    clearAuth();
    nav("/login", { replace: true });
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Dashboard</h2>
        <button onClick={logout}>Çıkış</button>
      </div>
      <p>Aktif Modüller:</p>
      {err && <p style={{ color: "crimson" }}>Hata: {err}</p>}
      <ul>
        {modules.map((m) => (
          <li key={m.code}>
            {m.name} <small>({m.type})</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
