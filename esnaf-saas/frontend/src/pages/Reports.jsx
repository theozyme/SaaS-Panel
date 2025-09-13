// src/pages/Reports.jsx
import { useEffect, useState } from "react";
import { http } from "../lib/http";

function Card({ title, value, subtitle }) {
  return (
    <div style={{ padding: 16, border: "1px solid #333", borderRadius: 12, minWidth: 220 }}>
      <div style={{ fontSize: 12, color: "#aaa" }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 700 }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: "#888" }}>{subtitle}</div>}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setErr(""); setLoading(true);
      const { data } = await http.get("/reports/summary");
      setData(data);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Rapor verileri alınamadı");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  if (loading) return <p>Yükleniyor…</p>;
  if (err) return <p style={{ color: "crimson" }}>Hata: {err}</p>;
  if (!data) return null;

  const totalJobs = data?.jobs?.total ?? 0;
  const byStatus = data?.jobs?.by_status || {};
  const totalAmount = data?.payments?.total_amount || "0.00";
  const lowStock = data?.inventory?.low_stock_samples || [];

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <h2>Raporlar</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Card title="Toplam İş Emri" value={totalJobs} subtitle={
          Object.entries(byStatus).map(([k,v]) => `${k}: ${v}`).join(" • ") || ""
        } />
        <Card title="Toplam Ödeme (₺)" value={totalAmount} />
        <Card title="Düşük Stok (adet)" value={lowStock.length} />
      </div>

      {lowStock.length > 0 && (
        <>
          <h3 style={{ marginTop: 20 }}>Düşük Stok Listesi</h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ textAlign: "left", borderBottom: "1px solid #333" }}>
                  <th style={{ padding: 8 }}>Ürün</th>
                  <th style={{ padding: 8, width: 140 }}>SKU</th>
                  <th style={{ padding: 8, width: 100 }}>Adet</th>
                  <th style={{ padding: 8, width: 140 }}>Kritik Eşik</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((r) => (
                  <tr key={r.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: 8 }}>{r.name}</td>
                    <td style={{ padding: 8, color: "#888" }}>{r.sku || "-"}</td>
                    <td style={{ padding: 8 }}>{r.qty}</td>
                    <td style={{ padding: 8 }}>{r.low_stock_threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
