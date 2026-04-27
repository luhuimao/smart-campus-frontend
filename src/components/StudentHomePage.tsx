"use client";

import {
  Users, Building2, FileText, TrendingUp, Plus,
  RefreshCw, ArrowUpDown, Maximize2, Upload, Printer, PieChart,
} from "lucide-react";
import React, { useState } from "react";
import { PageHeader } from "./PageHeader";
import type { PageKey } from "@/app/page";

// ── mock data ───────────────────────────────────────────────────
const FILTER_DEFS = [
  { label: "宿舍区",  options: ["全部", "佳慧楼", "自强楼", "自立楼"] },
  { label: "检查项",  options: ["全部", "卫生检查", "纪律检查", "安全检查"] },
  { label: "宿舍号",  options: ["全部", "101", "102", "201", "202", "301"] },
  { label: "扣分项",  options: ["全部", "地面不洁", "被褥不整", "私接电源", "违规物品"] },
  { label: "检查人",  options: ["全部", "李老师", "王老师", "张老师"] },
  { label: "扣分分值", options: ["全部", "1分", "2分", "3分", "5分"] },
];

const TIME_OPTIONS = ["本周", "本月", "本学期", "上学期", "自定义"];

const BUILDING_STATS = [
  { label: "佳慧楼总扣分", value: 23, color: "#8b5cf6" },
  { label: "自强楼总扣分", value: 17, color: "#6366f1" },
  { label: "自立楼总扣分", value: 31, color: "#7c3aed" },
];

const mockDeductions = [
  { id: 1,  dorm: "A101", building: "佳慧楼", scene: "宿舍", stuId: "20240101", stuName: "张伟",   checkItem: "卫生检查", reason: "地面不洁",   score: 2, desc: "地面有明显污渍，未及时清扫",         photo: "有", phone: "13800001001", time: "2026-04-25 09:10" },
  { id: 2,  dorm: "B202", building: "自强楼", scene: "宿舍", stuId: "20240215", stuName: "李晓明",  checkItem: "纪律检查", reason: "违规物品",   score: 5, desc: "宿舍内发现违禁电器，已没收",         photo: "有", phone: "13800001002", time: "2026-04-25 10:30" },
  { id: 3,  dorm: "C301", building: "自立楼", scene: "宿舍", stuId: "20240322", stuName: "王芳",    checkItem: "卫生检查", reason: "被褥不整",   score: 1, desc: "被褥未叠放整齐",                   photo: "无", phone: "13800001003", time: "2026-04-24 14:00" },
  { id: 4,  dorm: "A102", building: "佳慧楼", scene: "宿舍", stuId: "20240408", stuName: "陈志远",  checkItem: "安全检查", reason: "私接电源",   score: 3, desc: "私自拉接插线板，存在安全隐患",       photo: "有", phone: "13800001004", time: "2026-04-24 15:20" },
  { id: 5,  dorm: "B201", building: "自强楼", scene: "宿舍", stuId: "20240533", stuName: "刘静",    checkItem: "卫生检查", reason: "地面不洁",   score: 2, desc: "垃圾未及时清理，气味较重",           photo: "有", phone: "13800001005", time: "2026-04-23 09:00" },
  { id: 6,  dorm: "C303", building: "自立楼", scene: "宿舍", stuId: "20240619", stuName: "赵磊",    checkItem: "纪律检查", reason: "违规物品",   score: 5, desc: "发现烟草制品，已上报处理",           photo: "有", phone: "13800001006", time: "2026-04-23 11:15" },
  { id: 7,  dorm: "A103", building: "佳慧楼", scene: "宿舍", stuId: "20240724", stuName: "孙丽",    checkItem: "卫生检查", reason: "被褥不整",   score: 1, desc: "枕头凌乱，床单有褶皱",              photo: "无", phone: "13800001007", time: "2026-04-22 08:40" },
  { id: 8,  dorm: "B203", building: "自强楼", scene: "宿舍", stuId: "20240831", stuName: "周建国",  checkItem: "安全检查", reason: "私接电源",   score: 3, desc: "使用大功率充电宝，违反用电规定",     photo: "有", phone: "13800001008", time: "2026-04-22 16:00" },
  { id: 9,  dorm: "C302", building: "自立楼", scene: "走廊", stuId: "20240912", stuName: "吴雪",    checkItem: "纪律检查", reason: "大声喧哗",   score: 2, desc: "夜间熄灯后走廊嬉闹，影响他人休息",   photo: "无", phone: "13800001009", time: "2026-04-21 22:15" },
  { id: 10, dorm: "A104", building: "佳慧楼", scene: "宿舍", stuId: "20241005", stuName: "郑浩然",  checkItem: "卫生检查", reason: "窗台积灰",   score: 1, desc: "窗台及桌面积灰严重，未定期擦拭",     photo: "无", phone: "13800001010", time: "2026-04-21 10:00" },
  { id: 11, dorm: "B204", building: "自强楼", scene: "宿舍", stuId: "20241118", stuName: "何婷",    checkItem: "安全检查", reason: "门窗未锁",   score: 2, desc: "外出时宿舍门未上锁，存在财物安全隐患", photo: "有", phone: "13800001011", time: "2026-04-20 17:30" },
  { id: 12, dorm: "C304", building: "自立楼", scene: "宿舍", stuId: "20241223", stuName: "林俊杰",  checkItem: "卫生检查", reason: "垃圾溢桶",   score: 2, desc: "垃圾桶已满未及时清倒",              photo: "有", phone: "13800001012", time: "2026-04-20 09:45" },
];

