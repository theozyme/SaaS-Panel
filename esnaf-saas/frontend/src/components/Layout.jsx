import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { http, clearAuth } from "../lib/http";
import Button from "./ui/Button";

export default function Layout() {
  const [modules, setModules] = useState([]);
  const [tenantName, setTenantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const loadModules = async () => {
    const { data } = await http.get("/modules/active");
    setModules(data.modules || []);
  };
  const loadTenant = async () => {
    const { data } = await http.get("/tenant/profile");
    setTenantName(data?.tenant?.name || "");
  };

  useEffect(() => {
    (async () => {
      try { setLoading(true); await Promise.all([loadModules(), loadTenant()]); setErr(""); }
      catch (e) { setErr(e?.response?.data?.detail || "Veri yüklenemedi"); }
      finally { setLoading(false); }
    })();
    const onRefresh = () => loadModules().catch(() => {});
    window.addEventListener("modules-refresh", onRefresh);
    return () => window.removeEventListener("modules-refresh", onRefresh);
  }, []);

  const logout = () => { clearAuth(); nav("/login", { replace: true }); };

  return (
    <div className="min-h-screen flex">
      <Sidebar modules={modules} />
      <main className="flex-1 p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="text-lg font-semibold">
            {tenantName || "Panel"} {loading && <span className="text-[var(--muted)]">• yükleniyor…</span>}
            {err && <span className="text-red-400 ml-2">({err})</span>}
          </div>
          <Button variant="ghost" onClick={logout}>Çıkış</Button>
        </header>
        <div className="space-y-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
