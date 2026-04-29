"use client";

import { ChevronDown, Calendar, Plus, QrCode, X, Search, MoreHorizontal, Download, Trash2, Clock, Filter, LayoutGrid, List, AlignLeft, RefreshCw } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "./PageHeader";

const teal = "#00b095";

const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

type Mode = "add-only" | "add-manage-own" | "leader-manage" | "all-permitted";

const modeOptions: { value: Mode; label: string }[] = [
  { value: "add-only",        label: "仅添加数据" },
  { value: "add-manage-own",  label: "添加并管理本人数据" },
  { value: "leader-manage",   label: "组长管理本组数据" },
  { value: "all-permitted",   label: "全部有权限的数据" },
];

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-base font-semibold" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 -mt-0.5">{hint}</p>}
      {children}
    </div>
  );
}

function Input({ placeholder = "" }: { placeholder?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="form-input"
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function FSelect({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select
        className="form-input appearance-none"
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
      >
        <option value=""></option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Textarea({ rows = 5 }: { rows?: number }) {
  return (
    <textarea
      rows={rows}
      className="form-input resize-none"
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function MemberPicker({ minHeight }: { minHeight?: number }) {
  return (
    <button
      className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600"
      style={{ minHeight: minHeight ?? 44 }}
    >
      <Plus className="w-4 h-4 opacity-60" /> 选择成员
    </button>
  );
}

const mockRecords = [
  { id: 1, semester: "2023-2024第一学期", title: "高一数学第三单元函数专题备课", subject: "数学", date: "2024-03-15", week: "第10周", location: "教研室301", group: "高一数学组", leader: "卢辉茂", host: "卢辉茂", recorder: "卢辉茂", participants: "卢辉茂、张明华、李思远", expected: 8, actual: 8, absent: "无", content: "讨论函数单调性教学方案", photo: "现场照片1.jpg", attachment: "教案.docx", department: "数学教研组", attendCount: 10, submitter: "卢辉茂", submitTime: "2024-03-15 17:30", updateTime: "2024-03-15 17:30", creator: "卢辉茂", status: "已提交" },
  { id: 2, semester: "2023-2024第一学期", title: "三角函数图像与性质集体备课",   subject: "数学", date: "2024-03-08", week: "第9周",  location: "教研室301", group: "高一数学组", leader: "卢辉茂", host: "卢辉茂", recorder: "卢辉茂", participants: "卢辉茂、张明华",         expected: 6, actual: 5, absent: "李思远请假", content: "研讨正弦余弦图像画法", photo: "",              attachment: "课件.pptx", department: "数学教研组", attendCount: 9,  submitter: "卢辉茂", submitTime: "",              updateTime: "2024-03-08 16:00", creator: "卢辉茂", status: "草稿"  },
  { id: 3, semester: "2023-2024第一学期", title: "二次函数复习课备课活动",       subject: "数学", date: "2024-02-28", week: "第7周",  location: "办公室205", group: "高二数学组", leader: "张明华", host: "张明华", recorder: "王小燕", participants: "张明华、王小燕、陈刚",    expected: 7, actual: 7, absent: "无",       content: "整理二次函数考点与典型例题", photo: "照片2.jpg",    attachment: "",           department: "数学教研组", attendCount: 8,  submitter: "张明华", submitTime: "2024-02-28 18:00", updateTime: "2024-02-28 18:00", creator: "张明华", status: "已提交" },
  { id: 4, semester: "2023-2024第一学期", title: "导数与微分综合应用专题",       subject: "数学", date: "2024-02-20", week: "第6周",  location: "教研室302", group: "高三数学组", leader: "李思远", host: "李思远", recorder: "陈刚",   participants: "李思远、陈刚、吴磊",      expected: 9, actual: 9, absent: "无",       content: "分析高考导数大题解题思路",   photo: "照片3.jpg",    attachment: "专题讲义.pdf", department: "数学教研组", attendCount: 12, submitter: "李思远", submitTime: "2024-02-20 17:00", updateTime: "2024-02-21 09:00", creator: "李思远", status: "已提交" },
  { id: 5, semester: "2023-2024第一学期", title: "期中考试复习备课研讨",         subject: "数学", date: "2024-02-14", week: "第5周",  location: "会议室101", group: "高二数学组", leader: "张明华", host: "王小燕", recorder: "王小燕", participants: "张明华、王小燕、李思远、陈刚", expected: 10, actual: 9, absent: "吴磊出差", content: "制定期中复习计划与分工", photo: "照片4.jpg",    attachment: "复习计划.docx", department: "数学教研组", attendCount: 11, submitter: "王小燕", submitTime: "2024-02-14 16:30", updateTime: "2024-02-14 16:30", creator: "王小燕", status: "已提交" },
];

const COLUMNS = ["学期", "主题", "备课学科", "时间", "周次", "地点", "备课组", "备课组长","主持人","记录人","参与人员","应到人数","实到人数","未到场人员情况说明","内容记录","照片","附件","学科部门","备课参加次数","提交人","提交时间","更新时间"];

function RecordTable({ records, pageSize = 20, variant = "full" }: { records: typeof mockRecords; pageSize?: number; variant?: "full" | "leader" | "all" }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const filtered = records.filter(
    (r) => !search || r.title.includes(search) || r.subject.includes(search)
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
      {/* ── Toolbar ── */}
      <div className="px-3 py-2.5 flex justify-between items-center border-b border-gray-100 bg-white shrink-0">
        {/* Left actions */}
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ backgroundColor: teal }}
          >
            <Plus className="w-3.5 h-3.5" /> 添加
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors">
            <Download className="w-3.5 h-3.5" /> 导出
          </button>
          {(variant === "full" || variant === "all") && <>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> 删除
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              <Clock className="w-3.5 h-3.5" /> 操作记录
            </button>
          </>}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
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
          {/* Filter */}
          <button className="flex items-center gap-1.5 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> 筛选
          </button>
          {/* View toggles */}
          <div className="flex items-center gap-3 pl-3 ml-1 border-l border-gray-200 text-gray-400">
            <LayoutGrid className="w-4 h-4 cursor-pointer rounded p-0.5" style={{ color: teal, background: "rgba(0,176,149,0.08)" }} />
            <List className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
            <AlignLeft className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
            <RefreshCw className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
            <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-600 transition-colors" />
          </div>
        </div>
      </div>

      {/* ── Table ── */}
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
                      <rect x="64" y="125" width="2" height="8" fill="#e6e6e6" />
                      <circle cx="145" cy="125" r="6" fill="#e6e6e6" />
                      <rect x="144" y="128" width="2" height="6" fill="#e6e6e6" />
                    </svg>
                    <span className="text-sm">暂无数据</span>
                  </div>
                </td>
              </tr>
            ) : paged.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-gray-50 transition-colors"
                style={selected.has(r.id) ? { background: "rgba(0,176,149,0.04)" } : {}}
              >
                <td className="px-3 py-2.5 border-b border-r border-gray-100 shrink-0">
                  <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="w-4 h-4 rounded border-gray-300 cursor-pointer" style={{ accentColor: teal }} />
                </td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.semester}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-800 font-medium whitespace-nowrap max-w-[180px] truncate">{r.title}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.subject}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.date}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.week}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.location}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.group}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.leader}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.host}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.recorder}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 max-w-[160px] truncate">{r.participants}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap text-center">{r.expected}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap text-center">{r.actual}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 max-w-[120px] truncate">{r.absent || "—"}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 max-w-[160px] truncate">{r.content}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.photo || "—"}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.attachment || "—"}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.department}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap text-center">{r.attendCount}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.submitter}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.submitTime || "—"}</td>
                <td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.updateTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
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
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded disabled:text-gray-300 hover:enabled:text-gray-700 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-white text-gray-700 text-sm">{page}</div>
          <span className="text-gray-400 px-1">/ {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1 rounded disabled:text-gray-300 hover:enabled:text-gray-700 transition-colors"
          >
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

export function LessonPrepRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [recorder, setRecorder] = useState<string | null>("卢辉茂");
  const [mode, setMode] = useState<Mode>("add-only");

  const ownRecords    = mockRecords.filter((r) => r.creator === "卢辉茂");
  const groupRecords  = mockRecords.filter((r) => r.group === "高一数学组");

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        breadcrumbs={[{ label: "备课活动" }, { label: "备课组活动记录", active: true }]}
        left={<ModeSelector value={mode} onChange={setMode} />}
        onMenuOpen={onMenuOpen}
      />

      <div className={mode === "add-only" ? "flex-1 overflow-y-auto bg-[#f5f5f7] pb-24" : "flex-1 overflow-hidden bg-[#f0f2f5] p-4"}>
        {/* 仅添加数据 */}
        {mode === "add-only" && (
          <main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
            <div className="rounded-2xl md:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white p-5 md:p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                <Field label="主题" required><Input /></Field>
                <Field label="备课学科" required>
                  <FSelect options={["数学", "语文", "英语", "物理", "化学", "生物", "历史", "地理", "政治"]} />
                </Field>

                <Field label="时间" required>
                  <div className="relative">
                    <Input />
                    <Calendar className="w-4 h-4 absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
                  </div>
                </Field>

                <Field label="周次" required>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-sm text-gray-400 pointer-events-none">第</span>
                    <input
                      type="text"
                      className="form-input px-8"
                      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                    />
                    <span className="absolute right-3.5 text-sm text-gray-400 pointer-events-none">周</span>
                  </div>
                </Field>

                <Field label="地点" required><Input /></Field>
                <Field label="备课组" required>
                  <FSelect options={["高一数学组", "高二数学组", "高三数学组"]} />
                </Field>

                <Field label="备课组长" required><MemberPicker /></Field>
                <Field label="主持人" required><MemberPicker /></Field>

                <Field label="记录人" required>
                  {recorder ? (
                    <div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center flex-wrap gap-2 min-h-[44px] transition-all">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#fff1f2", color: "#dc2626", borderColor: "#fecaca" }}>
                        <div className="w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center text-[10px] font-bold">卢</div>
                        {recorder}
                        <button className="ml-1 opacity-60 hover:opacity-100 transition-opacity" onClick={() => setRecorder(null)}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600"
                      style={{ minHeight: 44 }}
                      onClick={() => setRecorder("卢辉茂")}
                    >
                      <Plus className="w-4 h-4 opacity-60" /> 选择成员
                    </button>
                  )}
                </Field>

                <Field label="参与人员" required><MemberPicker minHeight={64} /></Field>
                <Field label="应到人数" required><Input /></Field>
                <Field label="实到人数" required><Input /></Field>
                <Field label="未到场人员情况说明" required><Textarea rows={5} /></Field>
                <Field label="内容记录" required><Textarea rows={5} /></Field>

                <Field label="照片" required hint="请上传现场照片">
                  <div className="flex gap-2">
                    <div className="flex-1 border border-dashed border-gray-200 rounded-[10px] px-4 py-3 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                      <p className="text-sm text-gray-400 text-center leading-relaxed">
                        <span className="font-semibold" style={{ color: teal }}>选择</span> 拖拽或单击后粘贴图片，单张20MB以内
                      </p>
                    </div>
                    <button className="w-12 border border-gray-200 rounded-[10px] flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400">
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                </Field>

                <Field label="附件" hint="教案、课件、教学设计、备课记录等">
                  <div className="border border-dashed border-gray-200 rounded-[10px] px-4 py-3 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold" style={{ color: teal }}>选择</span> 拖拽或单击后粘贴文件，单个20MB以内
                    </p>
                  </div>
                </Field>
              </div>

              <div className="mt-10 pt-6" style={{ borderTop: "1px solid #f3f4f6" }}>
                <Field label="学科部门" required>
                  <button
                    className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600"
                    style={{ minHeight: 44 }}
                  >
                    <Plus className="w-4 h-4 opacity-60" /> 选择部门
                  </button>
                </Field>
              </div>

              <div className="mt-8 pt-6 flex justify-start gap-3" style={{ borderTop: "1px dashed #e5e7eb" }}>
                <button
                  className="px-10 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
                  style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
                >
                  提交登记
                </button>
                <button className="btn-secondary">
                  保存草稿
                </button>
              </div>
            </div>
          </main>
        )}

        {(mode === "add-manage-own" || mode === "leader-manage" || mode === "all-permitted") && (
          <div className="h-full rounded-lg overflow-hidden shadow-sm bg-white flex flex-col">
            <RecordTable
              records={
                mode === "add-manage-own" ? ownRecords
                : mode === "leader-manage" ? groupRecords
                : mockRecords
              }
              variant={
                mode === "add-manage-own" ? "full"
                : mode === "leader-manage" ? "leader"
                : "all"
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
