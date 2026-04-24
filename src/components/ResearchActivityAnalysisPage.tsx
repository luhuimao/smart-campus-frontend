"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker, DateRangePicker } from "./ui/DatePicker";

const glass = {
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.3)",
} as const;

const card = {
  ...glass,
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
} as const;

const teal = "#13c2c2";

// ── 数据 ──────────────────────────────────────────────────────────────────────

const subjects = [
  "高中思想政治","高中数学","高中英语","高中历史",
  "高中地理","高中物理","高中生物学","高中语文","高中俄语","汇总",
];

const teacherCounts = [
  { name: "孙有璋", count: 2 },
  { name: "农兆年", count: 3 },
  { name: "沈太何", count: 3 },
  { name: "黄景民", count: 4 },
  { name: "莫燕",   count: 4 },
  { name: "甘育攀", count: 6 },
  { name: "张丽燕", count: 5 },
];

const tableRows = [
  { reporter: "甘育攀", dept: "政治教研组", theme: "新课标背景下思政课教学策略研讨", time: "2026-04-22 09:00", location: "行政楼三楼会议室", subject: "高中思想政治", participants: "甘育攀、孙有璋、农兆年", hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "" },
  { reporter: "黄景民", dept: "数学教研组", theme: "数学核心素养培育路径探讨",       time: "2026-04-18 14:00", location: "明达楼二楼辅导室", subject: "高中数学",     participants: "黄景民、莫燕、沈太何",   hasRecord: true,  hasPhotos: false, hasAttach: true,  remark: "" },
  { reporter: "张丽燕", dept: "英语教研组", theme: "英语写作专项教研",               time: "2026-04-15 08:30", location: "图书馆报告厅",    subject: "高中英语",     participants: "张丽燕、何春柳、钱伟",   hasRecord: false, hasPhotos: true,  hasAttach: false, remark: "资料整理中" },
  { reporter: "孙有璋", dept: "史地教研组", theme: "历史史料教学法研讨",             time: "2026-04-12 10:00", location: "行政楼三楼会议室", subject: "高中历史",     participants: "孙有璋、沈太何",         hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "" },
  { reporter: "郑茹",   dept: "史地教研组", theme: "地理区域认知与综合思维教研",     time: "2026-04-10 09:30", location: "明达楼二楼辅导室", subject: "高中地理",     participants: "郑茹、韩冰、农兆年",     hasRecord: true,  hasPhotos: false, hasAttach: false, remark: "" },
  { reporter: "甘育攀", dept: "理化教研组", theme: "物理实验教学研讨",               time: "2026-03-28 14:30", location: "实验楼一楼研讨室", subject: "高中物理",     participants: "黄景民、甘育攀、李金月", hasRecord: false, hasPhotos: true,  hasAttach: true,  remark: "实验报告待提交" },
  { reporter: "李枝芳", dept: "理化教研组", theme: "生物学新教材使用研讨",           time: "2026-03-25 09:00", location: "实验楼一楼研讨室", subject: "高中生物学",   participants: "李枝芳、曹磊、莫燕",     hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "" },
  { reporter: "张敏",   dept: "语文教研组", theme: "语文整本书阅读教学策略",         time: "2026-03-20 09:00", location: "图书馆报告厅",    subject: "高中语文",     participants: "张敏、吴晓峰、农兆年",   hasRecord: true,  hasPhotos: true,  hasAttach: false, remark: "" },
  { reporter: "沈太何", dept: "外语教研组", theme: "俄语口语教学研讨",               time: "2026-03-15 10:00", location: "语音室",          subject: "高中俄语",     participants: "沈太何、田中花子",       hasRecord: false, hasPhotos: false, hasAttach: false, remark: "资料待补充" },
  { reporter: "甘育攀", dept: "全体教研组", theme: "跨学科主题教学研讨",             time: "2026-02-26 14:00", location: "行政楼三楼会议室", subject: "汇总",         participants: "全体教师",               hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "全员参与" },
];

const calendarDays = ["20 周一","21 周二","22 周三","23 周四","24 周五","25 周六","26 周日"];

// ── SVG 折线图 ────────────────────────────────────────────────────────────────

const CHART_DATA   = [1, 4, 22, 12];
const CHART_LABELS = ["2025年12月","2026年02月","2026年03月","2026年04月"];
const W = 600, H = 160, PAD_L = 32, PAD_R = 16, PAD_T = 20, PAD_B = 28;
const MAX_VAL = 25;

function pointX(i: number) { return PAD_L + (i / (CHART_DATA.length - 1)) * (W - PAD_L - PAD_R); }
function pointY(v: number) { return PAD_T + (1 - v / MAX_VAL) * (H - PAD_T - PAD_B); }

