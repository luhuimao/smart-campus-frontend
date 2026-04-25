"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker, DateRangePicker } from "./ui/DatePicker";

const teal = "#13c2c2";

const prepGroups = ["日语","高一化学","高一语文","高三英语","高三政治","高二语文","心理","高二地理","高三生物"];
const teachers  = ["李金月","廖永会","张敏","何春柳","杨帆","李枝芳","莫燕","刘瑞珊","郑茹"];

const tableRows = [
  { name: "第三单元 就业与创业",   time: "2026-04-01 08:14", location: "明达楼二楼辅导室", prepGroup: "高三政治备课组", researchGroup: "政治教研组", groupLeader: "王建国", prepLeader: "廖永会", participants: "廖永会、陈晓明、赵丽", host: "廖永会",  hasRecord: true,  hasPhotos: true,  hasAttach: false, remark: "" },
  { name: "第二单元 家庭与婚姻",   time: "2026-03-25 08:06", location: "明达楼二楼辅导室", prepGroup: "高三政治备课组", researchGroup: "政治教研组", groupLeader: "王建国", prepLeader: "廖永会", participants: "廖永会、陈晓明",        host: "陈晓明", hasRecord: true,  hasPhotos: false, hasAttach: true,  remark: "需补充资料" },
  { name: "诗歌鉴赏专题备课",     time: "2026-03-20 09:00", location: "行政楼三楼会议室", prepGroup: "高一语文备课组", researchGroup: "语文教研组", groupLeader: "林海燕", prepLeader: "张敏",  participants: "张敏、吴晓峰、刘芳", host: "张敏",   hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "" },
  { name: "化学反应速率教研",     time: "2026-03-18 14:30", location: "实验楼一楼研讨室", prepGroup: "高一化学备课组", researchGroup: "理化教研组", groupLeader: "孙志远", prepLeader: "李金月", participants: "李金月、周磊、黄倩",   host: "李金月", hasRecord: false, hasPhotos: true,  hasAttach: false, remark: "实验记录待整理" },
  { name: "英语阅读理解策略",     time: "2026-03-15 08:00", location: "图书馆报告厅",    prepGroup: "高三英语备课组", researchGroup: "英语教研组", groupLeader: "赵英",  prepLeader: "何春柳", participants: "何春柳、钱伟、孙梅",   host: "何春柳", hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "" },
  { name: "日语口语训练方案",     time: "2026-03-12 10:00", location: "语音室",          prepGroup: "日语备课组",    researchGroup: "外语教研组", groupLeader: "赵英",  prepLeader: "杨帆",  participants: "杨帆、田中花子",        host: "杨帆",   hasRecord: true,  hasPhotos: false, hasAttach: false, remark: "" },
  { name: "函数与导数综合备课",   time: "2026-03-10 08:30", location: "明达楼二楼辅导室", prepGroup: "高二数学备课组", researchGroup: "数学教研组", groupLeader: "吴大伟", prepLeader: "莫燕",  participants: "莫燕、蒋涛、许静",     host: "莫燕",   hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "补充习题册" },
  { name: "心理健康月活动方案",   time: "2026-03-06 15:00", location: "心理咨询室",      prepGroup: "心理备课组",    researchGroup: "德育教研组", groupLeader: "陈芸",  prepLeader: "刘瑞珊", participants: "刘瑞珊、马晓",          host: "刘瑞珊", hasRecord: false, hasPhotos: false, hasAttach: true,  remark: "活动方案已上报" },
  { name: "地理区域分析教研",     time: "2026-03-04 09:30", location: "行政楼三楼会议室", prepGroup: "高二地理备课组", researchGroup: "史地教研组", groupLeader: "邓明",  prepLeader: "郑茹",  participants: "郑茹、韩冰、沈洁",     host: "郑茹",   hasRecord: true,  hasPhotos: true,  hasAttach: false, remark: "" },
  { name: "生物遗传与进化专题",   time: "2026-02-28 08:00", location: "实验楼一楼研讨室", prepGroup: "高三生物备课组", researchGroup: "理化教研组", groupLeader: "孙志远", prepLeader: "李枝芳", participants: "李枝芳、曹磊、温婷",   host: "李枝芳", hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "" },
  { name: "政治热点时事分析",     time: "2026-02-25 14:00", location: "明达楼二楼辅导室", prepGroup: "高三政治备课组", researchGroup: "政治教研组", groupLeader: "王建国", prepLeader: "廖永会", participants: "廖永会、陈晓明",        host: "廖永会", hasRecord: false, hasPhotos: false, hasAttach: false, remark: "时事素材整理中" },
  { name: "作文教学研讨",         time: "2026-02-20 09:00", location: "图书馆报告厅",    prepGroup: "高二语文备课组", researchGroup: "语文教研组", groupLeader: "林海燕", prepLeader: "张敏",  participants: "张敏、吴晓峰、刘芳、陈倩", host: "吴晓峰", hasRecord: true,  hasPhotos: true,  hasAttach: true,  remark: "" },
];

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
      {/* Y grid lines */}
      {[0,10,20,30,40,50].map(v => (
        <g key={v}>
          <line x1={PAD_L} x2={W - PAD_R} y1={pointY(v)} y2={pointY(v)} stroke="#f3f4f6" strokeWidth="1" />
          <text x={PAD_L - 4} y={pointY(v) + 3} textAnchor="end" fill="#999" fontSize="8">{v}</text>
        </g>
      ))}
      {/* Area */}
      <path d={areaPath} fill="url(#areaGrad)" />
      {/* Line */}
      <polyline points={pts} fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Points + labels */}
      {CHART_DATA.map((v, i) => (
        <g key={i}>
          <circle cx={pointX(i)} cy={pointY(v)} r="4" fill="white" stroke="#60a5fa" strokeWidth="2" />
          <text x={pointX(i)} y={pointY(v) - 7} textAnchor="middle" fill="#666" fontSize="9">{v}</text>
        </g>
      ))}
      {/* X labels */}
      {CHART_LABELS.map((l, i) => (
        <text key={i} x={pointX(i)} y={H - PAD_B + 14} textAnchor="middle" fill="#666" fontSize="8">{l}</text>
      ))}
    </svg>
  );
}

