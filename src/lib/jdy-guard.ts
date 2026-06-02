import type { WecomUser } from "./wecom-auth";
import { getDevUser } from "./wecom-auth";
import { FORM_PERMISSIONS } from "./jdy-permissions";
import type { PermSpec } from "./jdy-permissions";
import { isUserInRole } from "./jdy-role-cache";
import { isUserInDept } from "./jdy-dept-cache";

export type JdyAction =
  | "create"
  | "batch-create"
  | "update"
  | "batch-update"
  | "delete"
  | "batch-delete";

function getPermSpec(
  entryId: string,
  action: JdyAction,
): PermSpec | null {
  const perm = FORM_PERMISSIONS[entryId];
  if (!perm) return null;

  if (action === "create" || action === "batch-create") {
    return perm.create ?? null;
  }
  if (action === "update" || action === "batch-update") {
    return perm.update ?? null;
  }
  if (action === "delete" || action === "batch-delete") {
    return perm.delete ?? null;
  }
  return null;
}

function isEmpty(spec: PermSpec): boolean {
  return (
    (!spec.roles || spec.roles.length === 0) &&
    (!spec.depts || spec.depts.length === 0) &&
    (!spec.members || spec.members.length === 0)
  );
}

async function checkSpec(
  userName: string,
  spec: PermSpec,
): Promise<boolean> {
  // roles
  if (spec.roles) {
    for (const roleNo of spec.roles) {
      if (await isUserInRole(userName, roleNo)) return true;
    }
  }
  // departments
  if (spec.depts) {
    for (const deptNo of spec.depts) {
      if (await isUserInDept(userName, deptNo)) return true;
    }
  }
  // individual members
  if (spec.members) {
    if (spec.members.includes(userName)) return true;
  }
  return false;
}

export async function checkJdyPermission(
  user: WecomUser,
  action: JdyAction,
  _appId: string,
  entryId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  if (getDevUser()) return { allowed: true };

  const spec = getPermSpec(entryId, action);
  if (!spec || isEmpty(spec)) return { allowed: true };

  const allowed = await checkSpec(user.name, spec);
  return allowed
    ? { allowed: true }
    : { allowed: false, reason: "无此操作权限" };
}
