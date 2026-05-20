"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Plus, X, Search } from "lucide-react";
import { useStaffDirectory, useCourses } from "@/hooks/use-research-dashboard";
import { StudentPicker } from "./ui/StudentPicker";
import type { StudentInfoRecord } from "@/hooks/use-research-dashboard";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input type="text" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled />{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false); const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date(); const [viewYear, setViewYear] = useState(now.getFullYear()); const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [timeStr, setTimeStr] = useState(value ? value.slice(11, 16) : `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  useEffect(() => { function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); } function onClick(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); } if (open) { document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick); } return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); }; }, [open]);
  const selectDay = (day: number) => { onChange(`${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}T${timeStr}`); setOpen(false); };
  const selectNow = () => { const n = new Date(); onChange(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}T${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`); setOpen(false); };
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate(); const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const cells: (number|null)[] = []; for (let i=0;i<firstDow;i++) cells.push(null); for (let d=1;d<=daysInMonth;d++) cells.push(d);
  const prevMonth = () => { if (viewMonth===1) { setViewYear(viewYear-1); setViewMonth(12); } else setViewMonth(viewMonth-1); };
  const nextMonth = () => { if (viewMonth===12) { setViewYear(viewYear+1); setViewMonth(1); } else setViewMonth(viewMonth+1); };
  const display = value ? value.replace("T"," ").slice(0,16) : "";
  return (<div ref={containerRef} className="relative"><input type="text" readOnly value={display} placeholder="请选择日期时间" className="form-input cursor-pointer" style={{ color: value ? "#374151" : "#9ca3af" }} onClick={() => setOpen(!open)} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
    {open && (<div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex gap-4" style={{ width: 380 }}><div className="flex-1"><div className="flex items-center justify-between mb-2"><button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">‹</button><span className="text-base font-medium text-gray-700">{viewYear}年{viewMonth}月</span><button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">›</button></div><div className="grid grid-cols-7 gap-0.5">{[..."日一二三四五六"].map((w,i) => (<div key={i} className="text-center text-xs text-gray-400 py-0.5">{w}</div>))}{cells.map((c,i) => (<div key={i} className={`text-center py-1 text-sm rounded-md ${c?"cursor-pointer hover:bg-gray-100 text-gray-700":""}`} onClick={() => c && selectDay(c)}>{c??""}</div>))}</div></div><div className="flex flex-col gap-3 border-l border-gray-100 pl-4" style={{ width: 120 }}><p className="text-xs text-gray-400">选择时间</p><input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" style={{ color: "#374151" }} /><button type="button" onClick={selectNow} className="w-full py-1.5 text-sm font-medium rounded-lg transition-colors text-white" style={{ backgroundColor: "#10b981" }}>此刻</button><button type="button" onClick={() => { onChange(""); setOpen(false); }} className="w-full py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">清除</button></div></div>)}
  </div>);
}

function MiniStaffPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const containerRef = useRef<HTMLDivElement>(null);
  const { raw: staffList } = useStaffDirectory();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? staffList.filter((s) => s.教职工姓名.includes(q)) : staffList; return list.slice(0, 30); }, [staffList, query]);
  const initial = value ? value.slice(0, 1) : "?";
  return (<div ref={containerRef} className="relative">
    {value ? (<div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center flex-wrap gap-2 min-h-[44px]"><div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}><div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">{initial}</div>{value}<button className="ml-1 opacity-60 hover:opacity-100 transition-opacity" onClick={() => onChange("")}><X className="w-3 h-3" /></button></div></div>) : (<button type="button" className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1 hover:border-emerald-400 transition-colors bg-white" style={{ color: "#9ca3af", minHeight: 44 }} onClick={() => setOpen(true)}><Plus size={16} /><span className="text-sm">选择成员</span></button>)}
    {open && (<><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 320, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索教职工姓名..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map((s) => (<button key={s._id} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => { onChange(s.教职工姓名); setOpen(false); }}><div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.教职工姓名.slice(0, 1)}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{s.教职工姓名}</p><p className="text-xs text-gray-400 truncate">{[s.部门, s.担任学科].filter(Boolean).join(" · ") || "—"}</p></div></button>))}</div></div></>)}
  </div>);
}

