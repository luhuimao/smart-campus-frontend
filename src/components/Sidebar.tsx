"use client";

import { Search, Home, Folder, ChevronDown, ChevronRight, FileText, LayoutGrid } from "lucide-react";
import { useState } from "react";

const treeItems = [
  { icon: Home,   label: "首页",             active: true,  iconColor: "#10b981", children: undefined },
  { icon: Folder, label: "教科研看板",        active: false, iconColor: "#f97316", children: undefined },
  { icon: Folder, label: "教师评价",          active: false, iconColor: "#f97316", children: ["教师所带班级排名", "班主任所带文明班级", "班主任所带文明宿舍"] },
  { icon: Folder, label: "教师基础档案",      active: false, iconColor: "#f97316", children: ["教师资格证", "职称信息", "荣誉称号", "获奖记录", "论文", "课题", "著作", "教师培训", "工作履历", "教育经历", "教学兼职"] },
  { icon: Folder, label: "教研活动",          active: false, iconColor: "#f97316", children: ["教研活动数据分析", "教研活动记录"] },
  { icon: Folder, label: "备课活动",          active: false, iconColor: "#f97316", children: ["备课活动数据分析","备课组活动记录"] },
  { icon: Folder, label: "教师组织参与的活动", active: false, iconColor: "#f97316", children: [{ label: "科技节活动", children: ["科技节活动看板", "科技节活动登记"] }] },
  { icon: Folder, label: "星级教师、星级班主任", active: false, iconColor: "#f97316", children: undefined },
];

const PARENT_KEY = "一师一案";

type YishengChild = { label: string; children?: string[] };
type YishengItem = { label: string; children?: YishengChild[] };

const yishengItems: YishengItem[] = [
  { label: "首页" },
  { label: "学生管理看板" },
  { label: "宿舍考勤看板" },
  { label: "学生档案", children: [{ label: "学生花名册" }] },
  { label: "学生成长", children: [
    { label: "一生一案谈心谈话记录表" },
    { label: "学生获奖记录" },
    { label: "好人好事记录" },
    { label: "体质检测录入" },
    { label: "学生干部风采" },
  ]},
  { label: "学生管理", children: [
    { label: "返校登记表" },
    { label: "学生退/转/休学申请表" },
    { label: "转科（班）申请表" },
    { label: "NFC宿舍考勤（桂宏）", children: ["宿舍考勤记录"] },
  ]},
  { label: "学生活动" },
  { label: "学情分析", children: [{ label: "学生成绩" }, { label: "学情分析统计表" }, { label: "学情分析表" }] },
  { label: "基础数据", children: [{ label: "科目" }, { label: "选考科目" }, { label: "学期" }, { label: "年级" }] },
];

const parentMenus = [
  { key: "一师一案", color: "#3b82f6" },
  { key: "一生一案", color: "#8b5cf6" },
];

import type { PageKey } from "@/app/page";

