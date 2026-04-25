# Behaviors — 教职工管理 Dashboard

## Scroll Behaviors
- The main content area (right pane) does NOT scroll the full page — it scrolls internally within `.app-view-content`
- No scroll snap observed
- No smooth scroll library detected
- No scroll-driven animations

## Sidebar
- Width: 280px (expandable/collapsible via resize handle or collapse button)
- Collapse transition: `left 0.6s cubic-bezier(0.19, 1, 0.22, 1)` — smooth slide
- Collapse button: small button top-right of sidebar
- **Active state**: bg rgba(19,29,46,0.08), borderRadius ~6px
- **Hover state**: likely same as active state bg

## Tab Bar
- INTERACTION MODEL: click-driven
- Clicking a tab changes the displayed data table content
- Active tab: bg rgb(17,110,255), text white/92% opacity
- Inactive tab hover: likely slight bg change
- No animation between tabs (instant switch)

## Shortcut Icons
- Hover: cursor pointer, likely slight opacity or elevation change
- No observed animation

## Header Bar
- Static — no scroll behavior
- Bell icon: clickable (notification panel)
- Expand icon (⇲): likely fullscreens the dashboard panel

## No Behaviors Detected
- No scroll-driven animations
- No auto-playing carousels
- No Lenis or Locomotive Scroll
- No parallax
- No dark mode switch
