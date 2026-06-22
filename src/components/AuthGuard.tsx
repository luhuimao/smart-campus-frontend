"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const publicPaths = ["/api/auth/", "/sign/"];
    if (publicPaths.some(p => pathname.startsWith(p))) {
      setChecked(true);
      return;
    }

    fetch("/api/auth/session")
      .then(r => r.json())
      .then((data: { authenticated: boolean }) => {
        if (!data.authenticated) {
          const redirect = encodeURIComponent(pathname);
          window.location.href = `/api/auth/wecom?redirect=${redirect}`;
        } else {
          setChecked(true);
        }
      })
      .catch(() => setChecked(true)); // fail open on network error
  }, [pathname]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f5f7]">
        <div className="text-sm text-gray-400">验证身份中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
