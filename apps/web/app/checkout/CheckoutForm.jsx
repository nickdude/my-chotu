"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/EmptyState";
import { useCart } from "@/lib/context/CartContext";
import { fetchAddresses, addAddress } from "@/lib/api/addresses";
import { placeOrder } from "@/lib/api/orders";
import { MapPin, Plus, Loader2, CheckCircle, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

const DELIVERY_FEE = 30;
const FREE_DELIVERY_THRESHOLD = 500;

export default function CheckoutForm() {
  const router = useRouter();
  const { cart, subtotal, clear: clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", line1: "", city: "", state: "", pincode: "" });
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState(null);

  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }
    fetchAddresses()
      .then((res) => {
        const list = res.data ?? [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setSelectedAddressId(def.id);
        if (list.length === 0) setShowAddForm(true);
      })
      .catch(() => setShowAddForm(true));
  }, [router]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addAddress(newAddress);
      const saved = res.data;
      setAddresses((prev) => [...prev, saved]);
      setSelectedAddressId(saved.id);
      setShowAddForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { setError("Please select a delivery address"); return; }
    if (!cart?.shopId)       { setError("Your cart is empty"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await placeOrder({ shopId: cart.shopId, addressId: selectedAddressId, notes });
      setPlaced(res.data);
      clearCart();
    } catch (err) {
      setError(err.message ?? "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (placed) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
          <h2 className="text-2xl font-bold text-[#152744]">Order placed!</h2>
          <p className="text-muted-foreground">
            Your order <span className="font-semibold text-[#152744]">#{placed.orderNumber}</span> has been placed successfully.
          </p>
          <p className="text-sm text-muted-foreground">
            The shop will confirm your order shortly. You&apos;ll receive updates as it progresses.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Button onClick={() => router.push(`/orders/${placed.id}`)}>
              Track order
            </Button>
            <Button variant="outline" onClick={() => router.push("/")}>
              Continue shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <EmptyState
          title="Your cart is empty"
          description="Add items from a shop before checking out"
          action={<Button onClick={() => router.push("/")}>Browse shops</Button>}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#FFFDF9] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#152744] mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Address + notes */}
          <div className="lg:col-span-3 space-y-5">

            {/* Delivery address */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#F4512C]" />
                  Delivery address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      selectedAddressId === addr.id
                        ? "border-[#F4512C] bg-[#FFF0EB]"
                        : "border-border hover:border-[#F4512C]/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => setSelectedAddressId(addr.id)}
                      className="mt-0.5 accent-[#F4512C]"
                    />
                    <div>
                      <p className="text-sm font-medium text-[#152744]">{addr.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </label>
                ))}

                {!showAddForm && (
                  <button
                    type="button"
                    onClick={() => setShowAddForm(true)}
                    className="flex items-center gap-2 text-sm text-[#F4512C] hover:underline"
                  >
                    <Plus className="w-4 h-4" /> Add new address
                  </button>
                )}

                {showAddForm && (
                  <form onSubmit={handleAddAddress} className="space-y-3 pt-2 border-t border-border">
                    <p className="text-sm font-medium text-[#152744]">New address</p>
                    {[
                      { name: "label", label: "Label (Home / Work)", placeholder: "Home" },
                      { name: "line1", label: "Address line 1", placeholder: "123, MG Road" },
                      { name: "city",  label: "City",             placeholder: "Mumbai" },
                      { name: "state", label: "State",            placeholder: "Maharashtra" },
                      { name: "pincode", label: "Pincode",        placeholder: "400001" },
                    ].map(({ name, label, placeholder }) => (
                      <div key={name} className="space-y-1">
                        <Label htmlFor={name} className="text-xs">{label}</Label>
                        <Input
                          id={name}
                          value={newAddress[name]}
                          onChange={(e) => setNewAddress((p) => ({ ...p, [name]: e.target.value }))}
                          placeholder={placeholder}
                          required={name !== "line2"}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">Save address</Button>
                      {addresses.length > 0 && (
                        <Button type="button" size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
                          Cancel
                        </Button>
                      )}
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order notes (optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Any special instructions for the shop..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Payment method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[#F4512C]" />
                  Payment method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-[#F4512C] bg-[#FFF0EB]">
                  <input type="radio" checked readOnly className="accent-[#F4512C]" />
                  <div>
                    <p className="text-sm font-medium text-[#152744]">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Order summary */}
          <div className="lg:col-span-2">
            <Card className="sticky top-20">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-[#152744] truncate flex-1 pr-2">
                      {item.variant?.product?.name ?? item.variantId}
                      {item.qty > 1 && <span className="text-muted-foreground"> ×{item.qty}</span>}
                    </span>
                    <span className="font-medium text-[#152744] flex-shrink-0">
                      ₹{(Number(item.priceSnapshot) * item.qty).toFixed(0)}
                    </span>
                  </div>
                ))}

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery fee</span>
                    <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-[#152744] text-base">
                    <span>Total</span><span>₹{total.toFixed(0)}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
                )}

                <Button className="w-full" onClick={handlePlaceOrder} disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Place order · ₹{total.toFixed(0)}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order you agree to our terms of service.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
