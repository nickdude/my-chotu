"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPlan, updatePlan, fetchPlan } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const EMPTY = {
  name: "", description: "",
  priceMonthly: "0", billingPeriodDays: "30",
  trialDays: "30", gracePeriodDays: "7",
  maxProducts: "", maxOrdersPerMonth: "", maxStaff: "",
};

export default function PlanForm({ planId }) {
  const router  = useRouter();
  const isEdit  = !!planId;
  const [form,    setForm]    = useState(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!isEdit) return;
    fetchPlan(planId)
      .then((r) => {
        const p = r.data;
        setForm({
          name:              p.name ?? "",
          description:       p.description ?? "",
          priceMonthly:      String(Number(p.priceMonthly ?? 0)),
          billingPeriodDays: String(p.billingPeriodDays ?? 30),
          trialDays:         String(p.trialDays ?? 30),
          gracePeriodDays:   String(p.gracePeriodDays ?? 7),
          maxProducts:       p.maxProducts != null ? String(p.maxProducts) : "",
          maxOrdersPerMonth: p.maxOrdersPerMonth != null ? String(p.maxOrdersPerMonth) : "",
          maxStaff:          p.maxStaff != null ? String(p.maxStaff) : "",
        });
      })
      .finally(() => setLoading(false));
  }, [planId, isEdit]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    const body = {
      name:              form.name,
      description:       form.description || undefined,
      priceMonthly:      Number(form.priceMonthly),
      billingPeriodDays: Number(form.billingPeriodDays),
      trialDays:         Number(form.trialDays),
      gracePeriodDays:   Number(form.gracePeriodDays),
      maxProducts:       form.maxProducts ? Number(form.maxProducts) : null,
      maxOrdersPerMonth: form.maxOrdersPerMonth ? Number(form.maxOrdersPerMonth) : null,
      maxStaff:          form.maxStaff ? Number(form.maxStaff) : null,
    };
    try {
      if (isEdit) await updatePlan(planId, body);
      else        await createPlan(body);
      router.push("/admin/plans");
    } catch (err) {
      setError(err.message ?? "Failed to save plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageSkeleton />;

  const fields = [
    [
      { f: "name",        label: "Plan name *",         placeholder: "Starter" },
      { f: "description", label: "Description",          placeholder: "Perfect for small shops" },
    ],
    [
      { f: "priceMonthly",      label: "Monthly price (₹) *", type: "number", min: "0" },
      { f: "billingPeriodDays", label: "Billing period (days)", type: "number", min: "1" },
      { f: "trialDays",         label: "Free trial (days)",     type: "number", min: "0" },
      { f: "gracePeriodDays",   label: "Grace period (days)",   type: "number", min: "0" },
    ],
    [
      { f: "maxProducts",       label: "Max products (blank = unlimited)",   type: "number", min: "0" },
      { f: "maxOrdersPerMonth", label: "Max orders/month (blank = unlimited)", type: "number", min: "0" },
      { f: "maxStaff",          label: "Max staff (blank = unlimited)",      type: "number", min: "0" },
    ],
  ];

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/plans"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4"/></Button></Link>
        <h1 className="text-xl font-bold text-[#152744]">{isEdit ? "Edit plan" : "New plan"}</h1>
      </div>

      {isEdit && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          Editing a plan updates future subscriptions only. Existing subscribers keep their current terms.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { title: "Basic info", items: fields[0] },
          { title: "Billing",    items: fields[1] },
          { title: "Limits",     items: fields[2] },
        ].map(({ title, items }) => (
          <Card key={title}>
            <CardHeader className="pb-3"><CardTitle className="text-sm">{title}</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(({ f, label, placeholder, ...rest }) => (
                <div key={f} className="space-y-1.5">
                  <Label>{label}</Label>
                  <Input value={form[f]} onChange={set(f)} placeholder={placeholder} {...rest} />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEdit ? "Save changes" : "Create plan"}
          </Button>
          <Link href="/admin/plans"><Button type="button" variant="outline">Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
