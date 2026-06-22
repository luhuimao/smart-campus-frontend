import { NextRequest, NextResponse } from "next/server";
import { getTokenStatus } from "@/lib/sign-token-store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const status = getTokenStatus(token);
  if (!status) return NextResponse.json({ error: "Token not found or expired" }, { status: 404 });
  console.log("[status-api] returning token:", token, "status:", status.status, "dataUrl len:", status.imageDataUrl?.length ?? 0);
  return NextResponse.json(status);
}
