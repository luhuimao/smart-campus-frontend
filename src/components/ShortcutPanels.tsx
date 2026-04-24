"use client";

import { FolderOpen, Briefcase, Flag, Trophy, Bookmark, FileText, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShortcutItem {
  label: string;
  gradient: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: React.ComponentType<any>;
}

interface PanelData {
  title: string;
  items: ShortcutItem[];
}

const LEFT_PANEL: PanelData = {
  title: "填报入口",
  items: [
    { label: "教师资格证", gradient: "linear-gradient(135deg, rgb(128,177,255), rgb(43,115,240))", icon: FolderOpen },
    { label: "职称信息", gradient: "linear-gradient(135deg, rgb(100,200,113), rgb(59,173,74))", icon: Briefcase },
    { label: "荣誉称号", gradient: "linear-gradient(135deg, rgb(253,125,121), rgb(239,86,85))", icon: Flag },
    { label: "获奖记录", gradient: "linear-gradient(135deg, rgb(247,190,84), rgb(237,164,38))", icon: Trophy },
    { label: "教育经历", gradient: "linear-gradient(135deg, rgb(128,177,255), rgb(43,115,240))", icon: Bookmark },
  ],
};

const RIGHT_PANEL: PanelData = {
  title: "人事申请",
  items: [
    {
      label: "转正申请",
      gradient: "linear-gradient(135deg, rgb(247,190,84), rgb(237,164,38))",
    },
    {
      label: "薪酬福利调整申请",
      gradient: "linear-gradient(135deg, rgb(247,190,84), rgb(237,164,38))",
    },
    {
      label: "劳动合同续签申请",
      gradient: "linear-gradient(135deg, rgb(247,190,84), rgb(237,164,38))",
    },
    {
      label: "离职申请",
      gradient: "linear-gradient(135deg, rgb(247,190,84), rgb(237,164,38))",
    },
    {
      label: "离职工作交接办理",
      gradient: "linear-gradient(135deg, rgb(247,190,84), rgb(237,164,38))",
    },
  ],
};

const panelStyle: React.CSSProperties = {
  flex: 1,
  backgroundColor: "white",
  backgroundImage: 'url("/images/b711e894323f.png")',
  backgroundSize: "auto",
  backgroundPosition: "right top",
  backgroundRepeat: "no-repeat",
  borderRadius: 6,
  overflow: "hidden",
  boxShadow:
    "0 0 2px 0 rgba(19,29,46,.02), 0 4px 8px 0 rgba(19,29,46,.06), 0 4px 24px 6px rgba(19,29,46,.04)",
};

function ShortcutPanel({ panel }: { panel: PanelData }) {
  return (
    <div style={panelStyle}>
      {/* Header */}
      <div
        style={{
          height: 40,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid rgba(19,29,46,0.08)",
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "rgb(19, 29, 46)",
          }}
        >
          {panel.title}
        </span>
      </div>

      {/* Body — 2-column grid */}
      <div
        style={{
          padding: "8px 0",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        {panel.items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 24px",
              cursor: "pointer",
              height: 46,
            }}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: item.gradient,
              }}
            >
              {item.icon ? <item.icon size={14} color="white" /> : <FileText size={14} color="white" />}
            </div>
            <span
              style={{
                fontSize: 14,
                color: "rgb(31, 45, 61)",
                fontWeight: 400,
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}

        {/* See all */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            cursor: "pointer",
            color: "rgba(19,29,46,0.47)",
            fontSize: 14,
            height: 46,
          }}
        >
          <MoreHorizontal size={14} color="rgba(19,29,46,0.47)" />
          <span>查看全部</span>
        </div>
      </div>
    </div>
  );
}

export function ShortcutPanels({ className }: { className?: string }) {
  return (
    <div
      className={cn(className)}
      style={{
        display: "flex",
        gap: 12,
        width: "100%",
        marginBottom: 12,
      }}
    >
      <ShortcutPanel panel={LEFT_PANEL} />
      <ShortcutPanel panel={RIGHT_PANEL} />
    </div>
  );
}
