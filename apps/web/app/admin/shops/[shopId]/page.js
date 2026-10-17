"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchAdminShop, updateShopStatus } from "@/lib/api/admin";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Store, Users, ShoppingBag, Package, CheckCircle, XCircle, PauseCircle } from "lucide-react";

export default function AdminShopDetailPage() {
  const { shopId } = useParams();
  const [shop,    setShop]   = useState(null);
  const [loading, setLoading]= useState(true);
  const [dialog,  setDialog] = useState(null);
  const [reason,  setReason] = useState("");

  const load = () => fetchAdminShop(shopId).then((r) => setShop(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [shopId]);

  const handleAction = async () => {
    if (!dialog) return;
    await updateShopStatus(shopId, { status: dialog.status, reason: reason||undefined });
    setDialog(null); setReason(""); load();
  };

  if (loading) return <PageSkeleton />;
  if (!shop)   return null;

  const activeSub = shop.subscriptions?.find((s) => ["TRIAL","ACTIVE","GRACE_PERIOD"].includes(s.status));

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/shops"><Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#152744]">{shop.name}</h1>
          <p className="text-sm text-muted-foreground">/{shop.slug}</p>
        </div>
        <StatusBadge status={shop.status} />
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        {shop.status === "PENDING"   && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={()=>setDialog({status:"APPROVED",label:"Approve shop"})}><CheckCircle className="w-4 h-4 mr-1"/>Approve</Button>}
        {shop.status === "PENDING"   && <Button size="sm" variant="destructive" onClick={()=>setDialog({status:"REJECTED",label:"Reject shop"})}><XCircle className="w-4 h-4 mr-1"/>Reject</Button>}
        {shop.status === "APPROVED"  && <Button size="sm" variant="outline" className="text-orange-600 border-orange-300" onClick={()=>setDialog({status:"SUSPENDED",label:"Suspend shop"})}><PauseCircle className="w-4 h-4 mr-1"/>Suspend</Button>}
        {shop.status === "SUSPENDED" && <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={()=>setDialog({status:"APPROVED",label:"Reactivate shop"})}><CheckCircle className="w-4 h-4 mr-1"/>Reactivate</Button>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Products",  value: shop._count?.products ?? 0, icon: Package },
          { label: "Orders",    value: shop._count?.orders   ?? 0, icon: ShoppingBag },
          { label: "Staff",     value: shop.memberships?.length ?? 0, icon: Users },
          { label: "Sub status",value: activeSub?.status ?? "None", icon: Store },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-3 text-center">
              <Icon className="w-5 h-5 text-[#F4512C] mx-auto mb-1" />
              <p className="text-lg font-bold text-[#152744]">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Shop info</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            ["Owner",    shop.owner?.name],
            ["Phone",    shop.owner?.phone ?? shop.phone ?? "—"],
            ["Email",    shop.owner?.email ?? shop.email ?? "—"],
            ["City",     shop.city ?? "—"],
            ["State",    shop.state ?? "—"],
            ["Category", shop.category?.name ?? "—"],
            ["Delivery radius", `${shop.deliveryRadiusKm ?? 0} km`],
            ["Min order", `₹${shop.minOrderAmount ?? 0}`],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-2">
              <span className="text-muted-foreground w-28 flex-shrink-0">{label}</span>
              <span className="font-medium text-[#152744] truncate">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {shop.subscriptions?.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Subscription history</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {shop.subscriptions.map((s) => (
              <div key={s.id} className="flex items-center gap-3 text-sm">
                <StatusBadge status={s.status} />
                <span className="text-muted-foreground">{s.plan?.name}</span>
                {s.trialEndsAt && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    Trial ends {new Date(s.trialEndsAt).toLocaleDateString("en-IN")}
                  </span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!dialog}
        onOpenChange={(o) => { if (!o) { setDialog(null); setReason(""); } }}
        title={dialog?.label}
        description={<div className="mt-2 space-y-1"><label className="text-xs text-muted-foreground">Reason (optional)</label><Input value={reason} onChange={(e)=>setReason(e.target.value)} placeholder="Reason…" /></div>}
        confirmLabel="Confirm"
        destructive={["SUSPENDED","REJECTED"].includes(dialog?.status)}
        onConfirm={handleAction}
      />
    </div>
  );
}
