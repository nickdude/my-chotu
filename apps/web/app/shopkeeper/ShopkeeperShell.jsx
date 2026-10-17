"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/shopkeeper/DashboardSidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { fetchShopOrders } from "@/lib/api/shopkeeper";

export default function ShopkeeperShell({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  const [pendingCount, setPendingCount]   = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }
    // Poll for pending orders every 30s
    const load = () =>
      fetchShopOrders({ status: "PENDING", limit: 1 })
        .then((r) => setPendingCount(r.meta?.total ?? 0))
        .catch(() => {});
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F3F5]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-60 lg:flex-col lg:flex-shrink-0">
        <DashboardSidebar pendingCount={pendingCount} />
      </div>

      {/* Mobile sidebar sheet */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-[#152744] border-0">
          <DashboardSidebar pendingCount={pendingCount} onClose={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-border flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
            <Menu className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-[#152744]">My Chotu</span>
          <div className="flex items-center gap-1">
            <NotificationBell />
            {pendingCount > 0 && (
              <span className="text-xs bg-[#F4512C] text-white font-bold px-2 py-0.5 rounded-full">
                {pendingCount} new
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
