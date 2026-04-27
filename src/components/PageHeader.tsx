"use client";

import { Bell, ChevronRight, ChevronDown, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Crumb { label: string; active?: boolean }

interface PageHeaderProps {
  breadcrumbs: Crumb[];
  /** Extra node rendered on the left (e.g. 发起流程 button). Hidden on mobile. */
  left?: React.ReactNode;
  /** Center the breadcrumb with a balanced spacer on desktop */
  centered?: boolean;
  onMenuOpen?: () => void;
}

export function PageHeader({ breadcrumbs, left, centered = false, onMenuOpen }: PageHeaderProps) {
  const activeLabel = (breadcrumbs.findLast?.((b) => b.active) ?? breadcrumbs[breadcrumbs.length - 1])?.label;

  const breadcrumbNav = (
    <div className="flex items-center gap-1.5 text-sm" style={{ color: "#9ca3af" }}>
      {breadcrumbs.map((b, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {b.active
            ? <span style={{ color: "#374151", fontWeight: 500 }}>{b.label}</span>
            : <span className="hover:text-gray-600 cursor-pointer transition-colors">{b.label}</span>
          }
        </span>
      ))}
    </div>
  );

  const bellAvatar = (
    <div className="flex items-center gap-4 md:gap-5 shrink-0">
      <div className="relative cursor-pointer">
        <Bell className="w-5 h-5 text-gray-400 hover:text-gray-700 transition-colors" />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
      </div>
      <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
        卢
      </div>
    </div>
  );

  return (
    <header
      className="flex items-center justify-between px-4 md:px-8 shrink-0 border-b border-gray-100"
      style={{ height: 64, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 10 }}
    >
      {/* ── Mobile layout ── */}
      <button
        className="md:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors"
        onClick={onMenuOpen}
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
      <span className="md:hidden text-sm font-semibold text-gray-800 truncate flex-1 mx-3">
        {activeLabel}
      </span>
      <div className="md:hidden">{bellAvatar}</div>

      {/* ── Desktop layout ── */}
      {centered ? (
        <>
          <div className="hidden md:flex items-center min-w-0">
            {left ?? <div className="w-24" />}
          </div>
          <div className="hidden md:flex">{breadcrumbNav}</div>
          <div className="hidden md:flex">{bellAvatar}</div>
        </>
      ) : (
        <>
          <div className="hidden md:flex items-center gap-3 min-w-0">
            {left && <div className="shrink-0">{left}</div>}
            {breadcrumbNav}
          </div>
          <div className="hidden md:flex">{bellAvatar}</div>
        </>
      )}
    </header>
  );
}

const FLOW_OPTIONS = ["发起流程", "查看本人数据", "全部有权限的数据"];

/** 发起流程 dropdown — used by form pages that need it */
export function FlowButton() {
  const [selected, setSelected] = useState(FLOW_OPTIONS[0]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
      >
        {selected} <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 min-w-full rounded-xl shadow-lg border border-gray-100 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", zIndex: 50 }}
        >
          {FLOW_OPTIONS.map((opt) => (
            <button
              key={opt}
              onClick={() => { setSelected(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 whitespace-nowrap"
              style={{ color: opt === selected ? "#2563eb" : "#374151", fontWeight: opt === selected ? 600 : 400 }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
