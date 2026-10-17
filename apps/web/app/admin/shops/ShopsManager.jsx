"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchAdminShops, updateShopStatus } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, ChevronRight, CheckCircle, XCircle, PauseCircle } from "lucide-react";

const STATUS_TABS = [
  { value: "",          label: "All" },
  { value: "PENDING",   label: "Pending" },
  { value: "APPROVED",  label: "Approved" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "REJECTED",  label: "Rejected" },
];

export default function ShopsManager() {
  const sp = useSearchParams();
  const [shops,  setShops]  = useState([]);
  const [loading,setLoading]= useState(true);
  const [search, setSearch] = useState("");
  const [deb,    setDeb]    = useState("");
  const [status, setStatus] = useState(sp.get("status") ?? "");
  const [action, setAction] = useState(null); // { shopId, status, label }
  const [reason, setReason] = useState("");

  useEffect(() => { const t = setTimeout(()=>setDeb(search), 350); return ()=>clearTimeout(t); }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminShops({ search: deb||undefined, status: status||undefined, limit: 50 })
      .then((r) => setShops(r.data ?? []))
      .finally(() => setLoading(false));
  }, [deb, status]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async () => {
    if (!action) return;
    await updateShopStatus(action.shopId, { status: action.status, reason: reason || undefined });
    setAction(null); setReason(""); load();
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Shops" description="Approve, suspend and manage all shops on the platform" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search shops…" className="pl-9" value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? <TableSkeleton rows={6} /> : shops.length === 0 ? (
        <EmptyState title="No shops found" />
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F1F3F5] hover:bg-[#F1F3F5]">
                <TableHead className="text-xs font-semibold text-[#152744]">Shop</TableHead>
                <TableHead className="text-xs font-semibold text-[#152744] hidden sm:table-cell">Owner</TableHead>
                <TableHead className="text-xs font-semibold text-[#152744]">Status</TableHead>
                <TableHead className="text-xs font-semibold text-[#152744] hidden md:table-cell">Subscription</TableHead>
                <TableHead className="text-xs font-semibold text-[#152744] hidden lg:table-cell">Created</TableHead>
                <TableHead className="w-28" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {shops.map((shop) => {
                const sub = shop.subscriptions?.[0];
                return (
                  <TableRow key={shop.id} className="hover:bg-[#FFFDF9]">
                    <TableCell>
                      <p className="text-sm font-medium text-[#152744] truncate max-w-[160px]">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">{shop.category?.name ?? "—"}</p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <p className="text-xs text-[#152744] truncate max-w-[130px]">{shop.owner?.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground truncate">{shop.owner?.phone ?? shop.owner?.email ?? "—"}</p>
                    </TableCell>
                    <TableCell><StatusBadge status={shop.status} /></TableCell>
                    <TableCell className="hidden md:table-cell">
                      {sub ? <StatusBadge status={sub.status} /> : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {new Date(shop.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        {shop.status === "PENDING" && (
                          <>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => setAction({ shopId: shop.id, status: "APPROVED", label: "Approve shop" })}>
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setAction({ shopId: shop.id, status: "REJECTED", label: "Reject shop" })}>
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {shop.status === "APPROVED" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-orange-500 hover:bg-orange-50"
                            onClick={() => setAction({ shopId: shop.id, status: "SUSPENDED", label: "Suspend shop" })}>
                            <PauseCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {shop.status === "SUSPENDED" && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600 hover:bg-green-50"
                            onClick={() => setAction({ shopId: shop.id, status: "APPROVED", label: "Reactivate shop" })}>
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Link href={`/admin/shops/${shop.id}`}>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-[#152744]">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!action}
        onOpenChange={(o) => { if (!o) { setAction(null); setReason(""); } }}
        title={action?.label}
        description={
          <div className="mt-2 space-y-2">
            <label className="text-sm text-muted-foreground">Reason (optional)</label>
            <Input placeholder="Reason for this action…" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
        }
        confirmLabel="Confirm"
        destructive={action?.status === "SUSPENDED" || action?.status === "REJECTED"}
        onConfirm={handleAction}
      />
    </div>
  );
}
