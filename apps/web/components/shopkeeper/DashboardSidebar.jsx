"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ShoppingBag, Package, BarChart2,
  Users, QrCode, Settings, LogOut,
} from "lucide-react";

const NAV = [
  { href: "/shopkeeper/dashboard",  label: "Dashboard",  icon: LayoutDashboard },
  { href: "/shopkeeper/orders",     label: "Orders",     icon: ShoppingBag, badge: "pending" },
  { href: "/shopkeeper/products",   label: "Products",   icon: Package },
  { href: "/shopkeeper/staff",      label: "Staff",      icon: Users },
  { href: "/shopkeeper/qr",         label: "QR Code",    icon: QrCode },
  { href: "/shopkeeper/analytics",  label: "Analytics",  icon: BarChart2 },
  { href: "/shopkeeper/settings",   label: "Settings",   icon: Settings },
];

export function DashboardSidebar({ pendingCount = 0, onClose }) {
  const path = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <aside className="flex flex-col h-full bg-[#152744] text-white">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <Logo size="md" className="[&_span:last-child]:text-white" />
        <p className="text-xs text-white/50 mt-1">Shopkeeper dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon, badge }) => {
          const active = path === href || path.startsWith(href + "/");
          const count = badge === "pending" ? pendingCount : 0;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[#F4512C] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {count > 0 && (
                <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors w-full text-left"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
