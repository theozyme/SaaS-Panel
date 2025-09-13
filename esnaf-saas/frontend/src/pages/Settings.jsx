// src/pages/Settings.jsx
import { useEffect, useState } from "react";
import { http } from "../lib/http";

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 46, height: 26, borderRadius: 20, border: "1px solid #333",
        background: checked ? "#22c55e" : "#444", position: "relative"
      }}
      type="button"
    >
      <span
        style={{
          position: "absolute", top: 2, left: checked ? 22 : 2, width: 20, height: 20,
          background: "#fff", borderRadius: "50%", transition: "left .15s"
        }}
      />
    </button>
  );
}

export default function Settings() {
  const [tenant, setTenant] = useState(null);
  const [core, setCore] = useState([]);
  const [addons, setAddons] = useState([]);           // tüm addon tanımları
  const [active, setActive] = useState(new Set());    // aktif addon code set'i

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    setMsg(""); setErr("");
    const { data } = await http.get("/tenant/profile");
    setTenant(data.tenant);
    setCore(data.core_modules || []);
    setAddons(data.available_addons || []);
    setActive(new Set(data.active_addons || []));
  };

  useEffect(() => {
    (async () => {
      try { setLoading(true); await load(); }
      catch (e) { setErr(e?.response?.data?.detail || "Ayarlar yüklenemedi"); }
      finally { setLoading(false); }
    })();
  }, []);

  const toggleModule = async (code, nextChecked) => {
    try {
      setSaving(true); setErr(""); setMsg("");
      if (nextChecked) {
        await http.post("/modules/activate", { code });
        setActive(prev => new Set(prev).add(code));
        setMsg(`${code} etkinleştirildi`);
      } else {
        await http.post("/modules/deactivate", { code });
        setActive(prev => {
          const n = new Set(prev); n.delete(code); return n;
        });
        setMsg(`${code} devre dışı bırakıldı`);
      }
      // Menüde hemen yansısın:
      window.dispatchEvent(new Event("modules-refresh"));
    } catch (e) {
      setErr(e?.response?.data?.detail || "Güncelleme başarısız");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Yükleniyor…</p>;
  if (err) return <p style={{ color: "crimson" }}>Hata: {err}</p>;

  return (
    <div style={{ fontFamily: "system-ui", maxWidth: 820 }}>
      <h2>Ayarlar</h2>

      <section style={{ padding: 16, border: "1px solid #333", borderRadius: 12, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>İşletme Bilgileri</h3>
        <p><strong>Ad:</strong> {tenant?.name}</p>
        <p><strong>ID:</strong> <code>{tenant?.id}</code></p>
      </section>

      <section style={{ padding: 16, border: "1px solid #333", borderRadius: 12, marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Çekirdek Modüller</h3>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {core.map(m => <li key={m.code}>{m.name} <small>({m.code})</small></li>)}
        </ul>
      </section>

      <section style={{ padding: 16, border: "1px solid #333", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Eklentiler (Addon)</h3>
        {addons.length === 0 ? (
          <p>Tanımlı eklenti yok.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {addons.map(m => {
              const isOn = active.has(m.code);
              return (
                <div key={m.code} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #333", borderRadius: 12, padding: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{m.code}</div>
                  </div>
                  <Toggle checked={isOn} onChange={(v) => toggleModule(m.code, v)} />
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop: 10 }}>
          {saving && <span>Kaydediliyor… </span>}
          {msg && <span style={{ color: "#22c55e" }}>{msg}</span>}
          {err && <span style={{ color: "crimson" }}>{err}</span>}
        </div>
        <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>
          Not: Aç/Kapa sonrası menü otomatik güncellenir. Görmüyorsan sayfayı yenilemeyi deneyebilirsin.
        </p>
      </section>
    </div>
  );
}
