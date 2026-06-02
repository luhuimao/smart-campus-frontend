import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, getDevUser, SESSION_COOKIE } from "@/lib/wecom-auth";
import { checkJdyPermission } from "@/lib/jdy-guard";
import type { JdyAction } from "@/lib/jdy-guard";

const JDY_BASE = "https://api.jiandaoyun.com/api/v5/app/entry/data";

// kebab-case client path → snake_case JDY endpoint
const ENDPOINT_MAP: Record<string, string> = {
  create: `${JDY_BASE}/create`,
  "batch-create": `${JDY_BASE}/batch_create`,
  update: `${JDY_BASE}/update`,
  "batch-update": `${JDY_BASE}/batch_update`,
  delete: `${JDY_BASE}/delete`,
  "batch-delete": `${JDY_BASE}/batch_delete`,
};

const VALID_ACTIONS = Object.keys(ENDPOINT_MAP);

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;

  if (!VALID_ACTIONS.includes(action)) {
    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 404 },
    );
  }

  const apiKey = process.env.JIANDAOYUN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "JIANDAOYUN_API_KEY not configured" },
      { status: 500 },
    );
  }

  const body = await req.json();

  // Permission check
  const user =
    getDevUser() ??
    decodeSession(
      (await cookies()).get(SESSION_COOKIE)?.value ?? "",
    );

  if (user) {
    const appId = body.app_id ?? "";
    const entryId = body.entry_id ?? "";
    const result = await checkJdyPermission(
      user,
      action as JdyAction,
      appId,
      entryId,
    );
    if (!result.allowed) {
      return NextResponse.json(
        { error: result.reason ?? "Forbidden" },
        { status: 403 },
      );
    }
  }

  const endpoint = ENDPOINT_MAP[action];
  const res = await fetch(endpoint, {
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
