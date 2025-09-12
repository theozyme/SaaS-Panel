// src/lib/http.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Token/Tenant saklama anahtarları
export const AUTH_KEYS = {
  ACCESS: "ACCESS_TOKEN",
  TENANT: "TENANT_ID",
};

// localStorage yardımcıları
export const getAccessToken = () => localStorage.getItem(AUTH_KEYS.ACCESS) || "";
export const getTenantId   = () => localStorage.getItem(AUTH_KEYS.TENANT) || "";
export const setAuth = ({ access, tenantId }) => {
  if (access) localStorage.setItem(AUTH_KEYS.ACCESS, access);
  if (tenantId) localStorage.setItem(AUTH_KEYS.TENANT, tenantId);
};
export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEYS.ACCESS);
  localStorage.removeItem(AUTH_KEYS.TENANT);
};

// axios instance
export const http = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// header ekleyici
http.interceptors.request.use((config) => {
  const token = getAccessToken();
  const tid = getTenantId();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (tid) config.headers["X-Tenant-ID"] = tid;
  return config;
});

// 401 durumunda basit temizleme (ileride refresh ekleriz)
http.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      // clearAuth(); // istersen aç
    }
    return Promise.reject(err);
  }
);
