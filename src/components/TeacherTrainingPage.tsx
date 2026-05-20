"use client";

import { Plus, X, Search, Menu } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useStaffDirectory } from "@/hooks/use-research-dashboard";
import { PageHeader, FlowButton } from "./PageHeader";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return (<div className={full ? "md:col-span-2" : ""}><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input type="text" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value=""></option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
}

function MultiStaffPicker({ selected, onChange }: { selected: string[]; onChange: (names: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { raw: staffList } = useStaffDirectory();

  const filtered = useMemo(() => {
    if (!staffList.length) return [];
    const q = query.trim();
    const list = q ? staffList.filter((s) => s.教职工姓名.includes(q)) : staffList;
    return list.slice(0, 30);
  }, [staffList, query]);

  useEffect(() => { if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); } }, [open]);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onClick(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); }
    if (open) { document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick); }
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  const toggle = (name: string) => {
    if (selected.includes(name)) onChange(selected.filter((n) => n !== name));
    else onChange([...selected, name]);
  };

  return (<div ref={containerRef} className="relative">
    <div className="border border-dashed border-gray-300 bg-white rounded-[10px] px-3 py-2 min-h-[44px] flex items-center flex-wrap gap-2 cursor-pointer" onClick={() => setOpen(true)}>
      {selected.length === 0 ? <span className="text-base text-gray-400 flex items-center gap-1.5"><Plus className="w-4 h-4" /> 选择成员</span> : selected.map((name) => (<span key={name} className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm" style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}><span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">{name.slice(0, 1)}</span>{name}<X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={(e) => { e.stopPropagation(); toggle(name); }} /></span>))}
    </div>
    {open && (<div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 340, maxHeight: 360 }}>
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input ref={inputRef} type="text" placeholder="搜索教职工姓名..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div>
      <div className="overflow-y-auto" style={{ maxHeight: 288 }}>
        {filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map((s) => { const isSel = selected.includes(s.教职工姓名); return (<button key={s._id} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => toggle(s.教职工姓名)}><div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors" style={{ borderColor: isSel ? teal : "#d1d5db", backgroundColor: isSel ? teal : "transparent" }}>{isSel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{s.教职工姓名}</p><p className="text-xs text-gray-400 truncate">{[s.部门, s.担任学科].filter(Boolean).join(" · ") || "—"}</p></div></button>); })}
      </div>
      {filtered.length > 0 && <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400">共 {staffList.length} 条</div>}
    </div>)}
  </div>);
}

export function TeacherTrainingPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [channel, setChannel] = useState("");
  const [trainName, setTrainName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [count, setCount] = useState("");
  const [trainType, setTrainType] = useState("");
  const [remark, setRemark] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => { setSubmitted(true); if ([{ f: channel }, { f: trainName }, { f: startDate }, { f: endDate }, { f: lecturer }, { f: participants.length > 0 }, { f: count }, { f: trainType }].find((x) => !x.f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader centered left={<FlowButton />} breadcrumbs={[{ label: "教师基础档案" }, { label: "教师培训", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
      <div className="flex items-center justify-center gap-5 mb-12"><div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} /><div className="flex items-center gap-3 px-12 py-2 text-white text-base font-semibold tracking-[0.2em]" style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}><span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />培训信息<span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" /></div><div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} /></div>
      <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="培训渠道" required><Select value={channel} onChange={setChannel} options={["校内培训", "校外培训", "线上培训"]} />{submitted && !channel && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
          <Field label="培训名称" required><Input value={trainName} onChange={setTrainName} />{submitted && !trainName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="培训开始时间" required><input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" style={{ color: startDate ? "#374151" : "#9ca3af" }} />{submitted && !startDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
          <Field label="培训结束时间" required><input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" style={{ color: endDate ? "#374151" : "#9ca3af" }} />{submitted && !endDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="主讲人" required><Input value={lecturer} onChange={setLecturer} />{submitted && !lecturer && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
          <Field label="参训人员" required><MultiStaffPicker selected={participants} onChange={setParticipants} />{submitted && participants.length === 0 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
          <Field label="具体人数" required><Input value={count} onChange={setCount} />{submitted && !count && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
          <Field label="培训形式" required><Select value={trainType} onChange={setTrainType} options={["校本培训", "远程培训","   集中培训"]} />{submitted && !trainType && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 bg-white">
          <Field label="备注" full><textarea rows={5} value={remark} onChange={(e) => setRemark(e.target.value)} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /></Field>
        </div>
      </div>
    </main></div>
    <div className="form-footer shrink-0 flex gap-3 px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
