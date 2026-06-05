import { NextRequest, NextResponse } from "next/server";

// Auth disabled — all requests pass through
// Original logic:
// - Check session cookie (wecom_session)
// - If not authenticated, redirect to /api/auth/wecom
// - Dev mode (WECOM_DEV_USER_ID set) always allowed

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
