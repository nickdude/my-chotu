"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { fetchCart, addToCart, updateItem, removeItem, clearCart } from "@/lib/api/cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoggedIn = () =>
    typeof window !== "undefined" && !!localStorage.getItem("token");

  const loadCart = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await fetchCart();
      setCart(res.data);
    } catch {
      setCart(null);
    }
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const add = async (variantId, qty = 1) => {
    if (!isLoggedIn()) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    try {
      const res = await addToCart({ variantId, qty });
      setCart(res.data);
      setDrawerOpen(true);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message, status: err.status };
    } finally {
      setLoading(false);
    }
  };

  const update = async (itemId, qty) => {
    setLoading(true);
    try {
      const res = await updateItem(itemId, qty);
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (itemId) => {
    setLoading(true);
    try {
      const res = await removeItem(itemId);
      setCart(res.data);
    } finally {
      setLoading(false);
    }
  };

  const clear = async () => {
    setLoading(true);
    try {
      await clearCart();
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.qty, 0) ?? 0;
  const subtotal = cart?.items?.reduce((sum, i) => sum + Number(i.priceSnapshot) * i.qty, 0) ?? 0;

  return (
    <CartContext.Provider
      value={{ cart, loading, drawerOpen, setDrawerOpen, add, update, remove, clear, loadCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
};
