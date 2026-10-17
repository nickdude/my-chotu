"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchShopOrders } from "@/lib/api/shopkeeper";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, RefreshCw } from "lucide-react";

const STATUS_TABS = [
  { value: "",               label: "All" },
  { value: "PENDING",        label: "Pending" },
  { value: "ACCEPTED",       label: "Accepted" },
  { value: "PREPARING",      label: "Preparing" },
  { value: "DELIVERED",      label: "Delivered" },
  { value: "CANCELLED",      label: "Cancelled" },
];

export default function ShopOrdersList() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchShopOrders({ status: status || undefined, limit: 50 });
      setOrders(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Orders"
        action={
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <Tabs value={status} onValueChange={setStatus}>
        <TabsList className="flex-wrap h-auto gap-1">
          {STATUS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} className="text-xs">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" description="Orders will appear here as customers place them" />
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/shopkeeper/orders/${order.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-border px-4 py-3 hover:border-[#F4512C]/40 hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-[#152744]">#{order.orderNumber}</span>
                  <StatusBadge status={order.status} />
                  {order.codCollection?.status === "COLLECTED" && (
                    <span className="text-xs text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full border border-green-200">COD collected</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {order.customer?.name} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-sm font-bold text-[#152744]">₹{Number(order.total).toFixed(0)}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#F4512C] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
