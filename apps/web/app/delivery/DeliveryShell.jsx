"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { Package, History, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/delivery/assignments", label: "Active",  icon: Package },
  { href: "/delivery/history",     label: "History", icon: History },
  { href: "/delivery/profile",     label: "Profile", icon: User },
];

export default function DeliveryShell({ children }) {
  const router = useRouter();
  const path   = usePathname();

  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
  }, [router]);

  return (
    <div className="flex flex-col h-screen bg-[#F1F3F5]">
      {/* Top bar */}
      <header className="flex items-center justify-between px-4 h-14 bg-[#152744] flex-shrink-0">
        <Logo size="sm" className="[&_span:last-child]:text-white" />
        <div className="flex items-center gap-1 text-white">
          <NotificationBell />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom navigation — delivery staff are on phones */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border flex h-16 z-40">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link key={href} href={href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                active ? "text-[#F4512C]" : "text-muted-foreground hover:text-[#152744]"
              )}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
