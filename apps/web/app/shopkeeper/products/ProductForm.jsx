"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProduct, updateProduct, fetchMyProduct } from "@/lib/api/shopkeeper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { ArrowLeft, Loader2 } from "lucide-react";

const EMPTY = {
  name: "", description: "", sku: "",
  price: "", costPrice: "", taxRate: "0",
  stockQty: "0", lowStockThreshold: "5",
};

export default function ProductForm({ productId }) {
  const router  = useRouter();
  const isEdit  = !!productId;
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!isEdit) return;
    fetchMyProduct(productId)
      .then((r) => {
        const p = r.data;
        const v = p.variants?.[0] ?? {};
        setForm({
          name:              p.name ?? "",
          description:       p.description ?? "",
          sku:               p.sku ?? "",
          price:             String(Number(v.price ?? 0)),
          costPrice:         v.costPrice ? String(Number(v.costPrice)) : "",
          taxRate:           String(Number(v.taxRate ?? 0)),
          stockQty:          String(v.stockQty ?? 0),
          lowStockThreshold: String(v.lowStockThreshold ?? 5),
        });
      })
      .finally(() => setLoading(false));
  }, [productId, isEdit]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    const body = {
      name:              form.name,
      description:       form.description || undefined,
      sku:               form.sku || undefined,
      price:             Number(form.price),
      costPrice:         form.costPrice ? Number(form.costPrice) : undefined,
      taxRate:           Number(form.taxRate),
      stockQty:          Number(form.stockQty),
      lowStockThreshold: Number(form.lowStockThreshold),
    };
    try {
      if (isEdit) { await updateProduct(productId, body); }
      else        { await createProduct(body); }
      router.push("/shopkeeper/products");
    } catch (err) {
      setError(err.message ?? "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton />;

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/shopkeeper/products">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-xl font-bold text-[#152744]">{isEdit ? "Edit product" : "Add product"}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Product details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={set("name")} placeholder="Tata Salt 1kg" required />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={set("description")} placeholder="Short product description..." />
            </div>
            <div className="space-y-1.5">
              <Label>SKU / barcode</Label>
              <Input value={form.sku} onChange={set("sku")} placeholder="Optional identifier" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Pricing & stock</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {[
              { f: "price",             label: "Selling price (₹) *", type: "number", min: "0" },
              { f: "costPrice",         label: "Cost price (₹)",      type: "number", min: "0" },
              { f: "taxRate",           label: "Tax rate (%)",         type: "number", min: "0", max: "100" },
              { f: "stockQty",          label: "Stock qty",            type: "number", min: "0" },
              { f: "lowStockThreshold", label: "Low stock alert",      type: "number", min: "0" },
            ].map(({ f, label, ...props }) => (
              <div key={f} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={form[f]} onChange={set(f)} {...props} />
              </div>
            ))}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Save changes" : "Add product"}
          </Button>
          <Link href="/shopkeeper/products">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
