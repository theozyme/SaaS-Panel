# Esnaf SaaS (MVP)

Çok-kiracılı (multi-tenant) servis: **Standart** (İş Emirleri, Ödemeler, Ayarlar) + **Eklentiler** (Randevu, Stok, Raporlar).

## Çalışan Uçlar
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- Modüller: `GET /api/modules/active`
- İş Emirleri: `GET/POST/PATCH/DELETE /api/jobs/`
- Ödemeler: `GET/POST/PATCH/DELETE /api/payments/`
- Randevular: `GET/POST/PATCH/DELETE /api/appointments/`

> Tüm isteklerde: `Authorization: Bearer <ACCESS_TOKEN>` ve `X-Tenant-ID: <TENANT_ID>`
