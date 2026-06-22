import { NextRequest, NextResponse } from "next/server";
import { createSignToken } from "@/lib/sign-token-store";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const token = createSignToken({ appId: body.appId, entryId: body.entryId });
  const baseUrl = process.env.SIGN_BASE_URL;
  if (baseUrl) {
    return NextResponse.json({ token, qrUrl: `${baseUrl}/sign/${token}` });
  }
  const host = req.headers.get("host") ?? "localhost:3000";
  const protocol = req.headers.get("x-forwarded-proto") ?? "http";
  const qrUrl = `${protocol}://${host}/sign/${token}`;
  return NextResponse.json({ token, qrUrl });
}
