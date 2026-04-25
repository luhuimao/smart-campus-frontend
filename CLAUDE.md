@AGENTS.md

## 设计规范（每次修改必须遵守）

### 视觉风格
- macOS 毛玻璃风格：使用 `.glass` CSS 类（`globals.css` 已定义），勿重复写内联样式
- 页面背景色：`#f5f5f7`（`bg-[#f5f5f7]`）
- 卡片圆角：小卡片 `rounded-[24px]`，中卡片 `rounded-[32px]`，大区块 `rounded-[40px]`

### 字体
- 全局字体已在 `body` 统一设置，**组件内禁止重复写 `fontFamily` 内联样式**
- 字号体系（各级相差 2px，保持层级感）：

| 用途 | Tailwind 类 | 实际大小 |
|------|-------------|---------|
| 页面大标题 / Banner | `text-4xl` ~ `text-5xl` | 36~48px |
| 区块标题、Tab 按钮 | `text-lg` | 18px |
| 正文、下拉选项、按钮 | `text-base` | 16px |
| 次级说明、标签 | `text-sm` | 14px |
| 大写字段标签（uppercase） | `text-sm` | 14px |
| 表格内紧凑文字 | `text-xs` | 12px |
| 侧边栏一级菜单 | `fontSize: 14` | 14px |
| 侧边栏二级菜单 | `fontSize: 13` | 13px |
| 侧边栏三级菜单 | `fontSize: 12` | 12px |

### 颜色体系
- **一师一案（教师端）**：主色蓝 `#3b82f6`，激活 `#2563eb`，激活背景 `rgba(59,130,246,0.1)`，渐变 `#5BC8F5 → #2B8FD9`
- **一生一案（学生端）**：与一师一案共用蓝色激活高亮，顶部 Header 渐变 `#8b5cf6 → #6d28d9`
- **一级菜单图标**：一师一案 `BookOpen` 靛蓝 `#6366f1`，一生一案 `GraduationCap` 靛蓝 `#6366f1`（颜色一致）
- **首页图标**：`Home` 绿色 `#10b981`
- **看板类图标**：`BarChart2` / `LayoutDashboard` 蓝色 `#3b82f6`
- **宿舍图标**：`Building2` 靛蓝 `#6366f1`
- **普通文件夹**：`Folder` 橙色 `#f97316`
- **文字**：主文本 `#111827`，次级 `#374151`，辅助 `#6b7280`，占位/禁用 `#9ca3af`
- **Tab 激活下划线**：绿色 `#10b981`（`.macos-tab-active`）

### 共享 CSS 类（`globals.css` 已定义，直接使用）
| 类名 | 用途 |
|------|------|
| `.glass` | 毛玻璃卡片面（background 0.85 + blur + border） |
| `.page-header` | 顶部导航栏（height 64px + glass + z-index 10） |
| `.form-footer` | 表单底部操作栏（glass + border-top dashed） |
| `.field-label` | 大写字段标签（10px bold gray uppercase） |
| `.form-input` | 标准输入框 / 下拉 / 文本域 |
| `.table-input` | 表格内紧凑输入框 |
| `.btn-secondary` | 取消 / 次要操作按钮 |
| `.apple-hover` | 卡片 hover 上浮动效 |
| `.macos-tab-active` | Tab 激活态（绿色下划线） |

### 间距
- 4px 基准网格，常用：`8 / 12 / 16 / 20 / 24px`
- 页面内边距：桌面 `p-10`，移动 `p-6`
- 区块间距：`space-y-10`

### 边框 / 阴影
- 分隔线：`rgba(0,0,0,0.06)`
- 卡片边框：`rgba(255,255,255,0.3)`（已含在 `.glass`）
- 卡片阴影：`shadow-sm`；强调阴影：`0 20px 40px rgba(0,0,0,0.1)`

### 交互
- hover 背景：`rgba(0,0,0,0.04)`
- 过渡：`transition-all duration-150`（菜单）/ `duration-300`（卡片）

---

## 页面结构规范

### 布局骨架
```
page.tsx
├── Sidebar（260px，固定，毛玻璃）
└── 内容区（flex-1，h-full，overflow-hidden）
    ├── <PageHeader>（64px，.page-header）
    └── 可滚动主区（flex-1 overflow-y-auto bg-[#f5f5f7]）
        └── <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
```

### 侧边栏（`Sidebar.tsx`）
- 宽度 260px，毛玻璃背景
- 三级菜单，逐级缩进 12px / 14px
- 激活高亮：蓝色 `rgba(59,130,246,0.1)` + 文字 `#2563eb`（两个模块统一）
- 外部导航跳转后自动同步高亮（`useEffect` 监听 `activePage` prop）
- `PAGE_TO_LABEL` 映射表维护 PageKey → 菜单标签文字

### 顶部导航（`PageHeader.tsx`）
- 使用 `.page-header` 类，无需重复写内联样式
- 包含面包屑导航、铃铛通知、用户头像
- 可选 `left` 插槽（如"发起流程"按钮）

### 首页 / 看板页（`ResearchDashboard.tsx` 为模板）
- Banner 区：深色渐变背景 `#0f172a → #1e293b`，圆角 `28px`，高度 `208px`
- 快捷入口：`.glass` 卡片，`rounded-[32px] p-8`，图标 `64×64px rounded-[24px]`
- 筛选器：5 列网格，`.glass` 小卡片，`rounded-[24px]`
- 数据区：`.glass rounded-[40px]`，Tab 用 `.macos-tab-active`

### 表单页（各 `*Page.tsx` 为模板）
- 主体：`rounded-[28px] overflow-hidden shadow-sm border bg-white`
- 交替行背景：白色 `bg-white` / 米色 `#fffcf2`
- 字段组件：`<Field>` + `.form-input` / `.table-input`
- 底部操作栏：`.form-footer`，提交按钮用 `teal` 主题色内联，取消用 `.btn-secondary`

---

## 组件开发规范

- 新增组件放在 `src/components/`，命名导出 + PascalCase
- 优先用 Tailwind 工具类；动态颜色、计算尺寸才用 `style={{}}`
- **禁止**在组件内重复定义 `const glass`、`const inputCls`、`fontFamily` 内联样式（已统一到 CSS）
- 复杂 keyframe 动画写入 `globals.css`
- TypeScript strict 模式，禁止 `any`
- 工具函数 camelCase，放在 `src/lib/`
- 不写无意义注释，不引入超出需求的抽象，不添加未被要求的功能

---

## 当前模块结构

### 一师一案（教师端，蓝色主题）
首页 · 教科研看板 · 教师评价 · 教师基础档案 · 教研活动 · 备课活动 · 教师组织参与的活动 · 星级教师/星级班主任

### 一生一案（学生端，蓝色激活 + 紫色 Header）
首页 · 学生管理看板 · 宿舍考勤看板 · 学生档案 · 学生成长 · 学生管理 · 学生活动 · 学情分析 · 基础数据
