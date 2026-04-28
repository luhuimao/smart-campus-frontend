"use client";

import { ChevronDown, LayoutGrid, List, AlignLeft, RefreshCw, MoreHorizontal, Plus, Download, Trash2, Clock, Search, Filter } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";

const teal = "#00b095";

const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

type Mode = "add-only" | "add-manage-own" | "all-permitted";

const modeOptions: { value: Mode; label: string }[] = [
  { value: "add-only",       label: "仅添加数据" },
  { value: "add-manage-own", label: "添加并管理本人数据" },
  { value: "all-permitted",  label: "全部有权限的数据" },
];

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function FSelect({ options, placeholder }: { options: string[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select
        className="form-input appearance-none"
        defaultValue=""
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
      >
        <option value="" disabled>{placeholder ?? ""}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
    </div>
  );
}

function UploadField() {
  return (
    <div className="flex gap-2">
      <div className="flex-1 border border-dashed border-gray-200 rounded-[10px] px-4 py-3 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
        <p className="text-sm text-gray-400 text-center leading-relaxed">
          <span className="font-semibold" style={{ color: teal }}>选择</span> 拖拽或单击后粘贴图片，单张20MB以内
        </p>
      </div>
      <button className="w-12 border border-gray-200 rounded-[10px] flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M9 3v18"/>
        </svg>
      </button>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="relative flex items-center justify-center my-2" style={{ height: 32 }}>
      <div className="absolute inset-0 rounded" style={{ background: "linear-gradient(90deg, transparent 0%, #00b095 10%, #00b095 90%, transparent 100%)" }} />
      <div className="absolute left-[9%] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45" style={{ background: "white", opacity: 0.6 }} />
      <div className="absolute right-[9%] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45" style={{ background: "white", opacity: 0.6 }} />
      <span className="relative text-sm font-semibold text-white tracking-wider">{title}</span>
    </div>
  );
}

const mockRecords = [
  { id: 1, cls: "高一(1)班", student: "张三", subject: "数学", startTime: "2026-04-01", endTime: "2026-04-20", goodPoints: "函数、三角", weakPoints: "导数", guidance: "加强导数练习", submitter: "张老师", submitTime: "2026-04-20 17:00", updateTime: "2026-04-20 17:00" },
  { id: 2, cls: "高一(2)班", student: "李四", subject: "语文", startTime: "2026-04-01", endTime: "2026-04-18", goodPoints: "阅读理解", weakPoints: "作文", guidance: "写作专项训练", submitter: "李老师", submitTime: "2026-04-18 16:30", updateTime: "2026-04-18 16:30" },
  { id: 3, cls: "高一(1)班", student: "王五", subject: "英语", startTime: "2026-03-15", endTime: "2026-04-15", goodPoints: "听力、口语", weakPoints: "语法", guidance: "每日语法练习", submitter: "王老师", submitTime: "2026-04-15 15:00", updateTime: "2026-04-15 15:00" },
];

const COLUMNS = ["班级", "学生姓名", "学科", "学情分析开始时间", "学情分析结束时间", "掌握较好的知识点", "掌握不足的知识点", "教师指导措施", "提交人", "提交时间", "更新时间"];

function RecordTable({ records }: { records: typeof mockRecords }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 20;

  const filtered = records.filter(
    (r) => !search || r.student.includes(search) || r.cls.includes(search) || r.subject.includes(search)
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const allChecked = paged.length > 0 && paged.every((r) => selected.has(r.id));
  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) paged.forEach((r) => next.delete(r.id));
    else paged.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggle = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2.5 flex justify-between items-center border-b border-gray-100 bg-white shrink-0">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: teal }}>
            <Plus className="w-3.5 h-3.5" /> 添加
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            <Download className="w-3.5 h-3.5" /> 导出
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> 删除
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            <Clock className="w-3.5 h-3.5" /> 操作记录
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-gray-300 rounded-md px-2.5 py-1 gap-1.5 w-56 bg-white">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="搜索数据"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="text-sm outline-none w-full bg-transparent"
            />
            <ChevronDown className="w-3 h-3 text-gray-400 shrink-0" />
          </div>
          <button className="flex items-center gap-1.5 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> 筛选
          </button>
          <div className="flex items-center gap-3 pl-3 ml-1 border-l border-gray-200 text-gray-400">
            <LayoutGrid className="w-4 h-4 cursor-pointer rounded p-0.5" style={{ color: teal, background: "rgba(0,176,149,0.08)" }} />
            <List className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
            <AlignLeft className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
            <RefreshCw className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr>
              <th className="w-10 px-3 py-2.5 bg-gray-50 border-b border-r border-gray-200 text-left">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 cursor-pointer" style={{ accentColor: teal }} />
              </th>
              {COLUMNS.map((col) => (
                <th key={col} className="px-3 py-2.5 bg-gray-50 border-b border-r border-gray-200 text-left text-[13px] font-medium text-gray-700 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length + 1}>
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <svg viewBox="0 0 200 150" fill="none" className="w-48 h-36 mb-3">
                      <path d="M100 50 L0 80 L200 80 Z" fill="rgba(255,243,176,0.3)" />
                      <path d="M20 130 Q100 110 180 130" stroke="#e6e6e6" strokeWidth="2" />
                      <rect x="90" y="55" width="20" height="70" fill="#d9e3f0" rx="2" />
                      <rect x="88" y="50" width="24" height="6" fill="#bfcedd" rx="1" />
                      <circle cx="100" cy="45" r="8" fill="#d9e3f0" />
                      <rect x="98" y="100" width="4" height="8" fill="#fff" rx="1" />
                      <circle cx="65" cy="120" r="8" fill="#e6e6e6" />
                      <circle cx="145" cy="125" r="6" fill="#e6e6e6" />
                    </svg>
                    <span className="text-sm">暂无数据</span>
                  </div>
                </td>
              </tr>
            ) : paged.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors" style={selected.has(r.id) ? { background: "rgba(0,176,149,0.04)" } : {}}>
                <td className="px-3 py-2.5 border-b border-r border-gray-100">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="w-4 h-4 rounded border-gray-300 cursor-pointer" style={{ accentColor: teal }} />
                </td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-800 whitespace-nowrap">{r.cls}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-800 whitespace-nowrap">{r.student}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.subject}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.startTime}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.endTime}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 max-w-[160px] truncate">{r.goodPoints}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 max-w-[160px] truncate">{r.weakPoints}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 max-w-[200px] truncate">{r.guidance}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.submitter}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.submitTime}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.updateTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-3 py-2.5 border-t border-gray-100 bg-white shrink-0 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-gray-400 border-r border-gray-200 pr-4">
            <List className="w-4 h-4 cursor-pointer hover:text-gray-600" />
            <AlignLeft className="w-4 h-4 cursor-pointer hover:text-gray-600" />
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center border border-gray-200 rounded px-2 py-0.5 cursor-pointer hover:bg-gray-50 text-sm gap-1.5">
              <span>{pageSize} 条/页</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
            <span className="ml-3 text-gray-500">共 {filtered.length} 条</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded disabled:text-gray-300 hover:enabled:text-gray-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-white text-gray-700 text-sm">{page}</div>
          <span className="text-gray-400 px-1">/ {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded disabled:text-gray-300 hover:enabled:text-gray-700 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ModeSelector({ value, onChange }: { value: Mode; onChange: (v: Mode) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as Mode)}
        className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold border border-gray-200 rounded-xl bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors"
        style={{ color: "#374151" }}
      >
        {modeOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function LearningAnalysisTablePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [mode, setMode] = useState<Mode>("add-only");
  const ownRecords = mockRecords.filter((r) => r.submitter === "张老师");

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        centered
        breadcrumbs={[{ label: "学情分析" }, { label: "学情分析表", active: true }]}
        left={<ModeSelector value={mode} onChange={setMode} />}
        onMenuOpen={onMenuOpen}
      />

      {mode === "add-only" ? (
        <>
          <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
            <main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
              <div className="rounded-2xl md:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white p-5 md:p-10">

                <SectionHeader title="南宁市宏德高级中学高一年级学情分析表" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mt-8">

                  <Field label="班级" required>
                    <FSelect options={["高一(1)班", "高一(2)班", "高一(3)班"]} />
                  </Field>

                  <Field label="学生姓名" required>
                    <FSelect options={[]} />
                  </Field>

                  <Field label="学科" required>
                    <FSelect options={["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"]} />
                  </Field>

                  <Field label="学情分析开始时间" required>
                    <DatePicker dateOnly />
                  </Field>

                  <Field label="学情分析结束时间" required>
                    <DatePicker dateOnly />
                  </Field>

                  <Field label="掌握较好的知识点" required>
                    <UploadField />
                  </Field>

                  <Field label="掌握不足的知识点" required>
                    <UploadField />
                  </Field>

                  <div className="md:col-start-2">
                    <Field label="教师指导措施" required>
                      <textarea
                        rows={7}
                        placeholder="根据薄弱知识点或题块给出具体指导措施"
                        className="form-input resize-none"
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                      />
                    </Field>
                  </div>

                </div>
              </div>
            </main>
          </div>

          <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4">
            <button
              className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
              style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
            >
              提交
            </button>
            <button className="btn-secondary">保存草稿</button>
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-hidden bg-[#f0f2f5] p-4">
          <div className="h-full rounded-lg overflow-hidden shadow-sm bg-white flex flex-col">
            <RecordTable records={mode === "add-manage-own" ? ownRecords : mockRecords} />
          </div>
        </div>
      )}
    </div>
  );
}
