import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/wecom-auth";

export async function GET() {
  const res = NextResponse.redirect(new URL("/api/auth/wecom", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
  return res;
}
