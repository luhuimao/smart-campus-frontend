"use client";

import { ChevronDown, ChevronRight, ChevronLeft, ChevronsLeft, Info, Upload, RefreshCw, ArrowUpDown, Maximize2, Plus } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const TIME_OPTIONS = ["等于","不等于","大于等于","小于等于","选择范围","动态筛选","为空","不为空"];
import { PageHeader } from "./PageHeader";
import { DatePicker, DateRangePicker } from "./ui/DatePicker";

const teal = "#00b095";

const WEEK_DAYS = ["20 周一", "21 周二", "22 周三", "23 周四", "24 周五", "25 周六", "26 周日"];

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

type ActionItem = { Icon: React.ElementType; tip: string };

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
  const [calView, setCalView] = useState<"week" | "month">("week");
  const [hvTotal,    setHvTotal]    = useState(false);
  const [hvChart,    setHvChart]    = useState(false);
  const [hvGroup,    setHvGroup]    = useState(false);
  const [hvTeacher,  setHvTeacher]  = useState(false);
  const [hvCalendar, setHvCalendar] = useState(false);
  const [hvTable,    setHvTable]    = useState(false);

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

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterCard title="教研组" mode="等于任意一个" />
          <FilterCard title="活动负责教师" mode="等于任意一个" />
          <TimeFilterCard />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-6 gap-4">
          {/* Total count */}
          <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: 260 }}
            onMouseEnter={() => setHvTotal(true)} onMouseLeave={() => setHvTotal(false)}>
            <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3 shrink-0">
              <h3 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">科技节活动总次数</h3>
              <ActionBar show={hvTotal} actions={[{ Icon: Upload, tip: "导出" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-4 gap-1">
              <span className="text-8xl font-light" style={{ color: "#1d1d1f" }}>7</span>
              <span className="text-xs font-semibold" style={{ color: "#10b981" }}>↑ 较上学期 +3</span>
            </div>
          </div>

          {/* Trend chart */}
          <div className="col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden" style={{ minHeight: 260 }}
            onMouseEnter={() => setHvChart(true)} onMouseLeave={() => setHvChart(false)}>
            <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3 shrink-0">
              <h3 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">活动次数</h3>
              <ActionBar show={hvChart} actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 flex flex-col px-4 pb-3 pt-2">
              <div className="relative flex-1">
                <svg viewBox="0 0 600 180" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00b095" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#00b095" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0,1,2,3].map(i => (
                    <line key={i} x1="36" y1={16 + i * 44} x2="580" y2={16 + i * 44}
                      stroke="#f0f0f0" strokeWidth="1" strokeDasharray="4,4" />
                  ))}
                  {["4","3","2","1","0"].map((v, i) => (
                    <text key={v} x="28" y={20 + i * 44} textAnchor="end" fontSize="10" fill="#9ca3af">{v}</text>
                  ))}
                  {(() => {
                    const pts = [{ x: 80, v: 1 }, { x: 190, v: 2 }, { x: 300, v: 1 }, { x: 410, v: 3 }, { x: 520, v: 2 }];
                    const toY = (v: number) => 156 - (v / 4) * 140;
                    const coords = pts.map(p => ({ x: p.x, y: toY(p.v), v: p.v }));
                    const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
                    const areaD = `${pathD} L${coords[coords.length-1].x},156 L${coords[0].x},156 Z`;
                    return (
                      <>
                        <path d={areaD} fill="url(#sfGrad)" />
                        <path d={pathD} fill="none" stroke="#00b095" strokeWidth="2" strokeLinejoin="round" />
                        {coords.map((c, idx) => (
                          <g key={idx}>
                            <circle cx={c.x} cy={c.y} r="4" fill="white" stroke="#00b095" strokeWidth="2" />
                            <text x={c.x} y={c.y - 9} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">{c.v}</text>
                          </g>
                        ))}
                      </>
                    );
                  })()}
                  {[
                    { x: 80, label: "2025年11月" }, { x: 190, label: "2025年12月" },
                    { x: 300, label: "2026年01月" }, { x: 410, label: "2026年03月" },
                    { x: 520, label: "2026年04月" },
                  ].map(m => (
                    <text key={m.label} x={m.x} y={172} textAnchor="middle" fontSize="10" fill="#6b7280">{m.label}</text>
                  ))}
                </svg>
              </div>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className="w-3 h-3 rounded-sm" style={{ background: "#00b095" }} />
                <span className="text-xs text-gray-400 font-medium">活动次数</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="grid grid-cols-12 gap-4">
          {/* 教研组活动情况统计 */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 420 }}
            onMouseEnter={() => setHvGroup(true)} onMouseLeave={() => setHvGroup(false)}>
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">教研组活动情况统计</h3>
              <ActionBar show={hvGroup} actions={[{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="flex-1 flex flex-col justify-center gap-2.5 px-4 py-3">
              {([
                { label: "理化教研组", value: 3, color: "#00b095" },
                { label: "数学教研组", value: 2, color: "#60a5fa" },
                { label: "英语教研组", value: 1, color: "#818cf8" },
                { label: "史地教研组", value: 1, color: "#fb923c" },
                { label: "政治教研组", value: 1, color: "#f472b6" },
              ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="shrink-0 text-right" style={{ fontSize: 11, color: "#6b7280", width: 60 }}>{label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: 8 }}>
                    <div className="h-full rounded-full" style={{ width: `${(value / 3) * 100}%`, background: color }} />
                  </div>
                  <span className="shrink-0 font-bold" style={{ fontSize: 11, color: "#374151", width: 12, textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
            <div className="px-3 py-2.5 border-t border-gray-50 flex items-center justify-center gap-1">
              <button className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ChevronsLeft className="w-3 h-3" />
              </button>
              <button className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="px-2 py-0.5 text-xs border rounded" style={{ borderColor: teal, color: teal, backgroundColor: "#f0fdf9" }}>1</span>
              <span className="text-xs text-gray-400">/ 1</span>
              <button className="w-6 h-6 border border-gray-200 rounded flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 教师参与次数 */}
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden" style={{ height: 420 }}
            onMouseEnter={() => setHvTeacher(true)} onMouseLeave={() => setHvTeacher(false)}>
            <div className="flex items-center justify-between border-b border-gray-50 px-4 py-3 shrink-0">
              <h3 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">教师参与次数</h3>
              <ActionBar show={hvTeacher} actions={[{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>
            <div className="p-4 flex flex-col flex-1 overflow-hidden">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-xs text-blue-500">计数</span>
                <div className="w-6 h-6 rounded-full bg-orange-400 text-white text-[10px] flex items-center justify-center font-bold">0</div>
              </div>
              <div className="flex-1 flex flex-col gap-2 pt-2 overflow-hidden">
                {([
                  { name: "甘育攀", count: 1 }, { name: "黄景民", count: 1 },
                  { name: "张丽燕", count: 1 }, { name: "李枝芳", count: 1 },
                  { name: "莫燕",   count: 1 }, { name: "郑茹",   count: 1 },
                  { name: "廖永会", count: 1 },
                ] as { name: string; count: number }[]).map(({ name, count }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-orange-400 text-white flex items-center justify-center font-bold shrink-0" style={{ fontSize: 9 }}>{name[0]}</div>
                    <span className="shrink-0" style={{ fontSize: 11, color: "#374151", width: 36 }}>{name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: 7 }}>
                      <div className="h-full rounded-full" style={{ width: "100%", background: "#fb923c" }} />
                    </div>
                    <span className="shrink-0 font-bold" style={{ fontSize: 11, color: "#374151" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 科技节活动日历 */}
          <div className="col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 420 }}
            onMouseEnter={() => setHvCalendar(true)} onMouseLeave={() => setHvCalendar(false)}>
            <div className="px-4 py-3 flex justify-between items-center border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">科技节活动日历</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <span className="text-xs font-semibold text-gray-700 px-1">4月20日–4月26日</span>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
                <button className="text-xs border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors text-gray-600">本周</button>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                  <button
                    className="px-2.5 py-1 transition-colors"
                    style={{ background: calView === "week" ? teal : "white", color: calView === "week" ? "white" : "#6b7280" }}
                    onClick={() => setCalView("week")}
                  >周</button>
                  <button
                    className="px-2.5 py-1 transition-colors"
                    style={{ background: calView === "month" ? teal : "white", color: calView === "month" ? "white" : "#6b7280" }}
                    onClick={() => setCalView("month")}
                  >月</button>
                </div>
                <ActionBar show={hvCalendar} actions={[{ Icon: Plus, tip: "添加" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: Maximize2, tip: "放大" }]} />
              </div>
            </div>
            {/* Calendar grid */}
            <div className="flex-1 grid grid-cols-7">
              {WEEK_DAYS.map((day) => (
                <div key={day} className="flex flex-col border-r last:border-r-0 border-gray-50">
                  <div className="py-2 text-[10px] text-gray-400 text-center border-b border-gray-50">{day}</div>
                  <div className="flex-1 bg-slate-50 opacity-40" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 科技节活动记录表 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm"
          onMouseEnter={() => setHvTable(true)} onMouseLeave={() => setHvTable(false)}>
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">科技节活动记录表</h3>
            <ActionBar show={hvTable} actions={[{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  {TABLE_COLS.map((col) => (
                    <th key={col} className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap border-b border-gray-100">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mockActivities.map((row) => (
                  <tr key={row.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.teacher}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.group}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{row.groupLeader}</td>
                    <td className="px-4 py-3 text-blue-800 font-medium whitespace-nowrap">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.time}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{row.location}</td>
                    <td className="px-4 py-3 text-gray-500 max-w-[240px] truncate">{row.desc}</td>
                    <td className="px-4 py-3 text-center">
                      {row.hasPhoto
                        ? <span className="text-blue-500 bg-blue-50 rounded px-2 py-0.5 text-xs">查看</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.hasVideo
                        ? <span className="text-blue-500 bg-blue-50 rounded px-2 py-0.5 text-xs">查看</span>
                        : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={mockActivities.length} />
        </div>
      </div>
    </div>
  );
}
