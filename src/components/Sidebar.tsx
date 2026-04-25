"use client";

import { Search, Home, Folder, ChevronDown, ChevronRight, ChevronLeft, FileText, BookOpen, GraduationCap, BarChart2, LayoutDashboard, Building2 } from "lucide-react";
import React, { useState, useEffect } from "react";

const treeItems = [
  { icon: Home,          label: "首页",               iconColor: "#10b981", children: undefined },
  { icon: BarChart2,     label: "教科研看板",          iconColor: "#3b82f6", children: undefined },
  { icon: Folder, label: "教师评价",            iconColor: "#f97316", children: ["教师所带班级排名", "班主任所带文明班级", "班主任所带文明宿舍"] },
  { icon: Folder, label: "教师基础档案",        iconColor: "#f97316", children: ["教师资格证", "职称信息", "荣誉称号", "获奖记录", "论文", "课题", "著作", "教师培训", "工作履历", "教育经历", "教学兼职"] },
  { icon: Folder, label: "教研活动",            iconColor: "#f97316", children: ["教研活动数据分析", "教研活动记录"] },
  { icon: Folder, label: "备课活动",            iconColor: "#f97316", children: ["备课活动数据分析", "备课组活动记录"] },
  { icon: Folder, label: "教师组织参与的活动",   iconColor: "#f97316", children: [{ label: "科技节活动", children: ["科技节活动看板", "科技节活动登记"] }] },
  { icon: Folder, label: "星级教师、星级班主任", iconColor: "#f97316", children: undefined },
];

const PARENT_KEY = "一师一案";

type YishengChild = { label: string; children?: string[] };
type YishengItem  = { icon: React.ElementType; label: string; iconColor: string; children?: YishengChild[] };

const yishengItems: YishengItem[] = [
  { icon: Home,            label: "首页",       iconColor: "#10b981", children: undefined },
  { icon: LayoutDashboard, label: "学生管理看板", iconColor: "#3b82f6", children: undefined },
  { icon: Building2,       label: "宿舍考勤看板", iconColor: "#6366f1", children: undefined },
  { icon: Folder, label: "学生档案",   iconColor: "#f97316", children: [{ label: "学生花名册" }] },
  { icon: Folder, label: "学生成长",   iconColor: "#f97316", children: [{ label: "一生一案谈心谈话记录表" }, { label: "学生获奖记录" }, { label: "好人好事记录" }, { label: "体质检测录入" }, { label: "学生干部风采" }] },
  { icon: Folder, label: "学生管理",   iconColor: "#f97316", children: [{ label: "返校登记表" }, { label: "学生退/转/休学申请表" }, { label: "转科（班）申请表" }, { label: "NFC宿舍考勤（桂宏）", children: ["宿舍考勤记录"] }] },
  { icon: Folder, label: "学生活动",   iconColor: "#f97316", children: undefined },
  { icon: Folder, label: "学情分析",   iconColor: "#f97316", children: [{ label: "学生成绩" }, { label: "学情分析统计表" }, { label: "学情分析表" }] },
  { icon: Folder, label: "基础数据",   iconColor: "#f97316", children: [{ label: "科目" }, { label: "选考科目" }, { label: "学期" }, { label: "年级" }] },
];

const yishiChildKeys   = treeItems.filter((i) => i.children).map((i) => i.label);
const yishengChildKeys = yishengItems.filter((i) => i.children).map((i) => i.label);

import type { PageKey } from "@/app/page";

const PAGE_TO_LABEL: Partial<Record<PageKey, string>> = {
  "research-dashboard":        "首页",
  "teacher-cert":              "教师资格证",
  "title-info":                "职称信息",
  "honor-title":               "荣誉称号",
  "award-record":              "获奖记录",
  "paper":                     "论文",
  "project":                   "课题",
  "works":                     "著作",
  "teacher-training":          "教师培训",
  "work-history":              "工作履历",
  "education":                 "教育经历",
  "part-time":                 "教学兼职",
  "class-rank":                "教师所带班级排名",
  "civilized-class":           "班主任所带文明班级",
  "civilized-dorm":            "班主任所带文明宿舍",
  "research-activity-analysis":"教研活动数据分析",
  "research-activity-record":  "教研活动记录",
  "lesson-prep-record":        "备课组活动记录",
  "lesson-prep-analysis":      "备课活动数据分析",
  "science-fest-dashboard":    "科技节活动看板",
  "science-fest-form":         "科技节活动登记",
  "student-dashboard":         "学生管理看板",
  "learning-analysis-table":   "学情分析表",
};

interface SidebarProps {
  onNavigate?: (page: PageKey) => void;
  activePage?: PageKey;
  mobileOpen?: boolean;
  onClose?: () => void;
}

