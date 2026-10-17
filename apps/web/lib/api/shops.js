import { api } from "./client";

export const fetchShops = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();
  return api.get(`/api/v1/shops${qs ? `?${qs}` : ""}`, { auth: false });
};

export const fetchShop = (slug) =>
  api.get(`/api/v1/shops/${slug}`, { auth: false });

export const fetchShopProducts = (slug, params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();
  return api.get(`/api/v1/shops/${slug}/products${qs ? `?${qs}` : ""}`, { auth: false });
};

export const fetchShopCategories = (slug) =>
  api.get(`/api/v1/shops/${slug}/categories`, { auth: false });

export const trackShopScan = (slug) =>
  api.post(`/api/v1/shops/${slug}/scan`, {}, { auth: false });
