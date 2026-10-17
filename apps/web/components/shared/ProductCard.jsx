"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { cn } from "@/lib/utils";

export function ProductCard({ product, onDifferentShop }) {
  const { cart, add, update, loading } = useCart();
  const [adding, setAdding] = useState(false);

  // Find the default/first variant
  const variant = product.variants?.[0];
  const isOutOfStock = !variant || !variant.isAvailable || variant.stockQty === 0;
  const isLowStock = variant && variant.stockQty > 0 && variant.stockQty <= variant.lowStockThreshold;

  // Check if this product is already in the cart
  const cartItem = cart?.items?.find((i) => i.variant?.id === variant?.id || i.variantId === variant?.id);
  const cartQty = cartItem?.qty ?? 0;

  const handleAdd = async () => {
    if (!variant) return;
    setAdding(true);
    const result = await add(variant.id, 1);
    if (!result.success && result.status === 409 && result.error?.includes("another shop")) {
      onDifferentShop?.();
    }
    setAdding(false);
  };

  const handleIncrement = () => update(cartItem.id, cartQty + 1);
  const handleDecrement = () => update(cartItem.id, cartQty - 1);

  const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;

  return (
    <div className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-[#F4512C]/30 transition-all duration-200">
      {/* Image */}
      <div className="relative h-40 bg-[#F1F3F5] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            🥬
          </div>
        )}
        {isLowStock && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-xs">
              Only {variant.stockQty} left
            </Badge>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-500">Out of stock</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#152744] line-clamp-2 leading-snug">
            {product.name}
          </p>
          {product.category && (
            <p className="text-xs text-muted-foreground mt-0.5">{product.category.name}</p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-bold text-[#152744]">
            ₹{Number(variant?.price ?? 0).toFixed(0)}
          </span>

          {isOutOfStock ? (
            <Button variant="outline" size="sm" disabled className="text-xs">
              Unavailable
            </Button>
          ) : cartQty === 0 ? (
            <Button
              size="sm"
              className={cn("text-xs px-3", adding && "opacity-70")}
              onClick={handleAdd}
              disabled={adding || loading}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-1.5 bg-[#FFF0EB] rounded-lg px-1 py-0.5">
              <button
                onClick={handleDecrement}
                disabled={loading}
                className="w-6 h-6 rounded-md bg-white border border-[#F4512C]/30 flex items-center justify-center hover:bg-[#F4512C] hover:text-white transition-colors disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="text-sm font-semibold text-[#F4512C] w-5 text-center">{cartQty}</span>
              <button
                onClick={handleIncrement}
                disabled={loading || cartQty >= variant.stockQty}
                className="w-6 h-6 rounded-md bg-[#F4512C] text-white flex items-center justify-center hover:bg-[#d43d21] transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
