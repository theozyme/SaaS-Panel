import { NavLink } from "react-router-dom";

const itemClass = ({ isActive }) =>
  `block px-3 py-2 rounded-xl transition ${
    isActive ? "bg-emerald-600 text-white" : "hover:bg-[#15161a] text-[var(--fg)]"
  }`;

export default function Sidebar({ modules }) {
  const has = (code) => modules?.some((m) => m.code === code);
  return (
    <aside className="w-[240px] p-4 border-r border-[var(--border)]">
      <div className="mb-4 text-xl font-semibold">Esnaf SaaS</div>
      <nav className="space-y-1">
        <NavLink to="/" className={itemClass} end>Dashboard</NavLink>
        <NavLink to="/jobs" className={itemClass}>İş Emirleri</NavLink>
        {has("payments")   && <NavLink to="/payments" className={itemClass}>Ödemeler</NavLink>}
        <NavLink to="/settings" className={itemClass}>Ayarlar</NavLink>
        {has("appointments") && <NavLink to="/appointments" className={itemClass}>Randevular</NavLink>}
        {has("inventory")   && <NavLink to="/inventory" className={itemClass}>Stok Yönetimi</NavLink>}
        {has("reports")     && <NavLink to="/reports" className={itemClass}>Raporlar</NavLink>}
      </nav>
    </aside>
  );
}
