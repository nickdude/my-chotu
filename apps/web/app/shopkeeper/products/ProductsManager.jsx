"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchMyProducts, archiveProduct, adjustStock } from "@/lib/api/shopkeeper";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/LoadingSkeleton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Package } from "lucide-react";

export default function ProductsManager() {
  const [products, setProducts]       = useState([]);
  const [loading,  setLoading]        = useState(true);
  const [search,   setSearch]         = useState("");
  const [debSearch, setDebSearch]     = useState("");
  const [archiveTarget, setArchiveTarget] = useState(null);
  const [stockModal,    setStockModal]    = useState(null); // { productId, variantId, current }
  const [stockForm,     setStockForm]     = useState({ type: "ADJUSTMENT_ADD", qty: "", reason: "" });
  const [saving,        setSaving]        = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMyProducts({ search: debSearch || undefined, limit: 100 });
      setProducts(res.data ?? []);
    } finally {
      setLoading(false);
    }
  }, [debSearch]);

  useEffect(() => { load(); }, [load]);

  const handleArchive = async () => {
    if (!archiveTarget) return;
    await archiveProduct(archiveTarget);
    setArchiveTarget(null);
    load();
  };

  const handleStockSave = async () => {
    if (!stockModal || !stockForm.qty) return;
    setSaving(true);
    try {
      await adjustStock(stockModal.productId, {
        type:   stockForm.type,
        qty:    Number(stockForm.qty),
        reason: stockForm.reason || undefined,
      });
      setStockModal(null);
      setStockForm({ type: "ADJUSTMENT_ADD", qty: "", reason: "" });
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Products"
        description="Manage your catalogue and stock levels"
        action={
          <Link href="/shopkeeper/products/new">
            <Button size="sm"><Plus className="w-4 h-4 mr-1.5" /> Add product</Button>
          </Link>
        }
      />

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input placeholder="Search products..." className="pl-9"
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <TableSkeleton rows={5} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start selling"
          action={<Link href="/shopkeeper/products/new"><Button size="sm"><Plus className="w-4 h-4 mr-1" />Add product</Button></Link>}
        />
      ) : (
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F1F3F5] hover:bg-[#F1F3F5]">
                <TableHead className="text-xs font-semibold text-[#152744]">Product</TableHead>
                <TableHead className="text-xs font-semibold text-[#152744] hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-xs font-semibold text-[#152744]">Price</TableHead>
                <TableHead className="text-xs font-semibold text-[#152744]">Stock</TableHead>
                <TableHead className="text-xs font-semibold text-[#152744] hidden md:table-cell">Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const variant  = p.variants?.[0];
                const stock    = variant?.stockQty ?? 0;
                const lowStock = stock > 0 && stock <= (variant?.lowStockThreshold ?? 5);
                const outStock = stock === 0;
                return (
                  <TableRow key={p.id} className="hover:bg-[#FFFDF9]">
                    <TableCell>
                      <p className="text-sm font-medium text-[#152744] truncate max-w-[180px]">{p.name}</p>
                      {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">{p.category?.name ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-semibold text-[#152744]">
                        ₹{Number(variant?.price ?? 0).toFixed(0)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setStockModal({ productId: p.id, current: stock })}
                        className="flex items-center gap-1.5 group"
                      >
                        <span className={`text-sm font-medium group-hover:underline ${outStock ? "text-red-600" : lowStock ? "text-orange-600" : "text-[#152744]"}`}>
                          {stock}
                        </span>
                        {outStock  && <Badge className="text-[10px] py-0 bg-red-100 text-red-700 border-red-200">Out</Badge>}
                        {lowStock  && <Badge className="text-[10px] py-0 bg-orange-100 text-orange-700 border-orange-200">Low</Badge>}
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={p.isActive ? "text-green-700 border-green-200 bg-green-50" : "text-gray-500"}>
                        {p.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 justify-end">
                        <Link href={`/shopkeeper/products/${p.id}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#152744]">
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600"
                          onClick={() => setArchiveTarget(p.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Archive confirm */}
      <ConfirmDialog
        open={!!archiveTarget}
        onOpenChange={(o) => { if (!o) setArchiveTarget(null); }}
        title="Archive product?"
        description="The product will be hidden from your storefront but not permanently deleted."
        confirmLabel="Archive"
        destructive
        onConfirm={handleArchive}
      />

      {/* Stock adjustment modal */}
      <Dialog open={!!stockModal} onOpenChange={(o) => { if (!o) setStockModal(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Adjust stock</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Current stock: <strong>{stockModal?.current ?? 0}</strong></p>
            <div className="space-y-1.5">
              <Label>Adjustment type</Label>
              <Select value={stockForm.type} onValueChange={(v) => setStockForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADJUSTMENT_ADD">Add stock</SelectItem>
                  <SelectItem value="ADJUSTMENT_REMOVE">Remove stock</SelectItem>
                  <SelectItem value="PURCHASE">Purchase / restock</SelectItem>
                  <SelectItem value="LOSS">Loss / damage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Quantity</Label>
              <Input type="number" min={1} placeholder="Enter qty"
                value={stockForm.qty} onChange={(e) => setStockForm((f) => ({ ...f, qty: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Reason (optional)</Label>
              <Input placeholder="e.g. Weekly restock"
                value={stockForm.reason} onChange={(e) => setStockForm((f) => ({ ...f, reason: e.target.value }))} />
            </div>
            <Button className="w-full" onClick={handleStockSave} disabled={saving || !stockForm.qty}>
              Save adjustment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
