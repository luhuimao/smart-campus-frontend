# 权限系统文档

## 架构概览

权限由三个维度组成，**OR 关系**（满足任一即通过）：

```
权限 = 角色组 (role_no) | 部门 (dept_no) | 具体成员 (user name)
```

两层控制：

| 层 | 位置 | 作用 |
|---|------|------|
| 菜单层 | Sidebar.tsx | 控制菜单项可见性，无权限则隐藏 |
| 操作层 | jdy-guard.ts | API 路由拦截，阻止无权限的 create/update/delete 操作 |

---

## 文件清单

| 文件 | 职责 |
|------|------|
| `src/lib/jdy-permissions.ts` | 权限配置表：角色别名 `R`、部门别名 `D`、`PermSpec` 类型、`FORM_PERMISSIONS`（表单操作）、`MENU_PERMISSIONS`（菜单可见性） |
| `src/lib/jdy-role-cache.ts` | 角色成员缓存：调 JDY API 拉取 role → members，5 分钟 TTL |
| `src/lib/jdy-dept-cache.ts` | 部门成员缓存：调 JDY API 拉取 dept → members，5 分钟 TTL |
| `src/lib/jdy-guard.ts` | 操作层守卫：API 路由在写操作前调用 `checkJdyPermission()` |
| `src/app/api/user/permissions/route.ts` | 菜单权限 API：返回当前用户可见的 PageKey 列表 |
| `src/components/Sidebar.tsx` | 菜单渲染：根据 `allowedPages` 过滤菜单项 |
| `src/app/api/jdy/data/[action]/route.ts` | 写操作代理路由：调用 guard 进行权限校验 |

---

## 权限配置 (jdy-permissions.ts)

### PermSpec 类型

```ts
interface PermSpec {
  roles?: number[];    // role_no 列表
  depts?: number[];    // dept_no 列表
  members?: string[];  // 用户名列表
}
```

### 配置方式

```ts
// 纯角色（最常用）
view: roles("技术", "学生发展处核心领导")

// 混合：角色 + 部门 + 指定人员
delete: perm({
  roles:   roles("教官队负责人", "教官队副队长"),
  depts:   [D.教官队部门],
  members: ["韦晓明", "关胜军"],
})

// 纯部门
create: perm({ depts: [D.财务室] })

// 纯成员
export: perm({ members: ["张嘉男", "李芳菲"] })
```

### FORM_PERMISSIONS（表单操作）

```ts
[JDY_CONFIG.STUDENT_SCORE.entry_id]: {
  view:   roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导", "学生发展处分管校领导", "学生发展处负责人", "学生发展处中层领导", "校长"),
  create: roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导"),
  delete: roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导"),
  export: roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导", "学生发展处分管校领导", "学生发展处负责人", "学生发展处中层领导", "校长"),
},
```

未配置的 entry_id 所有操作公开。未配置的 action 字段同样公开。

### MENU_PERMISSIONS（菜单可见性）

```ts
export const MENU_PERMISSIONS: Partial<Record<PageKey, PermSpec>> = {
  "student-dashboard": roles("学生发展处核心领导", "学校核心领导", "校长", "技术"),
  "student-home":      roles("教官队", "学生发展处核心领导", "学校核心领导", "技术"),
  // ...
};
```

未配置的 PageKey 默认所有人可见。

---

## 角色缓存流程 (jdy-role-cache.ts)

```
isUserInRole(userName, roleNo)
  │
  ├─ 查缓存 roleCache.get(roleNo)
  │   ├─ 命中且未过期 → 返回 cached.members.has(userName)
  │   └─ 未命中或过期 ↓
  │
  ├─ JDY API: POST /api/v5/corp/role/user/list
  │   Body: { role_no, skip: 0, limit: 300, has_manage_range: true }
  │
  ├─ 提取响应 users[].name → Set<string>
  │
  ├─ 写入缓存: roleCache.set(roleNo, { members, fetchedAt: Date.now() })
  │
  └─ 返回 members.has(userName)
```

**TTL**: 5 分钟 (`TTL_MS = 5 * 60 * 1000`)

**预热**: `prefetchRoles()` 批量拉取所有角色成员，适合在启动时调用。

---

## 部门缓存流程 (jdy-dept-cache.ts)

```
isUserInDept(userName, deptNo)
  │
  ├─ 查缓存 deptCache.get(deptNo)
  │   ├─ 命中且未过期 → 返回 cached.members.has(userName)
  │   └─ 未命中或过期 ↓
  │
  ├─ JDY API: POST /api/v5/corp/department/user/list
  │   Body: { dept_no, skip, limit: 300 }（分页拉取）
  │
  ├─ 提取响应 users[].name → Set<string>
  │
  ├─ 写入缓存
  │
  └─ 返回 members.has(userName)
```

**TTL**: 5 分钟。首次调用时自动初始化。

---

## 操作层守卫流程 (jdy-guard.ts)

