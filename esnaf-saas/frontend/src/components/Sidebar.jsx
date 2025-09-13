// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

const itemStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px 12px",
  borderRadius: 8,
  marginBottom: 6,
  textDecoration: "none",
  color: isActive ? "#111" : "#ddd",
  background: isActive ? "#9ae6b4" : "transparent",
});

export default function Sidebar({ modules }) {
  // modules: [{code, name, type}]
  const has = (code) => modules?.some((m) => m.code === code);

  return (
    <aside style={{ width: 220, padding: 16, borderRight: "1px solid #333" }}>
      <h3 style={{ marginTop: 0 }}>Esnaf SaaS</h3>

      {/* Core */}
      <NavLink to="/" style={itemStyle} end>Dashboard</NavLink>
      <NavLink to="/jobs" style={itemStyle}>İş Emirleri</NavLink>
      {has("payments") && <NavLink to="/payments" style={itemStyle}>Ödemeler</NavLink>}
      {has("settings") && <NavLink to="/settings" style={itemStyle}>Ayarlar</NavLink>}

      {/* Addons */}
      {has("appointments") && <NavLink to="/appointments" style={itemStyle}>Randevular</NavLink>}
      {has("inventory") && <NavLink to="/inventory" style={itemStyle}>Stok Yönetimi</NavLink>}
      {has("reports") && <NavLink to="/reports" style={itemStyle}>Raporlar</NavLink>}
    </aside>
  );
}
