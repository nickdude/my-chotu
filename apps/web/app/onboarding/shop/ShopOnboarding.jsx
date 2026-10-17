"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Store, MapPin, Clock, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { registerShop } from "@/lib/api/shopkeeper";
import { cn } from "@/lib/utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STEPS = [
  { id: 1, label: "Shop basics",  icon: Store },
  { id: 2, label: "Location",     icon: MapPin },
  { id: 3, label: "Hours",        icon: Clock },
];

const defaultHours = DAYS.map((_, i) => ({
  dayOfWeek: i,
  openTime: "09:00",
  closeTime: "21:00",
  isClosed: i === 0,
}));

export default function ShopOnboarding() {
  const router = useRouter();
  const [step, setStep]   = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone]   = useState(false);

  const [basics, setBasics] = useState({ name: "", description: "", phone: "", email: "" });
  const [location, setLocation] = useState({
    addressLine: "", city: "", state: "", pincode: "",
    deliveryRadiusKm: 5, minOrderAmount: 0,
    isDeliveryEnabled: true, isPickupEnabled: true,
  });
  const [hours, setHours] = useState(defaultHours);

  const setB = (f) => (e) => setBasics((p) => ({ ...p, [f]: e.target.value }));
  const setL = (f) => (e) => setLocation((p) => ({ ...p, [f]: e.target.value }));

  const toggleDay = (i) =>
    setHours((h) => h.map((d, idx) => idx === i ? { ...d, isClosed: !d.isClosed } : d));
  const setTime = (i, field, val) =>
    setHours((h) => h.map((d, idx) => idx === i ? { ...d, [field]: val } : d));

  const submit = async () => {
    if (!localStorage.getItem("token")) { router.replace("/login"); return; }
    setError(""); setLoading(true);
    try {
      await registerShop({
        ...basics,
        ...location,
        deliveryRadiusKm: Number(location.deliveryRadiusKm),
        minOrderAmount:   Number(location.minOrderAmount),
        hours,
      });
      setDone(true);
    } catch (err) {
      setError(err.message ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-md w-full text-center space-y-5 py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold text-[#152744]">Shop registered!</h2>
        <p className="text-muted-foreground">
          Your shop is live. You have a 30-day free trial to explore all features.
        </p>
        <div className="flex flex-col gap-2 w-full">
          <Button onClick={() => router.push("/shopkeeper/qr")} className="w-full">
            Get my QR code
          </Button>
          <Button variant="outline" onClick={() => router.push("/shopkeeper/dashboard")} className="w-full">
            Go to dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      {/* Progress steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const active = step === s.id;
          const done   = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                active ? "bg-[#F4512C] text-white" :
                done   ? "bg-green-100 text-green-700" :
                         "bg-[#F1F3F5] text-muted-foreground"
              )}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          );
        })}
      </div>

      <Card className="shadow-lg">
        {/* Step 1 — Basics */}
        {step === 1 && (
          <>
            <CardHeader>
              <CardTitle className="text-[#152744]">Tell us about your shop</CardTitle>
              <CardDescription>This is what customers will see on your storefront.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { field: "name",        label: "Shop name *",       placeholder: "Sharma Kirana Store" },
                { field: "description", label: "Description",        placeholder: "Fresh groceries, dairy and more..." },
                { field: "phone",       label: "Shop phone",         placeholder: "9876543210" },
                { field: "email",       label: "Shop email",         placeholder: "shop@example.com" },
              ].map(({ field, label, placeholder }) => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={field}>{label}</Label>
                  <Input id={field} value={basics[field]} onChange={setB(field)} placeholder={placeholder} />
                </div>
              ))}
            </CardContent>
          </>
        )}

        {/* Step 2 — Location */}
        {step === 2 && (
          <>
            <CardHeader>
              <CardTitle className="text-[#152744]">Where is your shop?</CardTitle>
              <CardDescription>Customers use this to find you and estimate delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { field: "addressLine", label: "Address",     placeholder: "12, MG Road" },
                { field: "city",        label: "City *",      placeholder: "Mumbai" },
                { field: "state",       label: "State *",     placeholder: "Maharashtra" },
                { field: "pincode",     label: "Pincode *",   placeholder: "400001" },
              ].map(({ field, label, placeholder }) => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={field}>{label}</Label>
                  <Input id={field} value={location[field]} onChange={setL(field)} placeholder={placeholder} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Delivery radius (km)</Label>
                  <Input type="number" min={1} max={50} value={location.deliveryRadiusKm}
                    onChange={(e) => setLocation((p) => ({ ...p, deliveryRadiusKm: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Min. order (₹)</Label>
                  <Input type="number" min={0} value={location.minOrderAmount}
                    onChange={(e) => setLocation((p) => ({ ...p, minOrderAmount: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-4">
                {[
                  { field: "isDeliveryEnabled", label: "Delivery" },
                  { field: "isPickupEnabled",   label: "Pickup" },
                ].map(({ field, label }) => (
                  <label key={field} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={location[field]} className="accent-[#F4512C]"
                      onChange={(e) => setLocation((p) => ({ ...p, [field]: e.target.checked }))} />
                    <span className="text-sm">{label} enabled</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </>
        )}

        {/* Step 3 — Hours */}
        {step === 3 && (
          <>
            <CardHeader>
              <CardTitle className="text-[#152744]">Operating hours</CardTitle>
              <CardDescription>Set when your shop is open. You can change this anytime.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {hours.map((h, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-8 text-sm font-medium text-[#152744]">{DAYS[i]}</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={!h.isClosed} className="accent-[#F4512C]"
                      onChange={() => toggleDay(i)} />
                    <span className="text-xs text-muted-foreground">{h.isClosed ? "Closed" : "Open"}</span>
                  </label>
                  {!h.isClosed && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input type="time" value={h.openTime} onChange={(e) => setTime(i, "openTime", e.target.value)}
                        className="text-sm border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#F4512C]" />
                      <span className="text-muted-foreground text-xs">to</span>
                      <input type="time" value={h.closeTime} onChange={(e) => setTime(i, "closeTime", e.target.value)}
                        className="text-sm border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#F4512C]" />
                    </div>
                  )}
                </div>
              ))}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
              )}
            </CardContent>
          </>
        )}

        {/* Footer navigation */}
        <div className="flex items-center justify-between px-6 pb-6 pt-2 gap-3">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < 3 ? (
            <Button onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 && !basics.name.trim()}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Register shop
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
