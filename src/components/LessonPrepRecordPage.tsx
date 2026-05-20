"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { ChevronDown, Plus, X, Search, Upload, Download, Trash2, Clock, Filter, LayoutGrid, List, AlignLeft, RefreshCw, MoreHorizontal, Menu } from "lucide-react";
import { useStaffDirectory, useCourses, useLessonPrepareGroups } from "@/hooks/use-research-dashboard";
import { PageHeader } from "./PageHeader";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

type Mode = "add-only" | "add-manage-own" | "leader-manage" | "all-permitted";
const modeOptions: { value: Mode; label: string }[] = [
  { value: "add-only", label: "仅添加数据" }, { value: "add-manage-own", label: "添加并管理本人数据" },
  { value: "leader-manage", label: "组长管理本组数据" }, { value: "all-permitted", label: "全部有权限的数据" },
];

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (<div className="space-y-1.5"><label className="block text-base font-semibold" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{hint && <p className="text-xs text-gray-400 -mt-0.5">{hint}</p>}{children}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input type="text" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options, loading }: { value: string; onChange: (v: string) => void; options: string[]; loading?: boolean }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} disabled={loading}><option value="" disabled>{loading ? "加载中..." : ""}</option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [timeStr, setTimeStr] = useState(value ? value.slice(11, 16) : `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  useEffect(() => { function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); } function onClick(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); } if (open) { document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick); } return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); }; }, [open]);
  const selectDay = (day: number) => { const m = String(viewMonth).padStart(2, "0"); const d = String(day).padStart(2, "0"); onChange(`${viewYear}-${m}-${d}T${timeStr}`); setOpen(false); };
  const selectNow = () => { const n = new Date(); const y = n.getFullYear(); const m = String(n.getMonth() + 1).padStart(2, "0"); const d = String(n.getDate()).padStart(2, "0"); const t = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`; setTimeStr(t); onChange(`${y}-${m}-${d}T${t}`); setOpen(false); };
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate(); const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const cells: (number | null)[] = []; for (let i = 0; i < firstDow; i++) cells.push(null); for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const prevMonth = () => { if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1); } else setViewMonth(viewMonth + 1); };
  const display = value ? value.replace("T", " ").slice(0, 16) : "";
  return (<div ref={containerRef} className="relative"><input type="text" readOnly value={display} placeholder="请选择日期时间" className="form-input cursor-pointer" style={{ color: value ? "#374151" : "#9ca3af" }} onClick={() => setOpen(!open)} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
    {open && (<div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex gap-4" style={{ width: 380 }}><div className="flex-1"><div className="flex items-center justify-between mb-2"><button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">‹</button><span className="text-base font-medium text-gray-700">{viewYear}年{viewMonth}月</span><button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">›</button></div><div className="grid grid-cols-7 gap-0.5">{["日","一","二","三","四","五","六"].map((w) => (<div key={w} className="text-center text-xs text-gray-400 py-0.5">{w}</div>))}{cells.map((c, i) => (<div key={i} className={`text-center py-1 text-sm rounded-md ${c ? "cursor-pointer hover:bg-gray-100 text-gray-700" : ""}`} onClick={() => c && selectDay(c)}>{c ?? ""}</div>))}</div></div><div className="flex flex-col gap-3 border-l border-gray-100 pl-4" style={{ width: 120 }}><p className="text-xs text-gray-400">选择时间</p><input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" style={{ color: "#374151" }} /><button type="button" onClick={selectNow} className="w-full py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ backgroundColor: teal, color: "white" }}>此刻</button><button type="button" onClick={() => { onChange(""); setOpen(false); }} className="w-full py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">清除</button></div></div>)}
  </div>);
}

function WeekInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (<div className="relative flex items-center"><span className="absolute left-3.5 text-base text-gray-400 pointer-events-none">第</span><input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="form-input px-8" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /><span className="absolute right-3.5 text-base text-gray-400 pointer-events-none">周</span></div>);
}

