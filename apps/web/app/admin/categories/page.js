"use client";

import { useEffect, useState } from "react";
import { fetchAdminCategories, createCategory, updateCategory, toggleCategory } from "@/lib/api/admin";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, ToggleLeft, ToggleRight, Package } from "lucide-react";

export default function CategoriesPage() {
  const [cats,    setCats]   = useState([]);
  const [loading, setLoading]= useState(true);
  const [modal,   setModal]  = useState(null); // null | "new" | category object
  const [form,    setForm]   = useState({ name: "", sortOrder: "0" });
  const [saving,  setSaving] = useState(false);
  const [error,   setError]  = useState("");

  const load = () => fetchAdminCategories().then((r) => setCats(r.data ?? [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openNew  = () => { setForm({ name: "", sortOrder: "0" }); setError(""); setModal("new"); };
  const openEdit = (cat) => { setForm({ name: cat.name, sortOrder: String(cat.sortOrder ?? 0) }); setError(""); setModal(cat); };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(""); setSaving(true);
    const body = { name: form.name, sortOrder: Number(form.sortOrder) };
    try {
      if (modal === "new") await createCategory(body);
      else                 await updateCategory(modal.id, body);
      setModal(null); load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => { await toggleCategory(id); load(); };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Categories"
        description="Product categories shown on the storefront"
        action={<Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1.5"/>Add category</Button>}
      />

      {loading ? <TableSkeleton rows={6} /> : cats.length === 0 ? (
        <EmptyState title="No categories" action={<Button size="sm" onClick={openNew}><Plus className="w-4 h-4 mr-1"/>Add</Button>} />
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          {cats.map((cat, i) => (
            <div key={cat.id} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""} hover:bg-[#FFFDF9]`}>
              <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#152744]">{cat.name}</p>
                <p className="text-xs text-muted-foreground">
                  {cat._count?.products ?? 0} product{cat._count?.products !== 1 ? "s" : ""}
                  {cat.children?.length > 0 && ` · ${cat.children.length} subcategories`}
                </p>
              </div>
              <Badge variant="outline" className={cat.isActive ? "text-green-700 border-green-200 bg-green-50 text-xs" : "text-gray-500 text-xs"}>
                {cat.isActive ? "Active" : "Hidden"}
              </Badge>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(cat)}>
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleToggle(cat.id)}>
                  {cat.isActive
                    ? <ToggleRight className="w-4 h-4 text-green-600" />
                    : <ToggleLeft  className="w-4 h-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!modal} onOpenChange={(o) => { if (!o) setModal(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{modal === "new" ? "New category" : "Edit category"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSave} className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Groceries" required />
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input type="number" min="0" value={form.sortOrder} onChange={(e) => setForm((p) => ({ ...p, sortOrder: e.target.value }))} />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={saving || !form.name}>
              {modal === "new" ? "Create" : "Save"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
