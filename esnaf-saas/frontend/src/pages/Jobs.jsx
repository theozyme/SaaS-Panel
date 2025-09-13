import { useEffect, useMemo, useState } from "react";
import { http } from "../lib/http";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";

const STATUS_OPTIONS = [
  { value: "open",        label: "Açık" },
  { value: "in_progress", label: "Devam" },
  { value: "done",        label: "Tamam" },
  { value: "canceled",    label: "İptal" },
];

export default function Jobs() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

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

  const openCreate = () => { resetForm(); setOpen(true); };
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
      if (editing) await http.patch(`/jobs/${editing.id}/`, payload);
      else        await http.post("/jobs/", payload);
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
    if (!confirm(`Silinsin mi?\nMüşteri: ${job.customer_name}`)) return;
    try {
      await http.delete(`/jobs/${job.id}/`);
      fetchList();
    } catch (e) {
      alert(e?.response?.data?.detail || "Silme başarısız");
    }
  };

  const rows = useMemo(() => list, [list]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-2xl font-semibold">İş Emirleri</h2>
        <Button onClick={openCreate}>+ Yeni İş Emri</Button>
      </div>

      {err && <p className="text-red-400">Hata: {err}</p>}

      {loading ? (
        <p>Yükleniyor…</p>
      ) : rows.length === 0 ? (
        <div className="card p-4 text-[var(--muted)]">
          Henüz kayıt yok.
          <Button variant="ghost" className="ml-2" onClick={openCreate}>
            İlk kaydı oluştur
          </Button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>Açıklama</th>
                <th className="w-28">Tutar</th>
                <th className="w-32">Durum</th>
                <th className="w-40">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.customer_name}</td>
                  <td className="text-[var(--muted)]">{r.description || "-"}</td>
                  <td>{r.total}</td>
                  <td>
                    <span className="badge">
                      {STATUS_OPTIONS.find(s => s.value === r.status)?.label || r.status}
                    </span>
                  </td>
                  <td>
                    <Button variant="ghost" className="mr-2" onClick={() => openEdit(r)}>
                      Düzenle
                    </Button>
                    <Button variant="danger" onClick={() => onDelete(r)}>
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={open} title={editing ? "İş Emri Düzenle" : "Yeni İş Emri"} onClose={() => setOpen(false)}>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm text-[var(--muted)]">Müşteri Adı</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm text-[var(--muted)]">Açıklama</label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-[var(--muted)]">Tutar (₺)</label>
              <Input type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-[var(--muted)]">Durum</label>
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </Select>
            </div>
          </div>

          {formErr && <p className="text-red-500">{formErr}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Vazgeç</Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Kaydediliyor..." : (editing ? "Güncelle" : "Oluştur")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
