"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, Upload, RefreshCw, ArrowUpDown, Maximize2 } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";

const teal = "#13c2c2";

const CONDITION_OPTIONS = ["等于任意一个", "不等于任意一个", "包含", "不包含", "为空", "不为空"];
const DATE_OPTIONS      = ["等于", "不等于", "大于等于", "小于等于", "为空", "不为空"];
const PERSON_OPTIONS    = ["等于任意一个", "包含任意一个", "同时包含", "为空", "不为空"];

function FilterCard({ title, options, children }: {
  title: string;
  options: string[];
  children: React.ReactNode | ((cond: string) => React.ReactNode);
}) {
  const [cond, setCond] = useState(options[0]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="glass" style={{ padding: "12px 16px", position: "relative", zIndex: open ? 100 : 1 }}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(v => !v)}
            style={{ color: teal, fontSize: 13, display: "flex", alignItems: "center", gap: 2 }}>
            {cond}
            <ChevronRight size={11} style={{ transform: open ? "rotate(270deg)" : "rotate(90deg)", transition: "transform 0.15s" }} />
          </button>
          {open && (
            <div className="absolute right-0 rounded-xl overflow-hidden"
              style={{ top: "calc(100% + 4px)", minWidth: 140, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", zIndex: 200 }}>
              {options.map(opt => (
                <button key={opt} onClick={() => { setCond(opt); setOpen(false); }}
                  className="w-full text-left px-3 py-2 transition-colors"
                  style={{ fontSize: 14, color: opt === cond ? teal : "#374151", background: opt === cond ? "rgba(19,194,194,0.06)" : "transparent" }}
                  onMouseEnter={e => { if (opt !== cond) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; }}
                  onMouseLeave={e => { if (opt !== cond) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      {typeof children === "function" ? children(cond) : children}
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

const TABLE_HEADERS = ["班级", "学科", "学情时间", "提交人", "分析总数", "优秀人数", "良好人数", "及格人数", "不及格人数", "备注"];

const TABLE_ROWS = [
  { class: "高一(1)班", subject: "数学", time: "2026-04-20", submitter: "张老师", total: 45, excellent: 12, good: 18, pass: 10, fail: 5, remark: "" },
  { class: "高一(2)班", subject: "语文", time: "2026-04-18", submitter: "李老师", total: 43, excellent: 10, good: 20, pass: 9,  fail: 4, remark: "需跟进" },
  { class: "高二(1)班", subject: "英语", time: "2026-04-15", submitter: "王老师", total: 46, excellent: 15, good: 16, pass: 11, fail: 4, remark: "" },
  { class: "高二(2)班", subject: "物理", time: "2026-04-12", submitter: "赵老师", total: 44, excellent: 8,  good: 14, pass: 16, fail: 6, remark: "物理拔尖生较少" },
  { class: "高三(1)班", subject: "化学", time: "2026-04-10", submitter: "陈老师", total: 42, excellent: 11, good: 17, pass: 10, fail: 4, remark: "" },
  { class: "高三(2)班", subject: "历史", time: "2026-04-08", submitter: "刘老师", total: 45, excellent: 14, good: 19, pass: 8,  fail: 4, remark: "" },
];

export function LearningAnalysisStatsPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [hvTable, setHvTable] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#f5f5f7" }}>
      <PageHeader
        breadcrumbs={[{ label: "学情分析" }, { label: "学情分析统计表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* 筛选器 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <FilterCard title="班级" options={CONDITION_OPTIONS}>
            <CustomSelect placeholder="请选择" />
          </FilterCard>
          <FilterCard title="学科" options={CONDITION_OPTIONS}>
            <CustomSelect placeholder="请选择" />
          </FilterCard>
          <FilterCard title="学情时间" options={DATE_OPTIONS}>
            {(cond) => (cond === "为空" || cond === "不为空") ? null : <DatePicker dateOnly />}
          </FilterCard>
          <FilterCard title="学情时间" options={DATE_OPTIONS}>
            {(cond) => (cond === "为空" || cond === "不为空") ? null : <DatePicker dateOnly />}
          </FilterCard>
          <FilterCard title="提交人" options={PERSON_OPTIONS}>
            <CustomSelect placeholder="当前用户" />
          </FilterCard>
        </div>

        {/* KPI 汇总指标行 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "分析总数", value: 0,   color: "#111827", bg: "white" },
            { label: "优秀人数", value: 0,   color: "#10b981", bg: "#ecfdf5" },
            { label: "良好人数", value: 0,   color: "#3b82f6", bg: "#eff6ff" },
            { label: "及格人数", value: 0,   color: "#f59e0b", bg: "#fffbeb" },
            { label: "不及格人数", value: 0, color: "#ef4444", bg: "#fef2f2" },
          ].map(({ label, value, color, bg }) => (
            <div key={label}
              className="glass flex flex-col items-center justify-center py-5 gap-1 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: bg, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>{label}</span>
              <span style={{ fontSize: 72, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* 明细表（全宽） */}
        <div className="grid grid-cols-1 gap-4">

          {/* 明细表 */}
          <div
            className="glass flex flex-col overflow-hidden"
            onMouseEnter={() => setHvTable(true)}
            onMouseLeave={() => setHvTable(false)}>
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
              <h3 className="flex-1 min-w-0 truncate font-semibold" style={{ fontSize: 15, color: "#111827" }}>学情分析明细表</h3>
              <ActionBar show={hvTable} actions={[{ Icon: Upload, tip: "导出" }, { Icon: RefreshCw, tip: "刷新" }, { Icon: ArrowUpDown, tip: "排序" }, { Icon: Maximize2, tip: "放大" }]} />
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: "#eff6ff" }}>
                    {TABLE_HEADERS.map(h => (
                      <th key={h} className="px-4 py-3 font-medium whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TABLE_ROWS.map((row, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#1e40af" }}>{row.class}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.subject}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.time}</td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{row.submitter}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center" style={{ fontSize: 15, color: "#374151" }}>{row.total}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span style={{ fontSize: 15, color: "#10b981", background: "#ecfdf5", borderRadius: 4, padding: "2px 8px" }}>{row.excellent}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span style={{ fontSize: 15, color: "#3b82f6", background: "#eff6ff", borderRadius: 4, padding: "2px 8px" }}>{row.good}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span style={{ fontSize: 15, color: "#f59e0b", background: "#fffbeb", borderRadius: 4, padding: "2px 8px" }}>{row.pass}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span style={{ fontSize: 15, color: "#ef4444", background: "#fef2f2", borderRadius: 4, padding: "2px 8px" }}>{row.fail}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap" style={{ fontSize: 15, color: row.remark ? "#374151" : "#9ca3af" }}>
                        {row.remark || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-gray-100" style={{ fontSize: 14, color: "#374151" }}>
              <div className="flex items-center gap-3">
                <button className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">📋</button>
                <div className="flex items-center gap-1">
                  <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none" style={{ color: "#374151" }}>
                    {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} 条/页</option>)}
                  </select>
                  <span style={{ color: "#6b7280" }}>共 0 条</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50">‹</button>
                <input type="text" defaultValue="1" className="w-8 border border-gray-200 rounded-lg text-center outline-none text-xs" style={{ color: "#374151" }} />
                <span style={{ color: "#6b7280" }}>/ 1</span>
                <button className="px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50" style={{ color: "#374151" }}>›</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