function ResearchChart() {
  const pts      = CHART_DATA.map((v, i) => `${pointX(i)},${pointY(v)}`).join(" ");
  const areaPath = [
    `M ${pointX(0)},${pointY(CHART_DATA[0])}`,
    ...CHART_DATA.slice(1).map((v, i) => `L ${pointX(i + 1)},${pointY(v)}`),
    `L ${pointX(CHART_DATA.length - 1)},${H - PAD_B}`,
    `L ${pointX(0)},${H - PAD_B} Z`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="researchAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#93c5fd" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 5, 10, 15, 20, 25].map(v => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={pointY(v)} y2={pointY(v)} stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
          <text x={PAD_L - 4} y={pointY(v) + 3} textAnchor="end" fill="#999" fontSize="8">{v}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#researchAreaGrad)" />
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

// ── 通用组件 ──────────────────────────────────────────────────────────────────

const SUBJECT_OPTIONS     = ["等于","不等于","等于任意一个","不等于任意一个","包含","不包含","为空","不为空"];
const PARTICIPANT_OPTIONS = ["包含任意一个","同时包含","等于","为空","不为空"];
const TIME_OPTIONS        = ["等于","不等于","大于等于","小于等于","选择范围","动态筛选","为空","不为空"];

function FilterCard({ title, options, children }: {
  title: string;
  options?: string[];
  children: React.ReactNode | ((condition: string) => React.ReactNode);
}) {
  const [condition, setCondition] = useState(options?.[0] ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div style={{ ...card, padding: "12px 16px", position: "relative", zIndex: open ? 100 : 1 }}>
      <div className="flex justify-between items-center mb-2">
        <span style={{ color: "#374151", fontSize: 13 }}>{title}</span>
        {options && (
          <div className="relative" ref={ref}>
            <button onClick={() => setOpen(v => !v)}
              style={{ color: teal, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}>
              {condition}
              <ChevronRight size={11} style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform 0.15s" }} />
            </button>
            {open && (
              <div className="absolute right-0 rounded-xl overflow-hidden"
                style={{ top: "calc(100% + 4px)", minWidth: 140, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", zIndex: 200 }}>
                {options.map(opt => (
                  <button key={opt} onClick={() => { setCondition(opt); setOpen(false); }}
                    className="w-full text-left px-3 py-2 transition-colors"
                    style={{ fontSize: 12, color: opt === condition ? teal : "#374151", background: opt === condition ? "rgba(19,194,194,0.06)" : "transparent" }}
                    onMouseEnter={e => { if (opt !== condition) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; }}
                    onMouseLeave={e => { if (opt !== condition) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >{opt}</button>
                ))}
              </div>
            )}
          </div>
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
        style={{ border: "1px solid #e5e7eb", color: "#9ca3af", background: "white", fontSize: 13 }}
        defaultValue="">
        <option value="" disabled>{placeholder}</option>
      </select>
      <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

function PaginationBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center items-center gap-1 p-2 border-t border-gray-100" style={{ fontSize: 12 }}>
      {["«","‹"].map(s => <button key={s} className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">{s}</button>)}
      <span className="px-3 text-gray-500">{current} / {total}</span>
      {["›","»"].map(s => <button key={s} className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">{s}</button>)}
    </div>
  );
}

// ── 页面主体 ──────────────────────────────────────────────────────────────────

export function ResearchActivityAnalysisPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif', background: "#f5f5f7" }}>

      <PageHeader
        breadcrumbs={[{ label: "教研活动" }, { label: "教研活动数据分析", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* 筛选器 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterCard title="教研学科" options={SUBJECT_OPTIONS}>
            <CustomSelect placeholder="请选择" />
          </FilterCard>
          <FilterCard title="参与教师" options={PARTICIPANT_OPTIONS}>
            <CustomSelect placeholder="请选择" />
          </FilterCard>
          <FilterCard title="教研时间" options={TIME_OPTIONS}>
            {(cond) => {
              if (cond === "为空" || cond === "不为空") return null;
              if (cond === "选择范围") return <DateRangePicker />;
              return <DatePicker />;
            }}
          </FilterCard>
        </div>

        {/* 统计 + 折线图 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div style={{ ...card, padding: "24px" }} className="flex flex-col justify-center">
            <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 16 }}>教研活动总数</p>
            <div style={{ fontSize: 64, fontWeight: 300, color: "#111827", lineHeight: 1 }}>39</div>
          </div>
          <div style={{ ...card, padding: "16px" }} className="md:col-span-3">
            <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 }}>教研次数</p>
            <div style={{ height: 160 }}>
              <ResearchChart />
            </div>
            <div className="flex justify-center mt-2 gap-1 items-center">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#93c5fd" }} />
              <span style={{ fontSize: 11, color: "#9ca3af" }}>教研次数</span>
            </div>
          </div>
        </div>

        {/* 列表 + 日历 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* 学科教研情况 */}
          <div style={{ ...card }} className="lg:col-span-2 flex flex-col overflow-hidden">
            <h3 className="font-semibold border-b border-gray-100" style={{ padding: "10px 12px", fontSize: 13, color: "#111827" }}>学科教研情况</h3>
            <div className="flex-1 overflow-y-auto">
              <ul>
                {subjects.map((s, i) => (
                  <li key={s} className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ padding: "8px 12px", fontSize: 13, color: "#374151", background: i === 0 ? "#f9fafb" : undefined }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <PaginationBar current={1} total={1} />
          </div>

          {/* 教师参与次数 */}
          <div style={{ ...card }} className="lg:col-span-2 flex flex-col overflow-hidden">
            <h3 className="font-semibold border-b border-gray-100" style={{ padding: "10px 12px", fontSize: 13, color: "#111827" }}>教师参与次数</h3>
            <div className="flex-1 overflow-y-auto">
              {/* 汇总行 */}
              <div className="flex justify-between items-center border-b border-gray-50 px-3 py-2">
                <span style={{ fontSize: 12, color: "#3b82f6" }}>计数</span>
                <span className="px-2 py-0.5 rounded-full text-white" style={{ fontSize: 11, background: "#fb923c" }}>583</span>
              </div>
              <ul>
                {teacherCounts.map((t, i) => (
                  <li key={t.name} className="flex justify-between items-center border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ padding: "8px 12px", background: i === 0 ? "#f9fafb" : undefined }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{t.name}</span>
                    <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 11, background: "#eff6ff", color: "#3b82f6" }}>{t.count}</span>
                  </li>
                ))}
              </ul>
            </div>
            <PaginationBar current={1} total={2} />
          </div>

          {/* 日历 */}
          <div style={{ ...card }} className="lg:col-span-8 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center border-b border-gray-100" style={{ padding: "10px 12px" }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>教研日历</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2" style={{ fontSize: 13 }}>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronLeft size={14} /></button>
                  <span style={{ fontWeight: 600, color: "#111827" }}>4月20日-4月26日</span>
                  <button className="p-1 hover:bg-gray-100 rounded transition-colors"><ChevronRight size={14} /></button>
                </div>
                <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: "#374151", fontSize: 12 }}>本周</button>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden" style={{ fontSize: 12 }}>
                  <button onClick={() => setCalendarView("week")} className="px-3 py-1 transition-colors"
                    style={{ background: calendarView === "week" ? teal : "white", color: calendarView === "week" ? "white" : "#374151" }}>周</button>
                  <button onClick={() => setCalendarView("month")} className="px-3 py-1 border-l border-gray-200 transition-colors"
                    style={{ background: calendarView === "month" ? teal : "white", color: calendarView === "month" ? "white" : "#374151" }}>月</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-100 text-center" style={{ background: "#f9fafb", fontSize: 11, color: "#9ca3af" }}>
              {calendarDays.map(d => <div key={d} className="py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 flex-1" style={{ minHeight: 200 }}>
              {calendarDays.map((d, i) => (
                <div key={d} className={i < 6 ? "border-r border-gray-50" : ""} />
              ))}
            </div>
          </div>
        </div>

        {/* 记录表 */}
        <div style={{ ...card, overflow: "hidden" }}>
          <h3 style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#111827", borderBottom: "1px solid #f3f4f6" }}>教研活动记录表</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: "#eff6ff", fontSize: 13 }}>
                  {["汇报人","学科部门","教研主题","教研时间","教研地点","教研学科","参与教师","教研记录","照片","附件","备注"].map((h, i) => (
                    <th key={h} className="px-4 py-3 font-medium" style={{ color: i === 6 ? "#3b82f6" : "#374151", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map(row => (
                  <tr key={row.theme} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.reporter}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.dept}</td>
                    <td className="px-4 py-3" style={{ color: "#1e40af", fontSize: 13, whiteSpace: "nowrap" }}>{row.theme}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.time}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.location}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.subject}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#3b82f6", whiteSpace: "nowrap" }}>{row.participants}</td>
                    <td className="px-4 py-3 text-center">
                      {row.hasRecord
                        ? <span style={{ fontSize: 11, color: "#3b82f6", background: "#eff6ff", borderRadius: 4, padding: "2px 8px" }}>查看</span>
                        : <span style={{ fontSize: 11, color: "#9ca3af" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.hasPhotos
                        ? <span style={{ fontSize: 11, color: "#3b82f6", background: "#eff6ff", borderRadius: 4, padding: "2px 8px" }}>查看</span>
                        : <span style={{ fontSize: 11, color: "#9ca3af" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.hasAttach
                        ? <span style={{ fontSize: 11, color: "#3b82f6", background: "#eff6ff", borderRadius: 4, padding: "2px 8px" }}>下载</span>
                        : <span style={{ fontSize: 11, color: "#9ca3af" }}>—</span>}
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: row.remark ? "#374151" : "#9ca3af", whiteSpace: "nowrap" }}>
                      {row.remark || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-gray-100" style={{ fontSize: 12, color: "#374151" }}>
            <div className="flex items-center gap-3">
              <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">📋</button>
              <div className="flex items-center gap-1">
                <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none" style={{ color: "#374151" }}>
                  <option>20 条/页</option>
                </select>
                <span style={{ color: "#6b7280" }}>共 39 条</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50">‹</button>
              <input type="text" defaultValue="1" className="w-8 border border-gray-200 rounded-lg text-center outline-none text-xs" style={{ color: "#374151" }} />
              <span style={{ color: "#6b7280" }}>/ 2</span>
              <button className="px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50" style={{ color: "#374151" }}>›</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
