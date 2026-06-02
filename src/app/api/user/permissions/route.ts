import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, getDevUser, SESSION_COOKIE } from "@/lib/wecom-auth";
import { MENU_PERMISSIONS, FORM_PERMISSIONS } from "@/lib/jdy-permissions";
import { isUserInRole } from "@/lib/jdy-role-cache";
import { isUserInDept } from "@/lib/jdy-dept-cache";
import type { PageKey } from "@/app/page";

export async function GET() {
  const user =
    getDevUser() ??
    decodeSession((await cookies()).get(SESSION_COOKIE)?.value ?? "");

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Dev mode: every menu item visible
  if (getDevUser()) {
    const allPages = Object.keys(MENU_PERMISSIONS) as PageKey[];
    return NextResponse.json({
      name: user.name,
      roles: [],
      depts: [],
      allowedPages: allPages,
    });
  }

  // Collect all role_nos and dept_nos referenced in any permissions config
  const allRoleNos = new Set<number>();
  const allDeptNos = new Set<number>();

  for (const spec of Object.values(MENU_PERMISSIONS)) {
    for (const r of spec?.roles ?? []) allRoleNos.add(r);
    for (const d of spec?.depts ?? []) allDeptNos.add(d);
  }
  for (const perm of Object.values(FORM_PERMISSIONS)) {
    for (const spec of Object.values(perm ?? {})) {
      for (const r of spec?.roles ?? []) allRoleNos.add(r);
      for (const d of spec?.depts ?? []) allDeptNos.add(d);
    }
  }

  // Check user's memberships
  const [userRoles, userDepts] = await Promise.all([
    Promise.all([...allRoleNos].map(async (r) => ((await isUserInRole(user.name, r)) ? r : null))).then((a) => a.filter(Boolean) as number[]),
    Promise.all([...allDeptNos].map(async (d) => ((await isUserInDept(user.name, d)) ? d : null))).then((a) => a.filter(Boolean) as number[]),
  ]);

  // Evaluate which pages the user can access
  const allowedPages = new Set<PageKey>();
  for (const [key, spec] of Object.entries(MENU_PERMISSIONS) as [PageKey, NonNullable<(typeof MENU_PERMISSIONS)[PageKey]>][]) {
    if (!spec) continue;
    const hasRole = spec.roles?.some((r) => userRoles.includes(r));
    const hasDept = spec.depts?.some((d) => userDepts.includes(d));
    const isMember = spec.members?.includes(user.name);
    if (hasRole || hasDept || isMember) allowedPages.add(key);
  }

  return NextResponse.json({
    name: user.name,
    roles: userRoles,
    depts: userDepts,
    allowedPages: [...allowedPages],
  });
}
