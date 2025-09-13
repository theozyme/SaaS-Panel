
import { useEffect, useMemo, useState } from "react";
import { http } from "../lib/http";

const STATUS_OPTIONS = [
  { value: "pending", label: "Bekliyor" },
  { value: "confirmed", label: "Onaylandı" },
  { value: "done", label: "Tamamlandı" },
  { value: "canceled", label: "İptal" },
];

function toInputLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}
function toIsoFromLocal(localValue) {
  if (!localValue) return new Date().toISOString();
  return new Date(localValue).toISOString();
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", color: "#111", borderRadius: 12, width: 560, maxWidth: "90%", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose}>Kapat</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Appointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [who, setWho] = useState("");
  const [when, setWhen] = useState(toInputLocal(new Date().toISOString()));
  const [category, setCategory] = useState("Genel kontrol");
  const [status, setStatus] = useState("pending");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const resetForm = () => {
    setWho("");
    setWhen(toInputLocal(new Date().toISOString()));
    setCategory("Genel kontrol");
    setStatus("pending");
    setNote("");
    setFormErr("");
    setEditing(null);
  };

  const openCreate = () => { resetForm(); setOpen(true); };
  const openEdit = (a) => {
    setEditing(a);
    setWho(a.who || "");
    setWhen(toInputLocal(a.when));
    setCategory(a.category || "Genel kontrol");
    setStatus(a.status || "pending");
    setNote(a.note || "");
    setFormErr("");
    setOpen(true);
  };

  const fetchList = async () => {
    try {
      setErr(""); setLoading(true);
      const { data } = await http.get("/appointments/");
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Randevular alınamadı");
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchList(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErr("");
    try {
      const payload = { who, when: toIsoFromLocal(when), category, status, note };
      if (editing) await http.patch(`/appointments/${editing.id}/`, payload);
      else await http.post("/appointments/", payload);
      setOpen(false); resetForm(); fetchList();
    } catch (e) {
      setFormErr(e?.response?.data?.detail || "Kaydetme başarısız");
    } finally { setSaving(false); }
  };

  const onDelete = async (a) => {
    if (!confirm(`Silinsin mi?\nKişi: ${a.who} • ${new Date(a.when).toLocaleString()}`)) return;
    try { await http.delete(`/appointments/${a.id}/`); fetchList(); }
    catch (e) { alert(e?.response?.data?.detail || "Silme başarısız"); }
  };

  const rows = useMemo(() => list, [list]);

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Randevular</h2>
        <button onClick={openCreate}>+ Yeni Randevu</button>
      </div>

      {err && <p style={{ color: "crimson" }}>Hata: {err}</p>}
      {loading ? <p>Yükleniyor…</p> : rows.length === 0 ? (
        <div style={{ padding: 16, border: "1px dashed #999", borderRadius: 8 }}>
          Kayıt yok. <button onClick={openCreate}>İlk randevuyu ekle</button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #333" }}>
                <th style={{ padding: 8, width: 200 }}>Kişi</th>
                <th style={{ padding: 8, width: 220 }}>Tarih/Saat</th>
                <th style={{ padding: 8, width: 200 }}>Kategori</th>
                <th style={{ padding: 8, width: 140 }}>Durum</th>
                <th style={{ padding: 8 }}>Not</th>
                <th style={{ padding: 8, width: 160 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #222" }}>
                  <td style={{ padding: 8 }}>{r.who}</td>
                  <td style={{ padding: 8 }}>{new Date(r.when).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>{r.category}</td>
                  <td style={{ padding: 8 }}>
                    {STATUS_OPTIONS.find(s => s.value === r.status)?.label || r.status}
                  </td>
                  <td style={{ padding: 8, color: "#777" }}>{r.note || "-"}</td>
                  <td style={{ padding: 8 }}>
                    <button onClick={() => openEdit(r)} style={{ marginRight: 8 }}>Düzenle</button>
                    <button onClick={() => onDelete(r)}>Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title={editing ? "Randevu Düzenle" : "Yeni Randevu"} onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit}>
          <label style={{ display: "block", marginTop: 8 }}>Kişi</label>
          <input style={{ width: "100%", padding: 8 }} value={who} onChange={(e) => setWho(e.target.value)} required />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Tarih/Saat</label>
              <input style={{ width: "100%", padding: 8 }} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Durum</label>
              <select style={{ width: "100%", padding: 8 }} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <label style={{ display: "block", marginTop: 8 }}>Kategori</label>
          <input style={{ width: "100%", padding: 8 }} value={category} onChange={(e) => setCategory(e.target.value)} />

          <label style={{ display: "block", marginTop: 8 }}>Not</label>
          <input style={{ width: "100%", padding: 8 }} value={note} onChange={(e) => setNote(e.target.value)} placeholder="İsteğe bağlı" />

          {formErr && <p style={{ color: "crimson", marginTop: 8 }}>Hata: {formErr}</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={() => setOpen(false)}>Vazgeç</button>
            <button type="submit" disabled={saving}>{saving ? "Kaydediliyor..." : (editing ? "Güncelle" : "Oluştur")}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
