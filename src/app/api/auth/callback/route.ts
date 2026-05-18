import { NextRequest, NextResponse } from "next/server";
import { getUserByCode, encodeSession, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/wecom-auth";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") ?? "/";

  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }

  try {
    const user = await getUserByCode(code);
    const res = NextResponse.redirect(new URL(state, origin));
    res.cookies.set(SESSION_COOKIE, encodeSession(user), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "auth failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
