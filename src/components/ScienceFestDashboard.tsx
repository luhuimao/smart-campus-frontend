"use client";

import { Bell, ChevronDown, ChevronRight, ChevronLeft, ChevronsLeft, Calendar, Info } from "lucide-react";
import { useState } from "react";

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

function DateRangeFilter() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-800">活动时间</span>
        <button className="flex items-center gap-0.5 text-xs" style={{ color: teal }}>
          选择范围 <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-8 border border-gray-200 rounded-lg flex items-center justify-between px-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
          <span className="text-[11px] text-gray-300">开始日期</span>
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </div>
        <span className="text-gray-300 text-xs">~</span>
        <div className="flex-1 h-8 border border-gray-200 rounded-lg flex items-center justify-between px-2.5 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
          <span className="text-[11px] text-gray-300">结束日期</span>
          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}

function EmptyState({ message = "暂无数据" }: { message?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
      <Info className="w-10 h-10 mb-2 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}

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

export function ScienceFestDashboard() {
  const [calView, setCalView] = useState<"week" | "month">("week");

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif', color: "#1d1d1f" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 shrink-0 border-b border-gray-100"
        style={{ height: 64, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", zIndex: 10 }}
      >
        <div className="flex items-center gap-1.5 text-sm" style={{ color: "#9ca3af" }}>
          <span className="hover:text-gray-600 cursor-pointer transition-colors">教师组织参与的活动</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="hover:text-gray-600 cursor-pointer transition-colors">科技节活动</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span style={{ color: "#374151", fontWeight: 500 }}>科技节活动看板</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative cursor-pointer">
            <Bell className="w-5 h-5 text-gray-400 hover:text-gray-700 transition-colors" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </div>
          <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white cursor-pointer hover:scale-105 transition-transform">
            卢
          </div>
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-5 space-y-4">

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FilterCard title="教研组" mode="等于任意一个" />
          <FilterCard title="活动负责教师" mode="等于任意一个" />
          <DateRangeFilter />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-6 gap-4">
          {/* Total count */}
          <div className="col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col" style={{ minHeight: 260 }}>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">科技节活动总次数</h3>
            <div className="flex-1 flex items-center justify-center">
              <span className="text-8xl font-light" style={{ color: "#1d1d1f" }}>0</span>
            </div>
          </div>

          {/* Trend chart */}
          <div className="col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col" style={{ minHeight: 260 }}>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">活动次数</h3>
            <EmptyState />
          </div>
        </div>

        {/* Bottom stats row */}
        <div className="grid grid-cols-12 gap-4">
          {/* 教研组活动情况统计 */}
          <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 420 }}>
            <div className="px-4 py-3 border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">教研组活动情况统计</h3>
            </div>
            <div className="flex-1" />
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
          <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col" style={{ height: 420 }}>
            <h3 className="text-sm font-semibold text-gray-800 mb-4">教师参与次数</h3>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-xs text-blue-500">计数</span>
              <div className="w-6 h-6 rounded-full bg-orange-400 text-white text-[10px] flex items-center justify-center font-bold">0</div>
            </div>
            <div className="flex-1" />
          </div>

          {/* 科技节活动日历 */}
          <div className="col-span-7 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col" style={{ height: 420 }}>
            <div className="px-4 py-3 flex justify-between items-center border-b border-gray-50">
              <h3 className="text-sm font-semibold text-gray-800">科技节活动日历</h3>
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
              </div>
            </div>
            {/* Calendar grid */}
            <div className="flex-1 grid grid-cols-7">
              {WEEK_DAYS.map((day, i) => (
                <div key={day} className="flex flex-col border-r last:border-r-0 border-gray-50">
                  <div className="py-2 text-[10px] text-gray-400 text-center border-b border-gray-50">{day}</div>
                  <div className="flex-1 bg-slate-50 opacity-40" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 科技节活动记录表 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-800">科技节活动记录表</h3>
          </div>
          <div className="flex items-center justify-center" style={{ minHeight: 300 }}>
            <div className="flex flex-col items-center text-gray-300 gap-2">
              <Info className="w-8 h-8 opacity-40" />
              <span className="text-sm">暂无记录</span>
            </div>
          </div>
          <Pagination total={0} />
        </div>
      </div>
    </div>
  );
}
