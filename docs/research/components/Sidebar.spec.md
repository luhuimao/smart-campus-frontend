# Sidebar Specification

## Overview
- **Target file:** `src/components/Sidebar.tsx`
- **Screenshot:** `docs/design-references/sidebar.png`
- **Interaction model:** click-driven (menu items navigate, collapse button toggles)

## DOM Structure
```
.left-pane (280px wide, flex column, bg rgb(243,243,248))
  .app-switcher (header: back arrow + app icon + app title)
  .menu-wrapper (flex column, fills rest)
    .app-flow-manage-wrapper (flow items: 我的待办 etc)
    [search input]
    [tree nav: 首页 active, folder groups]
  .resize-line (6px drag handle, right edge)
  [collapse button, right edge]
```

## Computed Styles (exact values from getComputedStyle)

### .left-pane (Sidebar Container)
- width: 280px
- height: 100% (full viewport height)
- backgroundColor: rgb(243, 243, 248)
- display: flex
- flexDirection: column
- position: absolute (left: 0)
- transition: left 0.6s cubic-bezier(0.19, 1, 0.22, 1)
- fontSize: 14px
- color: rgb(19, 29, 46)
- overflow: hidden (right edge clipped by resize line)

### App Switcher (.app-switcher)
- width: 280px
- height: ~50px
- display: flex
- alignItems: center
- padding: 0 16px
- gap: 8px
- borderBottom: 1px solid rgba(19,29,46,0.08)
- Contains: `<` back arrow (icon, 16px, color rgba(19,29,46,0.66)), teal-blue cube icon (32x32, borderRadius 8px), "教职工管理" text (fontWeight: 700, fontSize: 14px, color: rgb(19,29,46))

### Flow Nav Items (.app-flow-menu-item)
- height: 40px
- padding: 0 16px
- display: flex
- alignItems: center
- gap: 8px
- cursor: pointer
- color: rgb(19, 29, 46) / rgba(19,29,46,0.78)
- fontSize: 14px
- Items: 我的待办 (bell icon), 我发起的 (play icon), 我处理的 (inbox icon), 抄送我的 (send icon)

### Search Box
- margin: 8px 12px
- height: 32px
- backgroundColor: rgba(19,29,46,0.06)
- borderRadius: 6px
- display: flex
- alignItems: center
- padding: 0 10px
- gap: 6px
- placeholder text: "输入名称来搜索"
- placeholder color: rgba(19,29,46,0.29)
- search icon: rgba(19,29,46,0.47)

### Active Menu Item (首页)
- backgroundColor: rgba(19, 29, 46, 0.08)
- borderRadius: 6px
- margin: 0 8px
- height: 36px
- padding: 0 8px
- display: flex
- alignItems: center
- gap: 8px
- fontWeight: 600
- color: rgb(19, 29, 46)
- icon: home icon (teal #03ABA0)

### Inactive Tree Items
- height: 36px
- padding: 0 8px (with 8px margin on sides)
- display: flex
- alignItems: center
- gap: 8px
- color: rgb(19, 29, 46)
- cursor: pointer

### Folder Groups (人事管理, 师资培养档案)
- Same height/padding as tree items
- icon: orange folder emoji (🗂 or custom SVG, color ~rgb(245,166,35))
- fontWeight: 400 (collapsed state — no chevron shown)

### Resize Handle (.resize-line)
- width: 6px
- height: 100%
- position: absolute
- right: 0
- cursor: col-resize
- backgroundColor: transparent (hover: rgba(19,29,46,0.08))

## States & Behaviors

### Active Menu Item
- **Trigger:** click (route match)
- **State A:** no bg, fontWeight 400
- **State B:** bg rgba(19,29,46,0.08), fontWeight 600, borderRadius 6px
- **Transition:** instant

### Hover on Menu Items
- Slight bg change: rgba(19,29,46,0.04)
- cursor: pointer

## Text Content (verbatim)
- App title: 教职工管理
- Flow items: 我的待办, 我发起的, 我处理的, 抄送我的
- Search placeholder: 输入名称来搜索
- Active item: 首页
- Groups: 人事管理, 师资培养档案

## Assets
- App icon: light blue cube SVG (32x32, borderRadius 8px, gradient from #5BBEF5 to #2B8FD9)
- Flow icons: use Lucide icons (Bell, Play, Inbox, Send) at 16px, color rgba(19,29,46,0.66)
- Home icon: Home from Lucide at 16px, color #03ABA0
- Folder icon: Folder from Lucide at 16px, color rgb(245,166,35) (orange)

## Responsive Behavior
- Desktop only — no mobile layout
- Collapsible via button (animate width to 0 or 64px)
