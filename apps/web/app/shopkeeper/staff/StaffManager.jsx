"use client";

import { useEffect, useState } from "react";
import { fetchStaff, addStaffMember, toggleStaffStatus } from "@/lib/api/delivery";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, UserCheck, UserX, Loader2 } from "lucide-react";

export default function StaffManager() {
  const [staff,   setStaff]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ phone: "", email: "", name: "" });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const load = () => {
    setLoading(true);
    fetchStaff().then((r) => setStaff(r.data ?? [])).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    try {
      await addStaffMember(form);
      setModal(false);
      setForm({ phone: "", email: "", name: "" });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    await toggleStaffStatus(id);
    load();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Delivery staff"
        description="Manage who can accept and complete deliveries for your shop"
        action={<Button size="sm" onClick={() => setModal(true)}><Plus className="w-4 h-4 mr-1.5" />Add staff</Button>}
      />

      {loading ? <TableSkeleton rows={3} /> : staff.length === 0 ? (
        <EmptyState
          title="No delivery staff yet"
          description="Add staff members who will handle deliveries for your shop"
          action={<Button size="sm" onClick={() => setModal(true)}><Plus className="w-4 h-4 mr-1" />Add staff</Button>}
        />
      ) : (
        <div className="space-y-2">
          {staff.map((m) => {
            const u = m.user;
            return (
              <div key={m.id}
                className="flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[#FFF0EB] text-[#F4512C] text-sm font-bold">
                    {u?.name?.[0]?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#152744] truncate">{u?.name}</p>
                  <p className="text-xs text-muted-foreground">{u?.phone ?? u?.email ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={m.isActive ? "text-green-700 border-green-200 bg-green-50" : "text-gray-500"}>
                    {m.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(m.id)}>
                    {m.isActive
                      ? <UserX className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500" />
                      : <UserCheck className="w-3.5 h-3.5 text-muted-foreground hover:text-green-600" />}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={modal} onOpenChange={setModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add delivery staff</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Enter the phone or email of the person. If they don&apos;t have an account, one will be created for them.
            </p>
            {[
              { f: "name",  label: "Full name",    placeholder: "Raju Kumar" },
              { f: "phone", label: "Mobile number", placeholder: "9876543210" },
              { f: "email", label: "Email",          placeholder: "raju@example.com" },
            ].map(({ f, label, placeholder }) => (
              <div key={f} className="space-y-1.5">
                <Label>{label}</Label>
                <Input value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))} placeholder={placeholder} />
              </div>
            ))}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={saving || (!form.phone && !form.email)}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Add staff
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
