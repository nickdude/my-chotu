"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Store, Users, CreditCard,
  Tag, ClipboardList, Settings, LogOut, ShoppingBag,
} from "lucide-react";

const NAV = [
  { href: "/admin/dashboard",   label: "Overview",    icon: LayoutDashboard },
  { href: "/admin/shops",       label: "Shops",       icon: Store },
  { href: "/admin/users",       label: "Users",       icon: Users },
  { href: "/admin/plans",       label: "Plans",       icon: CreditCard },
  { href: "/admin/orders",      label: "Orders",      icon: ShoppingBag },
  { href: "/admin/categories",  label: "Categories",  icon: Tag },
  { href: "/admin/audit-logs",  label: "Audit Logs",  icon: ClipboardList },
  { href: "/admin/settings",    label: "Settings",    icon: Settings },
];

export function AdminSidebar({ onClose }) {
  const path = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <aside className="flex flex-col h-full bg-[#0f1a2b]">
      <div className="px-5 py-5 border-b border-white/10">
        <Logo size="md" className="[&_span:last-child]:text-white" />
        <p className="text-xs text-white/40 mt-1 font-medium uppercase tracking-widest">Super Admin</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[#F4512C] text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}
