import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.JIANDAOYUN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "JIANDAOYUN_API_KEY not configured" }, { status: 500 });
  }

  const { app_id, entry_id, transaction_id } = await req.json();
  if (!app_id || !entry_id) {
    return NextResponse.json({ error: "app_id and entry_id required" }, { status: 400 });
  }

  const res = await fetch(
    "https://api.jiandaoyun.com/api/v5/app/entry/file/get_upload_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ app_id, entry_id, transaction_id }),
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
