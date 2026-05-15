"use client";

import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";
import { DashboardTable, PhotoList } from "./ui/DashboardTable";
import type { ColumnDef } from "./ui/DashboardTable";
import { useLearningAnalysis, type LearningAnalysisRecord, type LearningAnalysisFilters } from "@/hooks/use-research-dashboard";

const filterSelectStyle: React.CSSProperties = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.5rem center",
  backgroundSize: "0.75rem",
  paddingRight: "1.6rem",
  appearance: "none" as const,
};

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
                    { label: "班级",             value: record.班级 },
                    { label: "学生姓名",         value: record.学生姓名 },
                    { label: "学科",             value: record.学科 },
                    { label: "提交人",           value: record.提交人 },
                    { label: "学情分析开始时间", value: record.学情分析开始时间 ? record.学情分析开始时间.slice(0, 16) : "" },
                    { label: "学情分析结束时间", value: record.学情分析结束时间 ? record.学情分析结束时间.slice(0, 16) : "" },
                    { label: "提交时间",         value: record.提交时间 ? record.提交时间.slice(0, 16) : "" },
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

// ── LearningAnalysisStatsPage ─────────────────────────────────────
export function LearningAnalysisStatsPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<LearningAnalysisRecord | null>(null);
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const filters = useMemo<LearningAnalysisFilters>(() => ({
    className: classFilter,
    subject: subjectFilter,
  }), [classFilter, subjectFilter]);

  const { raw, filterOptions, isPending, isError } = useLearningAnalysis(filters);

  const hasFilter = !!(classFilter || subjectFilter || startDate || endDate);

  function clearAll() {
    setClassFilter(""); setSubjectFilter("");
    setStartDate(null); setEndDate(null);
    setPage(1);
  }

  const dateFiltered = useMemo(() => {
    if (!startDate && !endDate) return raw;
    return raw.filter(r => {
      if (!r.学情分析开始时间) return false;
      const d = new Date(r.学情分析开始时间);
      if (isNaN(d.getTime())) return false;
      if (startDate) { const s = new Date(startDate); s.setHours(0, 0, 0, 0); if (d < s) return false; }
      if (endDate)   { const e = new Date(endDate);   e.setHours(23, 59, 59, 999); if (d > e) return false; }
      return true;
    });
  }, [raw, startDate, endDate]);

  const sorted = [...dateFiltered].sort((a, b) => {
    const av = a.学情分析开始时间 ?? ""; const bv = b.学情分析开始时间 ?? "";
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalRows = sorted.length;
  const sliced = sorted.slice((page - 1) * pageSize, page * pageSize);

  const cols = useMemo((): ColumnDef<LearningAnalysisRecord>[] => [
    { key: "班级",             header: "班级",     render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#1e40af" }}>{r.班级 || "—"}</span> },
    { key: "学生姓名",         header: "学生姓名", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学生姓名 || "—"}</span> },
    { key: "学科",             header: "学科",     render: r => r.学科 ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: "rgba(19,194,194,0.08)", color: "#0891b2" }}>{r.学科}</span>
    ) : <span className="text-gray-300">—</span> },
    { key: "学情分析开始时间", header: "开始时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学情分析开始时间 ? r.学情分析开始时间.slice(0, 16) : "—"}</span> },
    { key: "学情分析结束时间", header: "结束时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学情分析结束时间 ? r.学情分析结束时间.slice(0, 16) : "—"}</span> },
    { key: "掌握较好的知识点", header: "掌握较好的知识点", minWidth: 80, render: r => <PhotoList photos={r.掌握较好的知识点} /> },
    { key: "掌握不足的知识点", header: "掌握不足的知识点", minWidth: 80, render: r => <PhotoList photos={r.掌握不足的知识点} /> },
    { key: "教师指导措施",     header: "教师指导措施", minWidth: 160, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 160 }} title={r.教师指导措施}>{r.教师指导措施 || "—"}</span> },
    { key: "提交人",           header: "提交人",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.提交人 || "—"}</span> },
    { key: "提交时间",         header: "提交时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#9ca3af" }}>{r.提交时间 ? r.提交时间.slice(0, 16) : "—"}</span> },
  ], []);

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#f5f5f7" }}>
      <PageHeader
        breadcrumbs={[{ label: "学情分析" }, { label: "学情分析统计表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">

        {/* 筛选栏 */}
        <div className="glass rounded-[20px] px-4 py-3 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 shrink-0">班级</span>
            <select
              value={classFilter}
              onChange={e => { setClassFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-white/60 border border-gray-200/60 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer hover:bg-white/80 transition-colors"
              style={filterSelectStyle}>
              <option value="">全部</option>
              {filterOptions.classNames.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 shrink-0">学科</span>
            <select
              value={subjectFilter}
              onChange={e => { setSubjectFilter(e.target.value); setPage(1); }}
              className="appearance-none bg-white/60 border border-gray-200/60 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-700 outline-none cursor-pointer hover:bg-white/80 transition-colors"
              style={filterSelectStyle}>
              <option value="">全部</option>
              {filterOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 shrink-0">开始时间</span>
            <DatePicker dateOnly value={startDate} onChange={d => { setStartDate(d); setPage(1); }} placeholder="不限" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 shrink-0">结束时间</span>
            <DatePicker dateOnly value={endDate} onChange={d => { setEndDate(d); setPage(1); }} placeholder="不限" />
          </div>
          {hasFilter && (
            <button onClick={clearAll}
              className="ml-auto text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded-lg hover:bg-black/[0.04]">
              清除全部
            </button>
          )}
        </div>

        {/* KPI 汇总 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "分析总数",   value: isPending ? "—" : totalRows,                                                                                                    color: "#111827", bg: "white" },
            { label: "班级数",     value: isPending ? "—" : filterOptions.classNames.length,                                                                              color: "#10b981", bg: "#ecfdf5" },
            { label: "学科数",     value: isPending ? "—" : filterOptions.subjects.length,                                                                                color: "#3b82f6", bg: "#eff6ff" },
            { label: "有知识点图片", value: isPending ? "—" : raw.filter(r => r.掌握较好的知识点.length > 0 || r.掌握不足的知识点.length > 0).length,                    color: "#f59e0b", bg: "#fffbeb" },
            { label: "有指导措施", value: isPending ? "—" : raw.filter(r => !!r.教师指导措施).length,                                                                    color: "#8b5cf6", bg: "#f5f3ff" },
          ].map(({ label, value, color, bg }) => (
            <div key={label}
              className="glass flex flex-col items-center justify-center py-5 gap-1 transition-all duration-200 hover:-translate-y-0.5"
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
