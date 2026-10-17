import { api } from "./client";

export const fetchCart    = ()              => api.get("/api/v1/cart");
export const addToCart    = (body)          => api.post("/api/v1/cart/items", body);
export const updateItem   = (itemId, qty)   => api.patch(`/api/v1/cart/items/${itemId}`, { qty });
export const removeItem   = (itemId)        => api.delete(`/api/v1/cart/items/${itemId}`);
export const clearCart    = ()              => api.delete("/api/v1/cart");
