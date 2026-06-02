"use client";

import {
  Users, Building2, FileText, TrendingUp, Plus,
  RefreshCw, Maximize2, Upload, PieChart,
} from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";
import { PageHeader } from "./PageHeader";
import type { PageKey } from "@/app/page";
import { useDormAttendance } from "@/hooks/use-research-dashboard";
import type { DormAttendanceFilters, DormAttendanceRecord } from "@/hooks/use-research-dashboard";
import { DashboardTable, PhotoList, ImageLightbox } from "./ui/DashboardTable";
import type { ColumnDef } from "./ui/DashboardTable";

// ── mock data ───────────────────────────────────────────────────
const BUILDING_COLOR_MAP: Record<string, { bg: string; text: string }> = {
  佳慧楼: { bg: "rgba(139,92,246,0.1)",  text: "#7c3aed" },
  自强楼: { bg: "rgba(99,102,241,0.1)",  text: "#4f46e5" },
  自立楼: { bg: "rgba(124,58,237,0.1)",  text: "#6d28d9" },
};
const FALLBACK_PAIRS = [
  { bg: "rgba(236,72,153,0.1)",  text: "#db2777" },
  { bg: "rgba(20,184,166,0.1)",  text: "#0d9488" },
  { bg: "rgba(249,115,22,0.1)",  text: "#ea580c" },
  { bg: "rgba(59,130,246,0.1)",  text: "#2563eb" },
];

function getBuildingColor(name: string): { bg: string; text: string } {
  if (BUILDING_COLOR_MAP[name]) return BUILDING_COLOR_MAP[name];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return FALLBACK_PAIRS[Math.abs(hash) % FALLBACK_PAIRS.length];
}

const TIME_OPTIONS = ["本周", "本月", "本学期", "上学期", "自定义"];

function formatSubmitTime(raw: string): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  const hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  const isSameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (diffHour < 24 && isSameDay) return `今天 ${hhmm}`;
  if (isYesterday) return `昨天 ${hhmm}`;
  if (diffDay < 7) return `${diffDay}天前`;
  const sameYear = d.getFullYear() === now.getFullYear();
  if (sameYear) return `${d.getMonth() + 1}月${d.getDate()}日 ${hhmm}`;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

// ── shared filter operator dropdown style ───────────────────────
const opStyle: React.CSSProperties = {
  width: 76, paddingLeft: 7, paddingRight: 20, paddingTop: 4, paddingBottom: 4,
  border: "1px solid rgba(0,0,0,0.07)", borderRadius: 8, fontSize: 12,
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b0b7bf'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat", backgroundPosition: "right 0.3rem center", backgroundSize: "0.6rem",
  appearance: "none" as const, outline: "none", cursor: "pointer",
};

const valueSelectStyle: React.CSSProperties = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat", backgroundPosition: "right 0.6rem center", backgroundSize: "0.85rem",
  paddingRight: "1.6rem", appearance: "none" as const,
};

// ── inline filter bar ──────────────────────────────────────────
const filterBarSelectStyle: React.CSSProperties = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat", backgroundPosition: "right 0.5rem center", backgroundSize: "0.75rem",
  paddingRight: "1.6rem", appearance: "none" as const,
};

