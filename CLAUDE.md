@AGENTS.md

## 设计规范（每次修改必须遵守）

- **视觉风格**：macOS 毛玻璃风格，`backdrop-filter: blur(20px)`，白色半透明卡片背景 `rgba(255,255,255,0.8~0.85)`
- **字体**：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif`
- **主色**：
  - 一师一案模块：蓝色 `#3b82f6` / 渐变 `#5BC8F5 → #2B8FD9`
  - 一生一案模块：紫色 `#8b5cf6` / 渐变 `#8b5cf6 → #6d28d9`
  - 激活态：绿色 `#10b981` / `#059669`
  - 辅助色：橙色 `#f97316`（文件夹图标）
- **文字颜色**：主文本 `#111827`，次级 `#374151`，占位/禁用 `#6b7280`，标签 `#9ca3af`
- **间距**：4px 基准网格，常用间距 8 / 12 / 16 / 20 / 24px
- **圆角**：菜单项 `12px`，搜索框 `10px`，卡片 `24px ~ 40px`，按钮/标签 `8px ~ 12px`
- **边框**：分隔线 `rgba(0,0,0,0.06)`，卡片边框 `rgba(255,255,255,0.3)`
- **阴影**：卡片 `0 20px 40px rgba(0,0,0,0.1)`，按钮 `shadow-sm`
- **hover 效果**：背景 `rgba(0,0,0,0.04)`，过渡 `transition-all duration-150`
- **响应式**：移动优先，Tailwind 断点 `sm / md / lg`
- **动画**：复杂 keyframe 动画统一写入 `src/app/globals.css`，组件内用 Tailwind 动画类

## 组件规范

- 侧边栏（`Sidebar.tsx`）：宽度 260px，毛玻璃背景，支持多级展开菜单，顶部 Header 随激活模块动态切换
- 主内容区（`ResearchDashboard.tsx`）：顶栏高度 64px 与侧边栏对齐，主内容区可滚动，背景色 `#f5f5f7`
- 新增组件必须放在 `src/components/` 下，使用命名导出 + PascalCase
- 不使用 inline style 能用 Tailwind 解决的场景；动态值（颜色、尺寸计算）才用 `style={{}}`

## 开发规范

- TypeScript strict 模式，禁止 `any`
- 工具函数使用 camelCase，放在 `src/lib/`
- 样式优先使用 Tailwind 工具类，复杂动画写入 `globals.css`
- 不写无意义注释，不引入超出需求的抽象
- 不添加未被要求的功能或重构

## 当前模块结构

### 一师一案（教师端，蓝色主题）
首页 · 师资培养档案 · 教科研看板 · 教师评价 · 教师基础档案 · 备课活动 · 教师组织参与的活动 · 星级教师/星级班主任

### 一生一案（学生端，紫色主题）
首页 · 学生管理看板 · 宿舍考勤看板 · 学生档案 · 学生成长 · 学生管理 · 学生活动 · 学情分析 · 基础数据
