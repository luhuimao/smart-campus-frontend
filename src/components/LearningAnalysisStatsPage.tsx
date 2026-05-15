"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";
import { DashboardTable, PhotoList } from "./ui/DashboardTable";
import type { ColumnDef } from "./ui/DashboardTable";
import { useLearningAnalysis, type LearningAnalysisRecord, type LearningAnalysisFilters } from "@/hooks/use-research-dashboard";

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

function CustomSelect({ placeholder, options, value, onChange }: {
  placeholder: string;
  options?: string[];
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        className="w-full outline-none appearance-none pr-8 py-1.5 pl-3 rounded-lg"
        style={{ border: "1px solid #e5e7eb", color: value ? "#374151" : "#9ca3af", background: "white", fontSize: 15 }}
        value={value ?? ""}
        onChange={e => onChange?.(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {options?.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronRight size={12} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

// ── LearningAnalysisDrawer ────────────────────────────────────────
function LearningAnalysisDrawer({ record, onClose }: { record: LearningAnalysisRecord | null; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: 520, maxWidth: "100vw", background: "#fff",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}>
        {record && (
          <>
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-500">{record.班级 || "—"}</span>
                  {record.学科 && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: "rgba(19,194,194,0.08)", color: "#0891b2" }}>
                        {record.学科}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{record.学生姓名 || "—"}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "班级",         value: record.班级 },
                    { label: "学生姓名",     value: record.学生姓名 },
                    { label: "学科",         value: record.学科 },
                    { label: "提交人",       value: record.提交人 },
                    { label: "学情分析开始时间", value: record.学情分析开始时间 ? record.学情分析开始时间.slice(0, 16) : "" },
                    { label: "学情分析结束时间", value: record.学情分析结束时间 ? record.学情分析结束时间.slice(0, 16) : "" },
                    { label: "提交时间",     value: record.提交时间 ? record.提交时间.slice(0, 16) : "" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              {record.教师指导措施 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">教师指导措施</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.教师指导措施}</p>
                </section>
              )}
              {record.掌握较好的知识点.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">掌握较好的知识点（{record.掌握较好的知识点.length} 张）</p>
                  <PhotoList photos={record.掌握较好的知识点} />
                </section>
              )}
              {record.掌握不足的知识点.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">掌握不足的知识点（{record.掌握不足的知识点.length} 张）</p>
                  <PhotoList photos={record.掌握不足的知识点} />
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export function LearningAnalysisStatsPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LearningAnalysisRecord | null>(null);
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");

  const filters = useMemo<LearningAnalysisFilters>(() => ({
    className: classFilter,
    subject: subjectFilter,
  }), [classFilter, subjectFilter]);

  const { raw, filterOptions, isPending, isError } = useLearningAnalysis(filters);

  const sorted = [...raw].sort((a, b) => {
    const av = a.学情分析开始时间 ?? ""; const bv = b.学情分析开始时间 ?? "";
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalRows = sorted.length;
  const sliced = sorted.slice((page - 1) * pageSize, page * pageSize);

  const cols = useMemo((): ColumnDef<LearningAnalysisRecord>[] => [
    { key: "班级",         header: "班级",         render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#1e40af" }}>{r.班级 || "—"}</span> },
    { key: "学生姓名",     header: "学生姓名",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学生姓名 || "—"}</span> },
    { key: "学科",         header: "学科",         render: r => r.学科 ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: "rgba(19,194,194,0.08)", color: "#0891b2" }}>{r.学科}</span>
    ) : <span className="text-gray-300">—</span> },
    { key: "学情分析开始时间", header: "开始时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学情分析开始时间 ? r.学情分析开始时间.slice(0, 16) : "—"}</span> },
    { key: "学情分析结束时间", header: "结束时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学情分析结束时间 ? r.学情分析结束时间.slice(0, 16) : "—"}</span> },
    { key: "掌握较好的知识点", header: "掌握较好的知识点", minWidth: 80, render: r => <PhotoList photos={r.掌握较好的知识点} /> },
    { key: "掌握不足的知识点", header: "掌握不足的知识点", minWidth: 80, render: r => <PhotoList photos={r.掌握不足的知识点} /> },
    { key: "教师指导措施", header: "教师指导措施", minWidth: 160, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 160 }} title={r.教师指导措施}>{r.教师指导措施 || "—"}</span> },
    { key: "提交人",       header: "提交人",       render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.提交人 || "—"}</span> },
    { key: "提交时间",     header: "提交时间",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#9ca3af" }}>{r.提交时间 ? r.提交时间.slice(0, 16) : "—"}</span> },
  ], []);

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
            <CustomSelect
              placeholder="请选择"
              options={filterOptions.classNames}
              value={classFilter}
              onChange={v => { setClassFilter(v); setPage(1); }}
            />
          </FilterCard>
          <FilterCard title="学科" options={CONDITION_OPTIONS}>
            <CustomSelect
              placeholder="请选择"
              options={filterOptions.subjects}
              value={subjectFilter}
              onChange={v => { setSubjectFilter(v); setPage(1); }}
            />
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
            { label: "分析总数", value: isPending ? "—" : totalRows, color: "#111827", bg: "white" },
            { label: "班级数",   value: isPending ? "—" : filterOptions.classNames.length, color: "#10b981", bg: "#ecfdf5" },
            { label: "学科数",   value: isPending ? "—" : filterOptions.subjects.length,   color: "#3b82f6", bg: "#eff6ff" },
            { label: "有知识点图片", value: isPending ? "—" : raw.filter(r => r.掌握较好的知识点.length > 0 || r.掌握不足的知识点.length > 0).length, color: "#f59e0b", bg: "#fffbeb" },
            { label: "有指导措施", value: isPending ? "—" : raw.filter(r => r.教师指导措施).length, color: "#8b5cf6", bg: "#f5f3ff" },
          ].map(({ label, value, color, bg }) => (
            <div key={label}
              className="glass flex flex-col items-center justify-center py-5 gap-1 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: bg, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>{label}</span>
              <span style={{ fontSize: 56, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* 明细表 */}
        <DashboardTable
          title="学情分析明细表"
          columns={cols}
          rows={sliced}
          isPending={isPending}
          isError={isError}
          sortAsc={sortAsc}
          onSortToggle={() => { setSortAsc(v => !v); setPage(1); }}
          page={page}
          pageSize={pageSize}
          totalRows={totalRows}
          onPageChange={setPage}
          onPageSizeChange={n => { setPageSize(n); setPage(1); }}
          onRowClick={setSelectedRecord}
        />

      </div>

      <LearningAnalysisDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
}
