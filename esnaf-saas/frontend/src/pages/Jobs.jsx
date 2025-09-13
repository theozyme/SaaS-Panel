import { useEffect, useMemo, useState } from "react";
import { http } from "../lib/http";

const STATUS_OPTIONS = [
  { value: "open", label: "Açık" },
  { value: "in_progress", label: "Devam" },
  { value: "done", label: "Tamam" },
  { value: "canceled", label: "İptal" },
];

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

export default function Jobs() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // job objesi ya da null

  // form state
  const [customerName, setCustomerName] = useState("");
  const [description, setDescription] = useState("");
  const [total, setTotal] = useState("");
  const [status, setStatus] = useState("open");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const resetForm = () => {
    setCustomerName("");
    setDescription("");
    setTotal("");
    setStatus("open");
    setFormErr("");
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (job) => {
    setEditing(job);
    setCustomerName(job.customer_name || "");
    setDescription(job.description || "");
    setTotal(job.total || "");
    setStatus(job.status || "open");
    setFormErr("");
    setOpen(true);
  };

  const fetchList = async () => {
    try {
      setErr("");
      setLoading(true);
      const { data } = await http.get("/jobs/");
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "İş emirleri alınamadı");
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
        customer_name: customerName,
        description,
        total: total === "" ? 0 : Number(total),
        status,
      };
      if (editing) {
        await http.patch(`/jobs/${editing.id}/`, payload);
      } else {
        await http.post("/jobs/", payload);
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

  const onDelete = async (job) => {
    const ok = confirm(`Silinsin mi?\nMüşteri: ${job.customer_name}`);
    if (!ok) return;
    try {
      await http.delete(`/jobs/${job.id}/`);
      fetchList();
    } catch (e) {
      alert(e?.response?.data?.detail || "Silme başarısız");
    }
  };

  const rows = useMemo(() => list, [list]);

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>İş Emirleri</h2>
        <button onClick={openCreate}>+ Yeni İş Emri</button>
      </div>

      {err && <p style={{ color: "crimson" }}>Hata: {err}</p>}
      {loading ? (
        <p>Yükleniyor…</p>
      ) : rows.length === 0 ? (
        <div style={{ padding: 16, border: "1px dashed #999", borderRadius: 8 }}>
          Henüz kayıt yok. <button onClick={openCreate}>İlk kaydı oluştur</button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #333" }}>
                <th style={{ padding: 8 }}>Müşteri</th>
                <th style={{ padding: 8 }}>Açıklama</th>
                <th style={{ padding: 8, width: 120 }}>Tutar (₺)</th>
                <th style={{ padding: 8, width: 140 }}>Durum</th>
                <th style={{ padding: 8, width: 160 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #222" }}>
                  <td style={{ padding: 8 }}>{r.customer_name}</td>
                  <td style={{ padding: 8, color: "#bbb" }}>{r.description || "-"}</td>
                  <td style={{ padding: 8 }}>{r.total}</td>
                  <td style={{ padding: 8 }}>
                    {STATUS_OPTIONS.find(s => s.value === r.status)?.label || r.status}
                  </td>
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

      <Modal open={open} title={editing ? "İş Emri Düzenle" : "Yeni İş Emri"} onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit}>
          <label style={{ display: "block", marginTop: 8 }}>Müşteri Adı</label>
          <input
            style={{ width: "100%", padding: 8 }}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />

          <label style={{ display: "block", marginTop: 8 }}>Açıklama</label>
          <textarea
            style={{ width: "100%", padding: 8 }}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Tutar (₺)</label>
              <input
                style={{ width: "100%", padding: 8 }}
                type="number"
                step="0.01"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Durum</label>
              <select
                style={{ width: "100%", padding: 8 }}
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

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
