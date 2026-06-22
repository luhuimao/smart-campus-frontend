import { NextRequest, NextResponse } from "next/server";
import { confirmSignToken } from "@/lib/sign-token-store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { token, imageKey, imageDataUrl } = body;
  console.log("[confirm-api] received token:", token, "imageKey:", imageKey, "dataUrl len:", imageDataUrl?.length ?? 0, "preview:", imageDataUrl?.slice(0, 50));
  console.log("[confirm-api] body keys:", Object.keys(body), "body size:", JSON.stringify(body).length);
  if (!token || !imageKey) {
    return NextResponse.json({ error: "token and imageKey required" }, { status: 400 });
  }
  const ok = confirmSignToken(token, imageKey, imageDataUrl ?? "");
  if (!ok) return NextResponse.json({ error: "Token expired or already signed" }, { status: 409 });
  return NextResponse.json({ success: true });
}
