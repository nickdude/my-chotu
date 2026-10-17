import { api } from "./client";

const qs = (p = {}) => {
  const s = new URLSearchParams(Object.fromEntries(Object.entries(p).filter(([,v]) => v != null && v !== ""))).toString();
  return s ? `?${s}` : "";
};

// ─── Overview ─────────────────────────────────────────────────────────────────
export const fetchOverview   = ()    => api.get("/api/v1/admin/overview");
export const fetchTrend      = ()    => api.get("/api/v1/admin/overview/trend");

// ─── Shops ────────────────────────────────────────────────────────────────────
export const fetchAdminShops = (p)   => api.get(`/api/v1/admin/shops${qs(p)}`);
export const fetchAdminShop  = (id)  => api.get(`/api/v1/admin/shops/${id}`);
export const updateShopStatus = (id, body) => api.patch(`/api/v1/admin/shops/${id}/status`, body);

// ─── Users ────────────────────────────────────────────────────────────────────
export const fetchAdminUsers = (p)   => api.get(`/api/v1/admin/users${qs(p)}`);
export const updateUserStatus = (id, body) => api.patch(`/api/v1/admin/users/${id}/status`, body);

// ─── Plans ────────────────────────────────────────────────────────────────────
export const fetchPlans      = ()       => api.get("/api/v1/admin/plans");
export const fetchPlan       = (id)     => api.get(`/api/v1/admin/plans/${id}`);
export const createPlan      = (body)   => api.post("/api/v1/admin/plans", body);
export const updatePlan      = (id, b)  => api.patch(`/api/v1/admin/plans/${id}`, b);
export const archivePlan     = (id)     => api.delete(`/api/v1/admin/plans/${id}`);

// ─── Categories ───────────────────────────────────────────────────────────────
export const fetchAdminCategories  = ()          => api.get("/api/v1/admin/categories");
export const createCategory        = (body)      => api.post("/api/v1/admin/categories", body);
export const updateCategory        = (id, body)  => api.patch(`/api/v1/admin/categories/${id}`, body);
export const toggleCategory        = (id)        => api.patch(`/api/v1/admin/categories/${id}/toggle`, {});

// ─── Orders ───────────────────────────────────────────────────────────────────
export const searchAdminOrders = (p) => api.get(`/api/v1/admin/orders${qs(p)}`);

// ─── Audit logs ───────────────────────────────────────────────────────────────
export const fetchAuditLogs = (p) => api.get(`/api/v1/admin/audit-logs${qs(p)}`);

// ─── Settings ─────────────────────────────────────────────────────────────────
export const fetchSettings   = ()         => api.get("/api/v1/admin/settings");
export const updateSetting   = (key, body) => api.put(`/api/v1/admin/settings/${encodeURIComponent(key)}`, body);
