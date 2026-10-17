"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchPlans, archivePlan } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Pencil, Archive, Users } from "lucide-react";

export default function PlansManager() {
  const [plans,   setPlans]  = useState([]);
  const [loading, setLoading]= useState(true);
  const [archive, setArchive]= useState(null);

  const load = () => fetchPlans().then((r) => setPlans(r.data ?? [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleArchive = async () => {
    if (!archive) return;
    await archivePlan(archive.id);
    setArchive(null); load();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Subscription plans"
        description="Manage what shopkeepers are offered. Changes don't affect existing subscriptions."
        action={<Link href="/admin/plans/new"><Button size="sm"><Plus className="w-4 h-4 mr-1.5"/>New plan</Button></Link>}
      />

      {loading ? <TableSkeleton rows={3} /> : plans.length === 0 ? (
        <EmptyState title="No plans" description="Create your first subscription plan" action={<Link href="/admin/plans/new"><Button size="sm"><Plus className="w-4 h-4 mr-1"/>New plan</Button></Link>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.isActive ? "" : "opacity-60"}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-[#152744]">{plan.name}</p>
                    {plan.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{plan.description}</p>}
                  </div>
                  {!plan.isActive && <Badge variant="outline" className="text-xs text-gray-500">Archived</Badge>}
                </div>

                <p className="text-2xl font-bold text-[#152744]">
                  ₹{Number(plan.priceMonthly).toFixed(0)}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </p>

                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>Trial: {plan.trialDays} days</span>
                  <span>Grace: {plan.gracePeriodDays} days</span>
                  <span>Products: {plan.maxProducts ?? "Unlimited"}</span>
                  <span>Staff: {plan.maxStaff ?? "Unlimited"}</span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {plan._count?.subscriptions ?? 0} subscriptions
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/admin/plans/${plan.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1.5">
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </Link>
                  {plan.isActive && (
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-600"
                      onClick={() => setArchive(plan)}>
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!archive}
        onOpenChange={(o) => { if (!o) setArchive(null); }}
        title={`Archive "${archive?.name}"?`}
        description="Archived plans won't appear for new subscriptions. Existing subscriptions are unaffected."
        confirmLabel="Archive"
        destructive
        onConfirm={handleArchive}
      />
    </div>
  );
}
