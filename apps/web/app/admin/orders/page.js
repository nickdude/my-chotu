"use client";

import { useEffect, useState, useCallback } from "react";
import { searchAdminOrders } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search } from "lucide-react";

const STATUS_TABS = [
  { value: "",           label: "All" },
  { value: "PENDING",    label: "Pending" },
  { value: "DELIVERED",  label: "Delivered" },
  { value: "CANCELLED",  label: "Cancelled" },
];

export default function AdminOrdersPage() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [deb,     setDeb]     = useState("");
  const [status,  setStatus]  = useState("");

  useEffect(() => { const t = setTimeout(()=>setDeb(search),350); return ()=>clearTimeout(t); }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    searchAdminOrders({ search: deb||undefined, status: status||undefined, limit: 50 })
      .then((r) => setOrders(r.data ?? []))
      .finally(() => setLoading(false));
  }, [deb, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <PageHeader title="Orders" description="Search and inspect all platform orders" />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Order #, customer, phone…" className="pl-9" value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
      </div>

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList>{STATUS_TABS.map((t) => <TabsTrigger key={t.value} value={t.value} className="text-xs">{t.label}</TabsTrigger>)}</TabsList>
      </Tabs>

      {loading ? <TableSkeleton rows={6} /> : orders.length === 0 ? (
        <EmptyState title="No orders found" />
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F1F3F5] hover:bg-[#F1F3F5]">
                {["Order #", "Customer", "Shop", "Total", "Status", "Date"].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-[#152744]">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} className="hover:bg-[#FFFDF9]">
                  <TableCell><span className="text-xs font-mono text-[#152744]">#{o.orderNumber}</span></TableCell>
                  <TableCell><span className="text-xs text-[#152744]">{o.customerNameSnapshot}</span></TableCell>
                  <TableCell><span className="text-xs text-[#152744] truncate block max-w-[120px]">{o.shop?.name}</span></TableCell>
                  <TableCell><span className="text-xs font-semibold text-[#152744]">₹{Number(o.total).toFixed(0)}</span></TableCell>
                  <TableCell><StatusBadge status={o.status} /></TableCell>
                  <TableCell><span className="text-xs text-muted-foreground">{new Date(o.placedAt).toLocaleDateString("en-IN")}</span></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
