"use client";

import Link from "next/link";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/context/CartContext";
import { EmptyState } from "@/components/shared/EmptyState";

const DELIVERY_FEE = 30;
const FREE_DELIVERY_THRESHOLD = 500;

export function CartDrawer() {
  const { cart, drawerOpen, setDrawerOpen, update, remove, loading, itemCount, subtotal } = useCart();

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-[#152744]">
            <ShoppingBag className="w-5 h-5 text-[#F4512C]" />
            Your cart
            {itemCount > 0 && (
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!cart || cart.items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Add items from a shop to get started"
            />
          ) : (
            <div className="space-y-4">
              {/* Shop name */}
              {cart.shopId && (
                <p className="text-xs text-muted-foreground">
                  Items from <span className="font-medium text-[#152744]">{cart.items[0]?.variant?.product?.shopId ?? "your shop"}</span>
                </p>
              )}

              {cart.items.map((item) => {
                const name = item.variant?.product?.name ?? "Product";
                const variantName = item.variant?.name;
                const price = Number(item.priceSnapshot);
                const image = item.variant?.product?.images?.[0];

                return (
                  <div key={item.id} className="flex gap-3">
                    {/* Image */}
                    <div className="w-14 h-14 rounded-lg bg-[#F1F3F5] overflow-hidden flex-shrink-0">
                      {image ? (
                        <img src={image} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🛍️</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#152744] truncate">{name}</p>
                      {variantName && variantName !== "Default" && (
                        <p className="text-xs text-muted-foreground">{variantName}</p>
                      )}
                      <p className="text-sm font-semibold text-[#F4512C] mt-0.5">
                        ₹{(price * item.qty).toFixed(0)}
                      </p>
                    </div>

                    {/* Qty controls */}
                    <div className="flex flex-col items-end justify-between gap-1">
                      <button
                        onClick={() => remove(item.id)}
                        disabled={loading}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1.5 bg-[#FFF0EB] rounded-lg px-1 py-0.5">
                        <button
                          onClick={() => update(item.id, item.qty - 1)}
                          disabled={loading}
                          className="w-5 h-5 rounded bg-white border border-[#F4512C]/30 flex items-center justify-center hover:bg-[#F4512C] hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold text-[#F4512C] w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => update(item.id, item.qty + 1)}
                          disabled={loading}
                          className="w-5 h-5 rounded bg-[#F4512C] text-white flex items-center justify-center hover:bg-[#d43d21] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary + Checkout */}
        {cart && cart.items.length > 0 && (
          <div className="px-5 py-4 border-t border-border space-y-3 bg-white">
            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <p className="text-xs text-center text-muted-foreground bg-[#FFF0EB] rounded-lg py-2 px-3">
                Add ₹{(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(0)} more for free delivery
              </p>
            )}
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee</span>
                <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-[#152744]">
                <span>Total</span>
                <span>₹{total.toFixed(0)}</span>
              </div>
            </div>
            <Link href="/checkout" onClick={() => setDrawerOpen(false)}>
              <Button className="w-full gap-2">
                Proceed to checkout
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
