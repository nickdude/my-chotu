"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchOverview } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, ShoppingBag, IndianRupee, TrendingUp, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub, icon: Icon, color = "orange" }) {
  const bg = { orange: "bg-[#FFF0EB]", navy: "bg-blue-50", green: "bg-green-50", red: "bg-red-50" };
  const fg = { orange: "text-[#F4512C]", navy: "text-blue-600", green: "text-green-600", red: "text-red-600" };
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground uppercase tracking-wide truncate">{label}</p>
            <p className="text-2xl font-bold text-[#152744] mt-1">{value ?? "—"}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", bg[color])}>
            <Icon className={cn("w-5 h-5", fg[color])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOverview() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverview()
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i=><CardSkeleton key={i}/>)}</div>
      <CardSkeleton /><CardSkeleton />
    </div>
  );
  if (!data) return null;

  const { shops = {}, users = {}, orders = {}, subscriptions = {}, recentShops = [], recentOrders = [] } = data;

  const totalShops    = Object.values(shops).reduce((a, b) => a + b, 0);
  const totalCustomers = users.CUSTOMER ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Platform overview" description={new Date().toLocaleDateString("en-IN", { dateStyle: "long" })} />

      {/* Primary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total shops"     value={totalShops}           sub={`${shops.APPROVED ?? 0} approved`}        icon={Store}       color="navy" />
        <StatCard label="Customers"       value={totalCustomers}        sub="registered"                               icon={Users}       color="orange" />
        <StatCard label="Orders today"    value={orders.today ?? 0}     sub={`₹${(orders.todayGmv ?? 0).toFixed(0)} GMV`} icon={ShoppingBag} color="green" />
        <StatCard label="Monthly GMV"     value={`₹${((orders.monthGmv ?? 0)/1000).toFixed(1)}k`} sub={`${orders.month ?? 0} orders`} icon={IndianRupee} color="orange" />
      </div>

      {/* Subscription stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active",       value: subscriptions.ACTIVE       ?? 0, color: "text-green-700 bg-green-50 border-green-200" },
          { label: "Trial",        value: subscriptions.TRIAL        ?? 0, color: "text-blue-700 bg-blue-50 border-blue-200" },
          { label: "Grace period", value: subscriptions.GRACE_PERIOD ?? 0, color: "text-orange-700 bg-orange-50 border-orange-200" },
          { label: "Expired",      value: (subscriptions.EXPIRED ?? 0) + (subscriptions.CANCELLED ?? 0), color: "text-red-700 bg-red-50 border-red-200" },
        ].map(({ label, value, color }) => (
          <div key={label} className={cn("rounded-xl border px-4 py-3 text-center", color)}>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent shops */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Recent shops</CardTitle>
            <Link href="/admin/shops" className="text-xs text-[#F4512C] hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentShops.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No shops yet</p>
            ) : recentShops.map((s) => (
              <Link key={s.id} href={`/admin/shops/${s.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#FFFDF9] group transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#F1F3F5] flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#152744] truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.category?.name ?? "—"}</p>
                </div>
                <StatusBadge status={s.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Recent orders</CardTitle>
            <Link href="/admin/orders" className="text-xs text-[#F4512C] hover:underline flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
            ) : recentOrders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 p-2 rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#152744]">#{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {o.customer?.name} → {o.shop?.name}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#152744] flex-shrink-0">
                  ₹{Number(o.total).toFixed(0)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Shop status breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F4512C]" /> Shop status breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Pending approval", value: shops.PENDING   ?? 0, href: "/admin/shops?status=PENDING",   badge: "PENDING" },
              { label: "Approved",         value: shops.APPROVED  ?? 0, href: "/admin/shops?status=APPROVED",  badge: "APPROVED" },
              { label: "Suspended",        value: shops.SUSPENDED ?? 0, href: "/admin/shops?status=SUSPENDED", badge: "SUSPENDED" },
              { label: "Rejected",         value: shops.REJECTED  ?? 0, href: "/admin/shops?status=REJECTED",  badge: "REJECTED" },
            ].map(({ label, value, href, badge }) => (
              <Link key={badge} href={href}
                className="p-3 rounded-xl border border-border hover:border-[#F4512C]/40 hover:bg-[#FFFDF9] transition-colors text-center group">
                <p className="text-xl font-bold text-[#152744]">{value}</p>
                <div className="flex justify-center mt-1.5"><StatusBadge status={badge} /></div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
