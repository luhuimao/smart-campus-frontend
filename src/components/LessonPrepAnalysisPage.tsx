"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Upload, RefreshCw, ArrowUpDown, Maximize2, Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker, DateRangePicker } from "./ui/DatePicker";
import { useBeikeDashboard } from "@/hooks/use-research-dashboard";
import type { BeikeActiveFilters, BeikeRecord } from "@/hooks/use-research-dashboard";
import { TrendLineChart } from "./ui/TrendLineChart";
import { DashboardTable, PhotoList, FileBadgeList } from "./ui/DashboardTable";
import type { ColumnDef } from "./ui/DashboardTable";

const teal = "#13c2c2";

const prepGroups = ["日语","高一化学","高一语文","高三英语","高三政治","高二语文","心理","高二地理","高三生物"];
const teachers  = ["李金月","廖永会","张敏","何春柳","杨帆","李枝芳","莫燕","刘瑞珊","郑茹"];

const calendarDays = ["20 周一","21 周二","22 周三","23 周四","24 周五","25 周六","26 周日"];

// SVG line chart — no external dependency
const CHART_DATA = [1, 7, 44, 30];
const CHART_LABELS = ["2025年12月","2026年02月","2026年03月","2026年04月"];
const W = 600, H = 160, PAD_L = 32, PAD_R = 16, PAD_T = 20, PAD_B = 28;
const MAX_VAL = 50;

function pointX(i: number) { return PAD_L + (i / (CHART_DATA.length - 1)) * (W - PAD_L - PAD_R); }
function pointY(v: number) { return PAD_T + (1 - v / MAX_VAL) * (H - PAD_T - PAD_B); }

function PrepChart() {
  const pts = CHART_DATA.map((v, i) => `${pointX(i)},${pointY(v)}`).join(" ");
  const areaPath = [
    `M ${pointX(0)},${pointY(CHART_DATA[0])}`,
    ...CHART_DATA.slice(1).map((v, i) => `L ${pointX(i + 1)},${pointY(v)}`),
    `L ${pointX(CHART_DATA.length - 1)},${H - PAD_B}`,
    `L ${pointX(0)},${H - PAD_B} Z`,
  ].join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0,10,20,30,40,50].map(v => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={pointY(v)} y2={pointY(v)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={PAD_L - 4} y={pointY(v) + 3} textAnchor="end" fill="#999" fontSize="8">{v}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#areaGrad)" />
      <polyline points={pts} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {CHART_DATA.map((v, i) => (
        <g key={i}>
          <circle cx={pointX(i)} cy={pointY(v)} r="4" fill="white" stroke="#60a5fa" strokeWidth="2" />
          <text x={pointX(i)} y={pointY(v) - 7} textAnchor="middle" fill="#666" fontSize="9">{v}</text>
        </g>
      ))}
      {CHART_LABELS.map((l, i) => (
        <text key={i} x={pointX(i)} y={H - PAD_B + 14} textAnchor="middle" fill="#666" fontSize="8">{l}</text>
      ))}
    </svg>
  );
}

const SUBJECT_OPTIONS     = ["等于","不等于","等于任意一个","不等于任意一个","包含","不包含","为空","不为空"];
const PARTICIPANT_OPTIONS = ["包含任意一个","同时包含","等于","为空","不为空"];
const TIME_OPTIONS        = ["等于","不等于","大于等于","小于等于","选择范围","动态筛选","为空","不为空"];

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


