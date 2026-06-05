import { NextRequest, NextResponse } from "next/server";
import { decodeSession, getDevUser, SESSION_COOKIE } from "@/lib/wecom-auth";

// Paths that never require auth
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/favicon.ico"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths through
  if (PUBLIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Dev mode: always allow
  if (getDevUser()) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (sessionCookie && decodeSession(sessionCookie)) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to OAuth entry point
  // const loginUrl = new URL("/api/auth/wecom", origin);
  // loginUrl.searchParams.set("redirect", pathname);
  // return NextResponse.redirect(loginUrl);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
