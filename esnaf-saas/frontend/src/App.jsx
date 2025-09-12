// src/App.jsx
import { useState } from "react";
import { http, setAuth } from "./lib/http";

export default function App() {
  const [access, setAccess] = useState(localStorage.getItem("ACCESS_TOKEN") || "");
  const [tenantId, setTenantId] = useState(localStorage.getItem("TENANT_ID") || "");
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");

  const handleTest = async () => {
    try {
      setErr("");
      setResult(null);
      setAuth({ access, tenantId });
      const { data } = await http.get("/modules/active");
      setResult(data);
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    }
  };

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h2>Esnaf SaaS — API Bağlantı Testi</h2>

      <label style={{ display: "block", marginTop: 12 }}>JWT Access Token</label>
      <textarea
        rows={3}
        style={{ width: "100%" }}
        value={access}
        onChange={(e) => setAccess(e.target.value)}
        placeholder="Postman register/login yanıtındaki access token"
      />

      <label style={{ display: "block", marginTop: 12 }}>Tenant ID</label>
      <input
        style={{ width: "100%" }}
        value={tenantId}
        onChange={(e) => setTenantId(e.target.value)}
        placeholder="Postman yanıtındaki tenant_id"
      />

      <button style={{ marginTop: 16 }} onClick={handleTest}>Test Et (/modules/active)</button>

      {err && (
        <p style={{ color: "crimson", marginTop: 12 }}>Hata: {err}</p>
      )}

      {result && (
        <pre style={{ marginTop: 16, background: "#111", color: "#ddd", padding: 12, borderRadius: 8 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
