# 简道云数据变更 API 设计

> 基于 `config/jiaokeyan_dashboard_api.md` 简道云 API 文档设计
> 实现文件：`src/app/api/jdy/data/[action]/route.ts`

---

## 架构概览

```
Client Component
  └── jdyCreate / jdyBatchCreate / jdyUpdate / ...  (src/lib/jdy-api.ts)
        └── scheduler (rate limit: 5 req/s)
              └── fetch POST /api/jdy/data/[action]
                    ├── 1. 鉴权：session cookie → WecomUser
                    ├── 2. 权限校验：jdyGuard.checkJdyPermission()  ← 当前全部放行
                    └── 3. 代理转发 → 简道云 API
```

---

## API 端点映射

| Next.js 路由 | 简道云 API |
|-------------|-----------|
| `POST /api/jdy/data/create` | `POST https://api.jiandaoyun.com/api/v5/app/entry/data/create` |
| `POST /api/jdy/data/batch-create` | `POST .../batch_create` |
| `POST /api/jdy/data/update` | `POST .../update` |
| `POST /api/jdy/data/batch-update` | `POST .../batch_update` |
| `POST /api/jdy/data/delete` | `POST .../delete` |
| `POST /api/jdy/data/batch-delete` | `POST .../batch_delete` |

---

## 请求参数（client → Next.js API）

所有接口统一使用 `POST`，`Content-Type: application/json`，请求体透传到简道云。

### 新建单条数据 `POST /api/jdy/data/create`

```json
{
  "app_id": "59264073a2a60c0c08e20bfb",
  "entry_id": "59264073a2a60c0c08e20bfd",
  "data": {
    "_widget_1432728651402": { "value": "文本字段值" },
    "_widget_1432728651403": { "value": 100 }
  },
  "is_start_workflow": false,
  "is_start_trigger": false
}
```

### 新建多条数据 `POST /api/jdy/data/batch-create`

```json
{
  "app_id": "59264073a2a60c0c08e20bfb",
  "entry_id": "59264073a2a60c0c08e20bfd",
  "data_list": [
    { "_widget_1432728651402": { "value": "记录1" } },
    { "_widget_1432728651402": { "value": "记录2" } }
  ],
  "is_start_workflow": true
}
```

### 修改单条数据 `POST /api/jdy/data/update`

```json
{
  "app_id": "59264073a2a60c0c08e20bfb",
  "entry_id": "59264073a2a60c0c08e20bfd",
  "data_id": "6052e8072315c0075001d65e",
  "data": {
    "_widget_1432728651402": { "value": "新值" }
  },
  "is_start_trigger": false
}
```

### 修改多条数据 `POST /api/jdy/data/batch-update`

```json
{
  "app_id": "59264073a2a60c0c08e20bfb",
  "entry_id": "59264073a2a60c0c08e20bfd",
  "data_ids": ["id1", "id2", "id3"],
  "data": {
    "_widget_1432728651402": { "value": "统一修改值" }
  }
}
```

### 删除单条数据 `POST /api/jdy/data/delete`

```json
{
  "app_id": "59264073a2a60c0c08e20bfb",
  "entry_id": "59264073a2a60c0c08e20bfd",
  "data_id": "6052e8072315c0075001d65e",
  "is_start_trigger": false
}
```

### 删除多条数据 `POST /api/jdy/data/batch-delete`

```json
{
  "app_id": "59264073a2a60c0c08e20bfb",
  "entry_id": "59264073a2a60c0c08e20bfd",
  "data_ids": ["id1", "id2", "id3"]
}
```

---

## 客户端调用示例

```ts
import { jdyCreate, jdyBatchCreate, jdyUpdate, jdyDelete, JDY_CONFIG } from "@/lib/jdy-api";
import { WIDGET_IDS } from "@/lib/jdy-api";

// 新建单条
const res = await jdyCreate({
  app_id: JDY_CONFIG.JIAOYAN_ACTIVITY.app_id,
  entry_id: JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id,
  data: {
    [WIDGET_IDS.学期]: { value: "2025-2026 第一学期" },
    [WIDGET_IDS.教研主题]: { value: "单元教学设计研讨" },
    [WIDGET_IDS.时间]: { value: "2025-09-15T14:00:00.000Z" },
  },
});

// 批量新建
await jdyBatchCreate({
  app_id: JDY_CONFIG.BEIKE_ACTIVITY.app_id,
  entry_id: JDY_CONFIG.BEIKE_ACTIVITY.entry_id,
  data_list: [
    { [BEIKE_WIDGET_IDS.主题]: { value: "备课记录1" } },
    { [BEIKE_WIDGET_IDS.主题]: { value: "备课记录2" } },
  ],
});

// 修改单条
await jdyUpdate({
  app_id: JDY_CONFIG.JIAOYAN_ACTIVITY.app_id,
  entry_id: JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id,
  data_id: "6052e8072315c0075001d65e",
  data: { [WIDGET_IDS.教研主题]: { value: "修改后的主题" } },
});

// 删除单条
await jdyDelete({
  app_id: JDY_CONFIG.JIAOYAN_ACTIVITY.app_id,
  entry_id: JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id,
  data_id: "6052e8072315c0075001d65e",
});
```

---

## 权限校验

### 当前状态

`src/lib/jdy-guard.ts` 中 `checkJdyPermission()` 对**所有操作返回放行**，读写均可。

### 增加权限的步骤

只需修改 `src/lib/jdy-guard.ts` 一个文件：

```ts
// src/lib/jdy-guard.ts
import type { WecomUser } from "./wecom-auth";
import { JDY_CONFIG } from "./jdy-api";

// 示例：定义哪些表单只允许特定用户写入
const WRITE_ALLOWLIST: Record<string, string[]> = {
  [JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id]: ["zhangsan", "lisi"],
};

export async function checkJdyPermission(
  user: WecomUser,
  action: JdyAction,
  _appId: string,
  entryId: string,
): Promise<{ allowed: boolean; reason?: string }> {
  // 读操作（list）不走此 guard，只校验写操作
  const allowedUsers = WRITE_ALLOWLIST[entryId];
  if (allowedUsers && !allowedUsers.includes(user.userId)) {
    return { allowed: false, reason: "无此表单的写入权限" };
  }
  return { allowed: true };
}
```

### 可扩展的权限模型

| 维度 | 示例 |
|------|------|
| **按表单** | 特定 `entry_id` 只有教研组长可写 |
| **按操作** | 普通教师可 `create`，不可 `delete` |
| **按字段** | 部分字段只允许管理员修改 |
| **按数据归属** | 教师只能修改自己提交的记录 |

---

## 文件清单

| 文件 | 职责 |
|------|------|
| `src/app/api/jdy/data/[action]/route.ts` | 统一变更代理路由（6 种操作） |
| `src/app/api/jdy/data/list/route.ts` | 列表查询代理路由（已有） |
| `src/lib/jdy-api.ts` | 客户端调用函数 + 类型定义 + 速率调度 |
| `src/lib/jdy-guard.ts` | 权限校验（当前放行，未来扩展点） |
| `src/lib/request-scheduler.ts` | 请求速率限制器（5 req/s） |
