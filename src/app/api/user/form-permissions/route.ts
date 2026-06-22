import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decodeSession, getDevUser, getDevPermissionUser, SESSION_COOKIE } from "@/lib/wecom-auth";
import { FORM_PERMISSIONS, type PermAction, type PermSpec } from "@/lib/jdy-permissions";
import { isUserInRole } from "@/lib/jdy-role-cache";
import { isUserInDept } from "@/lib/jdy-dept-cache";

function isEmpty(spec: PermSpec): boolean {
  return (
    (!spec.roles || spec.roles.length === 0) &&
    (!spec.depts || spec.depts.length === 0) &&
    (!spec.members || spec.members.length === 0)
  );
}

async function checkSpec(userName: string, spec: PermSpec): Promise<boolean> {
  if (spec.roles) {
    for (const roleNo of spec.roles) {
      if (await isUserInRole(userName, roleNo)) return true;
    }
  }
  if (spec.depts) {
    for (const deptNo of spec.depts) {
      if (await isUserInDept(userName, deptNo)) return true;
    }
  }
  if (spec.members) {
    if (spec.members.includes(userName)) return true;
  }
  return false;
}

const ACTIONS: PermAction[] = ["create", "update", "delete", "export"];

export async function GET(req: NextRequest) {
  const entryId = req.nextUrl.searchParams.get("entryId");
  if (!entryId) {
    return NextResponse.json({ error: "entryId required" }, { status: 400 });
  }

  const user =
    getDevUser() ??
    decodeSession((await cookies()).get(SESSION_COOKIE)?.value ?? "");

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Dev permission test: use WECOM_DEV_PERMISSION_USER name for real permission checks
  const permTestUser = getDevPermissionUser();
  if (permTestUser) {
    const formPerm = FORM_PERMISSIONS[entryId];
    const result: Record<string, boolean> = {};
    for (const action of ACTIONS) {
      const spec = formPerm?.[action];
      if (!spec || isEmpty(spec)) {
        result[`can${action.charAt(0).toUpperCase() + action.slice(1)}`] = true;
      } else {
        result[`can${action.charAt(0).toUpperCase() + action.slice(1)}`] = await checkSpec(permTestUser, spec);
      }
    }
    return NextResponse.json(result);
  }

  // Dev mode: all actions allowed
  if (getDevUser()) {
    return NextResponse.json({
      canCreate: true,
      canUpdate: true,
      canDelete: true,
      canExport: true,
    });
  }

  const formPerm = FORM_PERMISSIONS[entryId];
  const result: Record<string, boolean> = {};

  for (const action of ACTIONS) {
    const spec = formPerm?.[action];
    if (!spec || isEmpty(spec)) {
      result[`can${action.charAt(0).toUpperCase() + action.slice(1)}`] = true;
    } else {
      result[`can${action.charAt(0).toUpperCase() + action.slice(1)}`] = await checkSpec(user.name, spec);
    }
  }

  return NextResponse.json(result);
}
