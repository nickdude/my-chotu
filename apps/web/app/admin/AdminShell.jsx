"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function AdminShell({ children }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
    // TODO: verify SUPER_ADMIN role client-side and redirect if not
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F1F3F5]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-56 lg:flex-col lg:flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-56 bg-[#0f1a2b] border-0">
          <AdminSidebar onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#0f1a2b] flex-shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-white hover:bg-white/10" aria-label="Open navigation">
            <Menu className="w-5 h-5" />
          </Button>
          <span className="text-sm font-semibold text-white">Super Admin</span>
          <div className="text-white"><NotificationBell /></div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
