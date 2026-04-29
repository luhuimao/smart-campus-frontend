"use client";

import {
  LayoutGrid, Search, Bell, FilePenLine, PieChart, Users2,
  TrendingUp, Plus, Share2, Download, BarChart3, Menu,
  RefreshCw, ArrowUpDown, Maximize2, Upload,
} from "lucide-react";
import React, { useState } from "react";

const glass = {
  background: "rgba(255,255,255,0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.3)",
} as const;

const quickEntries: { icon: React.ElementType; label: string; bg: string; color: string; hover: string; target: PageKey | null }[] = [
  { icon: FilePenLine, label: "添加教研记录", bg: "bg-blue-50", color: "text-blue-600", hover: "group-hover:bg-blue-600", target: "research-activity-record" },
  { icon: PieChart, label: "教研数据分析", bg: "bg-purple-50", color: "text-purple-600", hover: "group-hover:bg-purple-600", target: "research-activity-analysis" },
  { icon: Users2, label: "添加备课活动", bg: "bg-indigo-50", color: "text-indigo-600", hover: "group-hover:bg-indigo-600", target: "lesson-prep-record" },
  { icon: TrendingUp, label: "备课数据分析", bg: "bg-pink-50", color: "text-pink-600", hover: "group-hover:bg-pink-600", target: "lesson-prep-analysis" },
  { icon: Plus, label: "查看更多", bg: "bg-gray-50", color: "text-gray-400", hover: "group-hover:bg-gray-800", target: null },
];

const filters = [
  { label: "学期", options: ["2023-2024 第一学期", "2023-2024 第二学期"] },
  { label: "时间范围", options: ["本月累计", "本学期", "自定义"] },
  { label: "教研组", options: ["语文教研组", "数学教研组"] },
  { label: "备课组", options: ["初一备课组"] },
  { label: "学科分类", options: ["全部学科"] },
];

import type { PageKey } from "@/app/page";

