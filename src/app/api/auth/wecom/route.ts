import { NextRequest, NextResponse } from "next/server";
import { buildOAuthUrl, getDevUser, encodeSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/wecom-auth";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const redirect = searchParams.get("redirect") ?? "/";

  // Dev mode: skip OAuth, write a fake session and redirect
  const devUser = getDevUser();
  if (devUser) {
    const res = NextResponse.redirect(new URL(redirect, origin));
    res.cookies.set(SESSION_COOKIE, encodeSession(devUser), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  }

  // Production: redirect to WeCom OAuth
  const callbackUrl = `${origin}/api/auth/callback`;
  const oauthUrl = buildOAuthUrl(callbackUrl, redirect);
  return NextResponse.redirect(oauthUrl);
}