function Textarea({ value, onChange, rows = 5 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (<textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function MiniStaffPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const containerRef = useRef<HTMLDivElement>(null);
  const { raw: staffList } = useStaffDirectory();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? staffList.filter((s) => s.教职工姓名.includes(q)) : staffList; return list.slice(0, 30); }, [staffList, query]);
  const initial = value ? value.slice(0, 1) : "?";
  return (<div ref={containerRef} className="relative">
    {value ? (<div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center flex-wrap gap-2 min-h-[44px]"><div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#fff1f2", color: "#dc2626", borderColor: "#fecaca" }}><div className="w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center text-[10px] font-bold">{initial}</div>{value}<button className="ml-1 opacity-60 hover:opacity-100 transition-opacity" onClick={() => onChange("")}><X className="w-3 h-3" /></button></div></div>) : (<button type="button" className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-base text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600" style={{ minHeight: 44 }} onClick={() => setOpen(true)}><Plus className="w-4 h-4 opacity-60" /> 选择成员</button>)}
    {open && (<><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 320, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索教职工姓名..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map((s) => (<button key={s._id} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => { onChange(s.教职工姓名); setOpen(false); }}><div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.教职工姓名.slice(0, 1)}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{s.教职工姓名}</p><p className="text-xs text-gray-400 truncate">{[s.部门, s.担任学科].filter(Boolean).join(" · ") || "—"}</p></div></button>))}</div></div></>)}
  </div>);
}

