import { api } from "./client";

export const placeOrder  = (body)          => api.post("/api/v1/orders", body);
export const fetchOrders = (params = {})   => {
  const qs = new URLSearchParams(params).toString();
  return api.get(`/api/v1/orders${qs ? `?${qs}` : ""}`);
};
export const fetchOrder  = (orderId)       => api.get(`/api/v1/orders/${orderId}`);
export const cancelOrder = (orderId, reason) =>
  api.post(`/api/v1/orders/${orderId}/cancel`, { reason });
