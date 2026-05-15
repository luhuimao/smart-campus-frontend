import { NextRequest, NextResponse } from "next/server";

const JDY_ENDPOINT = "https://api.jiandaoyun.com/api/v5/app/entry/data/list";

export async function POST(req: NextRequest) {
  const apiKey = process.env.JIANDAOYUN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "JIANDAOYUN_API_KEY not configured" },
      { status: 500 },
    );
  }

  const body = await req.json();

  const res = await fetch(JDY_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
