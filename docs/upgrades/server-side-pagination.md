# 服务端分页升级方案

> **状态：学生请假表已完成（2026-05-16）**，其余表待按优先级跟进。

## 背景与问题

当前所有数据表（学生请假、晨午检、返校情况等）使用 `jdyListAll` 全量拉取模式：

```
jdyListAll → 串行发 maxPages 次请求 → 全量数据存入内存 → 前端筛选 + 分页
```

以学生请假表为例，`pageSize: 100, maxPages: 50` 上限为 **5000 条**，超出部分永远拿不到。

**三个硬伤：**
1. **数据截断** — 超过上限的记录对用户不可见，且无任何提示
2. **首屏慢** — 用户看到 table 前需等待所有页串行拉完（最多 50 次网络请求）
3. **内存浪费** — 用户只看第 1 页 20 条，却把 5000 条全放在客户端内存

---

## 设计方案：服务端游标分页

JDY API 原生支持游标分页（`data_id` 字段），每次只请求当前页数据。

### 数据流对比

**改造前（全量拉取）：**
```
mount → jdyListAll(50次串行请求) → 5000条存内存 → 前端slice分页
```

**改造后（服务端分页）：**
```
mount → jdyListPage(1次请求, 100条) → 渲染
翻页  → jdyListPage(cursor=lastId, 1次请求) → 渲染
```

---

## 实现层次

### 第一层：`src/lib/jdy-api.ts` ✅ 已完成

新增 `JdyPageResult` 接口和 `jdyListPage` 函数，单次请求，返回数据和下一页游标：

```ts
export interface JdyPageResult {
  records: JdyRecord[];
  nextCursor: string | null; // null 表示已是最后一页
}

export async function jdyListPage(
  params: Omit<JdyListParams, "data_id"> & {
    pageSize?: number;
    cursor?: string | null;
  }
): Promise<JdyPageResult> {
  const pageSize = params.pageSize ?? 100;
  const { data } = await jdyList({
    ...params,
    limit: pageSize,
    data_id: params.cursor ?? undefined,
  });
  const records = data ?? [];
  return {
    records,
    nextCursor: records.length === pageSize ? records[records.length - 1]._id : null,
  };
}
```

### 第二层：`src/hooks/use-research-dashboard.ts` ✅ 已完成（学生请假）

为需要服务端分页的表新增 `usePage` 变体 hook，`queryKey` 包含 cursor 和 filter，每页独立缓存：

```ts
export function useStudentLeavePage(
  filters: StudentLeaveFilters | undefined,
  cursor: string | null,
  pageSize = 100,
) {
  const { data, isPending, isError, error, refetch } = useQuery<JdyPageResult>({
    queryKey: ["student-leave-page", cursor, pageSize, filters?.name, filters?.type, filters?.status, filters?.grade],
    queryFn: () =>
      jdyListPage({
        app_id: JDY_CONFIG.STUDENT_LEAVE_APPLICATION.app_id,
        entry_id: JDY_CONFIG.STUDENT_LEAVE_APPLICATION.entry_id,
        pageSize,
        cursor,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const records = useMemo((): StudentLeaveRecord[] => {
    if (!data) return [];
    const normalized = data.records.map(normalizeStudentLeaveRecord);
    return normalized.filter(r => { /* client-side filter */ });
  }, [data, filters]);

  return { records, nextCursor: data?.nextCursor ?? null, isPending, isError, error, refetch };
}
```

**注意：** `filterOptions`（筛选下拉选项）和统计数字（请假人数 banner）依赖全量数据，保留原 `useStudentLeave(undefined, true)` 独立全量查询。

### 第三层：`src/components/StudentDashboard.tsx` ✅ 已完成（学生请假）

组件维护游标栈，支持前进/后退翻页：

```ts
// 游标栈：[null] = 第1页，[null, "id_xxx"] = 第2页，以此类推
const [leaveCursorStack, setLeaveCursorStack] = useState<(string | null)[]>([null]);
const [leaveStackIdx, setLeaveStackIdx] = useState(0);
const leaveCursor = leaveCursorStack[leaveStackIdx];

const { records, nextCursor, isPending } = useStudentLeavePage(leaveFilters, leaveCursor, leavePageSize);

function leaveGoNext() {
  if (!leaveNextCursor) return;
  const newStack = leaveCursorStack.slice(0, leaveStackIdx + 1);
  if (newStack[newStack.length - 1] !== leaveNextCursor) newStack.push(leaveNextCursor);
  setLeaveCursorStack(newStack);
  setLeaveStackIdx(newStack.length - 1);
}
function leaveGoPrev() {
  if (leaveStackIdx > 0) setLeaveStackIdx(i => i - 1);
}
function leaveResetCursor() {
  setLeaveCursorStack([null]);
  setLeaveStackIdx(0);
}
```

筛选/排序变化时调用 `leaveResetCursor()` 重置到第 1 页。后退时直接减 `leaveStackIdx`，TanStack Query 已缓存该游标对应的页数据，无需重新请求。

### 第四层：`src/components/ui/DashboardTable.tsx` ✅ 已完成

扩展 props 支持游标分页模式。当传入 `onPrev`/`onNext` 时，分页栏切换为"第 N 页 + 上一页/下一页"，隐藏总条数：

```ts
// 新增可选 props
hasPrev?: boolean;
hasNext?: boolean;
onPrev?: () => void;
onNext?: () => void;
pageIndex?: number;  // 0-based，用于显示"第 N 页"

// 原有 offset 分页 props 改为可选
page?: number;
totalRows?: number;
onPageChange?: (p: number) => void;
```

---

## 需要服务端分页的表

| 表名 | 当前上限 | 优先级 | 状态 |
|------|---------|--------|------|
| 学生请假 | 5,000 | 高（数据量大，已知截断） | ✅ 已完成 |
| 学生晨午检 | 5,000 | 高 | 待实施 |
| 学生返校情况 | 5,000 | 中 | 待实施 |
| 学生心理谈话 | 5,000 | 中 | 待实施 |
| 学生学情分析 | 5,000 | 低 | 待实施 |

学生基本信息（`useStudentInfo`）数据量相对固定（在校学生数），暂不需要改造。

---

## 不改造的部分

- `useStudentInfo` — 学生总数固定，全量拉取用于 Overview 统计
- `filterOptions` 枚举 — 保留独立轻量全量查询（`useStudentLeave(undefined, true)`）
- `leaveAllRecords` 用于 `filteredLeaveCount` 统计 — 保留，后续可考虑用 API filter 替代

---

## 实施顺序

1. ✅ `jdy-api.ts` — 新增 `jdyListPage` + `JdyPageResult`
2. ✅ `use-research-dashboard.ts` — 新增 `useStudentLeavePage`，保留原 `useStudentLeave`（供 filterOptions 和统计使用）
3. ✅ `DashboardTable.tsx` — 扩展 props 支持游标分页模式
4. ✅ `StudentDashboard.tsx` — 学生请假 tab 改用游标栈分页，更新分页 UI
5. 按优先级依次改造其他表（晨午检 → 返校情况 → 谈心谈话 → 学情分析）
