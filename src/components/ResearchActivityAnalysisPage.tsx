"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Upload, RefreshCw, ArrowUpDown, Maximize2, Unlink, Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { useResearchDashboard } from "@/hooks/use-research-dashboard";
import type { ActiveFilters } from "@/hooks/use-research-dashboard";
import { TrendLineChart } from "./ui/TrendLineChart";
import { DashboardTable, PhotoList, FileBadgeList } from "./ui/DashboardTable";
import type { ColumnDef } from "./ui/DashboardTable";

const teal = "#13c2c2";
const PAGE_SIZE = 20;

const calendarDays = ["20 周一","21 周二","22 周三","23 周四","24 周五","25 周六","26 周日"];

// ── 通用组件 ──────────────────────────────────────────────────────────────────

type ActionItem = { Icon: React.ElementType; tip: string; onClick?: () => void; tipAlign?: "center" | "right" };

function ActionBar({ show, actions }: { show: boolean; actions: ActionItem[] }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {actions.map(({ Icon, tip, onClick, tipAlign = "center" }) => (
        <div key={tip} className="relative group/tip">
          <button
            onClick={onClick}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors"
          >
            <Icon size={12} />
          </button>
          <div className={`pointer-events-none absolute top-full mt-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 ${tipAlign === "right" ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
            {tipAlign !== "right" && <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800/90" />}
            <div className="px-2 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md whitespace-nowrap">{tip}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
        {value && (
          <button onClick={() => onChange("")} className="text-xs text-gray-400 hover:text-gray-600 px-1">✕</button>
        )}
      </div>
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left"
          style={{ border: "1px solid #e5e7eb", background: "white", fontSize: 15, color: value ? "#374151" : "#9ca3af" }}
        >
          <span className="truncate">{value || "全部"}</span>
          <ChevronRight size={12} style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform 0.15s", flexShrink: 0, color: "#9ca3af" }} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 rounded-xl overflow-hidden"
            style={{ top: "calc(100% + 4px)", background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", zIndex: 200, maxHeight: 200, overflowY: "auto" }}>
            <button
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-3 py-2 transition-colors"
              style={{ fontSize: 14, color: !value ? teal : "#374151", background: !value ? "rgba(19,194,194,0.06)" : "transparent" }}
            >全部</button>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-3 py-2 transition-colors"
                style={{ fontSize: 14, color: opt === value ? teal : "#374151", background: opt === value ? "rgba(19,194,194,0.06)" : "transparent" }}
              >{opt}</button>
            ))}
          </div>
        )}
      </div>
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
    const obs = new ResizeObserver(() => {
      setWidth(el.scrollWidth);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function onTopScroll() {
    if (botRef.current && topRef.current) botRef.current.scrollLeft = topRef.current.scrollLeft;
  }
  function onBotScroll() {
    if (topRef.current && botRef.current) topRef.current.scrollLeft = botRef.current.scrollLeft;
  }

  return (
    <div>
      {/* 顶部镜像滚动条 */}
      <div ref={topRef} onScroll={onTopScroll} style={{ overflowX: "auto", overflowY: "hidden", height: 12 }}>
        <div style={{ width, height: 1 }} />
      </div>
      {/* 实际表格 */}
      <div ref={botRef} onScroll={onBotScroll} className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

// 照片 hover 预览（fixed 定位，不受 overflow 裁剪）
function PhotoPreview({ src, alt }: { src: string; alt: string }) {
  const [visible, setVisible] = useState(false);
  const [floatPos, setFloatPos] = useState({ x: 0, y: 0 });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  function clearHide() {
    if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; }
  }
  function scheduleHide() {
    clearHide();
    hideTimer.current = setTimeout(() => setVisible(false), 400);
  }

  function onThumbEnter() {
    clearHide();
    // 用缩略图元素的位置计算浮层坐标，固定在缩略图正上方
    const el = thumbRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setFloatPos({ x: rect.left, y: rect.top });
    }
    setVisible(true);
  }

  // 浮层宽 240，高约 240；紧贴缩略图上方，左对齐缩略图
  // 浮层紧贴缩略图上方 8px
  const FLOAT_H = 244;
  const left = Math.min(floatPos.x, window.innerWidth - 260);
  const top  = floatPos.y - FLOAT_H - 4;

  return (
    <div ref={thumbRef} className="shrink-0 inline-block"
      onMouseEnter={onThumbEnter}
      onMouseLeave={scheduleHide}
    >
      <img src={src} alt={alt} className="rounded object-cover cursor-pointer" style={{ width: 32, height: 32 }} />
      {visible && (
        <div
          className="z-[9999] rounded-xl shadow-2xl flex flex-col"
          style={{ position: "fixed", left, top, width: 240, background: "#fff", border: "1px solid #e5e7eb", overflow: "hidden" }}
          onMouseEnter={clearHide}
          onMouseLeave={scheduleHide}
        >
          <img src={src} alt={alt} className="object-contain w-full" style={{ maxHeight: 200 }} />
          <a
            href={src}
            download={alt || "photo"}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium hover:bg-blue-50 transition-colors"
            style={{ color: "#3b82f6", borderTop: "1px solid #f3f4f6" }}
          >
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

import type { ResearchRecord } from "@/hooks/use-research-dashboard";

// ── 图片全屏预览 ──────────────────────────────────────────────────────────────

function ImageLightbox({ images, index, onClose }: { images: { name: string; url: string }[]; index: number; onClose: () => void }) {
  const [cur, setCur] = useState(index);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  setCur(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setCur(i => Math.min(images.length - 1, i + 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      {/* 关闭 */}
      <button className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
        onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      {/* 下载 */}
      <a href={images[cur].url} download={images[cur].name} target="_blank" rel="noreferrer"
        className="absolute top-4 right-16 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
        onClick={e => e.stopPropagation()}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </a>
      {/* 上一张 */}
      {cur > 0 && (
        <button className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          onClick={e => { e.stopPropagation(); setCur(i => i - 1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {/* 下一张 */}
      {cur < images.length - 1 && (
        <button className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          onClick={e => { e.stopPropagation(); setCur(i => i + 1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
      {/* 图片 */}
      <img src={images[cur].url} alt={images[cur].name}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl mx-auto block"
        onClick={e => e.stopPropagation()}
      />
      {/* 计数 */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
          {cur + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// ── 详情抽屉 ──────────────────────────────────────────────────────────────────

function RecordDrawer({ record, onClose }: { record: ResearchRecord | null; onClose: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  function formatTime(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose}
      />
      {/* 抽屉 */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: 480,
          maxWidth: "100vw",
          background: "#fff",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        {record && (
          <>
            {/* 顶部 */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-semibold text-blue-500 mb-1">{record.学期 || "—"}</p>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{record.教研主题 || "—"}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

              {/* 基本信息 */}
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "教研学科", value: record.教研学科 },
                    { label: "教研组",   value: record.教研组 },
                    { label: "学科部门", value: record.学科部门 },
                    { label: "教研组长", value: record.教研组长 },
                    { label: "主持人",   value: record.主持人 },
                    { label: "教研时间", value: formatTime(record.时间) },
                    { label: "教研地点", value: record.地点 },
                    { label: "周次",     value: record.周次 },
                    { label: "应到人数", value: record.应到人数 ? String(record.应到人数) : "" },
                    { label: "实到人数", value: record.实到人数 ? String(record.实到人数) : "" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 参与人员 */}
              {record.参与人员 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">参与人员</p>
                  <p className="text-base text-gray-800 leading-relaxed">{record.参与人员}</p>
                </section>
              )}

              {/* 内容记录 */}
              {record.内容记录 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">内容记录</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.内容记录}</p>
                </section>
              )}

              {/* 备注 */}
              {record.备注 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">备注</p>
                  <p className="text-base text-gray-800 leading-relaxed">{record.备注}</p>
                </section>
              )}

              {/* 照片 */}
              {record.照片.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">照片（{record.照片.length} 张）</p>
                  <div className="grid grid-cols-3 gap-2">
                    {record.照片.map((f, i) => (
                      <button key={i} onClick={() => setLightboxIndex(i)}
                        className="block rounded-lg overflow-hidden aspect-square bg-gray-100 hover:opacity-80 transition-opacity cursor-zoom-in">
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* 附件 */}
              {record.附件.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">附件（{record.附件.length} 个）</p>
                  <div className="flex flex-col gap-2">
                    {record.附件.map((f, i) => (
                      <a key={i} href={f.url} target="_blank" rel="noreferrer" download={f.name}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors group">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                          </svg>
                        </div>
                        <span className="flex-1 min-w-0 text-base text-gray-700 truncate group-hover:text-blue-600 transition-colors">{f.name || "附件"}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </a>
                    ))}
                  </div>
                </section>
              )}

            </div>
          </>
        )}
      </div>
      {lightboxIndex !== null && record && (
        <ImageLightbox
          images={record.照片}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

// ── 页面主体 ──────────────────────────────────────────────────────────────────

export function ResearchActivityAnalysisPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");
  const [calendarOffset, setCalendarOffset] = useState(0); // 周偏移量
  const [hvTotal,    setHvTotal]    = useState(false);
  const [hvChart,    setHvChart]    = useState(false);
  const [hvSubject,  setHvSubject]  = useState(false);
  const [hvTeacher,  setHvTeacher]  = useState(false);
  const [hvCalendar, setHvCalendar] = useState(false);
  const [hvTable,    setHvTable]    = useState(false);
  const [tablePage,  setTablePage]  = useState(1);
  const [tablePageSize, setTablePageSize] = useState(20);
  const [tableSortAsc, setTableSortAsc] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ResearchRecord | null>(null);
  const [teacherPage, setTeacherPage] = useState(1);
  const [subjectPage, setSubjectPage] = useState(1);
  const LIST_PAGE_SIZE = 6;

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ semester: "", group: "", subject: "" });

  const { data, filterOptions, isPending, isError, raw } = useResearchDashboard(activeFilters);

  // 筛选变化时重置分页
  useEffect(() => {
    setTablePage(1);
    setTeacherPage(1);
    setSubjectPage(1);
  }, [activeFilters.semester, activeFilters.group, activeFilters.subject]);

  const totalRows  = raw.length;
  const sortedRaw  = [...raw].sort((a, b) => {
    const ta = new Date(a.时间).getTime() || 0;
    const tb = new Date(b.时间).getTime() || 0;
    return tableSortAsc ? ta - tb : tb - ta;
  });
  const totalPages = Math.max(1, Math.ceil(totalRows / tablePageSize));
  const pageRows   = sortedRaw.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  // 折线图数据
  const trend = data?.trendByMonth ?? [];

  // 学科列表
  const subjectList = data?.subjectDistribution ?? [];
  const subjectTotalPages = Math.max(1, Math.ceil(subjectList.length / LIST_PAGE_SIZE));
  const subjectPageRows = subjectList.slice((subjectPage - 1) * LIST_PAGE_SIZE, subjectPage * LIST_PAGE_SIZE);

  // 教师参与
  const teacherList = data?.teacherParticipation ?? [];
  const teacherTotal = teacherList.reduce((s, t) => s + t.value, 0);
  const teacherTotalPages = Math.max(1, Math.ceil(teacherList.length / LIST_PAGE_SIZE));
  const teacherPageRows = teacherList.slice((teacherPage - 1) * LIST_PAGE_SIZE, teacherPage * LIST_PAGE_SIZE);

  function formatTime(iso: string) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  }

  // 日历：计算当前周的7天
  const weekDays = (() => {
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
  })();

  const weekLabel = (() => {
    const s = weekDays[0], e = weekDays[6];
    if (s.getMonth() === e.getMonth())
      return `${s.getMonth()+1}月${s.getDate()}日-${e.getDate()}日`;
    return `${s.getMonth()+1}月${s.getDate()}日-${e.getMonth()+1}月${e.getDate()}日`;
  })();

  const DAY_NAMES = ["周一","周二","周三","周四","周五","周六","周日"];

  const eventsByDate = (() => {
    const map = new Map<string, typeof raw>();
    for (const r of raw) {
      if (!r.时间) continue;
      const d = new Date(r.时间);
      if (isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return map;
  })();

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,"0")}-${String(t.getDate()).padStart(2,"0")}`;
  })();

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#f5f5f7" }}>
      <RecordDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />

      <PageHeader
        breadcrumbs={[{ label: "教研活动" }, { label: "教研活动数据分析", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* 筛选器 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterDropdown
            label="学期"
            value={activeFilters.semester}
            options={filterOptions.semesters}
            onChange={v => setActiveFilters(f => ({ ...f, semester: v }))}
          />
          <FilterDropdown
            label="教研组"
            value={activeFilters.group}
            options={filterOptions.groups}
            onChange={v => setActiveFilters(f => ({ ...f, group: v }))}
          />
          <FilterDropdown
            label="教研学科"
            value={activeFilters.subject}
            options={filterOptions.subjects}
            onChange={v => setActiveFilters(f => ({ ...f, subject: v }))}
          />
        </div>

        {/* 统计 + 折线图 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass flex flex-col overflow-hidden" onMouseEnter={() => setHvTotal(true)} onMouseLeave={() => setHvTotal(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
              <p className="flex-1 min-w-0 truncate" title="教研活动总数" style={{ fontSize: 15, fontWeight: 500, color: "#374151" }}>教研活动总数</p>
              <ActionBar show={hvTotal} actions={[{ Icon: Upload, tip: "导出" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6">
              {isPending ? (
                <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
              ) : (
                <>
                  <span className="font-black text-gray-900 leading-none" style={{ fontSize: 96 }}>
                    {isError ? "!" : data?.total ?? 0}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#10b981" }}>
                    {isError ? "加载失败" : `共 ${data?.total ?? 0} 条记录`}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="glass md:col-span-3 flex flex-col overflow-hidden" onMouseEnter={() => setHvChart(true)} onMouseLeave={() => setHvChart(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
              <p className="flex-1 min-w-0 truncate" title="教研次数" style={{ fontSize: 15, fontWeight: 500, color: "#374151" }}>教研次数</p>
              <ActionBar show={hvChart} actions={[{ Icon: Unlink, tip: "取消联动" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 p-4" style={{ height: 200 }}>
              <TrendLineChart
                data={trend}
                isPending={isPending}
                isError={isError}
                legendLabel="教研次数"
              />
            </div>
          </div>
        </div>

        {/* 列表 + 日历 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* 学科教研情况 */}
          <div className="glass lg:col-span-2 flex flex-col overflow-hidden shadow-sm" onMouseEnter={() => setHvSubject(true)} onMouseLeave={() => setHvSubject(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 shrink-0" style={{ padding: "10px 12px" }}>
              <h3 className="font-semibold flex-1 min-w-0 truncate" title="学科教研情况" style={{ fontSize: 15, color: "#111827" }}>学科教研情况</h3>
              <ActionBar show={hvSubject} actions={[{ Icon: Unlink, tip: "取消联动" }, { Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 overflow-hidden">
              {isPending ? (
                <div className="p-3 space-y-2">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : subjectList.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-sm text-gray-400">暂无数据</div>
              ) : (
                <ul>
                  {subjectPageRows.map(({ label, value }, i) => (
                    <li key={label} className="flex justify-between items-center border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ padding: "8px 12px", fontSize: 15, color: "#374151", background: i === 0 && subjectPage === 1 ? "#f9fafb" : undefined }}>
                      <span className="truncate flex-1 min-w-0" title={label}>{label}</span>
                      <span className="ml-2 shrink-0 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "#eff6ff", color: "#3b82f6" }}>{value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-center items-center gap-1 p-2 border-t border-gray-100 shrink-0 mt-auto" style={{ fontSize: 14 }}>
              <button onClick={() => setSubjectPage(p => Math.max(1, p - 1))} disabled={subjectPage === 1}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">‹</button>
              <span className="px-2 text-gray-500">{subjectPage} / {subjectTotalPages}</span>
              <button onClick={() => setSubjectPage(p => Math.min(subjectTotalPages, p + 1))} disabled={subjectPage === subjectTotalPages}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">›</button>
            </div>
          </div>

          {/* 教师参与次数 */}
          <div className="glass lg:col-span-2 flex flex-col overflow-hidden shadow-sm" onMouseEnter={() => setHvTeacher(true)} onMouseLeave={() => setHvTeacher(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 shrink-0" style={{ padding: "10px 12px" }}>
              <h3 className="font-semibold flex-1 min-w-0 truncate" title="教师参与次数" style={{ fontSize: 15, color: "#111827" }}>教师参与次数</h3>
              <ActionBar show={hvTeacher} actions={[{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-center border-b border-gray-50 px-3 py-2">
                <span style={{ fontSize: 14, color: "#3b82f6" }}>计数</span>
                <span className="px-2 py-0.5 rounded-full text-white" style={{ fontSize: 15, background: "#fb923c" }}>{teacherTotal}</span>
              </div>
              {isPending ? (
                <div className="p-3 space-y-2">
                  {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : teacherList.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-sm text-gray-400">暂无数据</div>
              ) : (
                <ul>
                  {teacherPageRows.map((t, i) => (
                    <li key={t.label} className="flex justify-between items-center border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ padding: "8px 12px", background: i === 0 && teacherPage === 1 ? "#f9fafb" : undefined }}>
                      <span style={{ fontSize: 15, color: "#374151" }}>{t.label}</span>
                      <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 15, background: "#eff6ff", color: "#3b82f6" }}>{t.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-center items-center gap-1 p-2 border-t border-gray-100 shrink-0 mt-auto" style={{ fontSize: 14 }}>
              <button onClick={() => setTeacherPage(p => Math.max(1, p - 1))} disabled={teacherPage === 1}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">‹</button>
              <span className="px-2 text-gray-500">{teacherPage} / {teacherTotalPages}</span>
              <button onClick={() => setTeacherPage(p => Math.min(teacherTotalPages, p + 1))} disabled={teacherPage === teacherTotalPages}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">›</button>
            </div>
          </div>

          {/* 日历 */}
          <div className="glass lg:col-span-8 flex flex-col overflow-hidden shadow-sm" onMouseEnter={() => setHvCalendar(true)} onMouseLeave={() => setHvCalendar(false)}>
            <div className="flex justify-between items-center border-b border-gray-100" style={{ padding: "10px 12px" }}>
              <h3 className="flex-1 min-w-0 truncate" title="教研日历" style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>教研日历</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1" style={{ fontSize: 14 }}>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors" onClick={() => setCalendarOffset(o => o - 1)}><ChevronLeft size={14} /></button>
                  <span style={{ fontWeight: 600, color: "#111827", minWidth: 120, textAlign: "center" }}>
                    {calendarView === "week" ? weekLabel : (() => {
                      const t = new Date(); t.setMonth(t.getMonth() + calendarOffset);
                      return `${t.getFullYear()}年${t.getMonth()+1}月`;
                    })()}
                  </span>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors" onClick={() => setCalendarOffset(o => o + 1)}><ChevronRight size={14} /></button>
                </div>
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "#374151", fontSize: 14 }}
                  onClick={() => setCalendarOffset(0)}>{calendarView === "week" ? "本周" : "本月"}</button>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden" style={{ fontSize: 14 }}>
                  <button onClick={() => { setCalendarView("week"); setCalendarOffset(0); }} className="px-3 py-1 transition-colors"
                    style={{ background: calendarView === "week" ? teal : "white", color: calendarView === "week" ? "white" : "#374151" }}>周</button>
                  <button onClick={() => { setCalendarView("month"); setCalendarOffset(0); }} className="px-3 py-1 border-l border-gray-200 transition-colors"
                    style={{ background: calendarView === "month" ? teal : "white", color: calendarView === "month" ? "white" : "#374151" }}>月</button>
                </div>
                <ActionBar show={hvCalendar} actions={[{ Icon: Plus, tip: "添加" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: Maximize2, tip: "放大" }]} />
              </div>
            </div>

            {/* 星期列头（周/月共用） */}
            <div className="grid grid-cols-7 border-b border-gray-100 text-center shrink-0" style={{ background: "#f9fafb" }}>
              {DAY_NAMES.map(n => (
                <div key={n} className="py-2" style={{ fontSize: 12, color: "#9ca3af" }}>{n}</div>
              ))}
            </div>

            {calendarView === "week" ? (
              <>
                {/* 周视图列头日期 */}
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
                {/* 周视图格子 */}
                <div className="grid grid-cols-7 flex-1 overflow-y-auto" style={{ minHeight: 140 }}>
                  {weekDays.map((d, i) => {
                    const dStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
                    const events = eventsByDate.get(dStr) ?? [];
                    return (
                      <div key={i} className={`p-1.5 flex flex-col gap-1 ${i < 6 ? "border-r border-gray-50" : ""}`}>
                        {events.slice(0, 3).map((ev, j) => (
                          <button key={j} onClick={() => setSelectedRecord(ev)}
                            className="w-full text-left px-1.5 py-1 rounded truncate hover:opacity-80 transition-opacity"
                            style={{ background: "#eff6ff", color: "#3b82f6", fontSize: 11 }}
                            title={ev.教研主题}
                          >{ev.教研主题 || ev.教研学科 || "教研活动"}</button>
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
              /* 月视图 */
              (() => {
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + calendarOffset;
                const viewDate = new Date(year, month, 1);
                const viewYear = viewDate.getFullYear();
                const viewMonth = viewDate.getMonth();
                // 当月第一天是周几（周一=0）
                const firstDow = viewDate.getDay() === 0 ? 6 : viewDate.getDay() - 1;
                const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
                // 补齐前面空格
                const cells: (number | null)[] = [
                  ...Array(firstDow).fill(null),
                  ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
                ];
                // 补齐末尾使总数为7的倍数
                while (cells.length % 7 !== 0) cells.push(null);
                const rows = cells.length / 7;

                return (
                  <div className="flex-1 overflow-y-auto" style={{ minHeight: 140 }}>
                    {Array.from({ length: rows }, (_, row) => (
                      <div key={row} className="grid grid-cols-7 border-b border-gray-50 last:border-0" style={{ minHeight: 72 }}>
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
                                  style={{ background: "#eff6ff", color: "#3b82f6", fontSize: 10 }}
                                  title={ev.教研主题}
                                >{ev.教研主题 || ev.教研学科 || "教研活动"}</button>
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

        {/* 记录表 */}
        {(() => {
          const cols: ColumnDef<typeof pageRows[0]>[] = [
            { key: "主持人",   header: "主持人",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.主持人 || "—"}</span> },
            { key: "学科部门", header: "学科部门", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学科部门 || "—"}</span> },
            { key: "教研主题", header: "教研主题", minWidth: 200, render: r => <span style={{ fontSize: 15, color: "#1e40af", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.教研主题}>{r.教研主题 || "—"}</span> },
            { key: "教研时间", header: "教研时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{formatTime(r.时间)}</span> },
            { key: "教研地点", header: "教研地点", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.地点 || "—"}</span> },
            { key: "教研学科", header: "教研学科", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.教研学科 || "—"}</span> },
            { key: "教研组",   header: "教研组",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.教研组 || "—"}</span> },
            { key: "周次",     header: "周次",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.周次 || "—"}</span> },
            { key: "学期",     header: "学期",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学期 || "—"}</span> },
            { key: "参与老师", header: "参与老师", minWidth: 160, render: r => <span style={{ fontSize: 15, color: "#374151", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.参与人员}>{r.参与人员 || "—"}</span> },
            { key: "照片",     header: "照片",     minWidth: 100, render: r => <PhotoList photos={r.照片} /> },
            { key: "附件",     header: "附件",     minWidth: 100, render: r => <FileBadgeList files={r.附件} type="file" /> },
            { key: "教研记录", header: "教研记录", render: r => <span style={{ fontSize: 15, color: r.内容记录 ? "#374151" : "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.内容记录 || undefined}>{r.内容记录 || "—"}</span> },
            { key: "备注",     header: "备注",     render: r => <span style={{ fontSize: 15, color: r.备注 ? "#374151" : "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.备注 || undefined}>{r.备注 || "—"}</span> },
          ];
          return (
            <DashboardTable
              title="教研活动记录表"
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
            />
          );
        })()}

      </div>
    </div>
  );
}
