"use client";

import { ChevronRight, Menu } from "lucide-react";
import { UserAvatarMenu } from "@/components/ui/UserAvatarMenu";

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

  const bellAvatar = <UserAvatarMenu />;

  return (
    <header
      className="flex items-center justify-between px-4 md:px-8 shrink-0 border-b border-gray-100"
      style={{ height: 64, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 10 }}
    >
      {/* Mobile layout */}
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

      {/* Desktop layout */}
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
