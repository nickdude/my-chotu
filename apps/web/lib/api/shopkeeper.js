import { api } from "./client";

// ─── Shop ─────────────────────────────────────────────────────────────────────
export const registerShop       = (body)  => api.post("/api/v1/shopkeeper/shop/register", body);
export const fetchMyShop        = ()      => api.get("/api/v1/shopkeeper/shop");
export const updateMyShop       = (body)  => api.patch("/api/v1/shopkeeper/shop", body);
export const updateShopHours    = (hours) => api.patch("/api/v1/shopkeeper/shop/hours", { hours });

// ─── Products ─────────────────────────────────────────────────────────────────
export const fetchMyProducts    = (p = {}) => {
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(p).filter(([,v]) => v != null && v !== ""))).toString();
  return api.get(`/api/v1/shopkeeper/products${qs ? `?${qs}` : ""}`);
};
export const fetchMyProduct     = (id)    => api.get(`/api/v1/shopkeeper/products/${id}`);
export const createProduct      = (body)  => api.post("/api/v1/shopkeeper/products", body);
export const updateProduct      = (id, body) => api.patch(`/api/v1/shopkeeper/products/${id}`, body);
export const archiveProduct     = (id)    => api.delete(`/api/v1/shopkeeper/products/${id}`);
export const adjustStock        = (id, body) => api.post(`/api/v1/shopkeeper/products/${id}/stock`, body);
export const fetchLowStock      = ()      => api.get("/api/v1/shopkeeper/products/low-stock");

// ─── Orders ───────────────────────────────────────────────────────────────────
export const fetchShopOrders    = (p = {}) => {
  const qs = new URLSearchParams(Object.fromEntries(Object.entries(p).filter(([,v]) => v != null && v !== ""))).toString();
  return api.get(`/api/v1/shopkeeper/orders${qs ? `?${qs}` : ""}`);
};
export const fetchShopOrder     = (id)    => api.get(`/api/v1/shopkeeper/orders/${id}`);
export const updateOrderStatus  = (id, body) => api.patch(`/api/v1/shopkeeper/orders/${id}/status`, body);

// ─── Analytics ────────────────────────────────────────────────────────────────
export const fetchAnalyticsSummary  = ()      => api.get("/api/v1/shopkeeper/analytics/summary");
export const fetchTopProducts       = ()      => api.get("/api/v1/shopkeeper/analytics/top-products");
export const fetchOrderTrend        = (days)  => api.get(`/api/v1/shopkeeper/analytics/trend?days=${days ?? 7}`);
