// src/pages/Payments.jsx
import { useEffect, useMemo, useState } from "react";
import { http } from "../lib/http";

const METHOD_OPTIONS = [
  { value: "cash", label: "Nakit" },
  { value: "card", label: "Kart" },
  { value: "transfer", label: "EFT/Havale" },
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
  // "YYYY-MM-DDTHH:MM" -> ISO8601 (UTC Z)
  if (!localValue) return new Date().toISOString();
  const d = new Date(localValue);
  return d.toISOString();
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
    }}>
      <div style={{ background: "#fff", color: "#111", borderRadius: 12, width: 520, maxWidth: "90%", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose}>Kapat</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Payments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // payment objesi ya da null

  // form state
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("cash");
  const [when, setWhen] = useState(toInputLocal(new Date().toISOString()));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const resetForm = () => {
    setAmount("");
    setMethod("cash");
    setWhen(toInputLocal(new Date().toISOString()));
    setNote("");
    setFormErr("");
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setAmount(p.amount || "");
    setMethod(p.method || "cash");
    setWhen(toInputLocal(p.when));
    setNote(p.note || "");
    setFormErr("");
    setOpen(true);
  };

  const fetchList = async () => {
    try {
      setErr("");
      setLoading(true);
      const { data } = await http.get("/payments/");
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Ödemeler alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErr("");
    try {
      const payload = {
        amount: amount === "" ? 0 : Number(amount),
        method,
        when: toIsoFromLocal(when),
        note,
      };
      if (editing) {
        await http.patch(`/payments/${editing.id}/`, payload);
      } else {
        await http.post("/payments/", payload);
      }
      setOpen(false);
      resetForm();
      fetchList();
    } catch (e) {
      setFormErr(e?.response?.data?.detail || "Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (p) => {
    const ok = confirm(`Silinsin mi?\nTutar: ${p.amount} ₺`);
    if (!ok) return;
    try {
      await http.delete(`/payments/${p.id}/`);
      fetchList();
    } catch (e) {
      alert(e?.response?.data?.detail || "Silme başarısız");
    }
  };

  const rows = useMemo(() => list, [list]);

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Ödemeler</h2>
        <button onClick={openCreate}>+ Yeni Ödeme</button>
      </div>

      {err && <p style={{ color: "crimson" }}>Hata: {err}</p>}
      {loading ? (
        <p>Yükleniyor…</p>
      ) : rows.length === 0 ? (
        <div style={{ padding: 16, border: "1px dashed #999", borderRadius: 8 }}>
          Henüz ödeme yok. <button onClick={openCreate}>İlk ödemeyi ekle</button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #333" }}>
                <th style={{ padding: 8, width: 120 }}>Tutar (₺)</th>
                <th style={{ padding: 8, width: 140 }}>Yöntem</th>
                <th style={{ padding: 8, width: 220 }}>Tarih/Saat</th>
                <th style={{ padding: 8 }}>Not</th>
                <th style={{ padding: 8, width: 160 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #222" }}>
                  <td style={{ padding: 8 }}>{r.amount}</td>
                  <td style={{ padding: 8 }}>
                    {METHOD_OPTIONS.find(m => m.value === r.method)?.label || r.method}
                  </td>
                  <td style={{ padding: 8 }}>
                    {new Date(r.when).toLocaleString()}
                  </td>
                  <td style={{ padding: 8, color: "#bbb" }}>{r.note || "-"}</td>
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

      <Modal open={open} title={editing ? "Ödeme Düzenle" : "Yeni Ödeme"} onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Tutar (₺)</label>
              <input
                style={{ width: "100%", padding: 8 }}
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Yöntem</label>
              <select
                style={{ width: "100%", padding: 8 }}
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {METHOD_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <label style={{ display: "block", marginTop: 8 }}>Tarih/Saat</label>
          <input
            style={{ width: "100%", padding: 8 }}
            type="datetime-local"
            value={when}
            onChange={(e) => setWhen(e.target.value)}
          />

          <label style={{ display: "block", marginTop: 8 }}>Not</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="İsteğe bağlı"
          />

          {formErr && <p style={{ color: "crimson", marginTop: 8 }}>Hata: {formErr}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
            <button type="button" onClick={() => setOpen(false)}>Vazgeç</button>
            <button type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : (editing ? "Güncelle" : "Oluştur")}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
