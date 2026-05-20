"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Plus, X, Search, Upload, Image as ImageIcon, FileText, Menu } from "lucide-react";
import { useStaffDirectory, useCourses, useTeachingResearchGroups } from "@/hooks/use-research-dashboard";
import { PageHeader, FlowButton } from "./PageHeader";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (<div style={{ background: error ? "#fffbe6" : "transparent", borderRadius: 8, padding: error ? "10px 12px" : 0 }}><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}{children}{error && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{error}</p>}</div>);
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
  const [timeStr, setTimeStr] = useState(
    value ? value.slice(11, 16) : `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onClick(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); }
    if (open) { document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick); }
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  const selectDay = (day: number) => {
    const m = String(viewMonth).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}T${timeStr}`);
    setOpen(false);
  };

  const selectNow = () => {
    const n = new Date();
    const y = n.getFullYear();
    const m = String(n.getMonth() + 1).padStart(2, "0");
    const d = String(n.getDate()).padStart(2, "0");
    const t = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
    setTimeStr(t);
    onChange(`${y}-${m}-${d}T${t}`);
    setOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => { if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1); } else setViewMonth(viewMonth + 1); };

  const display = value
    ? value.replace("T", " ").slice(0, 16)
    : "";

  return (<div ref={containerRef} className="relative">
    <input type="text" readOnly value={display} placeholder="请选择日期时间" className="form-input cursor-pointer" style={{ color: value ? "#374151" : "#9ca3af" }} onClick={() => setOpen(!open)} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
    {open && (<div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex gap-4" style={{ width: 380 }}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">‹</button>
          <span className="text-base font-medium text-gray-700">{viewYear}年{viewMonth}月</span>
          <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">›</button>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {["日","一","二","三","四","五","六"].map((w) => (<div key={w} className="text-center text-xs text-gray-400 py-0.5">{w}</div>))}
          {cells.map((c, i) => (<div key={i} className={`text-center py-1 text-sm rounded-md ${c ? "cursor-pointer hover:bg-gray-100 text-gray-700" : ""}`} onClick={() => c && selectDay(c)}>{c ?? ""}</div>))}
        </div>
      </div>
      <div className="flex flex-col gap-3 border-l border-gray-100 pl-4" style={{ width: 120 }}>
        <p className="text-xs text-gray-400">选择时间</p>
        <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" style={{ color: "#374151" }} />
        <button type="button" onClick={selectNow} className="w-full py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ backgroundColor: teal, color: "white" }}>此刻</button>
        <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="w-full py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">清除</button>
      </div>
    </div>)}
  </div>);
}

function WeekInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (<div className="flex items-center gap-2"><span className="text-base shrink-0 text-gray-500">第</span><input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="form-input text-center flex-1" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /><span className="text-base shrink-0 text-gray-500">周</span></div>);
}

function Textarea({ value, onChange, rows = 6 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (<textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function MiniStaffPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { raw: staffList } = useStaffDirectory();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? staffList.filter((s) => s.教职工姓名.includes(q)) : staffList; return list.slice(0, 30); }, [staffList, query]);
  const initial = value ? value.slice(0, 1) : "?";
  return (<div ref={containerRef} className="relative">
    {value ? (<div className="border border-dashed border-gray-300 bg-white rounded-[10px] px-3 py-2 min-h-[44px] flex items-center flex-wrap gap-2"><div className="flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-lg text-sm border border-red-100 gap-1.5"><div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{initial}</div>{value}<X className="w-3.5 h-3.5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity" onClick={() => onChange("")} /></div></div>) : (<button type="button" className="w-full border border-dashed border-gray-300 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-2 text-base text-gray-500 transition-all hover:border-[#00b095] hover:text-[#00b095]" style={{ minHeight: 44 }} onClick={() => setOpen(true)}><Plus size={15} className="opacity-70" /> 选择成员</button>)}
    {open && (<>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 320, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索教职工姓名..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map((s) => (<button key={s._id} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => { onChange(s.教职工姓名); setOpen(false); }}><div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.教职工姓名.slice(0, 1)}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{s.教职工姓名}</p><p className="text-xs text-gray-400 truncate">{[s.部门, s.担任学科].filter(Boolean).join(" · ") || "—"}</p></div></button>))}</div></div>
    </>)}
  </div>);
}

function MultiStaffPicker({ selected, onChange }: { selected: string[]; onChange: (names: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { raw: staffList } = useStaffDirectory();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? staffList.filter((s) => s.教职工姓名.includes(q)) : staffList; return list.slice(0, 30); }, [staffList, query]);
  const toggle = (name: string) => { if (selected.includes(name)) onChange(selected.filter((n) => n !== name)); else onChange([...selected, name]); };
  return (<div ref={containerRef} className="relative">
    <div className="border border-dashed border-gray-300 bg-white rounded-[10px] px-3 py-2 min-h-[72px] flex items-start flex-wrap gap-2 cursor-pointer" onClick={() => setOpen(true)}>
      {selected.length === 0 ? <span className="text-base text-gray-400 flex items-center gap-1.5 py-2"><Plus size={15} className="opacity-70" /> 选择成员</span> : selected.map((name) => (<span key={name} className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm" style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}><span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">{name.slice(0, 1)}</span>{name}<X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); toggle(name); }} /></span>))}
    </div>
    {open && (<>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 340, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索教职工姓名..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map((s) => { const isSel = selected.includes(s.教职工姓名); return (<button key={s._id} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => toggle(s.教职工姓名)}><div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0" style={{ borderColor: isSel ? teal : "#d1d5db", backgroundColor: isSel ? teal : "transparent" }}>{isSel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{s.教职工姓名}</p><p className="text-xs text-gray-400 truncate">{[s.部门, s.担任学科].filter(Boolean).join(" · ") || "—"}</p></div></button>); })}</div></div>
    </>)}
  </div>);
}

