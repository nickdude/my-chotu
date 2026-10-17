"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { fetchAnalyticsSummary, fetchTopProducts, fetchShopOrders, fetchMyShop } from "@/lib/api/shopkeeper";
import { ShoppingBag, Package, TrendingUp, AlertTriangle, Clock, IndianRupee, ChevronRight } from "lucide-react";

function StatCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold text-[#152744] mt-1">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${accent ?? "bg-[#FFF0EB]"}`}>
            <Icon className={`w-5 h-5 ${accent ? "text-white" : "text-[#F4512C]"}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrialBanner({ subscription }) {
  if (!subscription || subscription.status === "ACTIVE") return null;
  const ends = subscription.trialEndsAt ? new Date(subscription.trialEndsAt) : null;
  const days = ends ? Math.max(0, Math.ceil((ends - Date.now()) / 86400000)) : 0;

  if (subscription.status === "EXPIRED" || subscription.status === "CANCELLED") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 font-medium">Your subscription has expired. Renew to accept new orders.</p>
        </div>
        <Button size="sm" variant="destructive">Renew</Button>
      </div>
    );
  }

  const urgent = days <= 5;
  return (
    <div className={`rounded-xl px-4 py-3 flex items-center justify-between gap-3 border ${urgent ? "bg-orange-50 border-orange-200" : "bg-blue-50 border-blue-200"}`}>
      <div className="flex items-center gap-2">
        <Clock className={`w-4 h-4 flex-shrink-0 ${urgent ? "text-orange-500" : "text-blue-500"}`} />
        <p className={`text-sm font-medium ${urgent ? "text-orange-700" : "text-blue-700"}`}>
          {days > 0 ? `Free trial: ${days} day${days !== 1 ? "s" : ""} remaining` : "Trial expires today"}
        </p>
      </div>
      <Badge variant="outline" className={urgent ? "border-orange-300 text-orange-700" : "border-blue-300 text-blue-700"}>
        Trial
      </Badge>
    </div>
  );
}

export default function DashboardHome() {
  const [summary, setSummary]   = useState(null);
  const [topProds, setTopProds] = useState([]);
  const [recentOrders, setRecent] = useState([]);
  const [subscription, setSub]  = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAnalyticsSummary(),
      fetchTopProducts(),
      fetchShopOrders({ limit: 5 }),
      fetchMyShop(),
    ])
      .then(([sum, top, orders, shop]) => {
        setSummary(sum.data);
        setTopProds(top.data ?? []);
        setRecent(orders.data ?? []);
        setSub(shop.data?.subscription ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
        </div>
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#152744]">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}
        </p>
      </div>

      <TrialBanner subscription={subscription} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's orders"  value={summary?.today?.orders ?? 0}  sub={`₹${summary?.today?.revenue?.toFixed(0) ?? 0} revenue`} icon={ShoppingBag} />
        <StatCard label="Pending"         value={summary?.pending ?? 0}         sub="Need your attention" icon={Clock} accent="bg-yellow-400" />
        <StatCard label="This month"      value={`₹${summary?.month?.revenue?.toFixed(0) ?? 0}`} sub={`${summary?.month?.orders ?? 0} orders`} icon={IndianRupee} />
        <StatCard label="Low stock"       value={summary?.lowStock ?? 0}        sub={`of ${summary?.products ?? 0} products`} icon={AlertTriangle} accent={summary?.lowStock > 0 ? "bg-red-500" : undefined} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent orders</CardTitle>
            <Link href="/shopkeeper/orders">
              <Button variant="ghost" size="sm" className="text-[#F4512C] hover:text-[#d43d21] -mr-2">
                View all <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No orders yet</p>
            ) : recentOrders.map((o) => (
              <Link key={o.id} href={`/shopkeeper/orders/${o.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#FFFDF9] transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#152744]">#{o.orderNumber}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {o.customer?.name} · {o.items?.length} item{o.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-[#152744]">₹{Number(o.total).toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.placedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#F4512C]" /> Top products
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topProds.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No sales data yet</p>
            ) : topProds.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#152744] truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.unitsSold} sold</p>
                </div>
                <span className="text-sm font-semibold text-[#152744] flex-shrink-0">
                  ₹{p.revenue.toFixed(0)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
