import { api } from "./client";

export const fetchNotifications = () => api.get("/api/v1/notifications");
export const markRead           = (id) => api.patch(`/api/v1/notifications/${id}/read`, {});
export const markAllRead        = () => api.patch("/api/v1/notifications/read-all", {});
