# ShortcutPanels Specification

## Overview
- **Target file:** `src/components/ShortcutPanels.tsx`
- **Interaction model:** static (click items navigate, but we show mock links)
- **Screenshot:** `docs/design-references/shortcut-panels.png`

## DOM Structure
```
.shortcut-row (flex, gap 12px, full width)
  .shortcut-panel (left: "填报入口", ~556px wide)
    .container-header → .header-title "填报入口"
    .container-body
      .shortcut-grid (2-column grid of link items)
        .shortcut-item × 5 (icon + label)
        .see-all ("... 查看全部")
  .shortcut-panel (right: "人事申请", ~556px wide)
    .container-header → .header-title "人事申请"
    .container-body
      .shortcut-grid
        .shortcut-item × 5
        .see-all ("... 查看全部")
```

## Computed Styles

### Panel Container (.shortcut-panel)
- width: ~50% (flex: 1)
- backgroundColor: white
- backgroundImage: url("/images/b711e894323f.png")
- backgroundSize: 100% 100%
- borderRadius: 6px
- overflow: hidden
- boxShadow: 0 0 2px 0 rgba(19,29,46,.02), 0 4px 8px 0 rgba(19,29,46,.06), 0 4px 24px 6px rgba(19,29,46,.04)

### Panel Header (.container-header)
- height: 40px
- padding: 0 16px
- display: flex
- alignItems: center
- borderBottom: 1px solid rgba(19,29,46,0.08)

### Panel Title (.header-title)
- fontSize: 14px
- fontWeight: 700
- color: rgb(19, 29, 46)

### Shortcut Grid
- display: grid
- gridTemplateColumns: 1fr 1fr
- gap: 0 (items have own padding)
- padding: 8px 12px

### Shortcut Item
- display: flex
- alignItems: center
- gap: 10px
- padding: 12px 16px
- cursor: pointer
- height: ~48px

### App Icon (.x-biz-app-icon)
- width: 24px
- height: 24px
- borderRadius: 4px
- display: flex
- alignItems: center
- justifyContent: center
- backgroundImage: (gradient — see below)

### Item Label (.speedy-item-title)
- fontSize: 14px
- color: rgb(31, 45, 61)
- fontWeight: 400

### See All ("... 查看全部")
- display: flex
- alignItems: center
- gap: 6px
- padding: 12px 16px
- fontSize: 14px
- color: rgba(19,29,46,0.47)
- cursor: pointer
- "..." icon is 3 dots / ellipsis

## Per-State Content

### 填报入口 (left panel)
Items (icon gradient → label):
1. `linear-gradient(135deg, rgb(128,177,255), rgb(43,115,240))` → 教师资格证
2. `linear-gradient(135deg, rgb(100,200,113), rgb(59,173,74))` → 职称信息
3. `linear-gradient(135deg, rgb(253,125,121), rgb(239,86,85))` → 荣誉称号
4. `linear-gradient(135deg, rgb(247,190,84), rgb(237,164,38))` → 获奖记录
5. `linear-gradient(135deg, rgb(128,177,255), rgb(43,115,240))` → 教育经历
6. "... 查看全部"

### 人事申请 (right panel)
All icons use orange gradient: `linear-gradient(135deg, rgb(247,190,84), rgb(237,164,38))`
Items:
1. 转正申请
2. 薪酬福利调整申请
3. 劳动合同续签申请
4. 离职申请
5. 离职工作交接办理
6. "... 查看全部"

Note: from screenshot the HR icons appear orange/document-style. Use the same orange gradient for all HR items.

## Assets
- Background image: `/images/b711e894323f.png`
- Icons: colored gradient div boxes (no image needed — pure CSS gradients)
- Each icon box contains a small white SVG/icon (document/form icon) — use a simple white line icon

## Text Content (verbatim)
See Per-State Content above

## Responsive
- Two panels side by side on desktop
- Stack to single column below ~768px