function FilterCard({ title, badge, options, children }: {
  title: string;
  badge?: string;
  options?: string[];
  children: React.ReactNode | ((condition: string) => React.ReactNode);
}) {
  const [condition, setCondition] = useState(options ? options[0] : (badge ?? ""));
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="glass" style={{ padding: "12px 16px", position: "relative", zIndex: open ? 100 : 1 }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {options ? (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(v => !v)}
              style={{ color: teal, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}
            >
              {condition} <ChevronRight size={11} style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform 0.15s" }} />
            </button>
            {open && (
              <div className="absolute right-0 rounded-xl overflow-hidden"
                style={{ top: "calc(100% + 4px)", minWidth: 140, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", zIndex: 200 }}>
                {options.map(opt => (
                  <button key={opt} onClick={() => { setCondition(opt); setOpen(false); }}
                    className="w-full text-left px-3 py-2 transition-colors"
                    style={{ fontSize: 14, color: opt === condition ? teal : "#374151", background: opt === condition ? "rgba(19,194,194,0.06)" : "transparent" }}
                    onMouseEnter={e => { if (opt !== condition) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; }}
                    onMouseLeave={e => { if (opt !== condition) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >{opt}</button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: teal, fontSize: 14 }}>{badge} ▾</span>
        )}
      </div>
      {typeof children === "function" ? children(condition) : children}
    </div>
  );
}

function CustomSelect({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <select className="w-full outline-none appearance-none pr-8 py-1.5 pl-3 rounded-lg"
        style={{ border: "1px solid #e5e7eb", color: "#9ca3af", background: "white", fontSize: 15 }}
        defaultValue="">
        <option value="" disabled>{placeholder}</option>
      </select>
      <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

type ActionItem = { Icon: React.ElementType; tip: string; onClick?: () => void; tipAlign?: "center" | "right" };

function BeikeLineChart({ coords, pts, area, H, padB }: {
  coords: { x: number; y: number; v: number; label: string }[];
  pts: string; area: string; H: number; padB: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <svg viewBox="0 0 600 160" width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="beikeAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="32" x2="584" y1={20 + i * 26} y2={20 + i * 26} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
      ))}
      <path d={area} fill="url(#beikeAreaGrad)" />
      <polyline points={pts} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* hover 竖线 */}
      {hovered !== null && (
        <line x1={coords[hovered].x} x2={coords[hovered].x} y1={20} y2={H - padB}
          stroke="#60a5fa" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
      )}
      {coords.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y} r={hovered === i ? 6 : 4}
            fill={hovered === i ? "#60a5fa" : "white"}
            stroke="#60a5fa" strokeWidth="2.5"
            style={{ transition: "r 0.1s, fill 0.1s" }} />
          {/* hover tooltip */}
          {hovered === i && (
            <g>
              <rect x={c.x - 22} y={c.y - 26} width={44} height={18} rx="4" fill="#1e293b" />
              <text x={c.x} y={c.y - 13} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{c.v}</text>
            </g>
          )}
          {hovered !== i && (
            <text x={c.x} y={c.y - 9} textAnchor="middle" fill="#94a3b8" fontSize="10">{c.v}</text>
          )}
          <text x={c.x} y={H - padB + 16} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="500">{c.label}</text>
          {/* 透明热区 */}
          <rect x={c.x - 30} y={20} width={60} height={H - 20 - padB + 20} fill="transparent"
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{ cursor: "crosshair" }} />
        </g>
      ))}
    </svg>
  );
}



function ActionBar({ show, actions }: { show: boolean; actions: ActionItem[] }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {actions.map(({ Icon, tip, onClick, tipAlign = "center" }) => (
        <div key={tip} className="relative group/tip">
          <button onClick={onClick}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors">
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

function PaginationBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center items-center gap-1 p-2 border-t border-gray-100" style={{ fontSize: 14 }}>
      <button className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">«</button>
      <button className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">‹</button>
      <span className="px-3 text-gray-500">{current} / {total}</span>
      <button className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">›</button>
      <button className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">»</button>
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

// ── TableWithTopScrollbar ─────────────────────────────────────────────────────

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

  function onTopScroll() {
    if (botRef.current && topRef.current) botRef.current.scrollLeft = topRef.current.scrollLeft;
  }
  function onBotScroll() {
    if (topRef.current && botRef.current) topRef.current.scrollLeft = botRef.current.scrollLeft;
  }

  return (
    <div>
      <div ref={topRef} onScroll={onTopScroll} style={{ overflowX: "auto", overflowY: "hidden", height: 12 }}>
        <div style={{ width, height: 1 }} />
      </div>
      <div ref={botRef} onScroll={onBotScroll} className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

// ── PhotoPreview ──────────────────────────────────────────────────────────────

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
    const el = thumbRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      setFloatPos({ x: rect.left, y: rect.top });
    }
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

// ── ImageLightbox ─────────────────────────────────────────────────────────────

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
      style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <button className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <a href={images[cur].url} download={images[cur].name} target="_blank" rel="noreferrer"
        className="absolute top-4 right-16 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
        onClick={e => e.stopPropagation()}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </a>
      {cur > 0 && (
        <button className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          onClick={e => { e.stopPropagation(); setCur(i => i - 1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {cur < images.length - 1 && (
        <button className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          onClick={e => { e.stopPropagation(); setCur(i => i + 1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
      <img src={images[cur].url} alt={images[cur].name}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl mx-auto block"
        onClick={e => e.stopPropagation()} />
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
          {cur + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// ── BeikeRecordDrawer ─────────────────────────────────────────────────────────

function BeikeRecordDrawer({ record, onClose }: { record: BeikeRecord | null; onClose: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

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
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <p className="text-xs font-semibold text-blue-500 mb-1">{record.学期 || "—"}</p>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{record.主题 || "—"}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
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
                    { label: "备课学科", value: record.备课学科 },
                    { label: "备课组",   value: record.备课组 },
                    { label: "学科部门", value: record.学科部门 },
                    { label: "备课组长", value: record.备课组长 },
                    { label: "主持人",   value: record.主持人 },
                    { label: "备课时间", value: formatTime(record.时间) },
                    { label: "备课地点", value: record.地点 },
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
              {record.参与人员 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">参与人员</p>
                  <p className="text-base text-gray-800 leading-relaxed">{record.参与人员}</p>
                </section>
              )}
              {record.内容记录 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">内容记录</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.内容记录}</p>
                </section>
              )}
              {record.备注 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">备注</p>
                  <p className="text-base text-gray-800 leading-relaxed">{record.备注}</p>
                </section>
              )}
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
        <ImageLightbox images={record.照片} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function LessonPrepAnalysisPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [calendarView,   setCalendarView]   = useState<"week" | "month">("week");
  const [calendarOffset, setCalendarOffset] = useState(0);
  const [hvTotal,     setHvTotal]     = useState(false);
  const [hvChart,     setHvChart]     = useState(false);
  const [hvPrepGroup, setHvPrepGroup] = useState(false);
  const [hvTeacher,   setHvTeacher]   = useState(false);
  const [hvCalendar,  setHvCalendar]  = useState(false);
  const [hvTable,     setHvTable]     = useState(false);
  const [tablePage,     setTablePage]     = useState(1);
  const [tablePageSize, setTablePageSize] = useState(20);
  const [tableSortAsc,  setTableSortAsc]  = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BeikeRecord | null>(null);
  const [activeFilters, setActiveFilters] = useState<BeikeActiveFilters>({ semester: "", group: "", subject: "" });
  const [prepGroupPage, setPrepGroupPage] = useState(1);
  const [teacherPage,   setTeacherPage]   = useState(1);
  const LIST_PAGE_SIZE = 6;

  const { data, filterOptions, isPending, isError, raw } = useBeikeDashboard(activeFilters);

  useEffect(() => {
    setTablePage(1);
    setPrepGroupPage(1);
    setTeacherPage(1);
  }, [activeFilters.semester, activeFilters.group, activeFilters.subject]);

  const totalRows  = raw.length;
  const sortedRaw  = [...raw].sort((a, b) => {
    const ta = new Date(a.时间).getTime() || 0;
    const tb = new Date(b.时间).getTime() || 0;
    return tableSortAsc ? ta - tb : tb - ta;
  });
  const totalPages = Math.max(1, Math.ceil(totalRows / tablePageSize));
  const pageRows   = sortedRaw.slice((tablePage - 1) * tablePageSize, tablePage * tablePageSize);

  // summary count from live data when available, else static fallback
  const totalCount = data?.total ?? 0;

  const prepGroupList = data?.subjectDistribution ?? [];
  const prepGroupTotalPages = Math.max(1, Math.ceil(prepGroupList.length / LIST_PAGE_SIZE));
  const prepGroupPageRows = prepGroupList.slice((prepGroupPage - 1) * LIST_PAGE_SIZE, prepGroupPage * LIST_PAGE_SIZE);

  const teacherList = data?.teacherParticipation ?? [];
  const teacherTotal = teacherList.reduce((s, t) => s + t.value, 0);
  const teacherTotalPages = Math.max(1, Math.ceil(teacherList.length / LIST_PAGE_SIZE));
  const teacherPageRows = teacherList.slice((teacherPage - 1) * LIST_PAGE_SIZE, teacherPage * LIST_PAGE_SIZE);

  const DAY_NAMES = ["周一","周二","周三","周四","周五","周六","周日"];

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
      <PageHeader
        breadcrumbs={[{ label: "备课活动" }, { label: "备课活动数据分析", active: true }]}
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
            label="备课组"
            value={activeFilters.group}
            options={filterOptions.groups}
            onChange={v => setActiveFilters(f => ({ ...f, group: v }))}
          />
          <FilterDropdown
            label="备课学科"
            value={activeFilters.subject}
            options={filterOptions.subjects}
            onChange={v => setActiveFilters(f => ({ ...f, subject: v }))}
          />
        </div>

        {/* Summary + Chart */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass flex flex-col overflow-hidden" onMouseEnter={() => setHvTotal(true)} onMouseLeave={() => setHvTotal(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
              <p className="flex-1 min-w-0 truncate" style={{ fontSize: 15, fontWeight: 500, color: "#374151" }}>备课活动总数</p>
              <ActionBar show={hvTotal} actions={[{ Icon: Upload, tip: "导出" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-6">
              {isPending ? (
                <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
              ) : (
                <>
                  <span className="font-black text-gray-900 leading-none" style={{ fontSize: 96 }}>
                    {isError ? "!" : totalCount}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#10b981" }}>
                    {isError ? "加载失败" : `共 ${totalCount} 条记录`}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="glass md:col-span-3 flex flex-col overflow-hidden" onMouseEnter={() => setHvChart(true)} onMouseLeave={() => setHvChart(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
              <p className="flex-1 min-w-0 truncate" style={{ fontSize: 15, fontWeight: 500, color: "#374151" }}>备课次数</p>
              <ActionBar show={hvChart} actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 p-4" style={{ height: 200 }}>
              <TrendLineChart
                data={data?.trendByMonth ?? []}
                isPending={isPending}
                isError={isError}
                legendLabel="备课次数"
              />
            </div>
          </div>
        </div>

        {/* Lists + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* 备课组备课情况 */}
          <div className="glass lg:col-span-2 flex flex-col overflow-hidden shadow-sm" onMouseEnter={() => setHvPrepGroup(true)} onMouseLeave={() => setHvPrepGroup(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 shrink-0" style={{ padding: "10px 12px" }}>
              <h3 className="font-semibold flex-1 min-w-0 truncate" style={{ fontSize: 15, color: "#111827" }}>备课组备课情况</h3>
              <ActionBar show={hvPrepGroup} actions={[{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 overflow-hidden">
              {isPending ? (
                <div className="p-3 space-y-2">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
                </div>
              ) : prepGroupList.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-sm text-gray-400">暂无数据</div>
              ) : (
                <ul>
                  {prepGroupPageRows.map(({ label, value }, i) => (
                    <li key={label} className="flex justify-between items-center border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                      style={{ padding: "8px 12px", fontSize: 15, color: "#374151", background: i === 0 && prepGroupPage === 1 ? "#f9fafb" : undefined }}>
                      <span className="truncate flex-1 min-w-0" title={label}>{label}</span>
                      <span className="ml-2 shrink-0 px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ background: "#eff6ff", color: "#3b82f6" }}>{value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="flex justify-center items-center gap-1 p-2 border-t border-gray-100 shrink-0 mt-auto" style={{ fontSize: 14 }}>
              <button onClick={() => setPrepGroupPage(p => Math.max(1, p - 1))} disabled={prepGroupPage === 1}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">‹</button>
              <span className="px-2 text-gray-500">{prepGroupPage} / {prepGroupTotalPages}</span>
              <button onClick={() => setPrepGroupPage(p => Math.min(prepGroupTotalPages, p + 1))} disabled={prepGroupPage === prepGroupTotalPages}
                className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50 disabled:opacity-40">›</button>
            </div>
          </div>

          {/* 教师参与次数 */}
          <div className="glass lg:col-span-2 flex flex-col overflow-hidden shadow-sm" onMouseEnter={() => setHvTeacher(true)} onMouseLeave={() => setHvTeacher(false)}>
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

          {/* Calendar */}
          <div className="glass lg:col-span-8 flex flex-col overflow-hidden shadow-sm" onMouseEnter={() => setHvCalendar(true)} onMouseLeave={() => setHvCalendar(false)}>
            <div className="flex justify-between items-center border-b border-gray-100" style={{ padding: "10px 12px" }}>
              <h3 className="flex-1 min-w-0 truncate" style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>备课日历</h3>
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

            {/* 星期列头 */}
            <div className="grid grid-cols-7 border-b border-gray-100 text-center shrink-0" style={{ background: "#f9fafb" }}>
              {DAY_NAMES.map(n => (
                <div key={n} className="py-2" style={{ fontSize: 12, color: "#9ca3af" }}>{n}</div>
              ))}
            </div>

            {calendarView === "week" ? (
              <>
                {/* 周视图日期行 */}
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
                            title={ev.主题}
                          >{ev.主题 || ev.备课学科 || "备课活动"}</button>
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
                                  title={ev.主题}
                                >{ev.主题 || ev.备课学科 || "备课活动"}</button>
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

        {/* Table */}
        {(() => {
          const cols: ColumnDef<BeikeRecord>[] = [
            { key: "主题",     header: "活动主题", minWidth: 200, render: r => <span style={{ fontSize: 15, color: "#1e40af", maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.主题}>{r.主题 || "—"}</span> },
            { key: "时间",     header: "活动时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{formatTime(r.时间)}</span> },
            { key: "地点",     header: "活动地点", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.地点 || "—"}</span> },
            { key: "备课组",   header: "备课组",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.备课组 || "—"}</span> },
            { key: "备课组长", header: "备课组长", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.备课组长 || "—"}</span> },
            { key: "参与人员", header: "参与教师", minWidth: 160, render: r => <span style={{ fontSize: 15, color: "#374151", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.参与人员}>{r.参与人员 || "—"}</span> },
            { key: "主持人",   header: "主持人",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.主持人 || "—"}</span> },
            { key: "照片",     header: "照片",     minWidth: 100, render: r => <PhotoList photos={r.照片} /> },
            { key: "附件",     header: "附件",     minWidth: 100, render: r => <FileBadgeList files={r.附件} type="file" /> },
            { key: "内容记录", header: "内容记录", render: r => <span style={{ fontSize: 15, color: r.内容记录 ? "#374151" : "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.内容记录 || undefined}>{r.内容记录 || "—"}</span> },
            { key: "备注",     header: "备注",     render: r => <span style={{ fontSize: 15, color: r.备注 ? "#374151" : "#9ca3af", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.备注 || undefined}>{r.备注 || "—"}</span> },
          ];
          return (
            <DashboardTable
              title="备课活动记录表"
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

      <BeikeRecordDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
