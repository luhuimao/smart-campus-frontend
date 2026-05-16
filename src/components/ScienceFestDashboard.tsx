"use client";

import { ChevronDown, ChevronRight, ChevronLeft, ChevronsLeft, Info, Upload, RefreshCw, ArrowUpDown, Maximize2, Plus } from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";

const TIME_OPTIONS = ["等于","不等于","大于等于","小于等于","选择范围","动态筛选","为空","不为空"];
import { PageHeader } from "./PageHeader";
import { DatePicker, DateRangePicker } from "./ui/DatePicker";
import { useScienceFestDashboard } from "@/hooks/use-research-dashboard";
import type { ScienceFestRecord, ScienceFestFilters } from "@/hooks/use-research-dashboard";
import { DashboardTable, PhotoList, FileBadgeList, ImageLightbox } from "./ui/DashboardTable";
import type { ColumnDef } from "./ui/DashboardTable";
import { TrendLineChart } from "./ui/TrendLineChart";

const teal = "#00b095";

const WEEK_DAYS = ["20 周一", "21 周二", "22 周三", "23 周四", "24 周五", "25 周六", "26 周日"];

function FilterDropdown({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const tealColor = "#00b095";

  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div className="glass" style={{ padding: "12px 16px", position: "relative", zIndex: open ? 100 : 1 }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        {value && <button onClick={() => onChange("")} className="text-xs text-gray-400 hover:text-gray-600 px-1">✕</button>}
      </div>
      <div className="relative" ref={ref}>
        <button onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left"
          style={{ border: "1px solid #e5e7eb", background: "white", fontSize: 15, color: value ? "#374151" : "#9ca3af" }}>
          <span className="truncate">{value || "全部"}</span>
          <ChevronRight size={12} style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform 0.15s", flexShrink: 0, color: "#9ca3af" }} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 rounded-xl overflow-hidden"
            style={{ top: "calc(100% + 4px)", background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", zIndex: 200, maxHeight: 200, overflowY: "auto" }}>
            <button onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-3 py-2 transition-colors"
              style={{ fontSize: 14, color: !value ? tealColor : "#374151", background: !value ? "rgba(0,176,149,0.06)" : "transparent" }}>全部</button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2 transition-colors"
                style={{ fontSize: 14, color: opt === value ? tealColor : "#374151", background: opt === value ? "rgba(0,176,149,0.06)" : "transparent" }}>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterCard({ title, mode }: { title: string; mode: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <button className="flex items-center gap-0.5 text-xs" style={{ color: teal }}>
          {mode} <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      <div className="h-8 border border-gray-200 rounded-lg flex items-center justify-end px-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}

function TimeFilterCard() {
  const [condition, setCondition] = useState(TIME_OPTIONS[0]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3" style={{ position: "relative", zIndex: open ? 100 : 1 }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-800">活动时间</span>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-0.5 text-xs"
            style={{ color: teal }}
          >
            {condition}
            <ChevronRight size={11} style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform 0.15s" }} />
          </button>
          {open && (
            <div className="absolute right-0 rounded-xl overflow-hidden"
              style={{ top: "calc(100% + 4px)", minWidth: 140, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", zIndex: 200 }}>
              {TIME_OPTIONS.map(opt => (
                <button key={opt} onClick={() => { setCondition(opt); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs transition-colors"
                  style={{ color: opt === condition ? teal : "#374151", background: opt === condition ? "rgba(0,176,149,0.06)" : "transparent" }}
                  onMouseEnter={e => { if (opt !== condition) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; }}
                  onMouseLeave={e => { if (opt !== condition) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >{opt}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      {condition !== "为空" && condition !== "不为空" && (
        condition === "选择范围" ? <DateRangePicker /> : <DatePicker />
      )}
    </div>
  );
}

type ActionItem = { Icon: React.ElementType; tip: string; onClick?: () => void; tipAlign?: "center" | "right" };

function ActionBar({ show, actions }: { show: boolean; actions: ActionItem[] }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {actions.map(({ Icon, tip }) => (
        <div key={tip} className="relative group/tip">
          <button className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors">
            <Icon size={12} />
          </button>
          <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800/90" />
            <div className="px-2 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md whitespace-nowrap">{tip}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function TableWithTopScrollbar({ children }: { children: React.ReactNode }) {
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = botRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => { setWidth(el.scrollWidth); });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  function onTopScroll() { if (botRef.current && topRef.current) botRef.current.scrollLeft = topRef.current.scrollLeft; }
  function onBotScroll() { if (topRef.current && botRef.current) topRef.current.scrollLeft = botRef.current.scrollLeft; }
  return (
    <div>
      <div ref={topRef} onScroll={onTopScroll} style={{ overflowX: "auto", overflowY: "hidden", height: 12 }}>
        <div style={{ width, height: 1 }} />
      </div>
      <div ref={botRef} onScroll={onBotScroll} className="overflow-x-auto">{children}</div>
    </div>
  );
}

function PhotoPreview({ src, alt }: { src: string; alt: string }) {
  const [visible, setVisible] = useState(false);
  const [floatPos, setFloatPos] = useState({ x: 0, y: 0 });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  function clearHide() { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; } }
  function scheduleHide() { clearHide(); hideTimer.current = setTimeout(() => setVisible(false), 400); }
  function onThumbEnter() {
    clearHide();
    const el = thumbRef.current;
    if (el) { const rect = el.getBoundingClientRect(); setFloatPos({ x: rect.left, y: rect.top }); }
    setVisible(true);
  }
  const FLOAT_H = 244;
  const left = Math.min(floatPos.x, window.innerWidth - 260);
  const top  = floatPos.y - FLOAT_H - 4;
  return (
    <div ref={thumbRef} className="shrink-0 inline-block" onMouseEnter={onThumbEnter} onMouseLeave={scheduleHide}>
      <img src={src} alt={alt} className="rounded object-cover cursor-pointer" style={{ width: 32, height: 32 }} />
      {visible && (
        <div className="z-[9999] rounded-xl shadow-2xl flex flex-col"
          style={{ position: "fixed", left, top, width: 240, background: "#fff", border: "1px solid #e5e7eb", overflow: "hidden" }}
          onMouseEnter={clearHide} onMouseLeave={scheduleHide}>
          <img src={src} alt={alt} className="object-contain w-full" style={{ maxHeight: 200 }} />
          <a href={src} download={alt || "photo"} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium hover:bg-blue-50 transition-colors"
            style={{ color: "#3b82f6", borderTop: "1px solid #f3f4f6" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载图片
          </a>
        </div>
      )}
    </div>
  );
}


const mockActivities = [
  { id: 1, teacher: "甘育攀", group: "理化教研组", groupLeader: "孙志远", name: "科技小发明展评活动", time: "2026-04-22 09:00", location: "科技楼一楼展厅",   desc: "组织学生展示自制科技小发明，评选优秀作品",     hasPhoto: true,  hasVideo: true  },
  { id: 2, teacher: "黄景民", group: "数学教研组", groupLeader: "吴大伟", name: "数学建模竞赛备赛",   time: "2026-04-18 14:00", location: "明达楼二楼辅导室", desc: "指导学生参加全国数学建模竞赛，进行专题训练",   hasPhoto: true,  hasVideo: false },
  { id: 3, teacher: "张丽燕", group: "英语教研组", groupLeader: "赵英",   name: "英语科技演讲比赛", time: "2026-04-15 10:00", location: "图书馆报告厅",    desc: "围绕科技主题举办英语演讲比赛，提升表达能力", hasPhoto: false, hasVideo: true  },
  { id: 4, teacher: "李枝芳", group: "理化教研组", groupLeader: "孙志远", name: "生物标本制作工坊",   time: "2026-04-10 09:00", location: "实验楼一楼研讨室", desc: "带领学生动手制作植物与昆虫标本",             hasPhoto: true,  hasVideo: false },
  { id: 5, teacher: "莫燕",   group: "数学教研组", groupLeader: "吴大伟", name: "3D打印创意设计",     time: "2026-04-08 14:30", location: "科技楼二楼实训室", desc: "学生自主设计并打印创意模型，评选最佳作品",   hasPhoto: true,  hasVideo: true  },
  { id: 6, teacher: "郑茹",   group: "史地教研组", groupLeader: "邓明",   name: "地理信息系统体验",   time: "2026-04-03 09:30", location: "机房101",          desc: "带领学生体验GIS软件，制作主题地图",         hasPhoto: false, hasVideo: false },
  { id: 7, teacher: "廖永会", group: "政治教研组", groupLeader: "王建国", name: "科技与社会主题研讨", time: "2026-03-28 15:00", location: "行政楼三楼会议室", desc: "围绕人工智能对社会影响展开研讨与辩论",       hasPhoto: true,  hasVideo: false },
];

const TABLE_COLS = ["活动负责教师","教研组","教研组长","活动名称","活动时间","活动地点","活动描述","活动照片","活动视频"];

function Pagination({ total = 0 }: { total?: number }) {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-t border-gray-50">
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-200 rounded-lg px-2 py-1 text-xs gap-1.5 text-gray-500">
          <Info className="w-3 h-3 text-gray-400" />
          <select className="outline-none bg-transparent">
            <option>20 条/页</option>
            <option>50 条/页</option>
          </select>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
        <span className="text-xs text-gray-400">共 {total} 条</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1">
          <input type="text" defaultValue="1" className="w-8 h-7 border border-gray-200 rounded-lg text-center text-xs outline-none focus:border-teal-400" />
          <span className="text-xs text-gray-400">/ 1</span>
        </div>
        <button className="w-7 h-7 border border-gray-200 rounded-lg flex items-center justify-center text-gray-300 hover:bg-gray-50 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ScienceFestDashboard({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [calView,        setCalView]        = useState<"week" | "month">("week");
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [hvTotal,    setHvTotal]    = useState(false);
  const [hvChart,    setHvChart]    = useState(false);
  const [hvGroup,    setHvGroup]    = useState(false);
  const [hvTeacher,  setHvTeacher]  = useState(false);
  const [hvCalendar, setHvCalendar] = useState(false);
  const [hvTable,    setHvTable]    = useState(false);
  const [teacherPage, setTeacherPage] = useState(1);
  const TEACHER_PAGE_SIZE = 6;
  const [groupPage, setGroupPage] = useState(1);
  const GROUP_PAGE_SIZE = 6;
  const [tablePage,     setTablePage]     = useState(1);
  const [tablePageSize, setTablePageSize] = useState(20);
  const [tableSortAsc,  setTableSortAsc]  = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScienceFestRecord | null>(null);
  const [lightbox, setLightbox] = useState<{ images: { name: string; url: string }[]; index: number } | null>(null);
  const [activeFilters, setActiveFilters] = useState<ScienceFestFilters>({ group: "", teacher: "" });

  const { raw, filterOptions, isPending, isError, refetch } = useScienceFestDashboard(activeFilters);

  useEffect(() => {
    setTablePage(1);
    setGroupPage(1);
    setTeacherPage(1);
  }, [activeFilters.group, activeFilters.teacher]);

  const trend = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of raw) {
      if (!r.活动时间) continue;
      const d = new Date(r.活动时间);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-5)
      .map(([k, v]) => ({ month: `${k.split("-")[0]}年${k.split("-")[1]}月`, value: v }));
  }, [raw]);

  const GROUP_COLORS = ["#00b095","#60a5fa","#818cf8","#fb923c","#f472b6","#f59e0b","#34d399","#a78bfa"];

  const groupStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of raw) {
      if (!r.教研组) continue;
      map.set(r.教研组, (map.get(r.教研组) ?? 0) + 1);
    }
    const entries = Array.from(map.entries()).sort(([, a], [, b]) => b - a);
    const max = entries[0]?.[1] ?? 1;
    return entries.map(([label, value], i) => ({ label, value, max, color: GROUP_COLORS[i % GROUP_COLORS.length] }));
  }, [raw]);

  const teacherStats = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of raw) {
      if (!r.活动负责教师) continue;
      map.set(r.活动负责教师, (map.get(r.活动负责教师) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, count]) => ({ name, count }));
  }, [raw]);

  const teacherTotal = teacherStats.reduce((s, t) => s + t.count, 0);

  const DAY_NAMES = ["周一","周二","周三","周四","周五","周六","周日"];

  const weekDays = useMemo(() => {
    const today = new Date();
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - dow + calendarOffset * 7);
    monday.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [calendarOffset]);

  const weekLabel = useMemo(() => {
    const s = weekDays[0], e = weekDays[6];
    if (s.getMonth() === e.getMonth())
      return `${s.getMonth()+1}月${s.getDate()}日-${e.getDate()}日`;
    return `${s.getMonth()+1}月${s.getDate()}日-${e.getMonth()+1}月${e.getDate()}日`;
  }, [weekDays]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof raw>();
    for (const r of raw) {
      if (!r.活动时间) continue;
      const d = new Date(r.活动时间);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  }, [raw]);

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  }, []);

  const sortedRaw = [...raw].sort((a, b) => {
    const ta = new Date(a.活动时间).getTime() || 0;
    const tb = new Date(b.活动时间).getTime() || 0;
    return tableSortAsc ? ta - tb : tb - ta;
  });
  const totalRows  = raw.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / tablePageSize));
  const pageRows   = sortedRaw.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  function formatTime(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        breadcrumbs={[{ label: "教师组织参与的活动" }, { label: "科技节活动" }, { label: "科技节活动看板", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-3 md:p-5 space-y-4">

        {/* 筛选器 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FilterDropdown
            label="教研组"
            value={activeFilters.group}
            options={filterOptions.groups}
            onChange={v => setActiveFilters(f => ({ ...f, group: v }))}
          />
          <FilterDropdown
            label="活动负责教师"
            value={activeFilters.teacher}
            options={filterOptions.teachers}
            onChange={v => setActiveFilters(f => ({ ...f, teacher: v }))}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-6 gap-4">
          {/* Total count */}
          <div className="glass col-span-1 flex flex-col overflow-hidden" style={{ minHeight: 260 }}
            onMouseEnter={() => setHvTotal(true)} onMouseLeave={() => setHvTotal(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
              <h3 className="flex-1 min-w-0 truncate" style={{ fontSize: 15, fontWeight: 500, color: "#374151" }}>科技节活动总次数</h3>
              <ActionBar show={hvTotal} actions={[{ Icon: Upload, tip: "导出" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4">
              {isPending ? (
                <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
              ) : (
                <>
                  <span className="font-black text-gray-900 leading-none" style={{ fontSize: 80 }}>
                    {isError ? "!" : raw.length}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#10b981" }}>
                    {isError ? "加载失败" : `共 ${raw.length} 条记录`}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Trend chart */}
          <div className="col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: 260 }}
            onMouseEnter={() => setHvChart(true)} onMouseLeave={() => setHvChart(false)}>
            <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3 shrink-0">
              <h3 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">活动次数</h3>
              <ActionBar show={hvChart} actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 p-4" style={{ height: 200 }}>
              <TrendLineChart
                data={trend}
                isPending={isPending}
                isError={isError}
                color="#00b095"
                gradientColor="#00b095"
                legendLabel="活动次数"
              />
            </div>
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="grid grid-cols-12 gap-4">
          {/* 教研组活动情况统计 */}
          <div className="glass col-span-2 flex flex-col overflow-hidden shadow-sm"
            onMouseEnter={() => setHvGroup(true)} onMouseLeave={() => setHvGroup(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 shrink-0" style={{ padding: "10px 12px" }}>
              <h3 className="font-semibold flex-1 min-w-0 truncate" style={{ fontSize: 15, color: "#111827" }}>教研组活动情况统计</h3>
              <ActionBar show={hvGroup} actions={[{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 overflow-hidden">
              {isPending ? (
                <div className="p-3 space-y-2">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : groupStats.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-sm text-gray-400">暂无数据</div>
              ) : (
                <ul>
                  {groupStats.slice((groupPage - 1) * GROUP_PAGE_SIZE, groupPage * GROUP_PAGE_SIZE).map(({ label, value }, i) => (
                    <li key={label} className="flex justify-between items-center border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ padding: "8px 12px", fontSize: 15, color: "#374151", background: i === 0 ? "#f9fafb" : undefined }}>
                      <span className="truncate flex-1 min-w-0" title={label}>{label}</span>
                      <span className="ml-2 shrink-0 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "#eff6ff", color: "#3b82f6" }}>{value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-center items-center gap-1 p-2 border-t border-gray-100 shrink-0 mt-auto" style={{ fontSize: 14 }}>
              <button onClick={() => setGroupPage(p => Math.max(1, p - 1))} disabled={groupPage === 1}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">‹</button>
              <span className="px-2 text-gray-500">{groupPage} / {Math.max(1, Math.ceil(groupStats.length / GROUP_PAGE_SIZE))}</span>
              <button onClick={() => setGroupPage(p => Math.min(Math.ceil(groupStats.length / GROUP_PAGE_SIZE), p + 1))}
                disabled={groupPage >= Math.ceil(groupStats.length / GROUP_PAGE_SIZE)}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">›</button>
            </div>
          </div>

          {/* 教师参与次数 */}
          <div className="glass col-span-3 flex flex-col overflow-hidden shadow-sm"
            onMouseEnter={() => setHvTeacher(true)} onMouseLeave={() => setHvTeacher(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 shrink-0" style={{ padding: "10px 12px" }}>
              <h3 className="font-semibold flex-1 min-w-0 truncate" style={{ fontSize: 15, color: "#111827" }}>教师参与次数</h3>
              <ActionBar show={hvTeacher} actions={[{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center border-b border-gray-50 px-3 py-2">
                <span style={{ fontSize: 14, color: "#3b82f6" }}>计数</span>
                <span className="px-2 py-0.5 rounded-full text-white" style={{ fontSize: 15, background: "#fb923c" }}>{teacherTotal}</span>
              </div>
              {isPending ? (
                <div className="p-3 space-y-2">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : teacherStats.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-sm text-gray-400">暂无数据</div>
              ) : (
                <ul>
                  {teacherStats.slice((teacherPage - 1) * TEACHER_PAGE_SIZE, teacherPage * TEACHER_PAGE_SIZE).map((t, i) => (
                    <li key={t.name} className="flex justify-between items-center border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ padding: "8px 12px", background: i === 0 && teacherPage === 1 ? "#f9fafb" : undefined }}>
                      <span style={{ fontSize: 15, color: "#374151" }}>{t.name}</span>
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 15, background: "#eff6ff", color: "#3b82f6" }}>{t.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-center items-center gap-1 p-2 border-t border-gray-100 shrink-0 mt-auto" style={{ fontSize: 14 }}>
              <button onClick={() => setTeacherPage(p => Math.max(1, p - 1))} disabled={teacherPage === 1}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">‹</button>
              <span className="px-2 text-gray-500">{teacherPage} / {Math.max(1, Math.ceil(teacherStats.length / TEACHER_PAGE_SIZE))}</span>
              <button onClick={() => setTeacherPage(p => Math.min(Math.ceil(teacherStats.length / TEACHER_PAGE_SIZE), p + 1))}
                disabled={teacherPage >= Math.ceil(teacherStats.length / TEACHER_PAGE_SIZE)}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">›</button>
            </div>
          </div>

          {/* 科技节活动日历 */}
          <div className="col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 420 }}
            onMouseEnter={() => setHvCalendar(true)} onMouseLeave={() => setHvCalendar(false)}>
            <div className="px-4 py-3 flex justify-between items-center border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">科技节活动日历</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1" style={{ fontSize: 14 }}>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors" onClick={() => setCalendarOffset(o => o - 1)}><ChevronLeft size={14} /></button>
                  <span style={{ fontWeight: 600, color: "#111827", minWidth: 120, textAlign: "center" }}>
                    {calView === "week" ? weekLabel : (() => {
                      const t = new Date(); t.setMonth(t.getMonth() + calendarOffset);
                      return `${t.getFullYear()}年${t.getMonth()+1}月`;
                    })()}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors" onClick={() => setCalendarOffset(o => o + 1)}><ChevronRight size={14} /></button>
                </div>
                <button className="text-xs border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors text-gray-600"
                  onClick={() => setCalendarOffset(0)}>{calView === "week" ? "本周" : "本月"}</button>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button className="px-2.5 py-1 transition-colors"
                    style={{ background: calView === "week" ? teal : "white", color: calView === "week" ? "white" : "#6b7280" }}
                    onClick={() => { setCalView("week"); setCalendarOffset(0); }}>周</button>
                  <button className="px-2.5 py-1 transition-colors"
                    style={{ background: calView === "month" ? teal : "white", color: calView === "month" ? "white" : "#6b7280" }}
                    onClick={() => { setCalView("month"); setCalendarOffset(0); }}>月</button>
                </div>
                <ActionBar show={hvCalendar} actions={[{ Icon: Plus, tip: "添加" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: Maximize2, tip: "放大" }]} />
              </div>
            </div>

            {/* 星期列头 */}
            <div className="grid grid-cols-7 border-b border-gray-100 text-center shrink-0" style={{ background: "#f9fafb" }}>
              {DAY_NAMES.map(n => (
                <div key={n} className="py-2" style={{ fontSize: 12, color: "#9ca3af" }}>{n}</div>
              ))}
            </div>

            {calView === "week" ? (
              <>
                <div className="grid grid-cols-7 border-b border-gray-50 shrink-0">
                  {weekDays.map((d, i) => {
                    const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
                    const isToday = dStr === todayStr;
                    return (
                      <div key={i} className="flex justify-center py-1">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full text-sm font-medium"
                          style={{ background: isToday ? teal : "transparent", color: isToday ? "white" : "#374151" }}>
                          {d.getDate()}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ minHeight: 100 }}>
                  {weekDays.map((d, i) => {
                    const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
                    const events = eventsByDate.get(dStr) ?? [];
                    return (
                      <div key={i} className={`p-1.5 flex flex-col gap-1 ${i < 6 ? "border-r border-gray-50" : ""}`}>
                        {events.slice(0, 3).map((ev, j) => (
                          <button key={j} onClick={() => setSelectedRecord(ev)}
                            className="w-full text-left px-1.5 py-1 rounded truncate hover:opacity-80 transition-opacity"
                            style={{ background: "#f0fdf9", color: "#00b095", fontSize: 11 }}
                            title={ev.活动名称}
                          >{ev.活动名称 || "科技节活动"}</button>
                        ))}
                        {events.length > 3 && (
                          <span style={{ fontSize: 10, color: "#9ca3af", paddingLeft: 4 }}>+{events.length - 3} 项</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              (() => {
                const now = new Date();
                const viewDate = new Date(now.getFullYear(), now.getMonth() + calendarOffset, 1);
                const viewYear = viewDate.getFullYear();
                const viewMonth = viewDate.getMonth();
                const firstDow = viewDate.getDay() === 0 ? 6 : viewDate.getDay() - 1;
                const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
                const cells: (number | null)[] = [
                  ...Array(firstDow).fill(null),
                  ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
                ];
                while (cells.length % 7 !== 0) cells.push(null);
                const rows = cells.length / 7;
                return (
                  <div className="flex-1 overflow-y-auto" style={{ minHeight: 100 }}>
                    {Array.from({ length: rows }, (_, row) => (
                      <div key={row} className="grid grid-cols-7 border-b border-gray-50 last:border-0" style={{ minHeight: 60 }}>
                        {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                          if (!day) return <div key={col} className={col < 6 ? "border-r border-gray-50" : ""} style={{ background: "#fafafa" }} />;
                          const dStr = `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                          const events = eventsByDate.get(dStr) ?? [];
                          const isToday = dStr === todayStr;
                          return (
                            <div key={col} className={`p-1 flex flex-col gap-0.5 ${col < 6 ? "border-r border-gray-50" : ""}`}>
                              <span className="w-5 h-5 flex items-center justify-center rounded-full self-end mb-0.5"
                                style={{ fontSize: 11, fontWeight: isToday ? 700 : 400, background: isToday ? teal : "transparent", color: isToday ? "white" : "#374151" }}>
                                {day}
                              </span>
                              {events.slice(0, 2).map((ev, j) => (
                                <button key={j} onClick={() => setSelectedRecord(ev)}
                                  className="w-full text-left px-1 py-0.5 rounded truncate hover:opacity-80 transition-opacity"
                                  style={{ background: "#f0fdf9", color: "#00b095", fontSize: 10 }}
                                  title={ev.活动名称}
                                >{ev.活动名称 || "科技节活动"}</button>
                              ))}
                              {events.length > 2 && (
                                <span style={{ fontSize: 9, color: "#9ca3af", paddingLeft: 2 }}>+{events.length - 2}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* 科技节活动记录表 */}
        {(() => {
          const cols: ColumnDef<ScienceFestRecord>[] = [
            { key: "活动负责教师", header: "活动负责教师", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.活动负责教师 || "—"}</span> },
            { key: "教研组",       header: "教研组",       render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.教研组 || "—"}</span> },
            { key: "教研组长",     header: "教研组长",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.教研组长 || "—"}</span> },
            { key: "活动名称",     header: "活动名称",     minWidth: 200, render: r => <span style={{ fontSize: 15, color: "#1e40af", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.活动名称}>{r.活动名称 || "—"}</span> },
            { key: "活动时间",     header: "活动时间",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{formatTime(r.活动时间)}</span> },
            { key: "活动地点",     header: "活动地点",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.活动地点 || "—"}</span> },
            { key: "活动描述",     header: "活动描述",     minWidth: 160, render: r => <span style={{ fontSize: 15, color: "#374151", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.活动描述}>{r.活动描述 || "—"}</span> },
            { key: "照片",         header: "照片",         minWidth: 100, render: r => <PhotoList photos={r.活动图片} /> },
            { key: "视频",         header: "视频",         minWidth: 100, render: r => <FileBadgeList files={r.活动视频} type="video" /> },
            { key: "备注",         header: "备注",         render: r => <span style={{ fontSize: 15, color: r.备注 ? "#374151" : "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.备注 || undefined}>{r.备注 || "—"}</span> },
          ];
          return (
            <DashboardTable
              title="科技节活动记录表"
              columns={cols}
              rows={pageRows}
              isPending={isPending}
              isError={isError}
              sortAsc={tableSortAsc}
              onSortToggle={() => { setTableSortAsc(v => !v); setTablePage(1); }}
              page={tablePage}
              pageSize={tablePageSize}
              totalRows={totalRows}
              onPageChange={setTablePage}
              onPageSizeChange={n => { setTablePageSize(n); setTablePage(1); }}
              onRowClick={setSelectedRecord}
              onRefresh={refetch}
            />
          );
        })()}
      </div>

      {/* 详情抽屉 */}
      {selectedRecord && (
        <div className="fixed inset-0 z-40" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setSelectedRecord(null)} />
      )}
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{ width: 480, maxWidth: "100vw", background: "#fff", transform: selectedRecord ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
        {selectedRecord && (
          <>
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-semibold text-blue-500 mb-1">{selectedRecord.教研组 || "—"}</p>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{selectedRecord.活动名称 || "—"}</h2>
              </div>
              <button onClick={() => setSelectedRecord(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "活动负责教师", value: selectedRecord.活动负责教师 },
                    { label: "教研组",       value: selectedRecord.教研组 },
                    { label: "教研组长",     value: selectedRecord.教研组长 },
                    { label: "活动时间",     value: formatTime(selectedRecord.活动时间) },
                    { label: "活动地点",     value: selectedRecord.活动地点 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              {selectedRecord.活动描述 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">活动描述</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedRecord.活动描述}</p>
                </section>
              )}
              {selectedRecord.参与人员 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">参与人员</p>
                  <p className="text-base text-gray-800 leading-relaxed">{selectedRecord.参与人员}</p>
                </section>
              )}
              {selectedRecord.备注 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">备注</p>
                  <p className="text-base text-gray-800 leading-relaxed">{selectedRecord.备注}</p>
                </section>
              )}
              {selectedRecord.活动图片.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">活动照片（{selectedRecord.活动图片.length} 张）</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRecord.活动图片.map((f, i) => (
                      <button key={i} onClick={() => setLightbox({ images: selectedRecord.活动图片, index: i })}
                        className="block rounded-lg overflow-hidden aspect-square bg-gray-100 hover:opacity-80 transition-opacity cursor-zoom-in">
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {selectedRecord.更多图片.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">更多图片（{selectedRecord.更多图片.length} 张）</p>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRecord.更多图片.map((f, i) => (
                      <button key={i} onClick={() => setLightbox({ images: selectedRecord.更多图片, index: i })}
                        className="block rounded-lg overflow-hidden aspect-square bg-gray-100 hover:opacity-80 transition-opacity cursor-zoom-in">
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
              {selectedRecord.活动视频.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">活动视频（{selectedRecord.活动视频.length} 个）</p>
                  <div className="flex flex-col gap-2">
                    {selectedRecord.活动视频.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                          </svg>
                        </div>
                        <a href={f.url} target="_blank" rel="noreferrer"
                          className="flex-1 min-w-0 text-base text-gray-700 truncate group-hover:text-blue-600 transition-colors"
                          title={f.name}>
                          {f.name || "视频"}
                        </a>
                        <a href={f.url} download={f.name} target="_blank" rel="noreferrer"
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="下载"
                          onClick={e => e.stopPropagation()}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
      {lightbox && (
        <ImageLightbox images={lightbox.images} index={lightbox.index} onClose={() => setLightbox(null)} />
      )}
    </div>
  );
}
