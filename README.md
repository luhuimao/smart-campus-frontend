# 智慧教学管理系统

一个基于 Next.js 16 构建的教学管理系统前端，包含「一师一案」与「一生一案」两大模块，提供教科研数据看板、教师档案管理、学生档案管理等功能。

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | [Next.js 16](https://nextjs.org/) · App Router · React 19 |
| 语言 | TypeScript 5（strict 模式） |
| UI 组件 | [shadcn/ui](https://ui.shadcn.com/)（Radix 原语） |
| 样式 | [Tailwind CSS v4](https://tailwindcss.com/) + oklch 设计 token |
| 图标 | [Lucide React](https://lucide.dev/) |
| 动画 | tw-animate-css · CSS keyframe |
| 运行时 | Node.js ≥ 24 |
| 部署 | Vercel |

---

## 项目结构

```
src/
  app/
    globals.css            # 全局样式、自定义动画
    layout.tsx             # 根布局
    page.tsx               # 首页入口
  components/
    Sidebar.tsx            # 左侧多级菜单栏（支持动态联动）
    ResearchDashboard.tsx  # 右侧教科研数据看板
    ui/                    # shadcn/ui 基础组件
  lib/
    utils.ts               # cn() 工具函数
  types/
    dashboard.ts           # TypeScript 接口定义
public/
  images/                  # 静态图片资源
docs/
  research/                # 设计研究文档
scripts/                   # 资源下载脚本
```

---

## 功能模块

### 一师一案（教师端）
- 首页
- 师资培养档案（教师资格证、职称信息、荣誉称号等 11 项）
- 教科研看板
- 教师评价（班级排名、文明班级、文明宿舍）
- 教师基础档案
- 备课活动
- 教师组织参与的活动
- 星级教师、星级班主任

### 一生一案（学生端）
- 首页 · 学生管理看板 · 宿舍考勤看板
- 学生档案（学生花名册）
- 学生成长（谈心谈话、获奖记录、好人好事、体质检测、干部风采）
- 学生管理（返校登记、退转休学、转科申请、NFC 宿舍考勤）
- 学生活动
- 学情分析（学生成绩、统计表、分析表）
- 基础数据（科目、选考科目、学期、年级）

---

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 代码检查
npm run check
```

开发服务器默认运行在 [http://localhost:3000](http://localhost:3000)。

---

## 设计规范

- **视觉风格**：macOS 毛玻璃风格，`backdrop-filter: blur(20px)`，白色半透明卡片
- **字体**：`-apple-system, BlinkMacSystemFont, "SF Pro Text"` 系统字体栈
- **主色**：蓝色 `#3b82f6`（一师一案）· 紫色 `#8b5cf6`（一生一案）· 绿色 `#10b981`（激活态）
- **间距**：4px 基准网格
- **圆角**：菜单项 `12px`，卡片 `24px ~ 40px`
- **响应式**：移动优先，Tailwind 断点 `sm / md / lg`

---

## 开发规范

- TypeScript strict 模式，禁止 `any`
- 组件使用命名导出 + PascalCase
- 工具函数使用 camelCase
- 样式优先使用 Tailwind 工具类，复杂动画写入 `globals.css`
- 不写无意义注释，不引入超出需求的抽象

---

## License

MIT © JCodesMore
