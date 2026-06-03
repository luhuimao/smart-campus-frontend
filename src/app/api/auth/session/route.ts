import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, getDevUser, SESSION_COOKIE } from "@/lib/wecom-auth";

export async function GET() {
  if (getDevUser()) {
    return NextResponse.json({ authenticated: true });
  }
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (session && decodeSession(session)) {
    return NextResponse.json({ authenticated: true });
  }
  return NextResponse.json({ authenticated: false });
}