export function ResearchDashboard({ onMenuOpen, onNavigate }: { onMenuOpen?: () => void; onNavigate?: (page: PageKey) => void }) {
  const [activeTab, setActiveTab] = useState<"research" | "lesson">("research");
  const [moreOpen, setMoreOpen] = useState(false);

  const moreActions: { icon: React.ElementType; label: string; bg: string; color: string; hover: string; target: PageKey }[] = [
    { icon: FilePenLine, label: "添加教研记录", bg: "bg-blue-50", color: "text-blue-600", hover: "group-hover:bg-blue-600", target: "research-activity-record" },
    { icon: PieChart, label: "教研数据分析", bg: "bg-purple-50", color: "text-purple-600", hover: "group-hover:bg-purple-600", target: "research-activity-analysis" },
    { icon: Users2, label: "添加备课活动", bg: "bg-indigo-50", color: "text-indigo-600", hover: "group-hover:bg-indigo-600", target: "lesson-prep-record" },
    { icon: TrendingUp, label: "备课数据分析", bg: "bg-pink-50", color: "text-pink-600", hover: "group-hover:bg-pink-600", target: "lesson-prep-analysis" },
    { icon: FilePenLine, label: "添加科技活动记录", bg: "bg-emerald-50", color: "text-emerald-600", hover: "group-hover:bg-emerald-600", target: "science-fest-form" },
    { icon: BarChart3, label: "科技节活动看板", bg: "bg-orange-50", color: "text-orange-600", hover: "group-hover:bg-orange-600", target: "science-fest-dashboard" },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}>

      {/* ── 查看更多 悬浮层 ── */}
      {moreOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="rounded-[32px] p-8 shadow-2xl w-full max-w-lg mx-4"
            style={{ background: "rgba(255,255,255,0.96)", border: "1px solid rgba(255,255,255,0.4)" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">快捷入口</h3>
              </div>
              <button
                onClick={() => setMoreOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {moreActions.map(({ icon: Icon, label, bg, color, hover, target }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-3 group cursor-pointer"
                  onClick={() => { setMoreOpen(false); onNavigate?.(target); }}
                >
                  <div className={`w-14 h-14 ${bg} rounded-[20px] flex items-center justify-center ${color} ${hover} group-hover:text-white transition-all duration-300 shadow-sm apple-hover`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-gray-600 text-center leading-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}


      {/* Top Nav */}
      <header
        className="flex items-center justify-between px-4 md:px-8 shrink-0 border-b border-gray-200/30"
        style={{ height: 64, ...glass, zIndex: 10 }}
      >
        <div className="flex items-center gap-3 md:gap-6">
          <button className="md:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors" onClick={onMenuOpen}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-white shadow-sm">
              <LayoutGrid className="w-5 h-5" />
            </div> */}
            {/* <h1 className="text-lg font-bold tracking-tight text-gray-900">教学教研管理系统</h1> */}
          </div>
          <h1 className="text-base font-bold text-gray-900">教科研看板</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索..."
              className="pl-9 pr-4 py-1.5 bg-gray-200/40 border-none rounded-full text-xs outline-none w-48 transition-all focus:w-64"
            />
          </div> */}
          <div className="flex items-center gap-3">
            <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-rose-400 to-orange-400 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-white cursor-pointer hover:scale-105 transition-transform text-sm">
              卢
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable Main */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">

          {/* Tech Banner */}
          <section
            className="tech-banner-bg w-full flex flex-col items-center justify-center relative"
            style={{
              height: 208,
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: 28,
              overflow: "hidden",
              boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            <div
              className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }}
            />
            <div className="relative z-10 text-center space-y-3">
              {/* <div className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-[0.2em] border border-blue-500/30 mb-2">
                Research &amp; Teaching Analytics
              </div> */}
              <h2
                className="text-4xl md:text-5xl font-black text-white tracking-widest"
                style={{ textShadow: "0 0 30px rgba(0,113,227,0.6)" }}
              >
                教科研数据看板
              </h2>
              <div className="flex items-center justify-center gap-4 mt-6">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-blue-400" />
                <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-blue-400" />
              </div>
            </div>
            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-30" />
          </section>

          {/* Quick Entry */}
          <section className="rounded-[32px] p-8 shadow-sm" style={glass}>
            <div className="flex items-center mb-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                <h3 className="text-xl font-bold text-gray-500 uppercase tracking-widest">快捷入口</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {quickEntries.map(({ icon: Icon, label, bg, color, hover, target }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-4 group cursor-pointer"
                  onClick={() => {
                    if (label === "查看更多") { setMoreOpen(true); return; }
                    if (target) onNavigate?.(target);
                  }}
                >
                  <div className={`w-16 h-16 ${bg} rounded-[24px] flex items-center justify-center ${color} ${hover} group-hover:text-white transition-all duration-300 shadow-sm apple-hover`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-base font-bold text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Filters */}
          {(() => {
            const valueSelectStyle = {
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.6rem center",
              backgroundSize: "0.85rem",
              paddingRight: "1.6rem",
            };
            const opStyle = {
              width: 76,
              paddingLeft: 7,
              paddingRight: 20,
              paddingTop: 5,
              paddingBottom: 5,
              border: "1px solid rgba(0,0,0,0.07)",
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b0b7bf'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.3rem center",
              backgroundSize: "0.6rem",
            };

            function FilterCard({ label, options }: { label: string; options: string[] }) {
              const [op, setOp] = useState("等于");
              const hideValue = op === "为空" || op === "不为空";
              return (
                <div className="px-4 pt-4 pb-5 rounded-[20px] apple-hover border border-white/60 flex flex-col gap-3" style={glass}>
                  {/* 标题行：label + 条件运算符 */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-sm font-black text-gray-400 uppercase tracking-wider flex-1 min-w-0 truncate">
                      {label}
                    </p>
                    <select
                      value={op}
                      onChange={e => setOp(e.target.value)}
                      className="appearance-none shrink-0 text-xs font-semibold text-gray-500 bg-black/[0.04] rounded-lg outline-none cursor-pointer hover:bg-black/[0.07] transition-colors"
                      style={opStyle as React.CSSProperties}
                    >
                      <option>等于</option>
                      <option>不等于</option>
                      <option>等于任意一个</option>
                      <option>不等于任意一个</option>
                      <option>包含</option>
                      <option>不包含</option>
                      <option>为空</option>
                      <option>不为空</option>
                    </select>
                  </div>

                  {/* 值下拉框 — 为空/不为空时隐藏 */}
                  <div
                    className="overflow-hidden transition-all duration-200"
                    style={{ maxHeight: hideValue ? 0 : 60, opacity: hideValue ? 0 : 1 }}
                  >
                    <select
                      className="w-full appearance-none bg-white/40 border-none rounded-xl px-3 py-2.5 text-base font-bold text-gray-700 outline-none cursor-pointer"
                      style={valueSelectStyle as React.CSSProperties}
                    >
                      {options.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              );
            }

            return (
              <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {filters.map(({ label, options }) => (
                  <FilterCard key={label} label={label} options={options} />
                ))}
              </section>
            );
          })()}





          {/* Main Data View */}
          <section className="rounded-[40px] shadow-sm overflow-hidden flex flex-col" style={{ ...glass, minHeight: 500 }}>
            <div className="flex items-center px-10 pt-8 border-b border-gray-100/50">
              <div className="flex gap-4">
                <button
                  className={`pb-4 px-4 text-xl font-bold${activeTab === "research" ? " macos-tab-active" : " text-gray-400 hover:text-gray-600 transition-colors"}`}
                  onClick={() => setActiveTab("research")}
                >
                  教研记录
                </button>
                <button
                  className={`pb-4 px-4 text-xl font-bold${activeTab === "lesson" ? " macos-tab-active" : " text-gray-400 hover:text-gray-600 transition-colors"}`}
                  onClick={() => setActiveTab("lesson")}
                >
                  备课记录
                </button>
              </div>
              <div className="ml-auto flex gap-3 pb-4">
                <button className="p-2.5 hover:bg-gray-100 rounded-2xl transition-colors shadow-sm bg-white/50">
                  <Share2 className="w-4 h-4 text-gray-500" />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-2xl text-base font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-colors">
                  <Download className="w-4 h-4" /> 导出报表
                </button>
              </div>
            </div>

            <div className="p-8 flex-1 space-y-8">

              {/* ── 教研记录 Tab ── */}
              {activeTab === "research" && (
                <div className="space-y-6">

                  {/* 顶部：教研活动总数 + 教研次数（复用 GlassCard 交互效果） */}
                  {(() => {
                    function ResearchGlassCard({ colSpan, title, actions, children }: { colSpan: string; title?: string; actions?: { Icon: React.ElementType; tip: string }[]; children: React.ReactNode }) {
                      const ref = React.useRef<HTMLDivElement>(null);
                      const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
                      const [pressed, setPressed] = React.useState(false);
                      const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

                      function onMove(e: React.MouseEvent<HTMLDivElement>) {
                        const el = ref.current; if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top)  / rect.height;
                        setTilt({ rx: -(y - 0.5) * 10, ry: (x - 0.5) * 10, gx: x * 100, gy: y * 100, active: true });
                      }
                      function onLeave() { setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false }); setPressed(false); }
                      function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
                        setPressed(true);
                        const el = ref.current; if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const id = Date.now();
                        setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
                        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650);
                      }
                      function onMouseUp() { setPressed(false); }
                      const scale = pressed ? 0.97 : tilt.active ? 1.02 : 1;

                      return (
                        <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
                          className={`${colSpan} rounded-[28px] cursor-pointer select-none flex flex-col`}
                          style={{
                            background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.4)",
                            boxShadow: pressed ? "0 4px 8px rgba(0,0,0,0.08)" : tilt.active ? "0 20px 40px rgba(0,0,0,0.10)" : "none",
                            transform: `perspective(900px) rotateX(${pressed ? 0 : tilt.rx}deg) rotateY(${pressed ? 0 : tilt.ry}deg) scale(${scale})`,
                            transition: pressed ? "transform 0.06s ease-out, box-shadow 0.1s ease" : tilt.active ? "transform 0.08s ease-out, box-shadow 0.2s ease" : "transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
                            position: "relative", willChange: "transform",
                          }}
                        >
                          <div className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden" style={{ zIndex: 0 }}>
                            <div className="absolute inset-0" style={{ background: tilt.active && !pressed ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.4) 0%, transparent 60%)` : "none", transition: "background 0.08s ease" }} />
                            {ripples.map(r => (
                              <span key={r.id} className="absolute rounded-full" style={{ width: 60, height: 60, left: r.x - 30, top: r.y - 30, background: "rgba(0,0,0,0.12)", animation: "researchRipple 0.6s cubic-bezier(0,0.5,0.5,1) forwards" }} />
                            ))}
                          </div>
                          {title && (
                            <div className="px-4 py-3 border-b border-gray-100/60 relative z-10 shrink-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <p className="text-sm font-bold text-gray-600 flex-1 min-w-0 truncate" title={title}>{title}</p>
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
                          <div className="relative z-10 p-6 flex-1 flex flex-col">{children}</div>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* 教研活动总数 */}
                        <ResearchGlassCard colSpan="lg:col-span-3" title="教研活动总数" actions={[{ Icon: Upload, tip: "导出" }, { Icon: Maximize2, tip: "放大" }]}>
                          <div className="flex-1 flex flex-col items-center justify-center gap-2">
                            <span className="font-black text-gray-900 leading-none" style={{ fontSize: 96 }}>24</span>
                            <span className="text-sm font-semibold" style={{ color: "#10b981" }}>↑ 较上学期 +8</span>
                          </div>
                        </ResearchGlassCard>

                        {/* 教研次数折线图 */}
                        <ResearchGlassCard colSpan="lg:col-span-9" title="教研次数" actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]}>
                          <div className="relative h-56">
                            <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="researchGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              {[0,1,2,3,4].map(i => (
                                <line key={i} x1="40" y1={20 + i * 38} x2="580" y2={20 + i * 38}
                                  stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
                              ))}
                              {["10","8","6","4","2","0"].map((v, i) => (
                                <text key={v} x="32" y={24 + i * 38} textAnchor="end" fontSize="11" fill="#94a3b8">{v}</text>
                              ))}
                              {(() => {
                                const pts = [{ x: 80, v: 2 }, { x: 200, v: 5 }, { x: 320, v: 8 }, { x: 440, v: 6 }, { x: 560, v: 9 }];
                                const toY = (v: number) => 172 - (v / 10) * 152;
                                const coords = pts.map(p => ({ x: p.x, y: toY(p.v), v: p.v }));
                                const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
                                const areaD = `${pathD} L${coords[coords.length-1].x},172 L${coords[0].x},172 Z`;
                                return (
                                  <>
                                    <path d={areaD} fill="url(#researchGrad)" />
                                    <path d={pathD} fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinejoin="round" />
                                    {coords.map((c, i) => (
                                      <g key={i}>
                                        <circle cx={c.x} cy={c.y} r="5" fill="white" stroke="#818cf8" strokeWidth="2.5" />
                                        <text x={c.x} y={c.y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">{c.v}</text>
                                      </g>
                                    ))}
                                  </>
                                );
                              })()}
                              {[
                                { x: 80, label: "2025年09月" },
                                { x: 200, label: "2025年10月" },
                                { x: 320, label: "2025年11月" },
                                { x: 440, label: "2025年12月" },
                                { x: 560, label: "2026年01月" },
                              ].map(m => (
                                <text key={m.label} x={m.x} y={190} textAnchor="middle" fontSize="11" fill="#475569">{m.label}</text>
                              ))}
                            </svg>
                          </div>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="w-3 h-3 rounded-sm" style={{ background: "#818cf8" }} />
                            <span className="text-xs text-gray-400 font-medium">教研次数</span>
                          </div>
                        </ResearchGlassCard>
                      </div>
                    );
                  })()}

                  {/* 中部：教研活动学科分布 + 教研活动趋势（GlassCard 交互） */}
                  {(() => {
                    function MidGlassCard({ title, actions, children }: { title: string; actions?: { Icon: React.ElementType; tip: string }[]; children: React.ReactNode }) {
                      const ref = React.useRef<HTMLDivElement>(null);
                      const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
                      const [pressed, setPressed] = React.useState(false);
                      const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

                      function onMove(e: React.MouseEvent<HTMLDivElement>) {
                        const el = ref.current; if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top) / rect.height;
                        setTilt({ rx: -(y - 0.5) * 10, ry: (x - 0.5) * 10, gx: x * 100, gy: y * 100, active: true });
                      }
                      function onLeave() { setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false }); setPressed(false); }
                      function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
                        setPressed(true);
                        const el = ref.current; if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const id = Date.now();
                        setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
                        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650);
                      }
                      function onMouseUp() { setPressed(false); }
                      const scale = pressed ? 0.97 : tilt.active ? 1.02 : 1;

                      return (
                        <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
                          className="rounded-[28px] cursor-pointer select-none flex flex-col"
                          style={{
                            background: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.4)", minHeight: 240,
                            boxShadow: pressed ? "0 4px 8px rgba(0,0,0,0.08)" : tilt.active ? "0 20px 40px rgba(0,0,0,0.10)" : "none",
                            transform: `perspective(900px) rotateX(${pressed ? 0 : tilt.rx}deg) rotateY(${pressed ? 0 : tilt.ry}deg) scale(${scale})`,
                            transition: pressed ? "transform 0.06s ease-out, box-shadow 0.1s ease" : tilt.active ? "transform 0.08s ease-out, box-shadow 0.2s ease" : "transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
                            position: "relative", willChange: "transform",
                          }}
                        >
                          <div className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden" style={{ zIndex: 0 }}>
                            <div className="absolute inset-0" style={{ background: tilt.active && !pressed ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.4) 0%, transparent 60%)` : "none", transition: "background 0.08s ease" }} />
                            {ripples.map(r => (
                              <span key={r.id} className="absolute rounded-full" style={{ width: 60, height: 60, left: r.x - 30, top: r.y - 30, background: "rgba(0,0,0,0.12)", animation: "researchRipple 0.6s cubic-bezier(0,0.5,0.5,1) forwards" }} />
                            ))}
                          </div>
                          <div className="relative z-10 p-6 h-full flex flex-col">
                            <div className="flex items-center gap-2 min-w-0 mb-4">
                              <p className="text-sm font-bold text-gray-600 flex-1 min-w-0 truncate" title={title}>{title}</p>
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
                            {children}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <MidGlassCard title="教研活动学科分布" actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]}>
                          <div className="flex-1 flex flex-col justify-center gap-2.5 py-2">
                            {([
                              { label: "数学", value: 12, color: "#818cf8" },
                              { label: "语文", value: 8,  color: "#60a5fa" },
                              { label: "英语", value: 6,  color: "#34d399" },
                              { label: "物理", value: 4,  color: "#f472b6" },
                              { label: "化学", value: 3,  color: "#fb923c" },
                              { label: "生物", value: 2,  color: "#a78bfa" },
                            ] as { label: string; value: number; color: string }[]).map(({ label, value, color }) => (
                              <div key={label} className="flex items-center gap-2">
                                <span className="shrink-0 text-right font-medium" style={{ fontSize: 12, color: "#6b7280", width: 24 }}>{label}</span>
                                <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: 10 }}>
                                  <div className="h-full rounded-full" style={{ width: `${(value / 12) * 100}%`, background: color }} />
                                </div>
                                <span className="shrink-0 font-bold" style={{ fontSize: 12, color: "#374151", width: 16, textAlign: "right" }}>{value}</span>
                              </div>
                            ))}
                          </div>
                        </MidGlassCard>
                        <MidGlassCard title="教研活动趋势" actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]}>
                          <div className="flex-1 flex items-end gap-2 px-2 pb-6" style={{ position: "relative" }}>
                            {([
                              { month: "9月", value: 2 },
                              { month: "10月", value: 5 },
                              { month: "11月", value: 8 },
                              { month: "12月", value: 6 },
                              { month: "1月", value: 3 },
                            ] as { month: string; value: number }[]).map(({ month, value }) => (
                              <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                                <span className="text-xs font-bold" style={{ color: "#374151" }}>{value}</span>
                                <div className="w-full rounded-t-lg" style={{
                                  height: `${(value / 8) * 140}px`,
                                  background: "linear-gradient(180deg, #818cf8 0%, #c7d2fe 100%)",
                                  minHeight: 8,
                                }} />
                                <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>{month}</span>
                              </div>
                            ))}
                          </div>
                        </MidGlassCard>
                      </div>
                    );
                  })()}



                  {/* 底部：4 列统计卡片（复用 StatCardGroup） */}
                  {(() => {
                    const rippleStyle = `@keyframes researchRipple { 0% { transform: scale(0); opacity: 0.45; } 100% { transform: scale(4); opacity: 0; } }`;

                    function ResearchStatCard({ title, selected, onSelect, chartContent }: { title: string; selected: boolean; onSelect: () => void; chartContent?: React.ReactNode }) {
                      const ref = React.useRef<HTMLDivElement>(null);
                      const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
                      const [pressed, setPressed] = React.useState(false);
                      const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

                      function onMove(e: React.MouseEvent<HTMLDivElement>) {
                        const el = ref.current; if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top) / rect.height;
                        setTilt({ rx: -(y - 0.5) * 14, ry: (x - 0.5) * 14, gx: x * 100, gy: y * 100, active: true });
                      }
                      function onLeave() { setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false }); setPressed(false); }
                      function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
                        setPressed(true);
                        const el = ref.current; if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const id = Date.now();
                        setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
                        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650);
                      }
                      function onMouseUp() { setPressed(false); onSelect(); }
                      const scale = pressed ? 0.96 : tilt.active ? 1.03 : 1;

                      return (
                        <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} onMouseDown={onMouseDown} onMouseUp={onMouseUp}
                          className="rounded-[24px] flex flex-col cursor-pointer select-none"
                          style={{
                            background: "rgba(255,255,255,0.65)",
                            border: selected ? "1px solid rgba(96,165,250,0.35)" : "1px solid rgba(255,255,255,0.4)",
                            boxShadow: pressed ? `0 0 0 ${selected ? "4px" : "0px"} rgba(96,165,250,0.08), 0 4px 8px rgba(0,0,0,0.08)` : tilt.active ? `0 0 0 ${selected ? "4px" : "0px"} rgba(96,165,250,0.08), 0 20px 40px rgba(0,0,0,0.12)` : `0 0 0 ${selected ? "4px" : "0px"} rgba(96,165,250,0.08)`,
                            minHeight: 320,
                            transform: `perspective(800px) rotateX(${pressed ? 0 : tilt.rx}deg) rotateY(${pressed ? 0 : tilt.ry}deg) scale(${scale})`,
                            transition: pressed ? "transform 0.06s ease-out, box-shadow 0.1s ease" : tilt.active ? "transform 0.08s ease-out, box-shadow 0.2s ease" : "transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
                            position: "relative", willChange: "transform",
                          }}
                        >
                          {/* 高光+波纹裁剪层 */}
                          <div className="pointer-events-none absolute inset-0 rounded-[24px] overflow-hidden" style={{ zIndex: 0 }}>
                            <div className="absolute inset-0" style={{ background: tilt.active && !pressed ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.35) 0%, transparent 65%)` : "none", transition: "background 0.08s ease" }} />
                            {ripples.map(r => (
                              <span key={r.id} className="absolute rounded-full" style={{ width: 60, height: 60, left: r.x - 30, top: r.y - 30, background: selected ? "rgba(96,165,250,0.28)" : "rgba(0,0,0,0.12)", animation: "researchRipple 0.6s cubic-bezier(0,0.5,0.5,1) forwards" }} />
                            ))}
                          </div>
                          {/* 标题 + hover 按钮 */}
                          <div className="px-4 py-3 border-b border-gray-100/60 relative z-10">
                            <div className="flex items-center gap-2 min-w-0">
                              <p className="text-sm font-bold text-gray-600 flex-1 min-w-0 truncate" title={title}>{title}</p>
                              {/* hover 显示的操作图标组 */}
                              {tilt.active && (
                              <div className="flex items-center gap-0.5 shrink-0">
                                {([{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }] as { Icon: React.ElementType; tip: string }[]).map(({ Icon, tip }) => (
                                  <div key={tip} className="relative group/tip">
                                    <button onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()} onMouseUp={e => e.stopPropagation()}
                                      className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors">
                                      <Icon size={12} />
                                    </button>
                                    {/* Tooltip 向下弹出 */}
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
                          {/* 数据区 */}
                          <div className="flex-1 flex flex-col justify-center p-4 relative z-10">
                            {chartContent}
                          </div>
                          {/* 分页 */}
                          <div className="px-4 py-3 border-t border-gray-100/60 flex items-center justify-center gap-1 relative z-10">
                            {["⟪", "‹", null, "›", "⟫"].map((btn, i) => (
                              btn === null
                                ? <div key="page" className="flex items-center border border-gray-200 rounded px-2.5 h-7 mx-1 gap-1"><span className="text-xs text-gray-600">1</span><span className="text-gray-300 text-xs">/</span><span className="text-xs text-gray-600">1</span></div>
                                : <button key={i} className="flex items-center justify-center w-7 h-7 border border-gray-200 rounded text-gray-400 hover:bg-gray-50 transition-colors text-xs font-mono">{btn}</button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    function MiniBarChart({ bars, labels, color = "#818cf8" }: { bars: number[]; labels: string[]; color?: string }) {
                      const max = Math.max(...bars);
                      return (
                        <div className="flex items-end gap-1.5 w-full" style={{ height: 120 }}>
                          {bars.map((v, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-xs font-bold" style={{ color: "#374151", fontSize: 10 }}>{v}</span>
                              <div className="w-full rounded-t" style={{
                                height: `${(v / max) * 80}px`,
                                background: color,
                                minHeight: 4,
                                opacity: 0.85,
                              }} />
                              <span className="text-center leading-tight" style={{ fontSize: 9, color: "#9ca3af" }}>{labels[i]}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    function HBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
                      const max = Math.max(...data.map(d => d.value));
                      return (
                        <div className="flex flex-col gap-2.5 w-full py-2">
                          {data.map(({ label, value, color }) => (
                            <div key={label} className="flex items-center gap-2">
                              <span className="shrink-0 text-right font-medium" style={{ fontSize: 11, color: "#6b7280", width: 28 }}>{label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: 9 }}>
                                <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
                              </div>
                              <span className="shrink-0 font-bold" style={{ fontSize: 11, color: "#374151", width: 18, textAlign: "right" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    const researchCharts: Record<string, React.ReactNode> = {
                      "每周学科教研次数": <MiniBarChart bars={[2,4,3,5,1,3,4,2]} labels={["W1","W2","W3","W4","W5","W6","W7","W8"]} color="#818cf8" />,
                      "每月学科教研次数": <MiniBarChart bars={[8,12,7,15,10,9]} labels={["9月","10月","11月","12月","1月","2月"]} color="#60a5fa" />,
                      "学期学科教研次数": <HBarChart data={[
                        { label: "数学", value: 12, color: "#818cf8" },
                        { label: "语文", value: 8,  color: "#60a5fa" },
                        { label: "英语", value: 6,  color: "#34d399" },
                        { label: "物理", value: 4,  color: "#fb923c" },
                        { label: "化学", value: 3,  color: "#f472b6" },
                        { label: "生物", value: 2,  color: "#a78bfa" },
                      ]} />,
                      "教师参与次数": <MiniBarChart bars={[5,8,3,9,6,4,7,5]} labels={["王","李","张","刘","陈","杨","赵","吴"]} color="#34d399" />,
                    };

                    function ResearchStatGroup() {
                      const [sel, setSel] = React.useState<string | null>(null);
                      return (
                        <>
                          <style>{rippleStyle}</style>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {["每周学科教研次数", "每月学科教研次数", "学期学科教研次数", "教师参与次数"].map(title => (
                              <ResearchStatCard key={title} title={title} selected={sel === title} onSelect={() => setSel(p => p === title ? null : title)} chartContent={researchCharts[title]} />
                            ))}
                          </div>
                        </>
                      );
                    }

                    return <ResearchStatGroup />;
                  })()}

                </div>
              )}


              {/* ── 备课记录 Tab ── */}
              {activeTab === "lesson" && (
                <div className="space-y-6">
                  {/* 顶部：总数 + 折线图（带鼠标交互效果） */}
                  {(() => {
                    // 通用毛玻璃交互卡片组件
                    function GlassCard({ colSpan, title, actions, children }: { colSpan: string; title?: string; actions?: { Icon: React.ElementType; tip: string }[]; children: React.ReactNode }) {
                      const ref = React.useRef<HTMLDivElement>(null);
                      const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
                      const [pressed, setPressed] = React.useState(false);
                      const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

                      function onMove(e: React.MouseEvent<HTMLDivElement>) {
                        const el = ref.current;
                        if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top)  / rect.height;
                        setTilt({ rx: -(y - 0.5) * 10, ry: (x - 0.5) * 10, gx: x * 100, gy: y * 100, active: true });
                      }
                      function onLeave() { setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false }); setPressed(false); }
                      function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
                        setPressed(true);
                        const el = ref.current;
                        if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const id = Date.now();
                        setRipples(prev => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
                        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650);
                      }
                      function onMouseUp() { setPressed(false); }

                      const scale = pressed ? 0.97 : tilt.active ? 1.02 : 1;

                      return (
                        <div
                          ref={ref}
                          onMouseMove={onMove}
                          onMouseLeave={onLeave}
                          onMouseDown={onMouseDown}
                          onMouseUp={onMouseUp}
                          className={`${colSpan} rounded-[28px] cursor-pointer select-none`}
                          style={{
                            background: "rgba(255,255,255,0.6)",
                            border: "1px solid rgba(255,255,255,0.4)",
                            boxShadow: pressed
                              ? "0 4px 8px rgba(0,0,0,0.08)"
                              : tilt.active
                                ? "0 20px 40px rgba(0,0,0,0.10)"
                                : "none",
                            transform: `perspective(900px) rotateX(${pressed ? 0 : tilt.rx}deg) rotateY(${pressed ? 0 : tilt.ry}deg) scale(${scale})`,
                            transition: pressed
                              ? "transform 0.06s ease-out, box-shadow 0.1s ease"
                              : tilt.active
                                ? "transform 0.08s ease-out, box-shadow 0.2s ease"
                                : "transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
                            position: "relative",
                            willChange: "transform",
                          }}
                        >
                          {/* 高光+水波纹专属裁剪层 */}
                          <div className="pointer-events-none absolute inset-0 rounded-[28px] overflow-hidden" style={{ zIndex: 0 }}>
                            <div
                              className="absolute inset-0"
                              style={{
                                background: tilt.active && !pressed
                                  ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.4) 0%, transparent 60%)`
                                  : "none",
                                transition: "background 0.08s ease",
                              }}
                            />
                            {ripples.map(r => (
                              <span key={r.id} className="absolute rounded-full"
                                style={{
                                  width: 80, height: 80,
                                  left: r.x - 40, top: r.y - 40,
                                  background: "rgba(96,165,250,0.15)",
                                  animation: "statRipple 0.7s cubic-bezier(0,0.5,0.5,1) forwards",
                                }}
                              />
                            ))}
                          </div>
                          {title && (
                            <div className="px-4 py-3 border-b border-gray-100/60 relative z-10 shrink-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <p className="text-sm font-bold text-gray-600 flex-1 min-w-0 truncate" title={title}>{title}</p>
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
                          {/* 内容 */}
                          <div className="relative z-10 p-6 flex-1 flex flex-col">
                            {children}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* 备课记录总数 */}
                        <GlassCard colSpan="lg:col-span-3" title="备课记录总数" actions={[{ Icon: Upload, tip: "导出" }, { Icon: Maximize2, tip: "放大" }]}>
                          <div className="flex-1 flex items-center justify-center">
                            <span className="font-black text-gray-900 leading-none" style={{ fontSize: 100 }}>90</span>
                          </div>
                        </GlassCard>

                        {/* 备课活动次数折线图 */}
                        <GlassCard colSpan="lg:col-span-9" title="备课活动次数" actions={[{ Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]}>
                          <div className="relative h-56">
                            <svg viewBox="0 0 600 200" className="w-full h-full" preserveAspectRatio="none">
                              <defs>
                                <linearGradient id="lessonGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                                </linearGradient>
                              </defs>
                              {[0,1,2,3,4].map(i => (
                                <line key={i} x1="40" y1={20 + i * 38} x2="580" y2={20 + i * 38}
                                  stroke="#e2e8f0" strokeWidth="1" strokeDasharray="5,5" />
                              ))}
                              {["50","40","30","20","10","0"].map((v, i) => (
                                <text key={v} x="32" y={24 + i * 38} textAnchor="end" fontSize="11" fill="#94a3b8">{v}</text>
                              ))}
                              {(() => {
                                const pts = [{ x: 100, v: 1 }, { x: 240, v: 8 }, { x: 380, v: 46 }, { x: 520, v: 35 }];
                                const toY = (v: number) => 172 - (v / 50) * 152;
                                const coords = pts.map(p => ({ x: p.x, y: toY(p.v), v: p.v }));
                                const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
                                const areaD = `${pathD} L${coords[coords.length-1].x},172 L${coords[0].x},172 Z`;
                                return (
                                  <>
                                    <path d={areaD} fill="url(#lessonGrad)" />
                                    <path d={pathD} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinejoin="round" />
                                    {coords.map((c, i) => (
                                      <g key={i}>
                                        <circle cx={c.x} cy={c.y} r="5" fill="white" stroke="#60a5fa" strokeWidth="2.5" />
                                        <text x={c.x} y={c.y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#475569">{c.v}</text>
                                      </g>
                                    ))}
                                  </>
                                );
                              })()}
                              {[
                                { x: 100, label: "2025年12月" },
                                { x: 240, label: "2026年02月" },
                                { x: 380, label: "2026年03月" },
                                { x: 520, label: "2026年04月" },
                              ].map(m => (
                                <text key={m.label} x={m.x} y={190} textAnchor="middle" fontSize="11" fill="#475569">{m.label}</text>
                              ))}
                            </svg>
                          </div>
                          <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="w-3 h-3 rounded-sm" style={{ background: "#60a5fa" }} />
                            <span className="text-xs text-gray-400 font-medium">活动主题</span>
                          </div>
                        </GlassCard>

                      </div>
                    );
                  })()}

                  {/* 底部：4 列统计卡片 */}
                  {(() => {
                    // Ripple 动画 keyframe（注入一次）
                    const rippleStyle = `@keyframes statRipple {
                      0%   { transform: scale(0);   opacity: 0.45; }
                      100% { transform: scale(4);   opacity: 0; }
                    }`;

                    function StatCard({ title, highlight, selected, onSelect, chartContent }: {
                      title: string; highlight?: boolean;
                      selected: boolean; onSelect: () => void; chartContent?: React.ReactNode;
                    }) {
                      const ref = React.useRef<HTMLDivElement>(null);
                      const [tilt, setTilt] = React.useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
                      const [pressed, setPressed] = React.useState(false);
                      const [ripples, setRipples] = React.useState<{ id: number; x: number; y: number }[]>([]);

                      const isBlue = selected;   // 所有卡片统一：仅由 selected 决定蓝色边框

                      function onMove(e: React.MouseEvent<HTMLDivElement>) {
                        const el = ref.current;
                        if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width;
                        const y = (e.clientY - rect.top)  / rect.height;
                        setTilt({ rx: -(y - 0.5) * 14, ry: (x - 0.5) * 14, gx: x * 100, gy: y * 100, active: true });
                      }

                      function onLeave() {
                        setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });
                        setPressed(false);
                      }

                      function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
                        setPressed(true);
                        const el = ref.current;
                        if (!el) return;
                        const rect = el.getBoundingClientRect();
                        const id = Date.now();
                        setRipples(prev => [...prev, {
                          id,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        }]);
                        setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 650);
                      }

                      function onMouseUp() {
                        setPressed(false);
                        onSelect();   // 所有卡片统一触发，由 StatCardGroup 统一管理互斥
                      }

                      const scale = pressed ? 0.96 : tilt.active ? 1.03 : 1;

                      return (
                        <div
                          ref={ref}
                          onMouseMove={onMove}
                          onMouseLeave={onLeave}
                          onMouseDown={onMouseDown}
                          onMouseUp={onMouseUp}
                          className="rounded-[24px] flex flex-col cursor-pointer select-none"
                          style={{
                            background: "rgba(255,255,255,0.65)",
                            border: isBlue ? "1px solid rgba(96,165,250,0.35)" : "1px solid rgba(255,255,255,0.4)",
                            boxShadow: pressed
                              ? `0 0 0 ${isBlue ? "4px" : "0px"} rgba(96,165,250,0.08), 0 4px 8px rgba(0,0,0,0.08)`
                              : tilt.active
                                ? `0 0 0 ${isBlue ? "4px" : "0px"} rgba(96,165,250,0.08), 0 20px 40px rgba(0,0,0,0.12)`
                                : `0 0 0 ${isBlue ? "4px" : "0px"} rgba(96,165,250,0.08)`,
                            minHeight: 320,
                            transform: `perspective(800px) rotateX(${pressed ? 0 : tilt.rx}deg) rotateY(${pressed ? 0 : tilt.ry}deg) scale(${scale})`,
                            transition: pressed
                              ? "transform 0.06s ease-out, box-shadow 0.1s ease"
                              : tilt.active
                                ? "transform 0.08s ease-out, box-shadow 0.2s ease"
                                : "transform 0.45s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease",
                            position: "relative",
                            willChange: "transform",
                          }}
                        >
                          {/* 高光 + 水波纹专属裁剪层（overflow-hidden 只作用于此） */}
                          <div className="pointer-events-none absolute inset-0 rounded-[24px] overflow-hidden" style={{ zIndex: 0 }}>
                            {/* 鼠标跟随高光 */}
                            <div
                              className="absolute inset-0"
                              style={{
                                background: tilt.active && !pressed
                                  ? `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.35) 0%, transparent 65%)`
                                  : "none",
                                transition: "background 0.08s ease",
                              }}
                            />
                            {/* 水波纹 */}
                            {ripples.map(r => (
                              <span
                                key={r.id}
                                className="absolute rounded-full"
                                style={{
                                  width: 60, height: 60,
                                  left: r.x - 30, top: r.y - 30,
                                  background: isBlue ? "rgba(96,165,250,0.28)" : "rgba(0,0,0,0.12)",
                                  animation: "statRipple 0.6s cubic-bezier(0,0.5,0.5,1) forwards",
                                }}
                              />
                            ))}
                          </div>
                          {/* 卡片标题 + hover 操作栏 */}
                          <div className="px-4 py-3 border-b border-gray-100/60 relative z-10">
                            <div className="flex items-center gap-2 min-w-0">
                              {/* 标题：超出截断 */}
                              <p className="text-sm font-bold text-gray-600 flex-1 min-w-0 truncate" title={title}>
                                {title}
                              </p>
                              {/* hover 时显示的操作图标组 */}
                              {tilt.active && (
                              <div className="flex items-center gap-0.5 shrink-0">
                                {([
                                  { Icon: Upload,      tip: "导出" },
                                  { Icon: RefreshCw,   tip: "刷新" },
                                  { Icon: ArrowUpDown, tip: "排序" },
                                  { Icon: Maximize2,   tip: "放大" },
                                ] as { Icon: React.ElementType; tip: string }[]).map(({ Icon, tip }) => (
                                  <div key={tip} className="relative group/tip">
                                    <button
                                      onClick={e => e.stopPropagation()}
                                      onMouseDown={e => e.stopPropagation()}
                                      onMouseUp={e => e.stopPropagation()}
                                      className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors"
                                    >
                                      <Icon size={12} />
                                    </button>
                                    {/* 自定义 Tooltip — 向下弹出 */}
                                    <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
                                      {/* 小箭头（尖尖朝上） */}
                                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800/90" />
                                      <div className="px-2 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md whitespace-nowrap">
                                        {tip}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              )}
                            </div>
                          </div>
                          {/* 数据区 */}
                          <div className="flex-1 flex flex-col justify-center p-4 relative z-10">
                            {chartContent}
                          </div>
                          {/* 分页 */}
                          <div className="px-4 py-3 border-t border-gray-100/60 flex items-center justify-center gap-1 relative z-10">
                            {["⟪", "‹", null, "›", "⟫"].map((btn, i) => (
                              btn === null
                                ? <div key="page" className="flex items-center border border-gray-200 rounded px-2.5 h-7 mx-1 gap-1">
                                    <span className="text-xs text-gray-600">1</span>
                                    <span className="text-gray-300 text-xs">/</span>
                                    <span className="text-xs text-gray-600">1</span>
                                  </div>
                                : <button key={i} className="flex items-center justify-center w-7 h-7 border border-gray-200 rounded text-gray-400 hover:bg-gray-50 transition-colors text-xs font-mono">{btn}</button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    function LessonMiniBar({ bars, labels, color = "#60a5fa" }: { bars: number[]; labels: string[]; color?: string }) {
                      const max = Math.max(...bars);
                      return (
                        <div className="flex items-end gap-1.5 w-full" style={{ height: 120 }}>
                          {bars.map((v, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <span style={{ fontSize: 10, color: "#374151", fontWeight: 700 }}>{v}</span>
                              <div className="w-full rounded-t" style={{ height: `${(v / max) * 80}px`, background: color, minHeight: 4, opacity: 0.85 }} />
                              <span className="text-center leading-tight" style={{ fontSize: 9, color: "#9ca3af" }}>{labels[i]}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    function LessonHBar({ data }: { data: { label: string; value: number; color: string }[] }) {
                      const max = Math.max(...data.map(d => d.value));
                      return (
                        <div className="flex flex-col gap-2.5 w-full py-2">
                          {data.map(({ label, value, color }) => (
                            <div key={label} className="flex items-center gap-2">
                              <span className="shrink-0 text-right font-medium" style={{ fontSize: 11, color: "#6b7280", width: 28 }}>{label}</span>
                              <div className="flex-1 bg-gray-100 rounded-full overflow-hidden" style={{ height: 9 }}>
                                <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
                              </div>
                              <span className="shrink-0 font-bold" style={{ fontSize: 11, color: "#374151", width: 18, textAlign: "right" }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      );
                    }

                    const lessonCharts: Record<string, React.ReactNode> = {
                      "每周备课组备课次数": <LessonMiniBar bars={[5,8,6,9,4,7,8,6]} labels={["W1","W2","W3","W4","W5","W6","W7","W8"]} color="#60a5fa" />,
                      "每月备课组备课次数": <LessonMiniBar bars={[20,35,28,42,30,38]} labels={["9月","10月","11月","12月","1月","2月"]} color="#818cf8" />,
                      "备课组备课次数": <LessonHBar data={[
                        { label: "数学", value: 24, color: "#60a5fa" },
                        { label: "语文", value: 18, color: "#818cf8" },
                        { label: "英语", value: 15, color: "#34d399" },
                        { label: "物理", value: 10, color: "#fb923c" },
                        { label: "化学", value: 8,  color: "#f472b6" },
                        { label: "生物", value: 5,  color: "#a78bfa" },
                      ]} />,
                      "备课教师参与次数": <LessonMiniBar bars={[12,8,15,6,10,9,11,7]} labels={["王","李","张","刘","陈","杨","赵","吴"]} color="#34d399" />,
                    };

                    // StatCardGroup：持有共享 selectedTitle，实现互斥选中
                    function StatCardGroup() {
                      const [selectedTitle, setSelectedTitle] = React.useState<string | null>(null);
                      function handleSelect(title: string) {
                        setSelectedTitle(prev => prev === title ? null : title);
                      }
                      return (
                        <>
                          <style>{rippleStyle}</style>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            {[
                              { title: "每周备课组备课次数" },
                              { title: "每月备课组备课次数" },
                              { title: "备课组备课次数" },
                              { title: "备课教师参与次数" },
                            ].map(({ title }) => (
                              <StatCard
                                key={title}
                                title={title}
                                highlight={undefined}
                                selected={selectedTitle === title}
                                onSelect={() => handleSelect(title)}
                                chartContent={lessonCharts[title]}
                              />
                            ))}
                          </div>
                        </>
                      );
                    }

                    return <StatCardGroup />;
                  })()}


                </div>
              )}

            </div>

          </section>

        </main>
        {/* 
        <footer className="max-w-7xl mx-auto px-10 py-10 border-t border-gray-200/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-gray-400">© 2024 智慧教学教研管理系统 · macOS Edition</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">系统公告</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">帮助中心</a>
            <a href="#" className="text-xs font-bold text-gray-400 hover:text-blue-600 transition-colors">隐私协议</a>
          </div>
        </footer> */}
      </div>
    </div>
  );
}
