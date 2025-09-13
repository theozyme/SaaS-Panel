import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { http, setAuth } from "../lib/http";
import { Link } from "react-router-dom";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // SimpleJWT: username alanına email gönderiyoruz
      const { data } = await http.post("/auth/login", {
        username: email,
        password,
      });
      // login yanıtında tenant_id yok; gerekirse backend fallback ile bulunuyor
      setAuth({ access: data.access, tenantId: "" });
      nav("/", { replace: true });
    } catch (e) {
      setErr(e?.response?.data?.detail || "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", fontFamily: "system-ui" }}>
      <h2>Giriş Yap</h2>
      <form onSubmit={onSubmit}>
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
        <button
          type="submit"
          disabled={loading}
          style={{ marginTop: 16, padding: "10px 16px", cursor: "pointer" }}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
      {err && <p style={{ color: "crimson", marginTop: 12 }}>Hata: {err}</p>}
      <p style={{ marginTop: 12 }}>
  Henüz hesabın yok mu? <Link to="/register">Üye Ol</Link>
</p>
    </div>
  );
}
