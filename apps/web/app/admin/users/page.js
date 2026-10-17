"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchAdminUsers, updateUserStatus } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserCheck, UserX } from "lucide-react";

const ROLES = ["", "SUPER_ADMIN", "SHOP_OWNER", "SHOP_MANAGER", "DELIVERY_STAFF", "CUSTOMER"];
const ROLE_BADGE = {
  SUPER_ADMIN:    "bg-purple-100 text-purple-800",
  SHOP_OWNER:     "bg-blue-100 text-blue-800",
  SHOP_MANAGER:   "bg-indigo-100 text-indigo-800",
  DELIVERY_STAFF: "bg-orange-100 text-orange-800",
  CUSTOMER:       "bg-gray-100 text-gray-700",
};

export default function UsersManager() {
  const [users,   setUsers]  = useState([]);
  const [loading, setLoading]= useState(true);
  const [search,  setSearch] = useState("");
  const [deb,     setDeb]    = useState("");
  const [role,    setRole]   = useState("");
  const [dialog,  setDialog] = useState(null); // { userId, isActive, name }

  useEffect(() => { const t = setTimeout(()=>setDeb(search),350); return ()=>clearTimeout(t); }, [search]);

  const load = useCallback(() => {
    setLoading(true);
    fetchAdminUsers({ search: deb||undefined, role: role||undefined, limit: 50 })
      .then((r) => setUsers(r.data ?? []))
      .finally(() => setLoading(false));
  }, [deb, role]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async () => {
    if (!dialog) return;
    await updateUserStatus(dialog.userId, { isActive: !dialog.isActive });
    setDialog(null); load();
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Users" description="View and manage all platform users" />

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="Search users…" className="pl-9" value={search} onChange={(e)=>setSearch(e.target.value)} />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All roles" /></SelectTrigger>
          <SelectContent>
            {ROLES.map((r) => <SelectItem key={r} value={r}>{r || "All roles"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <TableSkeleton rows={8} /> : users.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F1F3F5] hover:bg-[#F1F3F5]">
                {["Name","Contact","Role","Orders","Status",""].map((h) => (
                  <TableHead key={h} className="text-xs font-semibold text-[#152744]">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-[#FFFDF9]">
                  <TableCell>
                    <p className="text-sm font-medium text-[#152744] truncate max-w-[140px]">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-[#152744] truncate max-w-[150px]">{u.phone ?? u.email ?? "—"}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-xs border-0 ${ROLE_BADGE[u.role] ?? ""}`}>
                      {u.role.replace(/_/g," ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-muted-foreground">{u._count?.orders ?? 0}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={u.isActive ? "text-green-700 border-green-200 bg-green-50 text-xs" : "text-gray-500 text-xs"}>
                      {u.isActive ? "Active" : "Suspended"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" className="h-7 w-7"
                      onClick={() => setDialog({ userId: u.id, isActive: u.isActive, name: u.name })}>
                      {u.isActive
                        ? <UserX className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                        : <UserCheck className="w-3.5 h-3.5 text-muted-foreground hover:text-green-600" />}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!dialog}
        onOpenChange={(o) => { if (!o) setDialog(null); }}
        title={dialog?.isActive ? `Suspend ${dialog?.name}?` : `Reactivate ${dialog?.name}?`}
        description={dialog?.isActive ? "The user will be blocked from logging in." : "The user will be able to log in again."}
        confirmLabel={dialog?.isActive ? "Suspend" : "Reactivate"}
        destructive={dialog?.isActive}
        onConfirm={handleToggle}
      />
    </div>
  );
}
