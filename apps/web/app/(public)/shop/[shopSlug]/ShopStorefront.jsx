"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shared/ProductCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ShareMenu } from "@/components/shared/ShareMenu";
import { fetchShop, fetchShopProducts, fetchShopCategories, trackShopScan } from "@/lib/api/shops";
import { useCart } from "@/lib/context/CartContext";
import { MapPin, Truck, Search, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ShopStorefront({ shopSlug, refParam }) {
  const [shop,         setShop]         = useState(null);
  const [products,     setProducts]     = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [debouncedSearch, setDebSearch] = useState("");
  const [activeCat,    setActiveCat]    = useState(null); // category id
  const [clearCartDialog, setClearDialog] = useState(false);
  const { clear, itemCount, subtotal, cart } = useCart();

  const shopUrl = typeof window !== "undefined"
    ? `${window.location.origin}/shop/${shopSlug}`
    : `/shop/${shopSlug}`;

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // Load shop + categories, track scan if came from QR
  useEffect(() => {
    fetchShop(shopSlug).then((r) => {
      setShop(r.data);
      if (refParam === "qr") trackShopScan(shopSlug).catch(() => {});
    }).catch(() => setShop(null));

    fetchShopCategories(shopSlug)
      .then((r) => setCategories(r.data ?? []))
      .catch(() => {});
  }, [shopSlug, refParam]);

  const loadProducts = useCallback(async () => {
    if (!shop) return;
    setLoading(true);
    try {
      const res = await fetchShopProducts(shopSlug, {
        search:     debouncedSearch || undefined,
        categoryId: activeCat || undefined,
        limit:      100,
      });
      setProducts(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [shopSlug, shop, debouncedSearch, activeCat]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleDifferentShop = () => setClearDialog(true);
  const handleClearAndContinue = async () => { await clear(); setClearDialog(false); };

  // Whether the current cart belongs to this shop
  const cartIsThisShop = cart?.shopId === shop?.id;
  const showFloatingCart = cartIsThisShop && itemCount > 0;

  if (!shop && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState title="Shop not found" description="This shop doesn't exist or is not available." />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FFFDF9]">

      {/* ── Shop header ─────────────────────────────────────────────────── */}
      {shop && (
        <div className="bg-white border-b border-border">
          {/* Cover image */}
          <div className="h-36 sm:h-48 bg-[#F1F3F5] relative overflow-hidden">
            {shop.coverImageUrl ? (
              <img src={shop.coverImageUrl} alt={shop.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#FFF0EB] to-[#F1F3F5]" />
            )}
          </div>

          <div className="max-w-6xl mx-auto px-4 pb-4">
            {/* Logo + name row */}
            <div className="flex items-end gap-3 -mt-7">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-4 border-white shadow-md bg-white overflow-hidden flex-shrink-0">
                {shop.logoUrl ? (
                  <img src={shop.logoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#FFF0EB] flex items-center justify-center text-2xl">🏪</div>
                )}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-lg sm:text-xl font-bold text-[#152744] truncate">{shop.name}</h1>
                  <Badge variant="outline"
                    className={shop.isOpen ? "text-green-700 border-green-200 bg-green-50 text-xs" : "text-gray-500 text-xs"}>
                    {shop.isOpen ? "Open now" : "Closed"}
                  </Badge>
                </div>
                {shop.category && <p className="text-xs text-muted-foreground mt-0.5">{shop.category.name}</p>}
              </div>
              {/* Share */}
              <div className="pb-1 flex-shrink-0">
                <ShareMenu
                  url={shopUrl}
                  title={`Order from ${shop.name} on My Chotu`}
                  size="sm"
                />
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {shop.city && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#F4512C]" />
                  {[shop.addressLine, shop.city].filter(Boolean).join(", ")}
                </span>
              )}
              {shop.isDeliveryEnabled && (
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#F4512C]" />
                  Delivery within {Number(shop.deliveryRadiusKm)} km
                  {Number(shop.minOrderAmount) > 0 && ` · Min ₹${Number(shop.minOrderAmount)}`}
                </span>
              )}
            </div>

            {shop.description && (
              <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{shop.description}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Products section ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-5">

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search products..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category filter tabs */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
            <button
              onClick={() => setActiveCat(null)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                activeCat === null
                  ? "bg-[#F4512C] text-white border-[#F4512C]"
                  : "bg-white text-[#152744] border-border hover:border-[#F4512C]/50"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id === activeCat ? null : cat.id)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  activeCat === cat.id
                    ? "bg-[#F4512C] text-white border-[#F4512C]"
                    : "bg-white text-[#152744] border-border hover:border-[#F4512C]/50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-52 rounded-xl bg-[#F1F3F5] animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="No products found"
            description={search || activeCat ? "Try clearing the filters" : "This shop hasn't added products yet"}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onDifferentShop={handleDifferentShop}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Floating cart bar ────────────────────────────────────────────── */}
      {showFloatingCart && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
          <Link href="/checkout">
            <div className="flex items-center justify-between bg-[#152744] text-white rounded-xl px-4 py-3 shadow-2xl cursor-pointer hover:bg-[#1e3660] transition-colors">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-[#F4512C] rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs text-white/70 leading-none">
                    {itemCount} item{itemCount !== 1 ? "s" : ""} in cart
                  </p>
                  <p className="text-sm font-bold leading-snug">₹{subtotal.toFixed(0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-semibold">
                Checkout <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* ── Clear cart dialog ─────────────────────────────────────────────── */}
      <ConfirmDialog
        open={clearCartDialog}
        onOpenChange={setClearDialog}
        title="Start a new cart?"
        description="You have items from another shop. Starting fresh will remove those items."
        confirmLabel="Clear cart & continue"
        destructive
        onConfirm={handleClearAndContinue}
      />
    </div>
  );
}
