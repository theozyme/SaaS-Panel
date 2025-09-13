// frontend/src/pages/Dashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../lib/http";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import Select from "../components/ui/Select";
import Modal from "../components/ui/Modal";

function toInputLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toIsoFromLocal(localValue) {
  if (!localValue) return new Date().toISOString();
  return new Date(localValue).toISOString();
}

export default function Dashboard() {
  const nav = useNavigate();

  // data
  const [modules, setModules] = useState([]);
  const [summary, setSummary] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // ui
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // quick-add modals
  const [openJob, setOpenJob] = useState(false);
  const [openAppt, setOpenAppt] = useState(false);

  // quick-add forms
  const [jobCustomer, setJobCustomer] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobTotal, setJobTotal] = useState("");
  const [jobSaving, setJobSaving] = useState(false);
  const [jobErr, setJobErr] = useState("");

  const [apptWho, setApptWho] = useState("");
  const [apptWhen, setApptWhen] = useState(toInputLocal(new Date().toISOString()));
  const [apptSaving, setApptSaving] = useState(false);
  const [apptErr, setApptErr] = useState("");

  const has = (code) => modules.some((m) => m.code === code);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const [modsRes, sumRes] = await Promise.all([
        http.get("/modules/active"),
        http.get("/reports/summary"),
      ]);
      const mods = modsRes.data.modules || [];
      setModules(mods);
      setSummary(sumRes.data || null);

      if (mods.some((m) => m.code === "appointments")) {
        const apRes = await http.get("/appointments/");
        setAppointments(Array.isArray(apRes.data) ? apRes.data : []);
      } else {
        setAppointments([]);
      }
    } catch (e) {
      setErr(e?.response?.data?.detail || "Veri alınamadı");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const nextAppointment = useMemo(() => {
    if (!appointments.length) return null;
    const now = new Date();
    const upcoming = appointments
      .filter((a) => new Date(a.when) >= now)
      .sort((a, b) => new Date(a.when) - new Date(b.when));
    return upcoming[0] || null;
  }, [appointments]);

  // Quick add: Job
  const submitQuickJob = async (e) => {
    e.preventDefault();
    setJobSaving(true);
    setJobErr("");
    try {
      const payload = {
        customer_name: jobCustomer,
        description: jobDesc,
        total: jobTotal === "" ? 0 : Number(jobTotal),
        status: "open",
      };
      await http.post("/jobs/", payload);
      setOpenJob(false);
      setJobCustomer("");
      setJobDesc("");
      setJobTotal("");
      await load();
    } catch (e) {
      setJobErr(e?.response?.data?.detail || "İş emri oluşturulamadı");
    } finally {
      setJobSaving(false);
    }
  };

  // Quick add: Appointment
  const submitQuickAppt = async (e) => {
    e.preventDefault();
    setApptSaving(true);
    setApptErr("");
    try {
      const payload = {
        who: apptWho,
        when: toIsoFromLocal(apptWhen),
        status: "pending",
        category: "Hızlı randevu",
        note: "",
      };
      await http.post("/appointments/", payload);
      setOpenAppt(false);
      setApptWho("");
      setApptWhen(toInputLocal(new Date().toISOString()));
      await load();
    } catch (e) {
      setApptErr(e?.response?.data?.detail || "Randevu oluşturulamadı");
    } finally {
      setApptSaving(false);
    }
  };

  const totalJobs = summary?.jobs?.total ?? 0;
  const totalAmount = summary?.payments?.total_amount ?? "0.00";
  const lowStockCount = summary?.inventory?.low_stock_samples?.length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        {loading && <span className="text-neutral-400">Yükleniyor…</span>}
      </div>

      {err && <p className="text-red-400">Hata: {err}</p>}

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="card p-4">
          <div className="text-sm text-neutral-400">Toplam İş Emri</div>
          <div className="text-3xl font-bold">{totalJobs}</div>
          <Button variant="ghost" className="mt-3" onClick={() => nav("/jobs")}>
            İş Emirlerine Git
          </Button>
        </div>

        <div className="card p-4">
          <div className="text-sm text-neutral-400">Toplam Ödeme (₺)</div>
          <div className="text-3xl font-bold">{totalAmount}</div>
          {has("payments") && (
            <Button variant="ghost" className="mt-3" onClick={() => nav("/payments")}>
              Ödemelere Git
            </Button>
          )}
        </div>

        <div className="card p-4">
          <div className="text-sm text-neutral-400">Düşük Stok</div>
          <div className="text-3xl font-bold">{lowStockCount}</div>
          {has("inventory") && (
            <Button variant="ghost" className="mt-3" onClick={() => nav("/inventory")}>
              Stok Yönetimine Git
            </Button>
          )}
        </div>

        <div className="card p-4">
          <div className="text-sm text-neutral-400">Yaklaşan Randevu</div>
          {has("appointments") ? (
            nextAppointment ? (
              <>
                <div className="text-xl font-semibold">{nextAppointment.who}</div>
                <div className="text-neutral-300">
                  {new Date(nextAppointment.when).toLocaleString()}
                </div>
              </>
            ) : (
              <div className="text-neutral-400">Yaklaşan randevu yok</div>
            )
          ) : (
            <div className="text-neutral-400">Randevu modülü pasif</div>
          )}
          {has("appointments") && (
            <Button variant="ghost" className="mt-3" onClick={() => nav("/appointments")}>
              Randevulara Git
            </Button>
          )}
        </div>
      </div>

      {/* Aktif Modüller */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Aktif Modüller</div>
          <Button variant="ghost" onClick={() => nav("/settings")}>Ayarlar</Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {modules.map((m) => (
            <span key={m.code} className="badge">{m.name}<span className="opacity-60"> ({m.code})</span></span>
          ))}
          {modules.length === 0 && <span className="text-neutral-400">Henüz modül yok.</span>}
        </div>
      </div>

      {/* Kısayollar */}
      <div className="card p-4">
        <div className="font-semibold mb-3">Kısayollar</div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setOpenJob(true)}>+ Hızlı İş Emri</Button>
          {has("appointments") && (
            <Button onClick={() => setOpenAppt(true)}>+ Hızlı Randevu</Button>
          )}
          {has("payments") && (
            <Button variant="ghost" onClick={() => nav("/payments")}>+ Ödeme Ekle</Button>
          )}
          {has("inventory") && (
            <Button variant="ghost" onClick={() => nav("/inventory")}>+ Ürün Ekle</Button>
          )}
          <Button variant="ghost" onClick={() => nav("/reports")}>Raporları Aç</Button>
        </div>
      </div>

      {/* Hızlı İş Emri Modal */}
      <Modal open={openJob} title="Hızlı İş Emri" onClose={() => setOpenJob(false)}>
        <form onSubmit={submitQuickJob} className="space-y-3">
          <div>
            <label className="text-sm text-neutral-400">Müşteri Adı</label>
            <Input value={jobCustomer} onChange={(e) => setJobCustomer(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-neutral-400">Açıklama (opsiyonel)</label>
            <Textarea rows={3} value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-neutral-400">Tutar (₺)</label>
            <Input type="number" step="0.01" value={jobTotal} onChange={(e) => setJobTotal(e.target.value)} />
          </div>
          {jobErr && <p className="text-red-500">{jobErr}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenJob(false)}>Vazgeç</Button>
            <Button type="submit" disabled={jobSaving}>{jobSaving ? "Kaydediliyor..." : "Oluştur"}</Button>
          </div>
        </form>
      </Modal>

      {/* Hızlı Randevu Modal */}
      <Modal open={openAppt} title="Hızlı Randevu" onClose={() => setOpenAppt(false)}>
        <form onSubmit={submitQuickAppt} className="space-y-3">
          <div>
            <label className="text-sm text-neutral-400">Kişi</label>
            <Input value={apptWho} onChange={(e) => setApptWho(e.target.value)} required />
          </div>
          <div>
            <label className="text-sm text-neutral-400">Tarih/Saat</label>
            <Input type="datetime-local" value={apptWhen} onChange={(e) => setApptWhen(e.target.value)} />
          </div>
          {apptErr && <p className="text-red-500">{apptErr}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpenAppt(false)}>Vazgeç</Button>
            <Button type="submit" disabled={apptSaving}>{apptSaving ? "Kaydediliyor..." : "Oluştur"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