const TABLE_COLS = ["序号", "宿舍号", "宿舍楼栋", "场景", "学生编号", "学生姓名", "检查项", "扣分项", "扣分", "违纪情况说明", "违纪图片", "提交人手机号", "提交时间"];

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

// ── inline FilterCard ───────────────────────────────────────────
function FilterCard({ label, options }: { label: string; options: string[] }) {
  const [op, setOp] = useState("等于");
  const hideValue = op === "为空" || op === "不为空";
  return (
    <div className="glass px-4 pt-3 pb-4 rounded-[20px] flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 min-w-0">
        <p className="text-sm font-semibold text-gray-800 flex-1 min-w-0 truncate">{label}</p>
        <select value={op} onChange={e => setOp(e.target.value)} style={opStyle}
          className="shrink-0 text-xs font-semibold text-gray-500 bg-black/[0.04] hover:bg-black/[0.07] transition-colors">
          {["等于","不等于","包含","不包含","为空","不为空"].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: hideValue ? 0 : 60, opacity: hideValue ? 0 : 1 }}>
        <select className="w-full appearance-none bg-white/40 border-none rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 outline-none cursor-pointer"
          style={valueSelectStyle}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
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

// ── main component ──────────────────────────────────────────────
export function StudentHomePage({ onMenuOpen, onNavigate }: {
  onMenuOpen?: () => void;
  onNavigate?: (page: PageKey) => void;
}) {
  const [timePeriod, setTimePeriod] = useState("本周");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hvTable, setHvTable] = useState(false);
  const totalPages = Math.ceil(mockDeductions.length / pageSize);

  const quickEntries: { icon: React.ElementType; label: string; bg: string; color: string; hover: string; target: PageKey | null }[] = [
    { icon: Users,         label: "学生管理看板", bg: "bg-violet-50",  color: "text-violet-600", hover: "group-hover:bg-violet-600",  target: "student-dashboard" },
    { icon: Building2,     label: "宿舍考勤看板", bg: "bg-indigo-50",  color: "text-indigo-600", hover: "group-hover:bg-indigo-600",  target: null },
    { icon: FileText,      label: "学生档案",     bg: "bg-purple-50",  color: "text-purple-600", hover: "group-hover:bg-purple-600",  target: null },
    { icon: TrendingUp,    label: "学情分析",     bg: "bg-fuchsia-50", color: "text-fuchsia-600", hover: "group-hover:bg-fuchsia-600", target: "learning-analysis-table" },
    { icon: Plus,          label: "查看更多",      bg: "bg-gray-50",    color: "text-gray-400",    hover: "group-hover:bg-gray-800",    target: null },
  ];

  const sliced = mockDeductions.slice((page - 1) * pageSize, page * pageSize);

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
                学生数据看板
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

          {/* ── Filters + Stats ── */}
          <section className="flex flex-col lg:flex-row gap-5">

            {/* Left: 2×3 filter grid */}
            <div className="grid grid-cols-2 gap-4 w-full lg:w-1/3">
              {FILTER_DEFS.map(({ label, options }) => (
                <FilterCard key={label} label={label} options={options} />
              ))}
            </div>

            {/* Right: time filter + 4 stat cards */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">

              {/* 扣分时间 */}
              <div className="glass rounded-[20px] px-4 pt-3 pb-4 flex flex-col gap-2.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 flex-1">扣分时间</p>
                  <span className="text-xs font-semibold text-violet-500 cursor-pointer select-none">动态筛选 ▾</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {TIME_OPTIONS.map(opt => (
                    <button key={opt} onClick={() => setTimePeriod(opt)}
                      className="px-3 py-1.5 rounded-xl text-sm font-semibold transition-all duration-150"
                      style={{ background: timePeriod === opt ? "rgba(139,92,246,0.12)" : "rgba(0,0,0,0.04)", color: timePeriod === opt ? "#7c3aed" : "#6b7280", border: timePeriod === opt ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1">

                {/* 扣分类型分布 */}
                <TiltCard title="扣分类型分布" actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: Maximize2, tip: "放大" }]}>
                  <div className="flex-1 flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.06)" }}>
                      <PieChart className="w-6 h-6 text-violet-300" />
                    </div>
                    <p className="text-sm text-gray-400">暂无数据</p>
                  </div>
                </TiltCard>

                {/* Building stats */}
                {BUILDING_STATS.map(({ label, value, color }) => (
                  <TiltCard key={label} title={label} actions={[{ Icon: Upload, tip: "导出" }, { Icon: Maximize2, tip: "放大" }]}>
                    <div className="flex-1 flex items-center justify-center">
                      <span className="font-black leading-none" style={{ fontSize: 72, color }}>{value}</span>
                    </div>
                  </TiltCard>
                ))}

              </div>
            </div>
          </section>

          {/* ── 扣分明细 table ── */}
          <section className="glass rounded-[40px] overflow-hidden shadow-sm"
            onMouseEnter={() => setHvTable(true)} onMouseLeave={() => setHvTable(false)}>
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100/60">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-violet-500 rounded-full" />
                <h3 className="text-xl font-bold text-gray-700">扣分明细</h3>
              </div>
              {hvTable && (
                <div className="flex items-center gap-0.5">
                  {([
                    { Icon: Upload,      tip: "导出" },
                    { Icon: Printer,     tip: "打印表格" },
                    { Icon: RefreshCw,   tip: "刷新" },
                    { Icon: ArrowUpDown, tip: "排序" },
                    { Icon: Maximize2,   tip: "放大" },
                  ] as { Icon: React.ElementType; tip: string }[]).map(({ Icon, tip }) => (
                    <div key={tip} className="relative group/tip">
                      <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors">
                        <Icon size={14} />
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

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead style={{ background: "#eff6ff" }}>
                  <tr>
                    {TABLE_COLS.map(col => (
                      <th key={col} className="px-4 py-3 font-medium whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sliced.map((row, i) => (
                    <tr key={row.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{(page - 1) * pageSize + i + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151", fontWeight: 600 }}>{row.dorm}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.building}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.scene}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.stuId}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.stuName}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.checkItem}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.reason}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                          style={{ background: row.score >= 5 ? "rgba(239,68,68,0.1)" : row.score >= 3 ? "rgba(245,158,11,0.1)" : "rgba(107,114,128,0.08)", color: row.score >= 5 ? "#dc2626" : row.score >= 3 ? "#d97706" : "#6b7280" }}>
                          -{row.score}分
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ fontSize: 15, color: "#374151", maxWidth: 160 }} title={row.desc}><span className="block truncate">{row.desc}</span></td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
                          style={{ background: row.photo === "有" ? "rgba(16,185,129,0.08)" : "rgba(0,0,0,0.04)", color: row.photo === "有" ? "#059669" : "#9ca3af" }}>
                          {row.photo}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* pagination */}
            <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-gray-100" style={{ fontSize: 14, color: "#374151" }}>
              <div className="flex items-center gap-3">
                <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">📋</button>
                <div className="flex items-center gap-1">
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none" style={{ color: "#374151" }}>
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} 条/页</option>)}
                  </select>
                  <span style={{ color: "#6b7280" }}>共 {mockDeductions.length} 条</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50" onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
                <input type="text" value={page} readOnly className="w-8 border border-gray-200 rounded-lg text-center outline-none text-xs" style={{ color: "#374151" }} />
                <span style={{ color: "#6b7280" }}>/ {totalPages}</span>
                <button className="px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50" style={{ color: "#374151" }} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
