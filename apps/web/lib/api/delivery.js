import { api } from "./client";

// ─── Delivery staff ───────────────────────────────────────────────────────────
export const fetchAssignments   = ()    => api.get("/api/v1/delivery/assignments");
export const fetchAssignmentHistory = (p = {}) => {
  const qs = new URLSearchParams(p).toString();
  return api.get(`/api/v1/delivery/assignments/history${qs ? `?${qs}` : ""}`);
};
export const fetchAssignment    = (id)  => api.get(`/api/v1/delivery/assignments/${id}`);
export const updateAssignmentStatus = (id, body) =>
  api.patch(`/api/v1/delivery/assignments/${id}/status`, body);
export const requestProofOtp    = (id)  => api.post(`/api/v1/delivery/assignments/${id}/otp`, {});
export const submitProof        = (id, body) =>
  api.post(`/api/v1/delivery/assignments/${id}/proof`, body);
export const recordCodCollection = (id, amountCollected) =>
  api.post(`/api/v1/delivery/assignments/${id}/cod`, { amountCollected });

// ─── Shopkeeper ───────────────────────────────────────────────────────────────
export const fetchStaff         = ()    => api.get("/api/v1/shopkeeper/staff");
export const addStaffMember     = (body) => api.post("/api/v1/shopkeeper/staff", body);
export const toggleStaffStatus  = (id)  => api.patch(`/api/v1/shopkeeper/staff/${id}/toggle`, {});
export const assignDelivery     = (orderId, staffId) =>
  api.post(`/api/v1/shopkeeper/staff/orders/${orderId}/assign`, { staffId });
export const fetchCodList       = ()    => api.get("/api/v1/shopkeeper/staff/cod");
export const reconcileCod       = (assignmentId) =>
  api.post(`/api/v1/shopkeeper/staff/cod/${assignmentId}/reconcile`, {});
