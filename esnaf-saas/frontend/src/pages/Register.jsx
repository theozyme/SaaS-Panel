import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { http, setAuth } from "../lib/http";

export default function Register() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bizName, setBizName] = useState("");
  const [addons, setAddons] = useState({
    appointments: true,     // örnek: varsayılan açık
    inventory: false,
    reports: false,
  });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onToggle = (key) => setAddons(a => ({ ...a, [key]: !a[key] }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const selectedAddons = Object.entries(addons)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      const payload = {
        full_name: fullName,
        email,
        password,
        biz_name: bizName,
        addons: selectedAddons,
      };

      const { data } = await http.post("/auth/register", payload);
      // backend: { access, refresh, tenant_id }
      setAuth({ access: data.access, tenantId: data.tenant_id });
      nav("/", { replace: true });
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.email?.[0] ||
        e?.message ||
        "Kayıt başarısız";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Üye Ol</h2>
      <form onSubmit={onSubmit}>
        <label style={{ display: "block", marginTop: 12 }}>Ad Soyad</label>
        <input
          style={{ width: "100%", padding: 8 }}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ad Soyad"
          required
        />

        <label style={{ display: "block", marginTop: 12 }}>E-posta</label>
        <input
          style={{ width: "100%", padding: 8 }}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@site.com"
          required
        />

        <label style={{ display: "block", marginTop: 12 }}>Şifre</label>
        <input
          style={{ width: "100%", padding: 8 }}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <label style={{ display: "block", marginTop: 12 }}>İşletme Adı</label>
        <input
          style={{ width: "100%", padding: 8 }}
          value={bizName}
          onChange={(e) => setBizName(e.target.value)}
          placeholder="Örn: Çakır Oto 26"
          required
        />

        <fieldset style={{ marginTop: 16, border: "1px solid #444", padding: 12, borderRadius: 8 }}>
          <legend>Modüller (ek ücretli eklentiler)</legend>
          <label style={{ display: "block", marginTop: 6 }}>
            <input type="checkbox" checked={addons.appointments} onChange={() => onToggle("appointments")} />
            {" "}Randevular
          </label>
          <label style={{ display: "block", marginTop: 6 }}>
            <input type="checkbox" checked={addons.inventory} onChange={() => onToggle("inventory")} />
            {" "}Stok Yönetimi
          </label>
          <label style={{ display: "block", marginTop: 6 }}>
            <input type="checkbox" checked={addons.reports} onChange={() => onToggle("reports")} />
            {" "}Raporlar
          </label>
        </fieldset>

        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 16, padding: "10px 16px", cursor: "pointer" }}
        >
          {loading ? "Kaydediliyor..." : "Üye Ol"}
        </button>
      </form>

      {err && <p style={{ color: "crimson", marginTop: 12 }}>Hata: {err}</p>}

      <p style={{ marginTop: 12 }}>
        Zaten hesabın var mı? <Link to="/login">Giriş Yap</Link>
      </p>
    </div>
  );
}