function FilterBar({ defs, values, onChange, onClear }: {
  defs: { key: string; label: string; options: string[] }[];
  values: Record<string, string>;
  onChange: (key: string, v: string) => void;
  onClear: () => void;
}) {
  const hasAny = defs.some(d => values[d.key]);
  return (
    <div className="glass rounded-[20px] px-4 py-3 flex items-center gap-3 flex-wrap">
      {defs.map(({ key, label, options }) => (
        <div key={key} className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs font-semibold text-gray-400 shrink-0">{label}</span>
          <select
            value={values[key] ?? ""}
            onChange={e => onChange(key, e.target.value)}
            className="appearance-none bg-white/60 border border-gray-200/60 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer hover:bg-white/80 transition-colors max-w-[150px]"
            style={{ ...filterBarSelectStyle, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            <option value="">全部</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}
      {hasAny && (
        <button
          onClick={onClear}
          className="ml-auto text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-black/[0.04]"
        >
          清除全部
        </button>
      )}
    </div>
  );
}

// ── interactive tilt card ───────────────────────────────────────
function TiltCard({ title, children, actions, className = "" }: {
  title?: string; children: React.ReactNode;
  actions?: { Icon: React.ElementType; tip: string }[];
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
  const [pressed, setPressed] = React.useState(false);
  const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    setTilt({ rx: -(y - 0.5) * 10, ry: (x - 0.5) * 10, gx: x * 100, gy: y * 100, active: true });
  }
  function onLeave() { setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false }); setPressed(false); }
  function onDown(e: React.MouseEvent<HTMLDivElement>) {
    setPressed(true);
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const id = Date.now();
    setRipples(prev => [...prev, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples(prev => prev.filter(rp => rp.id !== id)), 650);
  }
  function onUp() { setPressed(false); }
  const scale = pressed ? 0.97 : tilt.active ? 1.02 : 1;

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onMouseDown={onDown} onMouseUp={onUp}
      className={`rounded-[28px] cursor-pointer select-none flex flex-col ${className}`}
      style={{
        background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.4)",
        boxShadow: pressed ? "0 4px 8px rgba(0,0,0,0.08)" : tilt.active ? "0 20px 40px rgba(0,0,0,0.10)" : "none",
        transform: `perspective(900px) rotateX(${pressed ? 0 : tilt.rx}deg) rotateY(${pressed ? 0 : tilt.ry}deg) scale(${scale})`,
        transition: pressed ? "transform 0.06s ease-out,box-shadow 0.1s" : tilt.active ? "transform 0.08s ease-out,box-shadow 0.2s" : "transform 0.45s cubic-bezier(0.23,1,0.32,1),box-shadow 0.3s",
        position: "relative", willChange: "transform",
      }}
    >
      {/* highlight + ripple layer */}
      <div className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute inset-0" style={{ background: tilt.active && !pressed ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.4) 0%, transparent 60%)` : "none", transition: "background 0.08s" }} />
        {ripples.map(rp => (
          <span key={rp.id} className="absolute rounded-full" style={{ width: 60, height: 60, left: rp.x - 30, top: rp.y - 30, background: "rgba(139,92,246,0.15)", animation: "studentRipple 0.6s cubic-bezier(0,0.5,0.5,1) forwards" }} />
        ))}
      </div>
      {title && (
        <div className="px-4 py-3 border-b border-gray-100/60 relative z-10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-sm font-bold text-gray-600 flex-1 min-w-0 truncate">{title}</p>
            {tilt.active && actions && (
              <div className="flex items-center gap-0.5 shrink-0">
                {actions.map(({ Icon, tip }) => (
                  <div key={tip} className="relative group/tip">
                    <button onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onMouseUp={e => e.stopPropagation()}
                      className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors">
                      <Icon size={12} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800/90" />
                      <div className="px-2 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md whitespace-nowrap">{tip}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="relative z-10 p-5 flex-1 flex flex-col">{children}</div>
    </div>
  );
}

// ── DormAttendanceDrawer ────────────────────────────────────────
function DormAttendanceDrawer({ record, onClose }: { record: DormAttendanceRecord | null; onClose: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  const score = record ? Math.abs(record.扣分) : 0;
  const scoreColor = record
    ? score >= 5 ? "#dc2626" : score >= 3 ? "#d97706" : "#6b7280"
    : "#6b7280";
  const scoreBg = record
    ? score >= 5 ? "rgba(239,68,68,0.08)" : score >= 3 ? "rgba(245,158,11,0.08)" : "rgba(107,114,128,0.06)"
    : "rgba(107,114,128,0.06)";

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: 480, maxWidth: "100vw", background: "#fff",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}>
        {record && (
          <>
            {/* header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-indigo-500">{record.宿舍楼栋 || "—"}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs font-semibold text-gray-500">{record.宿舍号 || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 leading-snug">{record.学生姓名 || "—"}</h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: scoreBg, color: scoreColor }}>
                    {record.扣分 ? `${record.扣分}分` : "—"}
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">学生信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "学生编号", value: record.学生编号 },
                    { label: "年级",     value: record.年级 },
                    { label: "级部",     value: record.级部 },
                    { label: "班级",     value: record.班级名称 },
                    { label: "班主任",   value: record.班主任 },
                    { label: "级部主任", value: record.级部主任 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">宿舍信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "宿舍楼栋", value: record.宿舍楼栋 },
                    { label: "宿舍号",   value: record.宿舍号 },
                    { label: "场景",     value: record.场景 },
                    { label: "学期",     value: record.学期 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">扣分详情</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "检查项",       value: record.检查项 },
                    { label: "扣分项",       value: record.扣分项 },
                    { label: "扣分",         value: record.扣分 ? `${Math.abs(record.扣分)}分` : "" },
                    { label: "提交人手机号", value: record.提交人手机号 },
                    { label: "提交时间",     value: formatSubmitTime(record.提交时间), title: record.提交时间 || undefined },
                    { label: "学期",         value: record.学期 },
                  ].map(({ label, value, title }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800" title={title}>{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              {record.违纪情况说明 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">违纪情况说明</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.违纪情况说明}</p>
                </section>
              )}
              {record.违纪图片.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">违纪图片（{record.违纪图片.length} 张）</p>
                  <div className="grid grid-cols-3 gap-2">
                    {record.违纪图片.map((f, i) => (
                      <button key={i} onClick={() => setLightboxIndex(i)}
                        className="block rounded-lg overflow-hidden aspect-square bg-gray-100 hover:opacity-80 transition-opacity cursor-zoom-in">
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
      {lightboxIndex !== null && record && (
        <ImageLightbox images={record.违纪图片} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

// ── main component ──────────────────────────────────────────────
export function StudentHomePage({ onMenuOpen, onNavigate }: {
  onMenuOpen?: () => void;
  onNavigate?: (page: PageKey) => void;
}) {
  const [timePeriod, setTimePeriod] = useState("本周");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DormAttendanceRecord | null>(null);
  const [activeFilters, setActiveFilters] = useState<DormAttendanceFilters>({
    semester: "", building: "", checkItem: "", dormNo: "", deductItem: "",
  });

  const { raw, allRecords, filterOptions, isPending, isError, refetch } = useDormAttendance(activeFilters);

  // 级联筛选选项 — 每个筛选器的选项由其他筛选器的当前值决定
  const cascadingOptions = useMemo(() => {
    const f = activeFilters;
    const matchBuilding   = (r: DormAttendanceRecord) => !f.building   || r.宿舍楼栋 === f.building;
    const matchCheckItem  = (r: DormAttendanceRecord) => !f.checkItem  || r.检查项   === f.checkItem;
    const matchDormNo     = (r: DormAttendanceRecord) => !f.dormNo     || r.宿舍号   === f.dormNo;
    const matchDeductItem = (r: DormAttendanceRecord) => !f.deductItem || r.扣分项   === f.deductItem;
    const uniq = <T,>(arr: T[]) => [...new Set(arr)].filter(Boolean) as NonNullable<T>[];
    return {
      buildings:   uniq(allRecords.filter(r => matchCheckItem(r) && matchDormNo(r) && matchDeductItem(r)).map(r => r.宿舍楼栋)),
      checkItems:  uniq(allRecords.filter(r => matchBuilding(r)  && matchDormNo(r) && matchDeductItem(r)).map(r => r.检查项)),
      dormNos:     uniq(allRecords.filter(r => matchBuilding(r)  && matchCheckItem(r) && matchDeductItem(r)).map(r => r.宿舍号)),
      deductItems: uniq(allRecords.filter(r => matchBuilding(r)  && matchCheckItem(r) && matchDormNo(r)).map(r => r.扣分项)),
    };
  }, [allRecords, activeFilters.building, activeFilters.checkItem, activeFilters.dormNo, activeFilters.deductItem]);

  // 时间段过滤
  const timeFiltered = useMemo(() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year  = now.getFullYear();

    let start: Date | null = null;
    let end:   Date | null = null;

    if (timePeriod === "本周") {
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1; // Mon=0
      start = new Date(now); start.setDate(now.getDate() - day); start.setHours(0, 0, 0, 0);
    } else if (timePeriod === "本月") {
      start = new Date(year, now.getMonth(), 1);
    } else if (timePeriod === "本学期") {
      if (month >= 9)       { start = new Date(year, 8, 1); }
      else if (month >= 2)  { start = new Date(year, 1, 1); }
      else                  { start = new Date(year - 1, 8, 1); }
    } else if (timePeriod === "上学期") {
      if (month >= 9)       { start = new Date(year, 1, 1);     end = new Date(year, 7, 31, 23, 59, 59); }
      else if (month >= 2)  { start = new Date(year - 1, 8, 1); end = new Date(year, 0, 31, 23, 59, 59); }
      else                  { start = new Date(year - 1, 1, 1); end = new Date(year - 1, 7, 31, 23, 59, 59); }
    } else if (timePeriod === "自定义") {
      if (customDateRange.start) { start = new Date(customDateRange.start); start.setHours(0, 0, 0, 0); }
      if (customDateRange.end)   { end   = new Date(customDateRange.end);   end.setHours(23, 59, 59, 999); }
      if (!start && !end) return raw;
    }

    if (!start && !end) return raw;
    return raw.filter(r => {
      if (!r.提交时间) return false;
      const d = new Date(r.提交时间);
      if (isNaN(d.getTime())) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    });
  }, [raw, timePeriod, customDateRange.start, customDateRange.end]);

  const totalRows = timeFiltered.length;
  const sorted    = [...timeFiltered].sort((a, b) => sortAsc ? a._id.localeCompare(b._id) : b._id.localeCompare(a._id));
  const sliced    = sorted.slice((page - 1) * pageSize, page * pageSize);

  // stat cards — derived from time-filtered records
  const totalDeductions = timeFiltered.reduce((sum, r) => sum + Math.abs(r.扣分), 0);
  const buildingTotals  = filterOptions.buildings.map(b => ({
    label: `${b}总扣分`,
    value: timeFiltered.filter(r => r.宿舍楼栋 === b).reduce((s, r) => s + Math.abs(r.扣分), 0),
    color: "#8b5cf6",
  }));
  const BUILDING_COLORS = ["#8b5cf6", "#6366f1", "#7c3aed", "#a78bfa", "#4f46e5"];
  const buildingStats = buildingTotals.slice(0, 3).map((b, i) => ({ ...b, color: BUILDING_COLORS[i] }));

  // 扣分类型分布 — group by 扣分项, sort desc, top 6
  const deductItemDist = (() => {
    const map: Record<string, number> = {};
    for (const r of timeFiltered) { if (r.扣分项) map[r.扣分项] = (map[r.扣分项] ?? 0) + 1; }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  })();
  const deductItemMax = deductItemDist[0]?.[1] ?? 1;

  const cols: ColumnDef<DormAttendanceRecord>[] = [
    { key: "宿舍号",     header: "宿舍号",     render: r => <span className="whitespace-nowrap font-semibold" style={{ fontSize: 15, color: "#374151" }}>{r.宿舍号 || "—"}</span> },
    { key: "宿舍楼栋",   header: "宿舍楼栋",   render: r => {
      const { bg, text } = getBuildingColor(r.宿舍楼栋);
      return (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
          style={{ background: bg, color: text }}>
          {r.宿舍楼栋 || "—"}
        </span>
      );
    }},
    { key: "场景",       header: "场景",       render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.场景 || "—"}</span> },
    { key: "学生编号",   header: "学生编号",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学生编号 || "—"}</span> },
    { key: "学生姓名",   header: "学生姓名",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学生姓名 || "—"}</span> },
    { key: "检查项",     header: "检查项",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.检查项 || "—"}</span> },
    { key: "扣分项",     header: "扣分项",     minWidth: 120, render: r => <span style={{ fontSize: 15, color: r.扣分项 ? "#374151" : "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.扣分项 || undefined}>{r.扣分项 || "—"}</span> },
    { key: "扣分",       header: "扣分",       render: r => {
      const score = Math.abs(r.扣分);
      if (!score) return <span style={{ fontSize: 15, color: "#9ca3af" }}>—</span>;
      const high = score >= 5, mid = score >= 3;
      return (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
          style={{
            background: high ? "rgba(239,68,68,0.08)" : mid ? "rgba(245,158,11,0.1)" : "rgba(107,114,128,0.07)",
            color:      high ? "#dc2626"               : mid ? "#d97706"              : "#6b7280",
          }}>
          -{score}分
        </span>
      );
    }},
    { key: "违纪情况说明", header: "违纪情况说明", minWidth: 160, render: r => <span style={{ fontSize: 15, color: r.违纪情况说明 ? "#374151" : "#9ca3af", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.违纪情况说明 || undefined}>{r.违纪情况说明 || "—"}</span> },
    { key: "违纪图片",   header: "违纪图片",   minWidth: 80, render: r => <PhotoList photos={r.违纪图片} /> },
    { key: "提交人手机号", header: "提交人手机号", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.提交人手机号 || "—"}</span> },
    { key: "提交时间",   header: "提交时间",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }} title={r.提交时间 || undefined}>{formatSubmitTime(r.提交时间)}</span> },
  ];

  const quickEntries: { icon: React.ElementType; label: string; bg: string; color: string; hover: string; target: PageKey | null }[] = [
    { icon: Users,         label: "学生管理看板", bg: "bg-violet-50",  color: "text-violet-600", hover: "group-hover:bg-violet-600",  target: "student-dashboard" },
    { icon: Building2,     label: "宿舍考勤看板", bg: "bg-indigo-50",  color: "text-indigo-600", hover: "group-hover:bg-indigo-600",  target: null },
    { icon: FileText,      label: "学生档案",     bg: "bg-purple-50",  color: "text-purple-600", hover: "group-hover:bg-purple-600",  target: null },
    { icon: TrendingUp,    label: "学情分析",     bg: "bg-fuchsia-50", color: "text-fuchsia-600", hover: "group-hover:bg-fuchsia-600", target: "learning-analysis-table" },
    { icon: Plus,          label: "查看更多",      bg: "bg-gray-50",    color: "text-gray-400",    hover: "group-hover:bg-gray-800",    target: null },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <style>{`@keyframes studentRipple { 0%{transform:scale(0);opacity:0.45;} 100%{transform:scale(4);opacity:0;} }`}</style>

      <PageHeader
        breadcrumbs={[{ label: "一生一案" }, { label: "首页", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">

          {/* ── Banner ── */}
          <section
            className="w-full flex flex-col items-center justify-center relative"
            style={{ height: 208, background: "linear-gradient(135deg,#4c1d95 0%,#6d28d9 50%,#8b5cf6 100%)", borderRadius: 28, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
          >
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#ffffff 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
            <div className="relative z-10 text-center space-y-3">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-widest" style={{ textShadow: "0 0 30px rgba(139,92,246,0.8)" }}>
                宿舍考勤看板
              </h2>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-violet-400" />
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-violet-400" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent opacity-30" />
          </section>

          {/* ── Quick Entry ── */}
          <section className="glass rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center mb-8">
              <div className="w-1.5 h-4 bg-violet-500 rounded-full mr-2" />
              <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">快捷入口</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {quickEntries.map(({ icon: Icon, label, bg, color, hover, target }) => (
                <div key={label} className="flex flex-col items-center gap-4 group cursor-pointer"
                  onClick={() => { if (target) onNavigate?.(target); }}>
                  <div className={`w-16 h-16 ${bg} rounded-[24px] flex items-center justify-center ${color} ${hover} group-hover:text-white transition-all duration-300 shadow-sm apple-hover`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-base font-bold text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── 筛选区 ── */}
          <FilterBar
            defs={[
              { key: "building",   label: "宿舍区", options: cascadingOptions.buildings },
              { key: "checkItem",  label: "检查项", options: cascadingOptions.checkItems },
              { key: "dormNo",     label: "宿舍号", options: cascadingOptions.dormNos },
              { key: "deductItem", label: "扣分项", options: cascadingOptions.deductItems },
            ]}
            values={{ building: activeFilters.building, checkItem: activeFilters.checkItem, dormNo: activeFilters.dormNo, deductItem: activeFilters.deductItem }}
            onChange={(key, v) => { setActiveFilters(f => ({ ...f, [key]: v })); setPage(1); }}
            onClear={() => { setActiveFilters(f => ({ ...f, building: "", checkItem: "", dormNo: "", deductItem: "" })); setPage(1); }}
          />

          {/* ── 时间筛选 + 统计卡片（独立一行）── */}
          <section className="flex flex-col gap-4">

            {/* 扣分时间 */}
            <div className="glass rounded-[20px] px-4 pt-3 pb-4 flex flex-col gap-2.5">
              <p className="text-sm font-semibold text-gray-800">扣分时间</p>
              <div className="flex gap-2 flex-wrap items-center">
                {TIME_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => setTimePeriod(opt)}
                    className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150"
                    style={{ background: timePeriod === opt ? "rgba(139,92,246,0.12)" : "rgba(0,0,0,0.04)", color: timePeriod === opt ? "#7c3aed" : "#6b7280", border: timePeriod === opt ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent" }}>
                    {opt}
                  </button>
                ))}
                {timePeriod === "自定义" && (
                  <div className="flex items-center gap-2 ml-1">
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={e => setCustomDateRange(r => ({ ...r, start: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-violet-400 transition-colors bg-white/60"
                    />
                    <span className="text-xs text-gray-400">至</span>
                    <input
                      type="date"
                      value={customDateRange.end}
                      min={customDateRange.start}
                      onChange={e => setCustomDateRange(r => ({ ...r, end: e.target.value }))}
                      className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 outline-none focus:border-violet-400 transition-colors bg-white/60"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4 stat cards 全宽平铺 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

              {/* 扣分类型分布 */}
              <TiltCard title="扣分类型分布" actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: Maximize2, tip: "放大" }]}>
                <div className="flex-1 flex flex-col justify-center gap-1.5 py-1">
                  {isPending
                    ? [80, 60, 45, 30].map((w, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="h-2.5 rounded-full bg-gray-100 animate-pulse" style={{ width: `${w}%` }} />
                        </div>
                      ))
                    : deductItemDist.length === 0
                      ? <p className="text-sm text-gray-400 text-center">暂无数据</p>
                      : deductItemDist.map(([label, count], i) => {
                          const COLORS = ["#818cf8","#60a5fa","#34d399","#f472b6","#fb923c","#a78bfa"];
                          const color = COLORS[i % COLORS.length];
                          return (
                            <div key={label} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 shrink-0 text-right overflow-hidden text-ellipsis whitespace-nowrap" style={{ width: 52 }} title={label}>{label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: 9 }}>
                                <div className="h-full rounded-full transition-all duration-500"
                                  style={{ width: `${(count / deductItemMax) * 100}%`, background: color }} />
                              </div>
                              <span className="text-xs font-bold tabular-nums shrink-0" style={{ width: 18, color, textAlign: "right" }}>{count}</span>
                            </div>
                          );
                        })
                  }
                </div>
              </TiltCard>

              {/* 总扣分分值 */}
              <TiltCard title="总扣分分值" actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: Maximize2, tip: "放大" }]}>
                <div className="flex-1 flex items-center justify-center">
                  {isPending
                    ? <div className="w-16 h-12 bg-gray-100 rounded-xl animate-pulse" />
                    : <div className="relative leading-none">
                        <span className="font-black" style={{ fontSize: 72, color: "#6366f1" }}>{totalDeductions}</span>
                        <span className="absolute font-semibold text-gray-400" style={{ fontSize: 13, right: -16, bottom: 4 }}>分</span>
                      </div>
                  }
                </div>
              </TiltCard>

              {/* 各楼栋扣分 — 最多显示 2 栋 */}
              {isPending
                ? [0, 1].map(i => (
                    <TiltCard key={i} title="—" actions={[]}>
                      <div className="flex-1 flex items-center justify-center">
                        <div className="w-16 h-12 bg-gray-100 rounded-xl animate-pulse" />
                      </div>
                    </TiltCard>
                  ))
                : buildingStats.length === 0
                  ? [0, 1].map(i => (
                      <TiltCard key={i} title="楼栋扣分" actions={[{ Icon: Maximize2, tip: "放大" }]}>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="relative leading-none">
                            <span className="font-black" style={{ fontSize: 72, color: "#d1d5db" }}>0</span>
                            <span className="absolute font-semibold text-gray-300" style={{ fontSize: 13, right: -16, bottom: 4 }}>分</span>
                          </div>
                        </div>
                      </TiltCard>
                    ))
                  : buildingStats.map(({ label, value, color }) => (
                      <TiltCard key={label} title={label} actions={[{ Icon: Upload, tip: "导出" }, { Icon: Maximize2, tip: "放大" }]}>
                        <div className="flex-1 flex items-center justify-center">
                          <div className="relative leading-none">
                            <span className="font-black" style={{ fontSize: 72, color }}>{value}</span>
                            <span className="absolute font-semibold text-gray-400" style={{ fontSize: 13, right: -16, bottom: 4 }}>分</span>
                          </div>
                        </div>
                      </TiltCard>
                    ))
              }

            </div>
          </section>

          {/* ── 扣分明细 table ── */}
          <DashboardTable
            title="扣分明细"
            columns={cols}
            rows={sliced}
            isPending={isPending}
            isError={isError}
            sortAsc={sortAsc}
            onSortToggle={() => { setSortAsc(v => !v); setPage(1); }}
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            onPageChange={setPage}
            onPageSizeChange={n => { setPageSize(n); setPage(1); }}
            onRowClick={setSelectedRecord}
            onRefresh={refetch}
          />


        </main>
      </div>

      <DormAttendanceDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
