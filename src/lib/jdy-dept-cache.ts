const JDY_V5 = "https://api.jiandaoyun.com/api/v5/corp";
const JDY_V6 = "https://api.jiandaoyun.com/api/v6/corp";

interface DeptMember {
  username: string;
  name: string;
  departments: number[];
}

interface DeptCacheEntry {
  members: Set<string>;
  fetchedAt: number;
}

const TTL_MS = 5 * 60 * 1000;

const deptCache = new Map<number, DeptCacheEntry>();
let allDeptsFetchedAt = 0;

function apiKey(): string {
  const key = process.env.JIANDAOYUN_API_KEY;
  if (!key) throw new Error("JIANDAOYUN_API_KEY not configured");
  return key;
}

async function jdyFetchV5(path: string, body: unknown): Promise<unknown> {
  const res = await fetch(`${JDY_V5}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JDY dept API failed (${res.status}): ${text}`);
  }
  return res.json();
}

export interface DeptInfo {
  dept_no: number;
  name: string;
  parent_no: number;
}

let cachedDeptList: DeptInfo[] = [];

async function fetchAllDepts(): Promise<number[]> {
  const rawDepts: Array<{ dept_no: number; status: number; name: string; parent_no: number }> = [];
  let skip = 0;
  const limit = 200;
  while (true) {
    const res = await fetch(`${JDY_V6}/department/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({ dept_no: 1, has_child: true, skip, limit }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`JDY dept list API failed (${res.status}): ${text}`);
    }
    const data = (await res.json()) as { departments: typeof rawDepts };
    const batch = (data.departments ?? []);
    rawDepts.push(...batch);
    if (batch.length < limit) break;
    skip += limit;
  }
  allDeptsFetchedAt = Date.now();
  cachedDeptList = rawDepts.filter(d => d.status === 1).map(d => ({ dept_no: d.dept_no, name: d.name, parent_no: d.parent_no }));
  return cachedDeptList.map(d => d.dept_no);
}

/** Get all active department names (fetched from V6 API, cached) */
export async function getDeptList(): Promise<DeptInfo[]> {
  if (cachedDeptList.length === 0 || Date.now() - allDeptsFetchedAt > TTL_MS) {
    await fetchAllDepts();
  }
  return cachedDeptList;
}

async function fetchDeptMembers(deptNo: number): Promise<Set<string>> {
  const allMembers = new Set<string>();
  let skip = 0;
  const limit = 300;

  while (true) {
    const data = (await jdyFetchV5("/department/user/list", {
      dept_no: deptNo,
      skip,
      limit,
    })) as { users: DeptMember[] };

    for (const u of data.users ?? []) {
      if (u.name) allMembers.add(u.name);
    }

    if (!data.users || data.users.length < limit) break;
    skip += limit;
  }

  return allMembers;
}

function isExpired(entry: DeptCacheEntry): boolean {
  return Date.now() - entry.fetchedAt > TTL_MS;
}

export async function isUserInDept(
  userName: string,
  deptNo: number,
): Promise<boolean> {
  const cached = deptCache.get(deptNo);
  if (cached && !isExpired(cached)) {
    return cached.members.has(userName);
  }

  const members = await fetchDeptMembers(deptNo);
  deptCache.set(deptNo, { members, fetchedAt: Date.now() });
  return members.has(userName);
}

export async function getUserDepts(userName: string): Promise<number[]> {
  if (deptCache.size === 0) await prefetchDepts();
  const result: number[] = [];
  for (const [deptNo, entry] of deptCache) {
    if (entry.members.has(userName)) result.push(deptNo);
  }
  return result;
}

export async function prefetchDepts(): Promise<void> {
  if (Date.now() - allDeptsFetchedAt < TTL_MS) return;
  const deptNos = await fetchAllDepts();
  await Promise.allSettled(
    deptNos.map(async (deptNo) => {
      if (!deptCache.has(deptNo) || isExpired(deptCache.get(deptNo)!)) {
        const members = await fetchDeptMembers(deptNo);
        deptCache.set(deptNo, { members, fetchedAt: Date.now() });
      }
    }),
  );
}
