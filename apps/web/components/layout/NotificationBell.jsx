"use client";

import { useState, useEffect, useRef } from "react";
import { fetchNotifications, markRead, markAllRead } from "@/lib/api/notifications";
import { Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open,          setOpen]     = useState(false);
  const [notifications, setNotifs]   = useState([]);
  const [unread,        setUnread]   = useState(0);
  const ref = useRef(null);

  const load = () => {
    if (!localStorage.getItem("token")) return;
    fetchNotifications()
      .then((r) => { setNotifs(r.data?.notifications ?? []); setUnread(r.data?.unread ?? 0); })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifs((n) => n.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
  };

  const handleRead = async (id) => {
    await markRead(id);
    setNotifs((n) => n.map((x) => x.id === id ? { ...x, isRead: true } : x));
    setUnread((u) => Math.max(0, u - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-[#F4512C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-border z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-[#152744]">Notifications</h3>
            {unread > 0 && (
              <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs text-[#F4512C] hover:underline">
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
            ) : notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleRead(n.id)}
                className={cn(
                  "w-full text-left px-4 py-3 hover:bg-[#FFFDF9] transition-colors",
                  !n.isRead && "bg-[#FFF0EB]"
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.isRead && <span className="w-2 h-2 bg-[#F4512C] rounded-full mt-1.5 flex-shrink-0" />}
                  <div className={cn("min-w-0", n.isRead && "ml-4")}>
                    <p className="text-xs font-semibold text-[#152744] truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