const SUBJECT_OPTIONS     = ["等于","不等于","等于任意一个","不等于任意一个","包含","不包含","为空","不为空"];
const PARTICIPANT_OPTIONS = ["包含任意一个","同时包含","等于","为空","不为空"];
const TIME_OPTIONS        = ["等于","不等于","大于等于","小于等于","选择范围","动态筛选","为空","不为空"];

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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="glass" style={{ padding: "12px 16px", position: "relative", zIndex: open ? 100 : 1 }}>
      <div className="flex justify-between items-center mb-2">
        <span style={{ color: "#374151", fontSize: 13 }}>{title}</span>
        {options ? (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen(v => !v)}
              style={{ color: teal, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 2 }}
            >
              {condition} <ChevronRight size={11} style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform 0.15s" }} />
            </button>
            {open && (
              <div
                className="absolute right-0 rounded-xl overflow-hidden"
                style={{ top: "calc(100% + 4px)", minWidth: 140, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", zIndex: 200 }}
              >
                {options.map(opt => (
                  <button
                    key={opt}
                    onClick={() => { setCondition(opt); setOpen(false); }}
                    className="w-full text-left px-3 py-2 transition-colors"
                    style={{ fontSize: 12, color: opt === condition ? teal : "#374151", background: opt === condition ? "rgba(19,194,194,0.06)" : "transparent" }}
                    onMouseEnter={e => { if (opt !== condition) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; }}
                    onMouseLeave={e => { if (opt !== condition) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >{opt}</button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: teal, fontSize: 12 }}>{badge} ▾</span>
        )}
      </div>
      {typeof children === "function" ? children(condition) : children}
    </div>
  );
}

function CustomSelect({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative">
      <select
        className="w-full outline-none appearance-none pr-8 py-1.5 pl-3 rounded-lg"
        style={{ border: "1px solid #e5e7eb", color: "#9ca3af", background: "white", fontSize: 13 }}
        defaultValue=""
      >
        <option value="" disabled>{placeholder}</option>
      </select>
      <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}


function PaginationBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex justify-center items-center gap-1 p-2 border-t border-gray-100" style={{ fontSize: 12 }}>
      <button className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">«</button>
      <button className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">‹</button>
      <span className="px-3 text-gray-500">{current} / {total}</span>
      <button className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">›</button>
      <button className="px-2 py-1 rounded border border-gray-200 text-gray-400 hover:bg-gray-50">»</button>
    </div>
  );
}

export function LessonPrepAnalysisPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [calendarView, setCalendarView] = useState<"week" | "month">("week");

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "#f5f5f7" }}
    >
      <PageHeader
        breadcrumbs={[{ label: "备课活动" }, { label: "备课活动数据分析", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* Filters */}
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

        {/* Summary + Chart */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass flex flex-col justify-center" style={{ padding: "24px" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 16 }}>备课活动总数</p>
            <div style={{ fontSize: 64, fontWeight: 300, color: "#111827", lineHeight: 1 }}>82</div>
          </div>
          <div className="glass md:col-span-3" style={{ padding: "16px" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 8 }}>备课次数</p>
            <div style={{ height: 160 }}>
              <PrepChart />
            </div>
            <div className="flex justify-center mt-2 gap-1 items-center">
              <div className="w-3 h-3 rounded-sm" style={{ background: "#93c5fd" }} />
              <span style={{ fontSize: 11, color: "#9ca3af" }}>活动主题</span>
            </div>
          </div>
        </div>

        {/* Lists + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* 备课组 */}
          <div className="glass lg:col-span-2 flex flex-col overflow-hidden shadow-sm">
            <h3 className="font-semibold border-b border-gray-100" style={{ padding: "10px 12px", fontSize: 13, color: "#111827" }}>备课组备课情况</h3>
            <div className="flex-1 overflow-y-auto">
              <ul>
                {prepGroups.map((g, i) => (
                  <li key={g} className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ padding: "8px 12px", fontSize: 13, color: "#374151", background: i === 0 ? "#f9fafb" : undefined }}>
                    {g}
                  </li>
                ))}
                <li style={{ padding: "8px 12px", fontSize: 13, color: "#9ca3af" }}>...</li>
              </ul>
            </div>
            <PaginationBar current={1} total={1} />
          </div>

          {/* 教师 */}
          <div className="glass lg:col-span-2 flex flex-col overflow-hidden shadow-sm">
            <h3 className="font-semibold border-b border-gray-100" style={{ padding: "10px 12px", fontSize: 13, color: "#111827" }}>教师参与次数</h3>
            <div className="flex-1 overflow-y-auto">
              <ul>
                {teachers.map((t, i) => (
                  <li key={t} className="border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors"
                    style={{ padding: "8px 12px", fontSize: 13, color: "#374151", background: i === 0 ? "#f9fafb" : undefined }}>
                    {t}
                  </li>
                ))}
                <li style={{ padding: "8px 12px", fontSize: 13, color: "#9ca3af" }}>...</li>
              </ul>
            </div>
            <PaginationBar current={1} total={3} />
          </div>

          {/* Calendar */}
          <div className="glass lg:col-span-8 flex flex-col overflow-hidden shadow-sm">
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
                  <button
                    onClick={() => setCalendarView("week")}
                    className="px-3 py-1 transition-colors"
                    style={{ background: calendarView === "week" ? teal : "white", color: calendarView === "week" ? "white" : "#374151" }}
                  >周</button>
                  <button
                    onClick={() => setCalendarView("month")}
                    className="px-3 py-1 border-l border-gray-200 transition-colors"
                    style={{ background: calendarView === "month" ? teal : "white", color: calendarView === "month" ? "white" : "#374151" }}
                  >月</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-gray-100 text-center" style={{ background: "#f9fafb", fontSize: 11, color: "#9ca3af" }}>
              {calendarDays.map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 flex-1" style={{ minHeight: 200 }}>
              {calendarDays.map((d, i) => (
                <div key={d} className={i < 6 ? "border-r border-gray-50" : ""} />
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass rounded-[40px] overflow-hidden">
          <h3 style={{ padding: "10px 16px", fontSize: 13, fontWeight: 600, color: "#111827", borderBottom: "1px solid #f3f4f6" }}>教研活动记录表</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ background: "#eff6ff", fontSize: 13 }}>
                  {["活动主题","活动时间","活动地点","备课组","教研组","教研组长","备课组长","参与教师","主持人","活动记录（主备人模板照片）","其他照片","附件","备注"].map((h, i) => (
                    <th key={h} className="px-4 py-3 font-medium" style={{ color: i === 6 ? "#3b82f6" : "#374151", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.name} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3" style={{ color: "#1e40af", fontSize: 13, whiteSpace: "nowrap" }}>{row.name}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.time}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.location}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.prepGroup}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.researchGroup}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.groupLeader}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#3b82f6", whiteSpace: "nowrap" }}>{row.prepLeader}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.participants}</td>
                    <td className="px-4 py-3" style={{ fontSize: 13, color: "#374151", whiteSpace: "nowrap" }}>{row.host}</td>
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
                <span style={{ color: "#6b7280" }}>共 82 条</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50">‹</button>
              <input type="text" defaultValue="1" className="w-8 border border-gray-200 rounded-lg text-center outline-none text-xs" style={{ color: "#374151" }} />
              <span style={{ color: "#6b7280" }}>/ 5</span>
              <button className="px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50" style={{ color: "#374151" }}>›</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