function MultiStaffPicker({ selected, onChange, minHeight }: { selected: string[]; onChange: (names: string[]) => void; minHeight?: number }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const containerRef = useRef<HTMLDivElement>(null);
  const { raw: staffList } = useStaffDirectory();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? staffList.filter((s) => s.教职工姓名.includes(q)) : staffList; return list.slice(0, 30); }, [staffList, query]);
  const toggle = (name: string) => { if (selected.includes(name)) onChange(selected.filter((n) => n !== name)); else onChange([...selected, name]); };
  return (<div ref={containerRef} className="relative">
    <div className="border border-dashed border-gray-200 bg-white rounded-[10px] px-3 py-2 flex items-start flex-wrap gap-2 cursor-pointer" style={{ minHeight: minHeight ?? 64 }} onClick={() => setOpen(true)}>
      {selected.length === 0 ? <span className="text-base text-gray-400 flex items-center gap-1.5 py-2"><Plus className="w-4 h-4 opacity-60" /> 选择成员</span> : selected.map((name) => (<span key={name} className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm" style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}><span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">{name.slice(0, 1)}</span>{name}<X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); toggle(name); }} /></span>))}
    </div>
    {open && (<><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 340, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索教职工姓名..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map((s) => { const isSel = selected.includes(s.教职工姓名); return (<button key={s._id} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => toggle(s.教职工姓名)}><div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0" style={{ borderColor: isSel ? teal : "#d1d5db", backgroundColor: isSel ? teal : "transparent" }}>{isSel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{s.教职工姓名}</p><p className="text-xs text-gray-400 truncate">{[s.部门, s.担任学科].filter(Boolean).join(" · ") || "—"}</p></div></button>); })}</div></div></>)}
  </div>);
}

function FileUpload({ files, onChange, accept, hint }: { files: File[]; onChange: (f: File[]) => void; accept: string; hint: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (<div>
    <div className="flex items-center gap-2 mb-2"><div className="flex-1 flex items-center gap-2 border border-dashed border-gray-200 rounded-[10px] px-3.5 py-2.5 cursor-pointer" style={{ fontSize: 13, color: "#9ca3af" }} onClick={() => inputRef.current?.click()}><Upload size={14} className="shrink-0" style={{ color: "#9ca3af" }} /><span style={{ color: teal }}>选择</span><span>{hint}</span></div><input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={(e) => { if (e.target.files) onChange([...files, ...Array.from(e.target.files)]); e.target.value = ""; }} /></div>
    {files.length > 0 && (<div className="flex flex-wrap gap-2">{files.map((f, i) => (<div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600"><span className="max-w-[160px] truncate">{f.name}</span><X className="w-3 h-3 cursor-pointer hover:text-red-500 flex-shrink-0" onClick={() => onChange(files.filter((_, j) => j !== i))} /></div>))}</div>)}
  </div>);
}

function ModeSelector({ value, onChange }: { value: Mode; onChange: (v: Mode) => void }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value as Mode)} className="appearance-none pl-3 pr-8 py-1.5 text-sm font-semibold border border-gray-200 rounded-xl bg-white outline-none cursor-pointer hover:border-gray-300 transition-colors" style={{ color: "#374151" }}>{modeOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}</select><ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" /></div>);
}

const mockRecords = [
  { id: 1, semester: "2023-2024第一学期", title: "高一数学第三单元函数专题备课", subject: "数学", date: "2024-03-15", week: "第10周", location: "教研室301", group: "高一数学组", leader: "卢辉茂", host: "卢辉茂", recorder: "卢辉茂", participants: "卢辉茂、张明华、李思远", expected: 8, actual: 8, absent: "无", content: "讨论函数单调性教学方案", photo: "现场照片1.jpg", attachment: "教案.docx", department: "数学教研组", attendCount: 10, submitter: "卢辉茂", submitTime: "2024-03-15 17:30", updateTime: "2024-03-15 17:30", creator: "卢辉茂", status: "已提交" },
  { id: 2, semester: "2023-2024第一学期", title: "三角函数图像与性质集体备课", subject: "数学", date: "2024-03-08", week: "第9周", location: "教研室301", group: "高一数学组", leader: "卢辉茂", host: "卢辉茂", recorder: "卢辉茂", participants: "卢辉茂、张明华", expected: 6, actual: 5, absent: "李思远请假", content: "研讨正弦余弦图像画法", photo: "", attachment: "课件.pptx", department: "数学教研组", attendCount: 9, submitter: "卢辉茂", submitTime: "", updateTime: "2024-03-08 16:00", creator: "卢辉茂", status: "草稿" },
  { id: 3, semester: "2023-2024第一学期", title: "二次函数复习课备课活动", subject: "数学", date: "2024-02-28", week: "第7周", location: "办公室205", group: "高二数学组", leader: "张明华", host: "张明华", recorder: "王小燕", participants: "张明华、王小燕、陈刚", expected: 7, actual: 7, absent: "无", content: "整理二次函数考点与典型例题", photo: "照片2.jpg", attachment: "", department: "数学教研组", attendCount: 8, submitter: "张明华", submitTime: "2024-02-28 18:00", updateTime: "2024-02-28 18:00", creator: "张明华", status: "已提交" },
  { id: 4, semester: "2023-2024第一学期", title: "导数与微分综合应用专题", subject: "数学", date: "2024-02-20", week: "第6周", location: "教研室302", group: "高三数学组", leader: "李思远", host: "李思远", recorder: "陈刚", participants: "李思远、陈刚、吴磊", expected: 9, actual: 9, absent: "无", content: "分析高考导数大题解题思路", photo: "照片3.jpg", attachment: "专题讲义.pdf", department: "数学教研组", attendCount: 12, submitter: "李思远", submitTime: "2024-02-20 17:00", updateTime: "2024-02-21 09:00", creator: "李思远", status: "已提交" },
  { id: 5, semester: "2023-2024第一学期", title: "期中考试复习备课研讨", subject: "数学", date: "2024-02-14", week: "第5周", location: "会议室101", group: "高二数学组", leader: "张明华", host: "王小燕", recorder: "王小燕", participants: "张明华、王小燕、李思远、陈刚", expected: 10, actual: 9, absent: "吴磊出差", content: "制定期中复习计划与分工", photo: "照片4.jpg", attachment: "复习计划.docx", department: "数学教研组", attendCount: 11, submitter: "王小燕", submitTime: "2024-02-14 16:30", updateTime: "2024-02-14 16:30", creator: "王小燕", status: "已提交" },
];

const COLUMNS = ["学期","主题","备课学科","时间","周次","地点","备课组","备课组长","主持人","记录人","参与人员","应到人数","实到人数","未到场人员情况说明","内容记录","照片","附件","学科部门","备课参加次数","提交人","提交时间","更新时间"];

function RecordTable({ records, variant = "full" }: { records: typeof mockRecords; variant?: "full" | "leader" | "all" }) {
  const [selected, setSelected] = useState<Set<number>>(new Set()); const [page, setPage] = useState(1); const [search, setSearch] = useState(""); const [pageSize, setPageSize] = useState(20);
  const filtered = records.filter((r) => !search || r.title.includes(search) || r.subject.includes(search));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const allChecked = paged.length > 0 && paged.every((r) => selected.has(r.id));
  const toggleAll = () => { const next = new Set(selected); if (allChecked) paged.forEach((r) => next.delete(r.id)); else paged.forEach((r) => next.add(r.id)); setSelected(next); };
  const toggle = (id: number) => { const next = new Set(selected); next.has(id) ? next.delete(id) : next.add(id); setSelected(next); };

  return (<div className="flex flex-col h-full">
    <div className="px-3 py-2.5 flex justify-between items-center border-b border-gray-100 bg-white shrink-0">
      <div className="flex items-center gap-1">
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-white transition-all hover:opacity-90" style={{ backgroundColor: teal }}><Plus className="w-3.5 h-3.5" /> 添加</button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"><Download className="w-3.5 h-3.5" /> 导出</button>
        {(variant === "full" || variant === "all") && <><button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /> 删除</button><button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"><Clock className="w-3.5 h-3.5" /> 操作记录</button></>}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-gray-300 rounded-md px-2.5 py-1 gap-1.5 w-56 bg-white"><Search className="w-3.5 h-3.5 text-gray-400 shrink-0" /><input type="text" placeholder="搜索数据" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="text-sm outline-none w-full bg-transparent" /></div>
        <button className="flex items-center gap-1.5 border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"><Filter className="w-3.5 h-3.5" /> 筛选</button>
        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-gray-200 text-gray-400">
          <LayoutGrid className="w-4 h-4 cursor-pointer rounded p-0.5" style={{ color: teal, background: "rgba(0,176,149,0.08)" }} /><List className="w-4 h-4 cursor-pointer hover:text-gray-600" /><AlignLeft className="w-4 h-4 cursor-pointer hover:text-gray-600" /><RefreshCw className="w-4 h-4 cursor-pointer hover:text-gray-600" /><MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-gray-600" />
        </div>
      </div>
    </div>
    <div className="flex-1 overflow-auto"><table className="w-full text-sm border-collapse min-w-[800px]"><thead className="sticky top-0 z-10"><tr><th className="w-10 px-3 py-2.5 bg-gray-50 border-b border-r border-gray-200 text-left"><input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 cursor-pointer" style={{ accentColor: teal }} /></th>{COLUMNS.map((col) => (<th key={col} className="px-3 py-2.5 bg-gray-50 border-b border-r border-gray-200 text-left text-[13px] font-medium text-gray-700 whitespace-nowrap">{col}</th>))}</tr></thead><tbody>{paged.length === 0 ? (<tr><td colSpan={COLUMNS.length + 1}><div className="flex flex-col items-center justify-center py-20 text-gray-400"><span className="text-sm">暂无数据</span></div></td></tr>) : paged.map((r) => (<tr key={r.id} className="hover:bg-gray-50 transition-colors" style={selected.has(r.id) ? { background: "rgba(0,176,149,0.04)" } : {}}><td className="px-3 py-2.5 border-b border-r border-gray-100 shrink-0"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="w-4 h-4 rounded border-gray-300 cursor-pointer" style={{ accentColor: teal }} /></td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.semester}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-800 font-medium whitespace-nowrap max-w-[180px] truncate">{r.title}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.subject}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.date}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.week}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.location}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.group}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.leader}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.host}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.recorder}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 max-w-[160px] truncate">{r.participants}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap text-center">{r.expected}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap text-center">{r.actual}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 max-w-[120px] truncate">{r.absent || "—"}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 max-w-[160px] truncate">{r.content}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.photo || "—"}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.attachment || "—"}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.department}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap text-center">{r.attendCount}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-600 whitespace-nowrap">{r.submitter}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.submitTime || "—"}</td><td className="px-3 py-2.5 border-b border-r border-gray-100 text-gray-500 whitespace-nowrap">{r.updateTime}</td></tr>))}</tbody></table></div>
    <div className="px-3 py-2.5 border-t border-gray-100 bg-white shrink-0 flex justify-between items-center text-sm text-gray-600">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-gray-400 border-r border-gray-200 pr-4"><List className="w-4 h-4 cursor-pointer hover:text-gray-600" /><AlignLeft className="w-4 h-4 cursor-pointer hover:text-gray-600" /></div>
        <div className="flex items-center gap-1"><div className="flex items-center border border-gray-200 rounded px-2 py-0.5 cursor-pointer hover:bg-gray-50 text-sm gap-1.5"><select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="outline-none bg-transparent text-gray-600">{[10,20,50,100].map((n) => <option key={n} value={n}>{n} 条/页</option>)}</select></div><span className="ml-3 text-gray-500">共 {filtered.length} 条</span></div>
      </div>
      <div className="flex items-center gap-1"><button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded disabled:text-gray-300 hover:enabled:text-gray-700"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6" /></svg></button><div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded bg-white text-gray-700 text-sm">{page}</div><span className="text-gray-400 px-1">/ {totalPages}</span><button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded disabled:text-gray-300 hover:enabled:text-gray-700"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg></button></div>
    </div>
  </div>);
}

