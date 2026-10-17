"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchOrders } from "@/lib/api/orders";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ChevronRight, ShoppingBag } from "lucide-react";

export default function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.replace("/login"); return; }
    fetchOrders()
      .then((res) => setOrders(res.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <TableSkeleton rows={4} />;

  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Your orders will appear here once you place one"
        action={
          <Link href="/">
            <button className="text-sm text-[#F4512C] hover:underline">Browse shops</button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/orders/${order.id}`}
          className="flex items-center gap-4 bg-white rounded-xl border border-border p-4 hover:border-[#F4512C]/40 hover:shadow-sm transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-[#FFF0EB] flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 text-[#F4512C]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-[#152744]">#{order.orderNumber}</p>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {order.shop?.name} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-sm font-semibold text-[#152744]">₹{Number(order.total).toFixed(0)}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-[#F4512C] transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}
