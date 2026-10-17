"use client";

import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import { fetchMyShop } from "@/lib/api/shopkeeper";
import { PageHeader } from "@/components/shared/PageHeader";
import { CardSkeleton } from "@/components/shared/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Download, Printer, MessageCircle, Link2, Check,
  ExternalLink, QrCode, Info,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const BRAND = { dark: "#152744", light: "#FFFDF9" };

const CAMPAIGNS = [
  { id: "qr",        label: "QR code",        suffix: "?ref=qr" },
  { id: "whatsapp",  label: "WhatsApp",        suffix: "?ref=whatsapp" },
  { id: "print",     label: "Print/flyer",     suffix: "?ref=print" },
  { id: "base",      label: "Base URL",        suffix: "" },
];

export default function QRManager() {
  const [shopData,   setShopData]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [qrDataUrl,  setQrDataUrl]  = useState("");
  const [campaign,   setCampaign]   = useState("qr");
  const [copied,     setCopied]     = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    fetchMyShop()
      .then((r) => setShopData(r.data))
      .finally(() => setLoading(false));
  }, []);

  const activeUrl = shopData
    ? `${shopData.storefrontUrl}${CAMPAIGNS.find((c) => c.id === campaign)?.suffix ?? ""}`
    : "";

  // Regenerate QR whenever the URL changes
  useEffect(() => {
    if (!activeUrl) return;
    QRCode.toDataURL(activeUrl, {
      width: 400, margin: 2,
      color: { dark: BRAND.dark, light: BRAND.light },
      errorCorrectionLevel: "H",
    }).then(setQrDataUrl).catch(console.error);
  }, [activeUrl]);

  if (loading) return <CardSkeleton />;
  if (!shopData) return null;

  const shop = shopData.shop;

  const downloadPng = async () => {
    const dataUrl = await QRCode.toDataURL(activeUrl, {
      width: 1200, margin: 3,
      color: { dark: BRAND.dark, light: BRAND.light },
      errorCorrectionLevel: "H",
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${shop.slug}-qr.png`;
    a.click();
  };

  const downloadSvg = async () => {
    const svgStr = await QRCode.toString(activeUrl, {
      type: "svg", width: 500, margin: 2,
      color: { dark: BRAND.dark, light: BRAND.light },
      errorCorrectionLevel: "H",
    });
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${shop.slug}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Order from ${shop.name} online!\n${activeUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const handlePrint = () => window.print();

  return (
    <>
      {/* ── Print-only layout ─────────────────────────────────────────── */}
      <div ref={printRef} className="hidden print:flex print:flex-col print:min-h-screen print:items-center print:justify-center print:p-8 print:bg-white">
        <div className="text-center max-w-xs mx-auto space-y-6">
          {/* Branding */}
          <Logo size="lg" className="justify-center" />

          {/* QR Code */}
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="Shop QR Code"
              className="w-64 h-64 mx-auto"
              style={{ imageRendering: "pixelated" }}
            />
          )}

          {/* Shop name */}
          <div>
            <h1 className="text-2xl font-bold" style={{ color: BRAND.dark }}>{shop.name}</h1>
            {shop.category && <p className="text-sm text-gray-500 mt-1">{shop.category.name}</p>}
          </div>

          <Separator />

          {/* Instructions */}
          <div className="text-left space-y-2">
            <p className="text-sm font-semibold" style={{ color: BRAND.dark }}>How to order:</p>
            {[
              "Scan the QR code with your phone camera",
              "Browse products and add to cart",
              "Checkout with Cash on Delivery",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#F4512C] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600">{step}</p>
              </div>
            ))}
          </div>

          <Separator />

          <div className="text-center">
            <p className="text-xs text-gray-400">Powered by</p>
            <p className="text-sm font-semibold" style={{ color: BRAND.dark }}>My Chotu</p>
            <p className="text-xs text-gray-400">Your neighbourhood. Just a tap away.</p>
          </div>
        </div>
      </div>

      {/* ── Screen layout ──────────────────────────────────────────────── */}
      <div className="print:hidden space-y-6">
        <PageHeader
          title="QR Code"
          description="Share your shop's QR code with customers to let them order directly."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* QR display */}
          <Card className="lg:col-span-1 flex flex-col items-center">
            <CardContent className="pt-6 flex flex-col items-center gap-4 w-full">
              {qrDataUrl ? (
                <div className="rounded-2xl border-4 border-[#152744] overflow-hidden p-3 bg-[#FFFDF9]">
                  <img
                    src={qrDataUrl}
                    alt="Shop QR code"
                    className="w-48 h-48 sm:w-56 sm:h-56"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              ) : (
                <div className="w-56 h-56 rounded-2xl bg-[#F1F3F5] animate-pulse" />
              )}

              <div className="text-center">
                <p className="text-sm font-semibold text-[#152744]">{shop.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 break-all">{activeUrl}</p>
              </div>

              {/* Copy link */}
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={copyLink}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Link2 className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </CardContent>
          </Card>

          {/* Actions + campaign */}
          <div className="lg:col-span-2 space-y-5">

            {/* Campaign selector */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#F4512C]" />
                  Campaign URL
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Generate different URLs to track where customers come from.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {CAMPAIGNS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCampaign(c.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        campaign === c.id
                          ? "border-[#F4512C] bg-[#FFF0EB]"
                          : "border-border hover:border-[#F4512C]/50"
                      }`}
                    >
                      <p className="text-xs font-semibold text-[#152744]">{c.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                        {`/shop/${shop.slug}${c.suffix}`}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Download + share actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Download & share</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Download,
                    label: "Download PNG",
                    sub: "High-res · Best for print",
                    action: downloadPng,
                    accent: false,
                  },
                  {
                    icon: Download,
                    label: "Download SVG",
                    sub: "Vector · Scales infinitely",
                    action: downloadSvg,
                    accent: false,
                  },
                  {
                    icon: Printer,
                    label: "Print / PDF",
                    sub: "A4 sheet with instructions",
                    action: handlePrint,
                    accent: false,
                  },
                  {
                    icon: MessageCircle,
                    label: "Share on WhatsApp",
                    sub: "Send to customers directly",
                    action: shareWhatsApp,
                    accent: true,
                  },
                ].map(({ icon: Icon, label, sub, action, accent }) => (
                  <button
                    key={label}
                    onClick={action}
                    className={`p-4 rounded-xl border text-left transition-all hover:shadow-sm active:scale-[0.98] ${
                      accent
                        ? "border-green-200 bg-green-50 hover:border-green-400"
                        : "border-border hover:border-[#F4512C]/40 hover:bg-[#FFFDF9]"
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${accent ? "text-green-600" : "text-[#F4512C]"}`} />
                    <p className="text-xs font-semibold text-[#152744]">{label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Preview storefront link */}
            <a href={shopData.storefrontUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Preview your public storefront
              </Button>
            </a>

            {/* Tips */}
            <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Print the QR and place it at your shop counter, on packaging, or in your WhatsApp status.
                The URL never changes even if you update your shop name.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
