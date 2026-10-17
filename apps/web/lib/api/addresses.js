import { api } from "./client";

export const fetchAddresses = ()       => api.get("/api/v1/addresses");
export const addAddress     = (body)   => api.post("/api/v1/addresses", body);
export const setDefault     = (id)     => api.patch(`/api/v1/addresses/${id}/default`, {});
