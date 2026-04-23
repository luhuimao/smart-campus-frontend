"use client";

import { Users, PlusCircle, User, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { useState } from "react";

const glass = {
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: 24,
} as const;

const smallStats = [
  { label: "休学总数",  value: "0",      color: "#f97316", textColor: "text-orange-500" },
  { label: "转学总数",  value: "0",      color: "#3b82f6", textColor: "text-blue-500" },
  { label: "退学总数",  value: "0",      color: "#f43f5e", textColor: "text-rose-500" },
  { label: "请假人数",  value: "11,154", color: "#10b981", textColor: "text-emerald-500" },
  { label: "消费金额",  value: "242K",   color: "#8b5cf6", textColor: "text-purple-600" },
  { label: "出校人数",  value: "9,706",  color: "#f59e0b", textColor: "text-amber-600" },
  { label: "入校人数",  value: "3,031",  color: "#06b6d4", textColor: "text-cyan-600" },
];

const gradeClasses = [
  { grade: "高2025级", count: 16, active: true },
  { grade: "高2023级", count: 28, active: false },
  { grade: "高2024级", count: 18, active: false },
];

const consumeItems = [
  { label: "餐饮消费", pct: 75, color: "bg-orange-400" },
  { label: "文具采购", pct: 15, color: "bg-blue-400" },
  { label: "其他",     pct: 10, color: "bg-gray-300" },
];

const tabs = ["学生基础信息", "学生晨午检", "返校情况", "请假数据", "消费记录", "资助情况"];

const tableRows = [
  { status: "转入【增加】", name: "莫佳龙", ethnicity: "壮",  gender: "男", birth: "2009-02-18", age: 17 },
  { status: "转入【增加】", name: "陆彦希", ethnicity: "汉",  gender: "男", birth: "2009-04-14", age: 17 },
  { status: "转入【增加】", name: "张欣蕾", ethnicity: "汉族", gender: "女", birth: "2010-06-05", age: 16 },
];

const timeFilters = ["今日", "本周", "本月", "今年"];

export function StudentDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [activeTime, setActiveTime] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif', color: "#1d1d1f" }}
    >
      {/* Top Nav */}
      <header
        className="flex items-center justify-between px-8 shrink-0 border-b border-gray-200/30"
        style={{ height: 64, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 10 }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">学生管理看板</h1>
            {/* <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Student Management Intelligence</p> */}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-200/50 p-1 rounded-xl text-xs font-bold text-gray-500">
            {timeFilters.map((t, i) => (
              <button
                key={t}
                className={`px-4 py-1.5 rounded-lg transition-all ${activeTime === i ? "bg-white shadow-sm text-blue-600" : "hover:bg-white"}`}
                onClick={() => setActiveTime(i)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="p-2 hover:bg-gray-100 rounded-full cursor-pointer relative">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white">
              卢
            </div>
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="p-6 md:p-8 space-y-8">

          {/* Main Stats */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Banner */}
            <div
              className="lg:col-span-2 p-8 flex items-center justify-between shadow-xl relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0071e3 0%, #40a9ff 100%)", borderRadius: 24 }}
            >
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
              <div className="relative z-10 space-y-4">
                <p className="text-blue-100 text-sm font-medium">在读学生总数</p>
                <h2 className="text-6xl font-black text-white tracking-tighter">3,587</h2>
                <div className="flex gap-3">
                  <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-xs text-white border border-white/20">男: 2,217</div>
                  <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-xs text-white border border-white/20">女: 1,370</div>
                </div>
              </div>
              <div className="relative z-10 text-right">
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur border border-white/20">
                  <p className="text-blue-100 text-xs font-bold mb-1">班级总数</p>
                  <span className="text-4xl font-black text-white">60</span>
                </div>
              </div>
            </div>

            {/* Small stats grid */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
              {smallStats.map(({ label, value, color, textColor }) => (
                <div
                  key={label}
                  className="p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ ...glass, borderLeft: `4px solid ${color}` }}
                >
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
                  <span className={`text-2xl font-black ${textColor}`}>{value}</span>
                </div>
              ))}
              <div
                className="p-5 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-800"
                style={{ ...glass, background: "#111827" }}
              >
                <PlusCircle className="w-8 h-8 text-white opacity-50" />
              </div>
            </div>
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pie chart */}
            <div className="p-6 flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={glass}>
              <h3 className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> 男女比例
              </h3>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-32 h-32 rounded-full rotate-45 shadow-inner" style={{ border: "12px solid #3b82f6", borderLeftColor: "#34d399" }} />
                <div className="absolute text-center">
                  <p className="text-xs font-bold text-gray-400">占比</p>
                  <p className="text-sm font-black">57.4%</p>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-6 text-[10px] font-bold text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 男</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> 女</span>
              </div>
            </div>

            {/* Bar chart */}
            <div className="p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={glass}>
              <h3 className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" /> 各年级人数
              </h3>
              <div className="flex items-end justify-between h-32 px-4">
                {[{ h: "100%", v: "1339", c: "bg-blue-500" }, { h: "75%", v: "969", c: "bg-blue-400" }, { h: "60%", v: "779", c: "bg-blue-300" }].map(({ h, v, c }) => (
                  <div key={v} className="flex flex-col items-center gap-1" style={{ height: "100%", justifyContent: "flex-end" }}>
                    <p className="text-[8px] font-bold text-gray-400">{v}</p>
                    <div className={`w-8 ${c} rounded-t-lg`} style={{ height: h }} />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-[10px] font-bold text-gray-400 px-2">
                <span>高2023级</span><span>高2024级</span><span>高2025级</span>
              </div>
            </div>

            {/* Class count table */}
            <div className="p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={glass}>
              <h3 className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" /> 各年级班级数
              </h3>
              <div className="space-y-2">
                {gradeClasses.map(({ grade, count, active }) => (
                  <div key={grade} className={`flex justify-between p-2 rounded-lg text-xs ${active ? "bg-blue-50/50" : "bg-gray-50"}`}>
                    <span className={`font-bold ${active ? "text-blue-600" : "text-gray-600"}`}>{grade}</span>
                    <span className="font-black">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Consume progress */}
            <div className="p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={glass}>
              <h3 className="text-sm font-bold text-gray-500 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /> 消费情况
              </h3>
              <div className="space-y-4">
                {consumeItems.map(({ label, pct, color }) => (
                  <div key={label} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span>{label}</span><span>{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Search & Filters */}
          <section className="p-6 flex flex-wrap items-end gap-6" style={glass}>
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">学生姓名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  placeholder="输入姓名查询"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}
                  onFocus={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">班级选择</label>
              <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer" style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                <option>等于任意一个</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px] space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">提交时间</label>
              <select className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer" style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                <option>本周 (动态筛选)</option>
              </select>
            </div>
            <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
              查询
            </button>
          </section>

          {/* Data Table */}
          <section className="overflow-hidden" style={glass}>
            {/* Tabs */}
            <div className="flex items-center px-8 border-b border-gray-100 overflow-x-auto">
              {tabs.map((tab, i) => (
                <button
                  key={tab}
                  className="py-5 px-4 text-xs font-bold whitespace-nowrap transition-colors relative shrink-0"
                  style={{
                    color: activeTab === i ? "#0071e3" : "#9ca3af",
                    borderBottom: activeTab === i ? "2px solid #0071e3" : "2px solid transparent",
                  }}
                  onClick={() => setActiveTab(i)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-400 uppercase tracking-widest" style={{ background: "rgba(249,250,251,0.5)" }}>
                  <tr>
                    <th className="px-8 py-4">学籍状态</th>
                    <th className="px-6 py-4">姓名</th>
                    <th className="px-6 py-4">民族</th>
                    <th className="px-6 py-4">性别</th>
                    <th className="px-6 py-4">出生日期</th>
                    <th className="px-6 py-4">年龄</th>
                    <th className="px-6 py-4">政治面貌</th>
                    <th className="px-8 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {tableRows.map((row) => (
                    <tr key={row.name} className="transition-colors hover:bg-blue-50/30">
                      <td className="px-8 py-4">
                        <span className="bg-emerald-100 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{row.status}</span>
                      </td>
                      <td className="px-6 py-4 font-bold">{row.name}</td>
                      <td className="px-6 py-4 text-gray-500">{row.ethnicity}</td>
                      <td className="px-6 py-4 text-gray-500">{row.gender}</td>
                      <td className="px-6 py-4 text-gray-500">{row.birth}</td>
                      <td className="px-6 py-4 font-medium">{row.age}</td>
                      <td className="px-6 py-4 text-gray-400">--</td>
                      <td className="px-8 py-4 text-right">
                        <button className="text-blue-600 hover:underline text-xs font-medium">详情</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-8 py-5 flex items-center justify-between border-t border-gray-100" style={{ background: "rgba(249,250,251,0.3)" }}>
              <p className="text-xs text-gray-400 font-medium">显示第 1 到 10 条，共 3,587 条记录</p>
              <div className="flex gap-2 items-center">
                <button className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-all">
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: currentPage === p ? "#2563eb" : "transparent",
                      color: currentPage === p ? "white" : "#6b7280",
                      border: currentPage === p ? "none" : "1px solid transparent",
                    }}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button className="p-2 hover:bg-white rounded-lg border border-gray-200 transition-all">
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </section>

          {/* <footer className="text-center pb-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Apple Style Management Dashboard v2.0</p>
          </footer> */}

        </main>
      </div>
    </div>
  );
}
