"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchAssignmentHistory } from "@/lib/api/delivery";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

export default function DeliveryHistoryPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    fetchAssignmentHistory()
      .then((r) => setAssignments(r.data?.assignments ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-bold text-[#152744]">Delivery history</h1>
      {loading ? <TableSkeleton rows={4} /> : assignments.length === 0 ? (
        <EmptyState title="No completed deliveries" description="Your delivery history will appear here" />
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const order = a.order;
            const done  = a.status === "DELIVERED";
            return (
              <Link key={a.id} href={`/delivery/assignments/${a.id}`}
                className="flex items-center gap-3 bg-white rounded-xl border border-border p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100" : "bg-red-100"}`}>
                  {done
                    ? <CheckCircle className="w-4 h-4 text-green-600" />
                    : <XCircle    className="w-4 h-4 text-red-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#152744]">#{order?.orderNumber}</p>
                  <p className="text-xs text-muted-foreground truncate">{order?.shop?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.deliveredAt ? new Date(a.deliveredAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "—"}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#152744] flex-shrink-0">
                  ₹{Number(order?.total ?? 0).toFixed(0)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
