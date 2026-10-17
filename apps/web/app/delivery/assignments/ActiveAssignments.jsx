"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { fetchAssignments } from "@/lib/api/delivery";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, MapPin, ChevronRight, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS = {
  ASSIGNED:         "bg-yellow-100 text-yellow-800",
  ACCEPTED:         "bg-blue-100 text-blue-800",
  PICKED_UP:        "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-orange-100 text-orange-800",
};

export default function ActiveAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchAssignments()
      .then((r) => setAssignments(r.data ?? []))
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#152744]">Active deliveries</h1>
        <Button variant="ghost" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      {loading ? <TableSkeleton rows={3} /> : assignments.length === 0 ? (
        <EmptyState
          title="No active deliveries"
          description="New assignments will appear here"
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const order = a.order;
            const addr  = order?.deliveryAddressSnapshot;
            return (
              <Link key={a.id} href={`/delivery/assignments/${a.id}`}
                className="block bg-white rounded-xl border border-border p-4 hover:border-[#F4512C]/40 active:scale-[0.99] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn("text-xs border-0", STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-600")}>
                        {a.status.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{order?.orderNumber}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#152744] truncate">{order?.shop?.name}</p>
                    {addr && (
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {[addr.line1, addr.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#152744] flex items-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {Number(a.codCollection?.amountDue ?? order?.total ?? 0).toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">COD</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
