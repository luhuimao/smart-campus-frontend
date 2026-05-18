"use client";

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useCurrentUser } from "@/lib/user-context";

const USER_MENU_OPTIONS = ["我的收藏", "个人设置", "管理后台"] as const;

export function UserAvatarMenu() {
  const currentUser = useCurrentUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initial = currentUser?.name?.slice(0, 1) ?? "?";

  return (
    <div className="flex items-center gap-4 md:gap-5 shrink-0">
      <div className="relative cursor-pointer">
        <Bell className="w-5 h-5 text-gray-400 hover:text-gray-700 transition-colors" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
      </div>
      <div ref={ref} className="relative">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white cursor-pointer hover:scale-105 transition-transform"
          style={{ background: "linear-gradient(135deg, #5BC8F5, #2B8FD9)" }}
          onClick={() => setOpen((v) => !v)}
        >
          {initial}
        </div>
        {open && (
          <div
            className="absolute right-0 top-full mt-2 min-w-[120px] rounded-xl shadow-lg border border-gray-100 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", zIndex: 50 }}
          >
            {USER_MENU_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setOpen(false)}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 whitespace-nowrap"
                style={{ color: "#374151" }}
              >
                {opt}
              </button>
            ))}
            <a
              href="/api/auth/logout"
              className="block w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 whitespace-nowrap border-t border-gray-100"
              style={{ color: "#ef4444" }}
            >
              退出
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