```
API Route: POST /api/jdy/data/[action]
  │
  ├─ 1. 解码 session → WecomUser
  │
  ├─ 2. checkJdyPermission(user, action, app_id, entry_id)
  │     │
  │     ├─ getPermSpec(entry_id, action)
  │     │   └─ FORM_PERMISSIONS[entry_id][action] → PermSpec | null
  │     │
  │     ├─ spec 为空 → { allowed: true }（放行）
  │     │
  │     └─ checkSpec(user.name, spec)
  │           ├─ spec.roles  → isUserInRole() 逐个检查（任一命中 → true）
  │           ├─ spec.depts  → isUserInDept() 逐个检查（任一命中 → true）
  │           ├─ spec.members → user.name 在列表中（命中 → true）
  │           └─ 全部不命中 → { allowed: false, reason: "无此操作权限" }
  │
  └─ 3. 放行 → 转发请求到简道云 API
      拒绝 → 返回 403
```

---

## 菜单权限流程

```
HomeClient mount
  │
  ├─ useEffect → GET /api/user/permissions
  │     │
  │     ├─ 解码 session → WecomUser
  │     │
  │     ├─ 收集 MENU_PERMISSIONS + FORM_PERMISSIONS 中所有 role_nos / dept_nos
  │     │
  │     ├─ Promise.all 并行检查:
  │     │   └─ isUserInRole(user, eachRole)
  │     │   └─ isUserInDept(user, eachDept)
  │     │
  │     ├─ 对每个 MENU_PERMISSIONS[pageKey]:
  │     │   ├─ spec.roles ∩ userRoles ≠ ∅ → allowed
  │     │   ├─ spec.depts ∩ userDepts ≠ ∅ → allowed
  │     │   └─ user.name ∈ spec.members    → allowed
  │     │
  │     └─ 返回 { name, roles, depts, allowedPages: PageKey[] }
  │
  └─ setAllowedPages(new Set(allowedPages))
        │
        └─ Sidebar 渲染
              ├─ LABEL_TO_PAGE[label] → PageKey
              ├─ allowedPages.has(pageKey) → 显示菜单项
              ├─ hasVisibleChild() → 父级有可见子项才显示
              └─ allowedPages 为 undefined（API 失败）→ 全部显示
```

---

## 角色别名完整列表

| 别名 | role_no |
|------|---------|
| 招生核心领导 | 5 |
| 教务处招办 | 6 |
| 插班复读审核组 | 7 |
| 人事科 | 8 |
| 招生审批过程通知 | 10 |
| 财务 | 11 |
| 招生信息审核和修改 | 16 |
| 招生添加班级组 | 18 |
| 技术 | 19 |
| 党员管理 | 21 |
| 师资管理 | 22 |
| 教研组长 | 24 |
| 学生发展处核心领导 | 25 |
| 安全办核心领导 | 26 |
| 后勤核心领导 | 27 |
| 课程核心领导 | 28 |
| 学校核心领导 | 29 |
| 干部考核组 | 30 |
| 支部委员干事备课组长考核组 | 31 |
| 部门分管领导 | 32 |
| 双周工作计划负责人 | 33 |
| 学生发展处副主任 | 34 |
| 课程处领导 | 35 |
| 校长 | 36 |
| 学校办公室中层领导 | 38 |
| 学校办公室负责人 | 39 |
| 学校办公室分管校领导 | 40 |
| 学生发展处分管校领导 | 42 |
| 学生发展处负责人 | 43 |
| 学生发展处中层领导 | 44 |
| 课程教学处分管校领导 | 46 |
| 课程教学处负责人 | 47 |
| 课程教学处中层领导 | 48 |
| 师资培养处分管校领导 | 50 |
| 师资培养处负责人 | 51 |
| 师资培养处中层领导 | 52 |
| 全体教师 | 53 |
| 高一级部主任 | 54 |
| 高二级部主任 | 55 |
| 高三级部主任 | 56 |
| 后勤服务处负责人 | 58 |
| 后勤服务处中层领导 | 59 |
| 后勤服务处分管校领导 | 60 |
| 安全办负责人 | 62 |
| 安全办中层领导 | 63 |
| 安全办分管校领导 | 64 |
| 学校办公室干事 | 65 |
| 教官队负责人 | 67 |
| 教官队副队长 | 68 |
| 教官队 | 69 |
| 宣传科负责人 | 71 |
| 宣传科分管校领导 | 72 |
| 宣传科分管党总支领导 | 73 |
| 师资培养处干事 | 74 |

---

## 添加新权限的步骤

1. **新增角色**：在 `jdy-permissions.ts` 的 `R` 对象中添加 `角色名: role_no`
2. **新增部门**：在 `D` 对象中添加 `部门名: dept_no`
3. **表单操作权限**：在 `FORM_PERMISSIONS` 对应 `entry_id` 下添加 action → `roles(...)` 或 `perm({...})`
4. **菜单可见性**：在 `MENU_PERMISSIONS` 中添加 `"page-key"` → `roles(...)`
