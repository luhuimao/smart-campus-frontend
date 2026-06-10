import { NextResponse } from "next/server";
import { getDeptList } from "@/lib/jdy-dept-cache";

export async function GET() {
  try {
    const depts = await getDeptList();
    return NextResponse.json(depts);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
