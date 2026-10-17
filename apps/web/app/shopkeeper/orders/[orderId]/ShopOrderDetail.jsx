"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchShopOrder, updateOrderStatus } from "@/lib/api/shopkeeper";
import { fetchStaff, assignDelivery } from "@/lib/api/delivery";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, User, MapPin, MessageSquare, CheckCircle, XCircle, ChefHat, Truck } from "lucide-react";

const ACTION_MAP = {
  PENDING:    [
    { status: "ACCEPTED", label: "Accept order",  icon: CheckCircle, variant: "default" },
    { status: "REJECTED", label: "Reject order",  icon: XCircle,    variant: "destructive" },
  ],
  ACCEPTED:   [
    { status: "PREPARING", label: "Start preparing", icon: ChefHat, variant: "default" },
    { status: "CANCELLED", label: "Cancel",          icon: XCircle, variant: "destructive" },
  ],
  PREPARING:  [],
};

export default function ShopOrderDetail({ orderId }) {
  const router = useRouter();
  const [order,        setOrder]      = useState(null);
  const [loading,      setLoading]    = useState(true);
  const [dialog,       setDialog]     = useState(null);
  const [reason,       setReason]     = useState("");
  const [updating,     setUpdating]   = useState(false);
  const [assignModal,  setAssignModal] = useState(false);
  const [staffList,    setStaffList]   = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");

  useEffect(() => {
    fetchShopOrder(orderId)
      .then((r) => setOrder(r.data))
      .catch(() => router.replace("/shopkeeper/orders"))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  const handleAction = async () => {
    if (!dialog) return;
    setUpdating(true);
    try {
      const res = await updateOrderStatus(orderId, { status: dialog.status, reason });
      setOrder(res.data);
      setDialog(null);
      setReason("");
    } finally {
      setUpdating(false);
    }
  };

  const openAssignModal = async () => {
    const res = await fetchStaff();
    setStaffList((res.data ?? []).filter((m) => m.isActive));
    setAssignModal(true);
  };

  const handleAssign = async () => {
    if (!selectedStaff) return;
    setUpdating(true);
    try {
      await assignDelivery(orderId, selectedStaff);
      const res = await fetchShopOrder(orderId);
      setOrder(res.data);
      setAssignModal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageSkeleton />;
  if (!order)  return null;

  const actions = ACTION_MAP[order.status] ?? [];
  const addr    = order.deliveryAddressSnapshot;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/shopkeeper/orders">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#152744]">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Quick action buttons */}
      {(actions.length > 0 || order.status === "PREPARING") && (
        <div className="flex gap-2 flex-wrap">
          {actions.map(({ status, label, icon: Icon, variant }) => (
            <Button key={status} variant={variant} size="sm"
              onClick={() => setDialog({ status, label })} disabled={updating}>
              <Icon className="w-4 h-4 mr-1.5" />{label}
            </Button>
          ))}
          {order.status === "PREPARING" && !order.deliveryAssignment && (
            <Button size="sm" variant="outline" onClick={openAssignModal} disabled={updating}>
              <Truck className="w-4 h-4 mr-1.5" /> Assign delivery
            </Button>
          )}
        </div>
      )}

      {/* Customer */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="w-4 h-4 text-[#F4512C]" /> Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm font-medium text-[#152744]">{order.customerNameSnapshot}</p>
          {order.customerPhoneSnapshot && (
            <p className="text-sm text-muted-foreground">{order.customerPhoneSnapshot}</p>
          )}
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Order items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[#152744]">
                {item.productNameSnapshot}
                {item.variantNameSnapshot && item.variantNameSnapshot !== "Default" && (
                  <span className="text-muted-foreground"> · {item.variantNameSnapshot}</span>
                )}
                <span className="text-muted-foreground"> ×{item.qty}</span>
              </span>
              <span className="font-medium">₹{Number(item.total ?? item.unitPrice * item.qty).toFixed(0)}</span>
            </div>
          ))}
          <Separator />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className={order.deliveryFee == 0 ? "text-green-600" : ""}>
                {order.deliveryFee == 0 ? "FREE" : `₹${Number(order.deliveryFee).toFixed(0)}`}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-[#152744]">
              <span>Total</span><span>₹{Number(order.total).toFixed(0)}</span>
            </div>
          </div>
          {order.notes && (
            <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground bg-[#FFFDF9] rounded p-2">
              <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {order.notes}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery address */}
      {addr && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F4512C]" /> Delivery address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Status history */}
      {order.statusHistory?.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Order timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.statusHistory.map((h) => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-[#F4512C] mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-[#152744]">{h.toStatus.replace(/_/g, " ")}</span>
                  {h.reason && <span className="text-muted-foreground"> — {h.reason}</span>}
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Confirm dialog with reason */}
      <ConfirmDialog
        open={!!dialog}
        onOpenChange={(open) => { if (!open) { setDialog(null); setReason(""); } }}
        title={dialog?.label}
        description={
          <div className="mt-2 space-y-2">
            <Label className="text-sm">Reason (optional)</Label>
            <Input
              placeholder={dialog?.status === "REJECTED" ? "e.g. Item out of stock" : ""}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        }
        confirmLabel={dialog?.label}
        destructive={dialog?.status === "REJECTED" || dialog?.status === "CANCELLED"}
        onConfirm={handleAction}
      />

      {/* Assign delivery staff dialog */}
      <Dialog open={assignModal} onOpenChange={setAssignModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Assign delivery staff</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {staffList.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active delivery staff. Add staff from the Staff page.</p>
            ) : (
              <div className="space-y-2">
                {staffList.map((m) => (
                  <label key={m.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedStaff === m.user?.id ? "border-[#F4512C] bg-[#FFF0EB]" : "border-border hover:border-[#F4512C]/50"}`}>
                    <input type="radio" name="staff" value={m.user?.id}
                      checked={selectedStaff === m.user?.id}
                      onChange={() => setSelectedStaff(m.user?.id)}
                      className="accent-[#F4512C]" />
                    <div>
                      <p className="text-sm font-medium text-[#152744]">{m.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{m.user?.phone ?? m.user?.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <Button className="w-full" onClick={handleAssign} disabled={updating || !selectedStaff}>
              Assign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