function FileUpload({ files, onChange, accept, hint }: { files: File[]; onChange: (f: File[]) => void; accept: string; hint: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (<div>
    <div className="flex items-center gap-2 mb-2">
      <div className="flex-1 flex items-center gap-2 border border-dashed border-gray-200 rounded-[10px] px-3.5 py-2.5 cursor-pointer" style={{ fontSize: 13, color: "#9ca3af" }} onClick={() => inputRef.current?.click()}>
        <Upload size={14} className="shrink-0" style={{ color: "#9ca3af" }} />
        <span style={{ color: teal }}>选择</span>
        <span>{hint}</span>
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={(e) => { if (e.target.files) onChange([...files, ...Array.from(e.target.files)]); e.target.value = ""; }} />
    </div>
    {files.length > 0 && (<div className="flex flex-wrap gap-2">{files.map((f, i) => (<div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600"><span className="max-w-[160px] truncate">{f.name}</span><X className="w-3 h-3 cursor-pointer hover:text-red-500 flex-shrink-0" onClick={() => onChange(files.filter((_, j) => j !== i))} /></div>))}</div>)}
  </div>);
}

export function ResearchActivityRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [topic, setTopic] = useState("");
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
  const [contentRecord, setContentRecord] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { raw: courseList, isPending: courseLoading } = useCourses();
  const courseOptions = useMemo(() => [...new Set(courseList.map((c) => c.教研学科名).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [courseList]);

  const { raw: groupList, isPending: groupLoading } = useTeachingResearchGroups();
  const groupOptions = useMemo(() => [...new Set(groupList.map((g) => g.教研组).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [groupList]);

  const handleGroupChange = (v: string) => {
    setGroup(v);
    const match = groupList.find((g) => g.教研组 === v);
    if (match) setGroupLeader(match.教研组长);
  };

  const handleSubmit = () => { setSubmitted(true); if ([topic, subject, date, week, location, group, groupLeader, host, recorder, participants.length > 0, expectedCount, actualCount, absentNote, contentRecord].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader centered left={<FlowButton />} breadcrumbs={[{ label: "教研活动" }, { label: "教研活动记录", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
      <div className="flex items-center justify-center gap-5 mb-10"><div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} /><div className="flex items-center gap-3 px-12 py-2 text-white text-base font-semibold tracking-[0.2em]" style={{ backgroundColor: teal, clipPath: "polygon(10% 0,90% 0,100% 50%,90% 100%,10% 100%,0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}><span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />教研活动记录<span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" /></div><div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} /></div>
      <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="教研主题" required error={submitted && !topic ? "此项为必填项" : undefined}><Input value={topic} onChange={setTopic} /></Field>
          <Field label="教研学科" required error={submitted && !subject ? "此项为必填项" : undefined}><SelectField value={subject} onChange={setSubject} options={courseOptions} loading={courseLoading} /></Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="时间" required error={submitted && !date ? "此项为必填项" : undefined}><DateTimePicker value={date} onChange={setDate} /></Field>
          <Field label="周次" required error={submitted && !week ? "此项为必填项" : undefined}><WeekInput value={week} onChange={setWeek} /></Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="地点" required error={submitted && !location ? "此项为必填项" : undefined}><Input value={location} onChange={setLocation} /></Field>
          <Field label="教研组" required error={submitted && !group ? "此项为必填项" : undefined}><SelectField value={group} onChange={handleGroupChange} options={groupOptions} loading={groupLoading} /></Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="教研组长" required error={submitted && !groupLeader ? "此项为必填项" : undefined}><MiniStaffPicker value={groupLeader} onChange={setGroupLeader} /></Field>
          <Field label="主持人" required error={submitted && !host ? "此项为必填项" : undefined}><MiniStaffPicker value={host} onChange={setHost} /></Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="记录人" required error={submitted && !recorder ? "此项为必填项" : undefined}><MiniStaffPicker value={recorder} onChange={setRecorder} /></Field>
          <Field label="参与人员" required error={submitted && participants.length === 0 ? "此项为必填项" : undefined}><MultiStaffPicker selected={participants} onChange={setParticipants} /></Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="应到人数" required error={submitted && !expectedCount ? "此项为必填项" : undefined}><Input value={expectedCount} onChange={setExpectedCount} /></Field>
          <Field label="实到人数" required error={submitted && !actualCount ? "此项为必填项" : undefined}><Input value={actualCount} onChange={setActualCount} /></Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="未到场人员情况说明" required error={submitted && !absentNote ? "此项为必填项" : undefined}><Textarea value={absentNote} onChange={setAbsentNote} rows={6} /></Field>
          <Field label="内容记录" required error={submitted && !contentRecord ? "此项为必填项" : undefined}><Textarea value={contentRecord} onChange={setContentRecord} rows={6} /></Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="照片" required hint="请上传现场照片"><FileUpload files={photos} onChange={setPhotos} accept="image/*" hint="拖拽或单击后粘贴图片，单张 20MB 以内" /></Field>
          <Field label="其他附件" hint="其他文件"><FileUpload files={attachments} onChange={setAttachments} accept="*" hint="拖拽或单击后粘贴文件，单个 500MB 以内" /></Field>
        </div>
      </div>
    </main></div>
    <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
