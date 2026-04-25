# TabDataPanel Specification

## Overview
- **Target file:** `src/components/TabDataPanel.tsx`
- **Interaction model:** click-driven (tab switching changes table content)
- **Screenshot:** `docs/design-references/tab-panel.png`

## DOM Structure
```
.tab-data-panel (full width, white bg)
  .tab-header-wrapper (flex row, gap 4px, padding-top 4px, alignItems flex-end)
    .tab-header-item.tab-header-active (基础档案, blue bg)
    .tab-header-item (教资及职称, inactive)
    ... × 10 tabs total
  .tab-content-area
    .section-title "基础档案"
    .data-table
      .table-header-row
        .header-cell × N columns
      .table-body (empty — no data in demo)
```

## Computed Styles

### Tab Wrapper
- display: flex
- flexDirection: row
- alignItems: flex-end
- gap: 4px
- paddingTop: 4px
- width: 100%
- backgroundColor: white
- borderBottom: 2px solid rgba(19,29,46,0.08) (below tabs, above content)

### Active Tab (.tab-header-active)
- backgroundColor: rgb(17, 110, 255)
- color: rgba(255, 255, 255, 0.92)
- fontWeight: 600
- fontSize: 14px
- padding: 8px 16px
- height: 36px
- borderRadius: 6px 6px 0 0
- display: flex
- alignItems: center
- cursor: pointer

### Inactive Tab
- backgroundColor: rgba(20, 30, 49, 0.04)
- color: rgb(31, 45, 61)
- fontWeight: 400
- fontSize: 14px
- padding: 8px 16px
- height: 36px
- borderRadius: 6px 6px 0 0
- display: flex
- alignItems: center
- cursor: pointer

### Tab Content Area
- backgroundColor: white
- padding: 12px 0

### Section Title
- fontSize: 14px
- fontWeight: 600
- color: rgb(19, 29, 46)
- padding: 8px 16px
- marginBottom: 8px

### Table Header Cell
- backgroundColor: rgb(151, 190, 245)  ← light blue
- color: rgb(20, 30, 49)
- fontSize: 13px
- fontWeight: 400
- padding: 3px 20px 3px 10px
- height: 67px
- display: table-cell
- cursor: pointer
- borderRight: 1px solid rgba(151,190,245,0.5)

### Table Body
- Empty rows (no data) — show 2-3 empty rows with border

## States & Behaviors

### Tab Click
- **Trigger:** click on tab button
- **State A:** inactive (rgba bg, dark text, 400 weight)
- **State B:** active (blue bg, white text, 600 weight)
- **Transition:** instant (no animation)
- **Implementation:** useState to track active tab, conditional className

## Per-State Content (Tab Labels + Column Headers per tab)

### 基础档案 (active by default)
Columns: 教职工姓名, 人脸识别照, 形象照, 联系方式, 身份证号, 身份证图片, 性别, 出生日期, 年龄, 民族, 籍贯, 家庭地址, 政治面貌, 参加工作时间, 婚姻状况, 备注, 主要紧急联系人姓名, 主要紧急联系人关系, 主要紧急联系人电话

### Other tabs (教资及职称, 荣誉称号, 获奖记录, 教育经历, 工作履历, 教学兼职, 论文, 教育课题, 著作)
Show empty table with placeholder columns matching tab subject matter.

## All Tab Labels (verbatim)
基础档案, 教资及职称, 荣誉称号, 获奖记录, 教育经历, 工作履历, 教学兼职, 论文, 教育课题, 著作

## Assets
- No images required

## Responsive
- Horizontal scroll for tabs and table on narrow screens
