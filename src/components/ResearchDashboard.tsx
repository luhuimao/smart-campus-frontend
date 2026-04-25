"use client";

import {
  LayoutGrid, Search, Bell, FilePenLine, PieChart, Users2,
  TrendingUp, Plus, Share2, Download, BarChart3, Menu,
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
  { icon: PieChart,    label: "教研数据分析", bg: "bg-purple-50", color: "text-purple-600", hover: "group-hover:bg-purple-600", target: "research-activity-analysis" },
  { icon: Users2,      label: "添加备课活动", bg: "bg-indigo-50", color: "text-indigo-600", hover: "group-hover:bg-indigo-600", target: "lesson-prep-record" },
  { icon: TrendingUp,  label: "备课数据分析", bg: "bg-pink-50", color: "text-pink-600", hover: "group-hover:bg-pink-600", target: "lesson-prep-analysis" },
  { icon: Plus,        label: "查看更多",     bg: "bg-gray-50", color: "text-gray-400", hover: "group-hover:bg-gray-800", target: null },
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

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif' }}>

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
                <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest">快捷入口</h3>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {quickEntries.map(({ icon: Icon, label, bg, color, hover, target }) => (
                <div key={label} className="flex flex-col items-center gap-4 group cursor-pointer" onClick={() => target && onNavigate?.(target)}>
                  <div className={`w-16 h-16 ${bg} rounded-[24px] flex items-center justify-center ${color} ${hover} group-hover:text-white transition-all duration-300 shadow-sm apple-hover`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-base font-bold text-gray-600">{label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Filters */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {filters.map(({ label, options }) => (
              <div key={label} className="p-5 rounded-[24px] apple-hover border border-white/60" style={glass}>
                <p className="text-sm font-black text-gray-400 uppercase mb-3 tracking-widest">{label}</p>
                <select
                  className="w-full appearance-none bg-white/40 border-none rounded-xl px-4 py-2.5 text-base font-bold outline-none cursor-pointer"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.75rem center",
                    backgroundSize: "1rem",
                  }}
                >
                  {options.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </section>

          {/* Main Data View */}
          <section className="rounded-[40px] shadow-sm overflow-hidden flex flex-col" style={{ ...glass, minHeight: 500 }}>
            <div className="flex items-center px-10 pt-8 border-b border-gray-100/50">
              <div className="flex gap-4">
                <button
                  className={`pb-4 px-4 text-lg font-bold${activeTab === "research" ? " macos-tab-active" : " text-gray-400 hover:text-gray-600 transition-colors"}`}
                  onClick={() => setActiveTab("research")}
                >
                  教研记录汇总
                </button>
                <button
                  className={`pb-4 px-4 text-lg font-bold${activeTab === "lesson" ? " macos-tab-active" : " text-gray-400 hover:text-gray-600 transition-colors"}`}
                  onClick={() => setActiveTab("lesson")}
                >
                  备课活动周报
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

            <div className="p-10 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-[0.15em]">教研活动总数</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-gray-900">128</span>
                    <span className="text-sm font-bold text-emerald-500">+12%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-black text-gray-400 uppercase tracking-[0.15em]">累计教研时长</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl font-black text-gray-900">342<small className="text-xl">h</small></span>
                    <span className="text-sm font-bold text-blue-500">达标</span>
                  </div>
                </div>
              </div>

              <div className="w-full h-80 rounded-[32px] border-2 border-dashed border-gray-200/60 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-blue-400 transition-all duration-500 bg-gray-50/50">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-gray-300 group-hover:text-blue-500 group-hover:rotate-12 transition-all shadow-sm">
                  <BarChart3 className="w-10 h-10" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-gray-500 group-hover:text-gray-900 transition-colors">点击深度解析数据</p>
                  <p className="text-base text-gray-400 mt-1">系统将基于当前筛选条件生成 AI 分析图表</p>
                </div>
              </div>
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
