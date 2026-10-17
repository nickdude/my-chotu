"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAuditLogs } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ENTITIES = ["", "Shop", "User", "SubscriptionPlan", "PlatformSetting", "Order"];

const ACTION_COLORS = {
  CREATED:      "bg-green-100 text-green-800",
  UPDATED:      "bg-blue-100 text-blue-800",
  ARCHIVED:     "bg-gray-100 text-gray-700",
  STATUS_APPROVED:  "bg-green-100 text-green-800",
  STATUS_SUSPENDED: "bg-orange-100 text-orange-800",
  STATUS_REJECTED:  "bg-red-100 text-red-800",
  ACTIVATED:    "bg-green-100 text-green-800",
  SUSPENDED:    "bg-orange-100 text-orange-800",
};

export default function AuditLogsPage() {
  const [logs,    setLogs]   = useState([]);
  const [meta,    setMeta]   = useState(null);
  const [loading, setLoading]= useState(true);
  const [entity,  setEntity] = useState("");
  const [page,    setPage]   = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    fetchAuditLogs({ entity: entity||undefined, page, limit: 20 })
      .then((r) => { setLogs(r.data?.logs ?? []); setMeta(r.data?.meta ?? null); })
      .finally(() => setLoading(false));
  }, [entity, page]);

  useEffect(() => { setPage(1); }, [entity]);
  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <PageHeader title="Audit logs" description="Track all significant admin and system actions" />

      <Select value={entity} onValueChange={setEntity}>
        <SelectTrigger className="w-48"><SelectValue placeholder="All entities" /></SelectTrigger>
        <SelectContent>
          {ENTITIES.map((e) => <SelectItem key={e} value={e}>{e || "All entities"}</SelectItem>)}
        </SelectContent>
      </Select>

      {loading ? <TableSkeleton rows={8} /> : logs.length === 0 ? (
        <EmptyState title="No audit logs found" />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 bg-white rounded-xl border border-border px-4 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-[#152744] font-semibold">{log.entity}</span>
                  <Badge variant="outline" className={`text-[10px] border-0 ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                    {log.action}
                  </Badge>
                  {log.entityId && (
                    <span className="text-[10px] text-muted-foreground font-mono truncate max-w-[120px]">{log.entityId}</span>
                  )}
                </div>
                {log.actor && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by <span className="font-medium text-[#152744]">{log.actor.name}</span> ({log.actor.role})
                  </p>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0 whitespace-nowrap">
                {new Date(log.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
              </span>
            </div>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {meta.page} of {meta.totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p-1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(meta.totalPages, p+1))} disabled={page === meta.totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
