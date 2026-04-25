"use client";

import {
  Bell, ChevronRight, ChevronLeft, ChevronDown,
  Plus, Upload, Trash2, History, Search, Filter,
  Eye, ArrowUpDown, LayoutGrid, RefreshCw, MoreHorizontal,
  List, MoveHorizontal } from "lucide-react";
import { PageHeader } from "./PageHeader";

const teal = "#00b095";

const COLUMNS = ["班级", "学生姓名", "学科", "学情分析开始时间", "学情分析结束时间", "掌握较好的知识点", "掌握不足的知识点","教师指导措施","提交人","提交时间","更新时间"];

function LighthouseEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-56 h-56 opacity-50 mb-4">
        <path d="M50 300 Q200 280 350 300" stroke="#CBD5E1" strokeWidth="2" />
        <circle cx="150" cy="280" r="10" fill="#E2E8F0" />
        <circle cx="280" cy="290" r="8" fill="#E2E8F0" />
        <path d="M170 140 L50 120 Q50 160 170 180" fill="rgba(251,191,36,0.1)" />
        <rect x="180" y="140" width="40" height="150" fill="#94A3B8" />
        <rect x="185" y="150" width="30" height="130" fill="#E2E8F0" />
        <path d="M180 290 L220 290 L230 300 L170 300 Z" fill="#64748B" />
        <rect x="175" y="120" width="50" height="20" rx="2" fill="#64748B" />
        <rect x="185" y="100" width="30" height="20" rx="10" fill="#94A3B8" />
        <circle cx="200" cy="110" r="5" fill="#FBBF24" />
      </svg>
      <p className="text-sm text-gray-400">暂无数据</p>
    </div>
  );
}

export function LearningAnalysisTablePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        breadcrumbs={[{ label: "学情分析" }, { label: "学情分析表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col p-3 md:p-5 bg-[#f5f5f7]">

        {/* Toolbar */}
        <div
          className="bg-white rounded-t-2xl px-4 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 shrink-0"
          style={{ borderLeft: "1px solid #f3f4f6", borderRight: "1px solid #f3f4f6", borderTop: "1px solid #f3f4f6" }}
        >
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: teal }}
            >
              <Plus className="w-4 h-4" /> 添加
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              <Upload className="w-4 h-4" /> 导出
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              <Trash2 className="w-4 h-4" /> 删除
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              <History className="w-4 h-4" /> 操作记录
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="搜索数据"
                className="pl-9 pr-8 py-1.5 w-56 border border-gray-200 rounded-lg text-sm outline-none focus:border-teal-400 transition-colors"
              />
              <ChevronDown className="w-4 h-4 absolute right-2.5 text-gray-400 pointer-events-none" />
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4" /> 筛选
            </button>

            <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
              {[
                { Icon: Eye,           active: true  },
                { Icon: ArrowUpDown,   active: false },
                { Icon: LayoutGrid,    active: false },
                { Icon: RefreshCw,     active: false },
                { Icon: MoreHorizontal,active: false },
              ].map(({ Icon, active }, i) => (
                <button
                  key={i}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ background: active ? "#f0fdf9" : "transparent", color: active ? teal : "#6b7280" }}
                  onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"; }}
                  onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          className="bg-white flex-1 overflow-x-auto overflow-y-auto"
          style={{ borderLeft: "1px solid #f3f4f6", borderRight: "1px solid #f3f4f6" }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="w-12 px-4 py-3 bg-gray-50 border-r border-gray-100 shrink-0">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-teal-500" />
                </th>
                {COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-100 last:border-r-0 bg-gray-50 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
          <LighthouseEmpty />
        </div>

        {/* Pagination */}
        <div
          className="bg-white rounded-b-2xl px-4 py-3 flex justify-between items-center shrink-0"
          style={{ borderLeft: "1px solid #f3f4f6", borderRight: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6" }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <List className="w-4 h-4 text-gray-400" />
              <MoveHorizontal className="w-4 h-4 text-gray-400" />
              <div className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-gray-600 cursor-pointer hover:bg-gray-50 gap-1.5">
                <span>20 条/页</span>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>
            <span className="text-xs text-gray-400">共 0 条</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1 text-gray-300 cursor-not-allowed">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <input
                type="text"
                defaultValue="1"
                className="w-8 h-7 border border-gray-200 rounded-lg text-center text-xs outline-none focus:border-teal-400"
              />
              <span>/ 1</span>
            </div>
            <button className="p-1 text-gray-300 cursor-not-allowed">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
