"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchAssignment, updateAssignmentStatus,
  requestProofOtp, submitProof, recordCodCollection,
} from "@/lib/api/delivery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageSkeleton } from "@/components/shared/LoadingSkeleton";
import { ArrowLeft, MapPin, Phone, Package, IndianRupee, CheckCircle, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

const NEXT_STATUS = {
  ASSIGNED:         { label: "Accept delivery",     status: "ACCEPTED" },
  ACCEPTED:         { label: "Mark as picked up",   status: "PICKED_UP" },
  PICKED_UP:        { label: "Out for delivery",    status: "OUT_FOR_DELIVERY" },
  OUT_FOR_DELIVERY: null, // handled by proof-of-delivery flow
};

export default function AssignmentDetail({ id }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [updating,   setUpdating]   = useState(false);
  const [codModal,   setCodModal]   = useState(false);
  const [proofModal, setProofModal] = useState(false);
  const [otp,        setOtp]        = useState("");
  const [otpSent,    setOtpSent]    = useState(false);
  const [codAmount,  setCodAmount]  = useState("");
  const [error,      setError]      = useState("");

  const load = () =>
    fetchAssignment(id)
      .then((r) => setAssignment(r.data))
      .catch(() => router.replace("/delivery/assignments"))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [id]);

  const handleNextStatus = async () => {
    const next = NEXT_STATUS[assignment?.status];
    if (!next) return;
    setUpdating(true); setError("");
    try {
      const res = await updateAssignmentStatus(id, { status: next.status });
      setAssignment(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRequestOtp = async () => {
    setUpdating(true); setError("");
    try {
      await requestProofOtp(id);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!otp) return;
    setUpdating(true); setError("");
    try {
      const res = await submitProof(id, { proofType: "OTP", proofValue: otp });
      setAssignment(res.data);
      setProofModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCodCollect = async () => {
    if (!codAmount) return;
    setUpdating(true); setError("");
    try {
      await recordCodCollection(id, Number(codAmount));
      await load();
      setCodModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading)    return <PageSkeleton />;
  if (!assignment) return null;

  const order   = assignment.order;
  const addr    = order?.deliveryAddressSnapshot;
  const cod     = assignment.codCollection;
  const isDone  = ["DELIVERED", "FAILED"].includes(assignment.status);
  const nextAction = NEXT_STATUS[assignment.status];

  const mapsUrl = addr?.lat && addr?.lng
    ? `https://maps.google.com/?q=${addr.lat},${addr.lng}`
    : addr ? `https://maps.google.com/?q=${encodeURIComponent([addr.line1, addr.city, addr.pincode].filter(Boolean).join(" "))}`
    : null;

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-center gap-2">
        <Link href="/delivery/assignments">
          <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold text-[#152744]">Order #{order?.orderNumber}</h1>
          <p className="text-xs text-muted-foreground">{order?.shop?.name}</p>
        </div>
        <Badge className={cn("text-xs border-0", isDone ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800")}>
          {assignment.status.replace(/_/g, " ")}
        </Badge>
      </div>

      {/* COD amount */}
      <div className="bg-[#152744] text-white rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-white/60">Amount to collect</p>
          <p className="text-2xl font-bold flex items-center gap-1">
            <IndianRupee className="w-5 h-5" />
            {Number(cod?.amountDue ?? order?.total ?? 0).toFixed(0)}
          </p>
        </div>
        {assignment.status === "DELIVERED" && cod?.status !== "COLLECTED" && (
          <Button size="sm" variant="secondary" onClick={() => setCodModal(true)}>
            Record collection
          </Button>
        )}
        {cod?.status === "COLLECTED" && (
          <Badge className="bg-green-400 text-green-900 border-0">Collected</Badge>
        )}
      </div>

      {/* Delivery address */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#F4512C]" /> Delivery address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm font-medium text-[#152744]">{order?.customerNameSnapshot}</p>
          <p className="text-sm text-muted-foreground">
            {addr ? [addr.line1, addr.line2, addr.city, addr.pincode].filter(Boolean).join(", ") : "No address"}
          </p>
          {order?.customerPhoneSnapshot && (
            <a href={`tel:${order.customerPhoneSnapshot}`}
              className="flex items-center gap-1.5 text-sm text-[#F4512C] hover:underline">
              <Phone className="w-3.5 h-3.5" />{order.customerPhoneSnapshot}
            </a>
          )}
          {mapsUrl && (
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="mt-1 gap-1.5 text-[#152744] border-[#152744] hover:bg-[#152744] hover:text-white">
                <Navigation className="w-3.5 h-3.5" /> Open in Maps
              </Button>
            </a>
          )}
        </CardContent>
      </Card>

      {/* Order items */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Package className="w-4 h-4 text-[#F4512C]" /> Items
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {order?.items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-[#152744]">{item.productNameSnapshot} ×{item.qty}</span>
              <span className="font-medium">₹{Number(item.total ?? item.unitPrice * item.qty).toFixed(0)}</span>
            </div>
          ))}
          <Separator />
          <div className="flex justify-between text-sm font-bold text-[#152744]">
            <span>Total</span><span>₹{Number(order?.total ?? 0).toFixed(0)}</span>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

      {/* Action buttons */}
      {!isDone && (
        <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-border space-y-2">
          {nextAction && (
            <Button className="w-full" size="lg" onClick={handleNextStatus} disabled={updating}>
              {nextAction.label}
            </Button>
          )}
          {assignment.status === "OUT_FOR_DELIVERY" && (
            <Button className="w-full" size="lg" onClick={() => setProofModal(true)}>
              <CheckCircle className="w-4 h-4 mr-2" /> Mark as delivered
            </Button>
          )}
        </div>
      )}

      {/* Proof of delivery modal */}
      {proofModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setProofModal(false)}>
          <div className="bg-white w-full rounded-t-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#152744]">Proof of delivery</h3>
            {!otpSent ? (
              <>
                <p className="text-sm text-muted-foreground">Send an OTP to the customer to confirm delivery.</p>
                <Button className="w-full" onClick={handleRequestOtp} disabled={updating}>
                  Send OTP to customer
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Enter the 6-digit OTP received by the customer.</p>
                <div className="space-y-1.5">
                  <Label>OTP</Label>
                  <Input
                    placeholder="Enter OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <Button className="w-full" onClick={handleSubmitProof} disabled={updating || otp.length < 6}>
                  Confirm delivery
                </Button>
              </>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
      )}

      {/* COD collection modal */}
      {codModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50" onClick={() => setCodModal(false)}>
          <div className="bg-white w-full rounded-t-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#152744]">Record COD collection</h3>
            <p className="text-sm text-muted-foreground">
              Amount due: <strong>₹{Number(cod?.amountDue ?? 0).toFixed(0)}</strong>
            </p>
            <div className="space-y-1.5">
              <Label>Amount collected (₹)</Label>
              <Input
                type="number"
                placeholder={String(Number(cod?.amountDue ?? 0).toFixed(0))}
                value={codAmount}
                onChange={(e) => setCodAmount(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleCodCollect} disabled={updating || !codAmount}>
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
