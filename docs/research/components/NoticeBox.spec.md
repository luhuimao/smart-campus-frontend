# NoticeBox Specification

## Overview
- **Target file:** `src/components/NoticeBox.tsx`
- **Interaction model:** static
- **Screenshot:** `docs/design-references/notice-box.png`

## DOM Structure
```
.fx-dash-container (full width, white bg + decorative bg image)
  .container-body
    .fx-dash-rich-text
      → text content (multi-line, Chinese)
```

## Computed Styles

### Container
- width: 100%
- backgroundColor: white (rgb(255,255,255))
- backgroundImage: url("/images/b711e894323f.png")
- backgroundSize: 100% 100%
- borderRadius: 6px
- padding: 16px 20px
- marginBottom: 12px
- boxShadow: 0 0 2px 0 rgba(19,29,46,.02), 0 4px 8px 0 rgba(19,29,46,.06), 0 4px 24px 6px rgba(19,29,46,.04)

### Text Content
- fontSize: 14px
- lineHeight: 24px
- color: rgb(19, 29, 46)
- fontWeight: 400
- First line "使用说明：" is a label/heading style

## Text Content (verbatim)
```
使用说明：
1、第一步请确保入职时已完成【教职工档案的填写】，才能补充其他资料。
2、【教职工档案的填写】后，可根据实际情况补充奖状、荣誉称号、职称、工作履历、教育经历等信息，后续获奖情况也在此点击相应按钮进行新增，新增后会同步到个人档案。
```

## Assets
- Background image: `/images/b711e894323f.png` (soft wavy/cloud decorative pattern, light blue/gray tones, very subtle)

## States & Behaviors
- N/A — purely static display

## Responsive
- Full width of content area