interface SidebarProps {
  onNavigate?: (page: PageKey) => void;
  activePage?: PageKey;
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onNavigate, activePage, mobileOpen, onClose }: SidebarProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [PARENT_KEY]: true });
  const [activeParent, setActiveParent] = useState<string>(PARENT_KEY);

  const handleNavigate = (page: PageKey) => {
    onNavigate?.(page);
    onClose?.();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}
    <div
      className={`flex flex-col relative shrink-0 fixed md:relative z-50 md:z-auto h-full transition-transform duration-300 md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      style={{
        width: 260,
        height: "100%",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(0,0,0,0.06)",
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 shrink-0"
        style={{
          height: 64,
          padding: "0 20px",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
          style={{ background: activeParent === "一生一案" ? "linear-gradient(135deg, #8b5cf6, #6d28d9)" : "linear-gradient(135deg, #5BC8F5, #2B8FD9)" }}
        >
          <LayoutGrid className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-gray-900 truncate">{activeParent}</span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: "12px 10px" }}>

        {/* Search */}
        <div
          className="flex items-center gap-2 mb-3 shrink-0"
          style={{
            height: 34,
            background: "rgba(0,0,0,0.04)",
            borderRadius: 10,
            padding: "0 10px",
          }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "#9ca3af" }} />
          <input
            type="text"
            placeholder="输入名称来搜索"
            className="bg-transparent border-none outline-none w-full text-xs"
            style={{ color: "#6b7280" }}
          />
        </div>

        {/* Tree */}
        <div className="flex flex-col gap-0.5">

          {/* Parent: 一师一案 */}
          <div>
            <div
              className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
              style={{ height: 36, padding: "0 10px", fontSize: 13, fontWeight: 600, color: "#111827" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              onClick={() => { setActiveParent(PARENT_KEY); setExpanded((prev) => ({ ...prev, [PARENT_KEY]: !prev[PARENT_KEY] })); }}
            >
              <LayoutGrid size={15} style={{ color: "#3b82f6", flexShrink: 0 }} />
              <span className="flex-1 truncate">{PARENT_KEY}</span>
              {expanded[PARENT_KEY]
                ? <ChevronDown size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
                : <ChevronRight size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />}
            </div>

            {expanded[PARENT_KEY] && (
              <div className="flex flex-col gap-0.5 mt-0.5" style={{ paddingLeft: 12 }}>
                {treeItems.map(({ icon: Icon, label, iconColor, children }) => {
                  const isActive = (label === "首页" || label === "教科研看板") && activePage === "research-dashboard";
                  return (
                  <div key={label}>
                    <div
                      className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
                      style={{
                        height: 34,
                        padding: "0 10px",
                        background: isActive ? "rgba(59,130,246,0.1)" : "transparent",
                        fontWeight: isActive ? 600 : 400,
                        fontSize: 13,
                        color: isActive ? "#2563eb" : "#374151",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent";
                      }}
                      onClick={() => {
                        if (label === "首页" || label === "教科研看板") { handleNavigate("research-dashboard"); return; }
                        if (children) setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
                      }}
                    >
                      <Icon size={14} style={{ color: isActive ? "#2563eb" : iconColor, flexShrink: 0 }} />
                      <span className="flex-1 truncate">{label}</span>
                      {children && (
                        expanded[label]
                          ? <ChevronDown size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
                          : <ChevronRight size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
                      )}
                    </div>

                    {children && expanded[label] && (
                      <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5" style={{ paddingLeft: 14 }}>
                        {children.map((child) => {
                          const childLabel = typeof child === "string" ? child : child.label;
                          const grandChildren = typeof child === "string" ? undefined : child.children;
                          const grandChildPageMap: Record<string, PageKey> = {
                            "科技节活动看板": "science-fest-dashboard",
                            "科技节活动登记": "science-fest-form",
                          };
                          const childPageMap: Record<string, PageKey> = {
                            "教师资格证": "teacher-cert",
                            "职称信息": "title-info",
                            "荣誉称号": "honor-title",
                            "获奖记录": "award-record",
                            "论文": "paper",
                            "课题": "project",
                            "著作": "works",
                            "教师培训": "teacher-training",
                            "工作履历": "work-history",
                            "教育经历": "education",
                            "教学兼职": "part-time",
                            "教研活动数据分析": "research-activity-analysis",
                            "教研活动记录": "research-activity-record",
                            "备课组活动记录": "lesson-prep-record",
                            "备课活动数据分析": "lesson-prep-analysis",
                          };
                          const childPage = childPageMap[childLabel];
                          const childActive = childPage && activePage === childPage;
                          return (
                          <div key={childLabel}>
                            <div
                              className="flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150"
                              style={{
                                height: 30,
                                padding: "0 10px",
                                fontSize: 12,
                                color: childActive ? "#2563eb" : "#6b7280",
                                background: childActive ? "rgba(59,130,246,0.08)" : "transparent",
                                fontWeight: childActive ? 600 : 400,
                              }}
                              onMouseEnter={(e) => {
                                if (!childActive) {
                                  (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)";
                                  (e.currentTarget as HTMLDivElement).style.color = "#111827";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!childActive) {
                                  (e.currentTarget as HTMLDivElement).style.background = "transparent";
                                  (e.currentTarget as HTMLDivElement).style.color = "#6b7280";
                                }
                              }}
                              onClick={() => {
                                if (grandChildren) { setExpanded((prev) => ({ ...prev, [childLabel]: !prev[childLabel] })); return; }
                                if (childPage) handleNavigate(childPage);
                              }}
                            >
                              <FileText size={12} style={{ color: childActive ? "#2563eb" : "#d1d5db", flexShrink: 0 }} />
                              <span className="flex-1 truncate">{childLabel}</span>
                              {grandChildren && (expanded[childLabel]
                                ? <ChevronDown size={11} style={{ color: "#9ca3af", flexShrink: 0 }} />
                                : <ChevronRight size={11} style={{ color: "#9ca3af", flexShrink: 0 }} />
                              )}
                            </div>
                            {grandChildren && expanded[childLabel] && (
                              <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5" style={{ paddingLeft: 14 }}>
                                {grandChildren.map((gc) => {
                                  const gcPage = grandChildPageMap[gc];
                                  const gcActive = gcPage && activePage === gcPage;
                                  return (
                                  <div
                                    key={gc}
                                    className="flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150"
                                    style={{ height: 28, padding: "0 10px", fontSize: 11, color: gcActive ? "#2563eb" : "#9ca3af", background: gcActive ? "rgba(59,130,246,0.08)" : "transparent", fontWeight: gcActive ? 600 : 400 }}
                                    onMouseEnter={(e) => {
                                      if (!gcActive) { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.color = "#374151"; }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!gcActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#9ca3af"; }
                                    }}
                                    onClick={() => gcPage && handleNavigate(gcPage)}
                                  >
                                    <FileText size={11} style={{ color: gcActive ? "#2563eb" : "#e5e7eb", flexShrink: 0 }} />
                                    <span className="truncate">{gc}</span>
                                  </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Parent: 一生一案 */}
          <div>
            <div
              className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
              style={{ height: 36, padding: "0 10px", fontSize: 13, fontWeight: 600, color: "#111827" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              onClick={() => { setActiveParent("一生一案"); setExpanded((prev) => ({ ...prev, "一生一案": !prev["一生一案"] })); }}
            >
              <LayoutGrid size={15} style={{ color: "#8b5cf6", flexShrink: 0 }} />
              <span className="flex-1 truncate">一生一案</span>
              {expanded["一生一案"]
                ? <ChevronDown size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
                : <ChevronRight size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />}
            </div>

            {expanded["一生一案"] && (
              <div className="flex flex-col gap-0.5 mt-0.5" style={{ paddingLeft: 12 }}>
                {yishengItems.map(({ label, children }) => (
                  <div key={label}>
                    <div
                      className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
                      style={{ height: 34, padding: "0 10px", fontSize: 13, color: "#374151" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                      onClick={() => {
                        if (label === "学生管理看板") { handleNavigate("student-dashboard"); return; }
                        if (children) setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
                      }}
                    >
                      <Folder
                        size={14}
                        style={{ color: label === "学生管理看板" && activePage === "student-dashboard" ? "#8b5cf6" : "#f97316", flexShrink: 0 }}
                      />
                      <span className="flex-1 truncate" style={{ color: label === "学生管理看板" && activePage === "student-dashboard" ? "#8b5cf6" : undefined, fontWeight: label === "学生管理看板" && activePage === "student-dashboard" ? 600 : undefined }}>{label}</span>
                      {children && (expanded[label]
                        ? <ChevronDown size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
                        : <ChevronRight size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
                      )}
                    </div>
                    {children && expanded[label] && (
                      <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5" style={{ paddingLeft: 14 }}>
                        {children.map(({ label: childLabel, children: grandChildren }) => {
                          const yishengChildPageMap: Record<string, PageKey> = {
                            "学情分析表": "learning-analysis-table",
                          };
                          const childPage = yishengChildPageMap[childLabel];
                          const childActive = childPage && activePage === childPage;
                          return (
                          <div key={childLabel}>
                            <div
                              className="flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150"
                              style={{ height: 30, padding: "0 10px", fontSize: 12, color: childActive ? "#8b5cf6" : "#6b7280", background: childActive ? "rgba(139,92,246,0.08)" : "transparent", fontWeight: childActive ? 600 : 400 }}
                              onMouseEnter={(e) => {
                                if (!childActive) { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)";
                                (e.currentTarget as HTMLDivElement).style.color = "#111827"; }
                              }}
                              onMouseLeave={(e) => {
                                if (!childActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent";
                                (e.currentTarget as HTMLDivElement).style.color = "#6b7280"; }
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (grandChildren) { setExpanded((prev) => ({ ...prev, [childLabel]: !prev[childLabel] })); return; }
                                if (childPage) handleNavigate(childPage);
                              }}
                            >
                              <FileText size={12} style={{ color: childActive ? "#8b5cf6" : "#d1d5db", flexShrink: 0 }} />
                              <span className="flex-1 truncate">{childLabel}</span>
                              {grandChildren && (expanded[childLabel]
                                ? <ChevronDown size={11} style={{ color: "#9ca3af", flexShrink: 0 }} />
                                : <ChevronRight size={11} style={{ color: "#9ca3af", flexShrink: 0 }} />
                              )}
                            </div>
                            {grandChildren && expanded[childLabel] && (
                              <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5" style={{ paddingLeft: 14 }}>
                                {grandChildren.map((gc) => {
                                  const yishengGcPageMap: Record<string, PageKey> = {
                                    "学情分析表": "learning-analysis-table",
                                  };
                                  const gcPage = yishengGcPageMap[gc];
                                  const gcActive = gcPage && activePage === gcPage;
                                  return (
                                  <div
                                    key={gc}
                                    className="flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150"
                                    style={{ height: 28, padding: "0 10px", fontSize: 11, color: gcActive ? "#8b5cf6" : "#9ca3af", background: gcActive ? "rgba(139,92,246,0.08)" : "transparent", fontWeight: gcActive ? 600 : 400 }}
                                    onMouseEnter={(e) => {
                                      if (!gcActive) { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)";
                                      (e.currentTarget as HTMLDivElement).style.color = "#374151"; }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!gcActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent";
                                      (e.currentTarget as HTMLDivElement).style.color = "#9ca3af"; }
                                    }}
                                    onClick={() => gcPage && handleNavigate(gcPage)}
                                  >
                                    <FileText size={11} style={{ color: gcActive ? "#8b5cf6" : "#e5e7eb", flexShrink: 0 }} />
                                    <span className="truncate">{gc}</span>
                                  </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 h-full transition-colors hidden md:block"
        style={{ width: 4, cursor: "col-resize" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
      />
    </div>
    </>
  );
}
