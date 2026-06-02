const JDY_BASE = "https://api.jiandaoyun.com/api/v5/corp";

interface JdyRole {
  role_no: number;
  group_no: number;
  name: string;
  type: number;
  status: number;
}

interface JdyRoleMember {
  username: string;
  name: string;
  integrate_id: string;
}

interface RoleCacheEntry {
  members: Set<string>;
  fetchedAt: number;
}

const TTL_MS = 5 * 60 * 1000; // 5 minutes

const roleCache = new Map<number, RoleCacheEntry>();
let allRolesFetchedAt = 0;

function apiKey(): string {
  const key = process.env.JIANDAOYUN_API_KEY;
  if (!key) throw new Error("JIANDAOYUN_API_KEY not configured");
  return key;
}

async function jdyFetch(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${JDY_BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JDY role API failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function fetchAllRoles(): Promise<JdyRole[]> {
  // Avoid re-fetching within TTL
  const data = (await jdyFetch("/role/list", {
    skip: 0,
    limit: 300,
    has_internal: true,
    has_sync: true,
  })) as { roles: JdyRole[] };
  allRolesFetchedAt = Date.now();
  return data.roles ?? [];
}

async function fetchRoleMembers(roleNo: number): Promise<Set<string>> {
  const data = (await jdyFetch("/role/user/list", {
    skip: 0,
    limit: 300,
    role_no: roleNo,
    has_manage_range: true,
  })) as { users: JdyRoleMember[] };

  const names = new Set<string>();
  for (const u of data.users ?? []) {
    if (u.name) names.add(u.name);
  }
  return names;
}

function isExpired(entry: RoleCacheEntry): boolean {
  return Date.now() - entry.fetchedAt > TTL_MS;
}

export async function isUserInRole(
  userName: string,
  roleNo: number,
): Promise<boolean> {
  const cached = roleCache.get(roleNo);
  if (cached && !isExpired(cached)) {
    return cached.members.has(userName);
  }

  // Fetch and cache
  const members = await fetchRoleMembers(roleNo);
  roleCache.set(roleNo, { members, fetchedAt: Date.now() });
  return members.has(userName);
}

export async function prefetchRoles(): Promise<void> {
  if (Date.now() - allRolesFetchedAt < TTL_MS) return;
  const roles = await fetchAllRoles();
  // Warm cache for all roles in parallel
  await Promise.allSettled(
    roles.map(async (r) => {
      if (!roleCache.has(r.role_no) || isExpired(roleCache.get(r.role_no)!)) {
        const members = await fetchRoleMembers(r.role_no);
        roleCache.set(r.role_no, { members, fetchedAt: Date.now() });
      }
    }),
  );
}
