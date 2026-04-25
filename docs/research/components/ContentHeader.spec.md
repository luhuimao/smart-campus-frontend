# ContentHeader Specification

## Overview
- **Target file:** `src/components/ContentHeader.tsx`
- **Interaction model:** static
- **Screenshot:** `docs/design-references/header-bar.png`

## DOM Structure
```
.fx-non-fixed-navigation-bar (50px tall, full width of right pane)
  .navigation-left
    .fx-entry-title → <span class="entry-title">个人档案看板</span>
    <divider vertical>
    <expand icon button>
  .navigation-right
    <bell icon button>
    <user avatar "卢" red circle>
```

## Computed Styles

### Container
- height: 50px
- width: 100%
- display: flex (or block, position absolute z-index 10)
- alignItems: center
- justifyContent: space-between
- padding: 0 16px
- backgroundColor: transparent (white comes from parent)
- borderBottom: 1px solid rgba(19,29,46,0.08)
- position: absolute
- zIndex: 10

### Page Title (.entry-title)
- fontSize: 14px
- fontWeight: 700
- color: rgb(19, 29, 46)
- lineHeight: 28px

### Vertical Divider
- width: 1px
- height: 16px
- backgroundColor: rgba(19,29,46,0.15)
- margin: 0 8px

### Expand Icon Button
- width: 16px
- height: 16px
- color: rgba(19,29,46,0.47)
- cursor: pointer

### Bell Icon (notification)
- width: 24px
- height: 24px
- color: rgba(19,29,46,0.47)
- cursor: pointer
- marginRight: 12px

### User Avatar
- width: 32px
- height: 32px
- borderRadius: 50%
- backgroundColor: rgb(229, 81, 74) — red/coral
- color: white
- fontSize: 14px
- fontWeight: 600
- display: flex
- alignItems: center
- justifyContent: center
- text: "卢" (first char of user name)

## Text Content
- Title: 个人档案看板
- Avatar: 卢

## States & Behaviors
- N/A (static display)
- Bell hover: slight color change rgba(19,29,46,0.78)

## Responsive
- Desktop only
