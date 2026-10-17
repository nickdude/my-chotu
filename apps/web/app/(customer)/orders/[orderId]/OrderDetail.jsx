"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchOrder, cancelOrder } from "@/lib/api/orders";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { MapPin, Store, ArrowLeft, XCircle } from "lucide-react";

const CANCELLABLE = ["PENDING", "ACCEPTED", "PREPARING"];

const STATUS_TIMELINE = [
  { status: "PENDING",           label: "Order placed" },
  { status: "ACCEPTED",          label: "Accepted by shop" },
  { status: "PREPARING",         label: "Preparing" },
  { status: "DELIVERY_ASSIGNED", label: "Delivery assigned" },
  { status: "PICKED_UP",         label: "Picked up" },
  { status: "OUT_FOR_DELIVERY",  label: "Out for delivery" },
  { status: "DELIVERED",         label: "Delivered" },
];

export default function OrderDetail({ orderId }) {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.replace("/login"); return; }
    fetchOrder(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => router.replace("/orders"))
      .finally(() => setLoading(false));
  }, [orderId, router]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await cancelOrder(orderId, "Cancelled by customer");
      setOrder(res.data);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <PageSkeleton />;
  if (!order)  return null;

  const addr = order.deliveryAddressSnapshot;
  const canCancel = CANCELLABLE.includes(order.status);
  const currentStatusIdx = STATUS_TIMELINE.findIndex((s) => s.status === order.status);

  return (
    <div className="space-y-5">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link href="/orders">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#152744]">Order #{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Status timeline (only for non-terminal states) */}
      {order.status !== "CANCELLED" && order.status !== "REJECTED" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">Order progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {STATUS_TIMELINE.map(({ status, label }, idx) => {
                const done    = idx < currentStatusIdx || order.status === "DELIVERED";
                const current = idx === currentStatusIdx && order.status !== "DELIVERED";
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      done    ? "bg-green-500" :
                      current ? "bg-[#F4512C] ring-4 ring-[#FFF0EB]" :
                                "bg-[#E5E7EB]"
                    }`} />
                    <span className={`text-sm ${current ? "font-semibold text-[#152744]" : done ? "text-muted-foreground" : "text-[#E5E7EB]"}`}>
                      {label}
                    </span>
                    {current && <span className="text-xs text-[#F4512C] ml-auto animate-pulse">Current</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Store className="w-4 h-4 text-[#F4512C]" />
            {order.shop?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-[#152744]">
                {item.productNameSnapshot}
                {item.variantNameSnapshot && item.variantNameSnapshot !== "Default" && (
                  <span className="text-muted-foreground"> · {item.variantNameSnapshot}</span>
                )}
                <span className="text-muted-foreground"> ×{item.qty}</span>
              </span>
              <span className="font-medium">₹{Number(item.total).toFixed(0)}</span>
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
        </CardContent>
      </Card>

      {/* Delivery address */}
      {addr && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F4512C]" />
              Delivery address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-[#152744]">{order.customerNameSnapshot}</p>
            <p className="text-sm text-muted-foreground">
              {[addr.line1, addr.line2, addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cancel button */}
      {canCancel && (
        <Button
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => setCancelDialog(true)}
          disabled={cancelling}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Cancel order
        </Button>
      )}

      <ConfirmDialog
        open={cancelDialog}
        onOpenChange={setCancelDialog}
        title="Cancel this order?"
        description="This cannot be undone. Your cart items will be restored."
        confirmLabel="Yes, cancel"
        destructive
        onConfirm={handleCancel}
      />
    </div>
  );
}
