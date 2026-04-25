# Page Topology — 教职工管理 Dashboard

## URL
`https://wxwork.jiandaoyun.com/dashboard#/app/67fe190a3b9b96ddf443c3a2`

## Page Title
应用首页 (Application Home)

## Overall Layout
- Two-column: left sidebar (280px fixed) + right content area (fills remaining width)
- Full viewport height, no page scroll — internal panels scroll independently
- Sidebar: `position: absolute`, `left: 0`, transitions on collapse
- Right pane fills rest: flex column (header bar 50px + content area)

## Z-index Layers
1. Page wrapper `.fx-bg-page-wrapper` — base
2. Sidebar `.left-pane` — z-index: 0
3. Content header `.fx-non-fixed-navigation-bar` — z-index: 10

## Sections (top to bottom, left to right)

### 1. Sidebar (`left-pane`) — STATIC + click-driven
- Position: fixed left column, 280px wide
- bg: rgb(243, 243, 248)
- Sub-sections:
  - **App Switcher Header**: back arrow `<` + blue cube icon + "教职工管理" bold title
  - **Flow Nav**: 我的待办, 我发起的, 我处理的, 抄送我的 (with respective icons)
  - **Search box**: placeholder "输入名称来搜索"
  - **Tree menu**: 首页 (active, home icon, bg rgba(19,29,46,0.08)), 人事管理 (orange folder, collapsed), 师资培养档案 (orange folder)
  - **Resize handle**: 6px drag line on right edge

### 2. Content Header Bar (`fx-non-fixed-navigation-bar`) — STATIC
- Height: 50px, position: absolute, z-index: 10
- Left: "个人档案看板" title (14px/700) + divider + expand icon (⇲)
- Right: bell notification icon + user avatar red circle "卢"

### 3. Main Content Area — scroll-driven within container
Three visual blocks stacked vertically:

#### 3a. Notice/Instruction Box — STATIC
- Full-width white card with decorative wavy/clouds background image
- Text: "使用说明：1、第一步请确保入职时已完成【教职工档案的填写】..."
- bg: white + background-image: url(b711e894323f.png) 100% 100%

#### 3b. Shortcut Panels Row — STATIC (two side-by-side panels)
- **Left panel "填报入口"**: 5 form links (colored gradient icons + text label)
  - 教师资格证 (blue gradient), 职称信息 (green), 荣誉称号 (red), 获奖记录 (yellow/orange), 教育经历 (blue)
  - "... 查看全部" link
- **Right panel "人事申请"**: 5 HR form links (all orange icons)
  - 转正申请, 薪酬福利调整申请, 劳动合同续签申请, 离职申请, 离职工作交接办理
  - "... 查看全部" link
- Both panels share bg: white + background-image: url(b711e894323f.png)

#### 3c. Tab Bar + Data Table — click-driven tabs
- Tab bar: 基础档案 (active, blue bg #116eff, white text), 教资及职称, 荣誉称号, 获奖记录, 教育经历, 工作履历, 教学兼职, 论文, 教育课题, 著作
- Active tab: bg rgb(17,110,255), text rgba(255,255,255,0.92), borderRadius 6px 6px 0 0
- Inactive tabs: bg rgba(20,30,49,0.04), text rgb(31,45,61), same shape
- Below tabs: section title "基础档案" + data table
- Table header: bg rgb(151,190,245), text rgb(20,30,49), 13px
- Columns: 教职工姓名, 人脸识别照, 形象照, 联系方式, 身份证号, 身份证图片, 性别, 出生日期, 年龄...

## Interaction Models
- Sidebar tree items: click-driven navigation
- Tab bar: click-driven (switches table content)
- Resize handle: drag-driven sidebar width
- Content: static display (data comes from backend, we show empty table)

## Key Assets
- Background tile: `https://g.jdycdn.com/static/app/pc/b711e894323f.png`
- App cube icon: light blue SVG cube (custom SVG)
- Flow nav icons: iconfont (bell, play, inbox, send icons)
- Tree menu icons: home SVG (teal), folder emoji (orange)

## Responsive
- Desktop (1440px): sidebar 280px + content area fills rest
- No tablet/mobile layout observed (this is a desktop-only app)
