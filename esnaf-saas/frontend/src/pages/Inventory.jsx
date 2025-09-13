// src/pages/Inventory.jsx
import { useEffect, useMemo, useState } from "react";
import { http } from "../lib/http";

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", color: "#111", borderRadius: 12, width: 600, maxWidth: "95%", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button onClick={onClose}>Kapat</button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [low, setLow] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState("");

  const resetForm = () => {
    setName(""); setSku(""); setQty(""); setPrice(""); setLow("");
    setFormErr(""); setEditing(null);
  };
  const openCreate = () => { resetForm(); setOpen(true); };
  const openEdit = (it) => {
    setEditing(it);
    setName(it.name || ""); setSku(it.sku || "");
    setQty(it.qty ?? ""); setPrice(it.price ?? "");
    setLow(it.low_stock_threshold ?? "");
    setFormErr(""); setOpen(true);
  };

  const fetchList = async () => {
    try { setErr(""); setLoading(true);
      const { data } = await http.get("/inventory/");
      setList(Array.isArray(data) ? data : []);
    } catch (e) { setErr(e?.response?.data?.detail || "Stok listesi alınamadı");
    } finally { setLoading(false); }
  };
  useEffect(() => { fetchList(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErr("");
    try {
      const payload = {
        name,
        sku,
        qty: qty === "" ? 0 : Number(qty),
        price: price === "" ? 0 : Number(price),
        low_stock_threshold: low === "" ? 0 : Number(low),
      };
      if (editing) await http.patch(`/inventory/${editing.id}/`, payload);
      else await http.post("/inventory/", payload);
      setOpen(false); resetForm(); fetchList();
    } catch (e) {
      setFormErr(e?.response?.data?.detail || "Kaydetme başarısız");
    } finally { setSaving(false); }
  };

  const onDelete = async (it) => {
    if (!confirm(`Silinsin mi?\nÜrün: ${it.name}`)) return;
    try { await http.delete(`/inventory/${it.id}/`); fetchList(); }
    catch (e) { alert(e?.response?.data?.detail || "Silme başarısız"); }
  };

  const isLow = (it) => (it.low_stock_threshold > 0) && (Number(it.qty) <= Number(it.low_stock_threshold));
  const rows = useMemo(() => list, [list]);

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Stok Yönetimi</h2>
        <button onClick={openCreate}>+ Yeni Ürün</button>
      </div>

      {err && <p style={{ color: "crimson" }}>Hata: {err}</p>}
      {loading ? <p>Yükleniyor…</p> : rows.length === 0 ? (
        <div style={{ padding: 16, border: "1px dashed #999", borderRadius: 8 }}>
          Kayıt yok. <button onClick={openCreate}>İlk ürünü ekle</button>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #333" }}>
                <th style={{ padding: 8 }}>Ürün</th>
                <th style={{ padding: 8, width: 140 }}>SKU</th>
                <th style={{ padding: 8, width: 100 }}>Adet</th>
                <th style={{ padding: 8, width: 130 }}>Birim Fiyat (₺)</th>
                <th style={{ padding: 8, width: 140 }}>Kritik Eşik</th>
                <th style={{ padding: 8, width: 160 }}>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid #222", background: isLow(r) ? "rgba(255,0,0,.08)" : "transparent" }}>
                  <td style={{ padding: 8 }}>{r.name}</td>
                  <td style={{ padding: 8, color: "#888" }}>{r.sku || "-"}</td>
                  <td style={{ padding: 8 }}>{r.qty}</td>
                  <td style={{ padding: 8 }}>{r.price}</td>
                  <td style={{ padding: 8 }}>
                    {r.low_stock_threshold}
                    {isLow(r) && <strong style={{ color: "#ff5555" }}>  • DÜŞÜK</strong>}
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

      <Modal open={open} title={editing ? "Ürün Düzenle" : "Yeni Ürün"} onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit}>
          <label style={{ display: "block", marginTop: 8 }}>Ürün Adı</label>
          <input style={{ width: "100%", padding: 8 }} value={name} onChange={(e) => setName(e.target.value)} required />

          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>SKU</label>
              <input style={{ width: "100%", padding: 8 }} value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Opsiyonel" />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Adet</label>
              <input style={{ width: "100%", padding: 8 }} type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Birim Fiyat (₺)</label>
              <input style={{ width: "100%", padding: 8 }} type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", marginTop: 8 }}>Kritik Eşik</label>
              <input style={{ width: "100%", padding: 8 }} type="number" value={low} onChange={(e) => setLow(e.target.value)} />
            </div>
          </div>

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