export function LessonPrepRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [mode, setMode] = useState<Mode>("add-only");

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [week, setWeek] = useState("");
  const [location, setLocation] = useState("");
  const [group, setGroup] = useState("");
  const [groupLeader, setGroupLeader] = useState("");
  const [host, setHost] = useState("");
  const [recorder, setRecorder] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [expectedCount, setExpectedCount] = useState("");
  const [actualCount, setActualCount] = useState("");
  const [absentNote, setAbsentNote] = useState("");
  const [content, setContent] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { raw: courseList, isPending: courseLoading } = useCourses();
  const courseOptions = useMemo(() => [...new Set(courseList.map((c) => c.教研学科名).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [courseList]);

  const { raw: groupList, isPending: groupLoading } = useLessonPrepareGroups();
  const groupOptions = useMemo(() => [...new Set(groupList.map((g) => g.备课组).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [groupList]);

  const handleGroupChange = (v: string) => { setGroup(v); const match = groupList.find((g) => g.备课组 === v); if (match) setGroupLeader(match.备课组长); };

  const handleSubmit = () => { setSubmitted(true); if ([title, subject, date, week, location, group, groupLeader, host, recorder, participants.length > 0, expectedCount, actualCount, absentNote, content].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  const ownRecords = mockRecords.filter((r) => r.creator === "卢辉茂");
  const groupRecords = mockRecords.filter((r) => r.group === "高一数学组");

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader centered breadcrumbs={[{ label: "备课活动" }, { label: "备课组活动记录", active: true }]} left={<ModeSelector value={mode} onChange={setMode} />} onMenuOpen={onMenuOpen} />
    <div className={mode === "add-only" ? "flex-1 overflow-y-auto bg-[#f5f5f7] pb-24" : "flex-1 overflow-hidden bg-[#f0f2f5] p-4"}>
      {mode === "add-only" && (<main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
        <div className="rounded-2xl md:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white p-5 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <Field label="主题" required><Input value={title} onChange={setTitle} />{submitted && !title && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="备课学科" required><SelectField value={subject} onChange={setSubject} options={courseOptions} loading={courseLoading} />{submitted && !subject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="时间" required><DateTimePicker value={date} onChange={setDate} />{submitted && !date && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="周次" required><WeekInput value={week} onChange={setWeek} />{submitted && !week && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="地点" required><Input value={location} onChange={setLocation} />{submitted && !location && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="备课组" required><SelectField value={group} onChange={handleGroupChange} options={groupOptions} loading={groupLoading} />{submitted && !group && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="备课组长" required><MiniStaffPicker value={groupLeader} onChange={setGroupLeader} />{submitted && !groupLeader && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="主持人" required><MiniStaffPicker value={host} onChange={setHost} />{submitted && !host && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="记录人" required><MiniStaffPicker value={recorder} onChange={setRecorder} />{submitted && !recorder && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="参与人员" required><MultiStaffPicker selected={participants} onChange={setParticipants} minHeight={64} />{submitted && participants.length === 0 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="应到人数" required><Input value={expectedCount} onChange={setExpectedCount} />{submitted && !expectedCount && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="实到人数" required><Input value={actualCount} onChange={setActualCount} />{submitted && !actualCount && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="未到场人员情况说明" required><Textarea value={absentNote} onChange={setAbsentNote} rows={5} />{submitted && !absentNote && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="内容记录" required><Textarea value={content} onChange={setContent} rows={5} />{submitted && !content && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="照片" required hint="请上传现场照片"><FileUpload files={photos} onChange={setPhotos} accept="image/*" hint="拖拽或单击后粘贴图片，单张20MB以内" /></Field>
            <Field label="附件" hint="教案、课件、教学设计、备课记录等"><FileUpload files={attachments} onChange={setAttachments} accept="*" hint="拖拽或单击后粘贴文件，单个20MB以内" /></Field>
          </div>
          <div className="mt-8 pt-6 flex justify-start gap-3" style={{ borderTop: "1px dashed #e5e7eb" }}><button className="px-10 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
        </div>
      </main>)}
      {(mode === "add-manage-own" || mode === "leader-manage" || mode === "all-permitted") && (<div className="h-full rounded-lg overflow-hidden shadow-sm bg-white flex flex-col"><RecordTable records={mode === "add-manage-own" ? ownRecords : mode === "leader-manage" ? groupRecords : mockRecords} variant={mode === "add-manage-own" ? "full" : mode === "leader-manage" ? "leader" : "all"} /></div>)}
    </div>
  </div>);
}