function FileUpload({ files, onChange, accept, hint }: { files: File[]; onChange: (f: File[]) => void; accept: string; hint: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (<div>
    <div className="flex items-center gap-2 mb-2"><div className="flex-1 flex items-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-3 px-3.5 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors" onClick={() => inputRef.current?.click()}><span className="text-sm font-medium" style={{ color: "#10b981" }}>选择</span><span className="text-sm" style={{ color: "#9ca3af" }}>{hint}</span></div><input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={(e) => { if (e.target.files) onChange([...files, ...Array.from(e.target.files)]); e.target.value = ""; }} /></div>
    {files.length > 0 && (<div className="flex flex-wrap gap-2">{files.map((f, i) => (<div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600"><span className="max-w-[160px] truncate">{f.name}</span><X className="w-3 h-3 cursor-pointer hover:text-red-500 flex-shrink-0" onClick={() => onChange(files.filter((_, j) => j !== i))} /></div>))}</div>)}
  </div>);
}

const TALK_TOPICS = ["了解学生家庭情况","了解学生性格与兴趣爱好","了解学生的人际关系","了解学生的需求与希望","了解学生的梦想和目标","学情分析、学法指导","心理疏导"];

export function TalkRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [teacher, setTeacher] = useState("");
  const [studentName, setStudentName] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");
  const [talkTime, setTalkTime] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [contentRecord, setContentRecord] = useState("");
  const [advice, setAdvice] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { raw: courseList } = useCourses();
  const courseOptions = useMemo(() => [...new Set(courseList.map((c) => c.教研学科名).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [courseList]);

  const toggleTopic = (t: string) => setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSubmit = () => { setSubmitted(true); if ([teacher, studentName, teacherSubject, talkTime, selectedTopics.length > 0, contentRecord, advice].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader breadcrumbs={[{ label: "学生成长" }, { label: "一生一案谈心谈话记录表", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6"><div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <Field label="谈心教师" required><MiniStaffPicker value={teacher} onChange={setTeacher} />{submitted && !teacher && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学生姓名" required><StudentPicker value={studentName} onChange={setStudentName} />{submitted && !studentName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="谈心教师学科" required><SelectField value={teacherSubject} onChange={setTeacherSubject} options={courseOptions.length > 0 ? courseOptions : ["语文","数学","英语","物理","化学","生物","历史","地理","政治"]} />{submitted && !teacherSubject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="谈心谈话时间" required><DateTimePicker value={talkTime} onChange={setTalkTime} />{submitted && !talkTime && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="谈话内容" required>
          <div className="grid grid-cols-2 gap-y-3 pt-1">{TALK_TOPICS.map(t => (<label key={t} className="flex items-center gap-2 cursor-pointer select-none"><span onClick={() => toggleTopic(t)} className="shrink-0 flex items-center justify-center rounded-full border transition-colors" style={{ width: 18, height: 18, borderColor: selectedTopics.includes(t) ? "#10b981" : "#d1d5db", background: "white" }}>{selectedTopics.includes(t) && (<span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />)}</span><span className="text-sm" style={{ color: "#374151" }}>{t}</span></label>))}</div>
          {submitted && selectedTopics.length === 0 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>请至少选择一项谈话内容</p>}
        </Field>
        <Field label="谈心谈话内容记录" required><textarea rows={5} value={contentRecord} onChange={(e) => setContentRecord(e.target.value)} className="form-input resize-none" placeholder="请输入谈话内容记录" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />{submitted && !contentRecord && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="教师指导建议" required><textarea rows={6} value={advice} onChange={(e) => setAdvice(e.target.value)} className="form-input resize-none" placeholder="请输入教师指导建议" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />{submitted && !advice && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="沟通照片"><FileUpload files={photos} onChange={setPhotos} accept="image/*" hint="拖拽或单击后粘贴图片，单张 20MB 以内" /></Field>
      </div>
    </div></div></div>
    <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