const sidebarBaseStyle: React.CSSProperties = {
  width: 260,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRight: "1px solid rgba(0,0,0,0.06)",
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif',
};

export function Sidebar({ onNavigate, activePage, mobileOpen, onClose }: SidebarProps) {
  const [expanded,     setExpanded]    = useState<Record<string, boolean>>({ [PARENT_KEY]: true });
  const [activeParent, setActiveParent] = useState<string>(PARENT_KEY);
  const [activeLabel,  setActiveLabel] = useState<string>("首页");
  const [collapsed,    setCollapsed]   = useState(false);

  useEffect(() => {
    if (!activePage) return;
    const label = PAGE_TO_LABEL[activePage];
    if (!label) return;
    setActiveLabel(label);
    const isYisheng = yishengItems.some(
      (i) => i.label === label || i.children?.some((c) => c.label === label || c.children?.includes(label))
    );
    setActiveParent(isYisheng ? "一生一案" : PARENT_KEY);
  }, [activePage]);

  const handleNavigate = (page: PageKey, label: string) => {
    setActiveLabel(label);
    onNavigate?.(page);
    onClose?.();
  };

  const toggleParent = (key: string) => {
    setActiveParent(key);
    setExpanded((prev) => ({
      ...prev,
      "一师一案": key === "一师一案" ? !prev["一师一案"] : false,
      "一生一案": key === "一生一案" ? !prev["一生一案"] : false,
    }));
  };

  const toggleYishi = (label: string) => {
    setExpanded((prev) => {
      const next = { ...prev };
      yishiChildKeys.forEach((k) => { next[k] = false; });
      next[label] = !prev[label];
      return next;
    });
  };

  const toggleYisheng = (label: string) => {
    setExpanded((prev) => {
      const next = { ...prev };
      yishengChildKeys.forEach((k) => { next[k] = false; });
      next[label] = !prev[label];
      return next;
    });
  };

  // ── Shared sidebar content (used in both mobile and desktop) ──────────────
  const content = (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 shrink-0" style={{ height: 64, padding: "0 20px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
          style={{ background: activeParent === "一生一案" ? "linear-gradient(135deg,#8b5cf6,#6d28d9)" : "linear-gradient(135deg,#5BC8F5,#2B8FD9)" }}
        >
          {activeParent === "一生一案" ? <GraduationCap className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
        </div>
        <span className="text-sm font-bold text-gray-900 truncate">{activeParent}</span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto flex flex-col" style={{ padding: "12px 10px" }}>

        {/* Search */}
        <div className="flex items-center gap-2 mb-3 shrink-0" style={{ height: 34, background: "rgba(0,0,0,0.04)", borderRadius: 10, padding: "0 10px" }}>
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: "#9ca3af" }} />
          <input type="text" placeholder="输入名称来搜索" className="bg-transparent border-none outline-none w-full text-xs" style={{ color: "#6b7280" }} />
        </div>

        {/* Tree */}
        <div className="flex flex-col gap-0.5">

          {/* ── 一师一案 ── */}
          <div>
            <div
              className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
              style={{ height: 36, padding: "0 10px", fontSize: 14, fontWeight: 600, color: "#111827" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              onClick={() => toggleParent(PARENT_KEY)}
            >
              <BookOpen size={15} style={{ color: "#6366f1", flexShrink: 0 }} />
              <span className="flex-1 truncate">{PARENT_KEY}</span>
              {expanded[PARENT_KEY] ? <ChevronDown size={13} style={{ color: "#9ca3af", flexShrink: 0 }} /> : <ChevronRight size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />}
            </div>

            {expanded[PARENT_KEY] && (
              <div className="flex flex-col gap-0.5 mt-0.5" style={{ paddingLeft: 12 }}>
                {treeItems.map(({ icon: Icon, label, iconColor, children }) => {
                  const isActive = activeLabel === label;
                  return (
                    <div key={label}>
                      <div
                        className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
                        style={{ height: 34, padding: "0 10px", background: isActive ? "rgba(59,130,246,0.1)" : "transparent", fontWeight: isActive ? 600 : 400, fontSize: 14, color: isActive ? "#2563eb" : "#374151" }}
                        onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; }}
                        onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                        onClick={() => {
                          if (label === "首页")      { handleNavigate("research-dashboard", "首页"); return; }
                          if (label === "教科研看板") { handleNavigate("research-dashboard", "教科研看板"); return; }
                          if (children) toggleYishi(label);
                        }}
                      >
                        <Icon size={14} style={{ color: isActive ? "#2563eb" : iconColor, flexShrink: 0 }} />
                        <span className="flex-1 truncate">{label}</span>
                        {children && (expanded[label] ? <ChevronDown size={13} style={{ color: "#9ca3af", flexShrink: 0 }} /> : <ChevronRight size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />)}
                      </div>

                      {children && expanded[label] && (
                        <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5" style={{ paddingLeft: 14 }}>
                          {children.map((child) => {
                            const childLabel   = typeof child === "string" ? child : child.label;
                            const grandChildren = typeof child === "string" ? undefined : child.children;
                            const grandChildPageMap: Record<string, PageKey> = { "科技节活动看板": "science-fest-dashboard", "科技节活动登记": "science-fest-form" };
                            const childPageMap: Record<string, PageKey> = {
                              "教师资格证": "teacher-cert", "职称信息": "title-info", "荣誉称号": "honor-title",
                              "获奖记录": "award-record", "论文": "paper", "课题": "project", "著作": "works",
                              "教师培训": "teacher-training", "工作履历": "work-history", "教育经历": "education",
                              "教学兼职": "part-time", "教师所带班级排名": "class-rank",
                              "班主任所带文明班级": "civilized-class",
                              "班主任所带文明宿舍": "civilized-dorm",
                              "教研活动数据分析": "research-activity-analysis",
                              "教研活动记录": "research-activity-record", "备课组活动记录": "lesson-prep-record",
                              "备课活动数据分析": "lesson-prep-analysis",
                            };
                            const childPage   = childPageMap[childLabel];
                            const childActive = activeLabel === childLabel;
                            return (
                              <div key={childLabel}>
                                <div
                                  className="flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150"
                                  style={{ height: 30, padding: "0 10px", fontSize: 13, color: childActive ? "#2563eb" : "#6b7280", background: childActive ? "rgba(59,130,246,0.08)" : "transparent", fontWeight: childActive ? 600 : 400 }}
                                  onMouseEnter={(e) => { if (!childActive) { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.color = "#111827"; } }}
                                  onMouseLeave={(e) => { if (!childActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#6b7280"; } }}
                                  onClick={() => {
                                    if (grandChildren) { setExpanded((prev) => ({ ...prev, [childLabel]: !prev[childLabel] })); return; }
                                    if (childPage) handleNavigate(childPage, childLabel);
                                  }}
                                >
                                  <FileText size={12} style={{ color: childActive ? "#2563eb" : "#d1d5db", flexShrink: 0 }} />
                                  <span className="flex-1 truncate">{childLabel}</span>
                                  {grandChildren && (expanded[childLabel] ? <ChevronDown size={11} style={{ color: "#9ca3af", flexShrink: 0 }} /> : <ChevronRight size={11} style={{ color: "#9ca3af", flexShrink: 0 }} />)}
                                </div>
                                {grandChildren && expanded[childLabel] && (
                                  <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5" style={{ paddingLeft: 14 }}>
                                    {grandChildren.map((gc) => {
                                      const gcPage   = grandChildPageMap[gc];
                                      const gcActive = activeLabel === gc;
                                      return (
                                        <div
                                          key={gc}
                                          className="flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150"
                                          style={{ height: 28, padding: "0 10px", fontSize: 12, color: gcActive ? "#2563eb" : "#9ca3af", background: gcActive ? "rgba(59,130,246,0.08)" : "transparent", fontWeight: gcActive ? 600 : 400 }}
                                          onMouseEnter={(e) => { if (!gcActive) { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.color = "#374151"; } }}
                                          onMouseLeave={(e) => { if (!gcActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#9ca3af"; } }}
                                          onClick={() => gcPage && handleNavigate(gcPage, gc)}
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

          {/* ── 一生一案 ── */}
          <div>
            <div
              className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
              style={{ height: 36, padding: "0 10px", fontSize: 14, fontWeight: 600, color: "#111827" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
              onClick={() => toggleParent("一生一案")}
            >
              <GraduationCap size={15} style={{ color: "#6366f1", flexShrink: 0 }} />
              <span className="flex-1 truncate">一生一案</span>
              {expanded["一生一案"] ? <ChevronDown size={13} style={{ color: "#9ca3af", flexShrink: 0 }} /> : <ChevronRight size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />}
            </div>

            {expanded["一生一案"] && (
              <div className="flex flex-col gap-0.5 mt-0.5" style={{ paddingLeft: 12 }}>
                {yishengItems.map(({ icon: Icon, label, iconColor, children }) => {
                  const isActive = activeLabel === label;
                  return (
                    <div key={label}>
                      <div
                        className="flex items-center gap-2.5 rounded-xl cursor-pointer transition-all duration-150"
                        style={{ height: 34, padding: "0 10px", fontSize: 14, color: isActive ? "#2563eb" : "#374151", background: isActive ? "rgba(59,130,246,0.1)" : "transparent", fontWeight: isActive ? 600 : 400 }}
                        onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; }}
                        onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                        onClick={() => {
                          if (label === "学生管理看板") { handleNavigate("student-dashboard", label); return; }
                          if (children) toggleYisheng(label);
                        }}
                      >
                        <Icon size={14} style={{ color: isActive ? "#2563eb" : iconColor, flexShrink: 0 }} />
                        <span className="flex-1 truncate">{label}</span>
                        {children && (expanded[label] ? <ChevronDown size={13} style={{ color: "#9ca3af", flexShrink: 0 }} /> : <ChevronRight size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />)}
                      </div>

                      {children && expanded[label] && (
                        <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5" style={{ paddingLeft: 14 }}>
                          {children.map(({ label: childLabel, children: grandChildren }) => {
                            const yishengChildPageMap: Record<string, PageKey> = { "学情分析表": "learning-analysis-table" };
                            const childPage   = yishengChildPageMap[childLabel];
                            const childActive = activeLabel === childLabel;
                            return (
                              <div key={childLabel}>
                                <div
                                  className="flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150"
                                  style={{ height: 30, padding: "0 10px", fontSize: 13, color: childActive ? "#2563eb" : "#6b7280", background: childActive ? "rgba(59,130,246,0.08)" : "transparent", fontWeight: childActive ? 600 : 400 }}
                                  onMouseEnter={(e) => { if (!childActive) { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.color = "#111827"; } }}
                                  onMouseLeave={(e) => { if (!childActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#6b7280"; } }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (grandChildren) { setExpanded((prev) => ({ ...prev, [childLabel]: !prev[childLabel] })); return; }
                                    if (childPage) handleNavigate(childPage, childLabel);
                                  }}
                                >
                                  <FileText size={12} style={{ color: childActive ? "#2563eb" : "#d1d5db", flexShrink: 0 }} />
                                  <span className="flex-1 truncate">{childLabel}</span>
                                  {grandChildren && (expanded[childLabel] ? <ChevronDown size={11} style={{ color: "#9ca3af", flexShrink: 0 }} /> : <ChevronRight size={11} style={{ color: "#9ca3af", flexShrink: 0 }} />)}
                                </div>
                                {grandChildren && expanded[childLabel] && (
                                  <div className="flex flex-col gap-0.5 mt-0.5 mb-0.5" style={{ paddingLeft: 14 }}>
                                    {grandChildren.map((gc) => {
                                      const yishengGcPageMap: Record<string, PageKey> = { "学情分析表": "learning-analysis-table" };
                                      const gcPage   = yishengGcPageMap[gc];
                                      const gcActive = activeLabel === gc;
                                      return (
                                        <div
                                          key={gc}
                                          className="flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150"
                                          style={{ height: 28, padding: "0 10px", fontSize: 12, color: gcActive ? "#2563eb" : "#9ca3af", background: gcActive ? "rgba(59,130,246,0.08)" : "transparent", fontWeight: gcActive ? 600 : 400 }}
                                          onMouseEnter={(e) => { if (!gcActive) { (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.color = "#374151"; } }}
                                          onMouseLeave={(e) => { if (!gcActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "#9ca3af"; } }}
                                          onClick={() => gcPage && handleNavigate(gcPage, gc)}
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

        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}

      {/* Mobile sidebar — slides in/out via transform */}
      <div
        className={`flex flex-col md:hidden fixed z-50 h-full transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={sidebarBaseStyle}
      >
        {content}
      </div>

      {/* Desktop sidebar — collapses via width transition */}
      <div
        className="hidden md:block relative shrink-0 group/sidebar"
        style={{ width: collapsed ? 0 : 260, transition: "width 0.25s ease", overflow: "visible" }}
      >
        {/* Clip layer — overflow:hidden so content is cropped as parent width shrinks */}
        <div className="absolute inset-0 overflow-hidden" style={{ width: "100%" }}>
          {/* Inner panel — fixed 260px wide */}
          <div className="flex flex-col h-full" style={{ ...sidebarBaseStyle }}>
            {content}
          </div>
        </div>

        {/* Toggle button — only visible on hover (or always when collapsed) */}
        <div
          className="absolute top-1/2 -translate-y-1/2 z-50 group/btn"
          style={collapsed ? { left: 8 } : { right: -16 }}
        >
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`w-7 h-7 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-400 hover:shadow-lg transition-all duration-150 ${collapsed ? "opacity-100" : "opacity-0 group-hover/sidebar:opacity-100"}`}
          >
            {collapsed
              ? <ChevronRight className="w-3.5 h-3.5" />
              : <ChevronLeft  className="w-3.5 h-3.5" />}
          </button>
          {/* Tooltip */}
          <div className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-100 whitespace-nowrap">
            <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 shadow-lg">
              {collapsed ? "展开" : "收起"}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
