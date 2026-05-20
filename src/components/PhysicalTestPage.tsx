"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Plus, X, Search } from "lucide-react";
import { useStaffDirectory, useTermInfo, useGradeInfo } from "@/hooks/use-research-dashboard";
import { StudentPicker } from "./ui/StudentPicker";
import type { StudentInfoRecord } from "@/hooks/use-research-dashboard";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function SectionHeader({ title }: { title: string }) {
  return (<div className="relative flex items-center justify-center my-6" style={{ height: 32 }}><div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 0%, #10b981 10%, #10b981 90%, transparent 100%)" }} /><div className="absolute" style={{ left: "10%", width: 12, height: 12, background: "#10b981", transform: "rotate(45deg)" }} /><div className="absolute" style={{ right: "10%", width: 12, height: 12, background: "#10b981", transform: "rotate(45deg)" }} /><span className="relative z-10 text-white font-medium text-sm">{title}</span></div>);
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}{hint && <p className="mt-1 text-xs" style={{ color: "#9ca3af" }}>{hint}</p>}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input type="text" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled />{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
}

function DatePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false); const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date(); const [viewYear, setViewYear] = useState(now.getFullYear()); const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate(); const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const cells: (number|null)[] = []; for (let i=0;i<firstDow;i++) cells.push(null); for (let d=1;d<=daysInMonth;d++) cells.push(d);
  useEffect(() => { function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); } function onClick(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); } if (open) { document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick); } return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); }; }, [open]);
  const prevMonth = () => { if (viewMonth===1) { setViewYear(viewYear-1); setViewMonth(12); } else setViewMonth(viewMonth-1); };
  const nextMonth = () => { if (viewMonth===12) { setViewYear(viewYear+1); setViewMonth(1); } else setViewMonth(viewMonth+1); };
  const display = value ? value.slice(0, 10) : "";
  return (<div ref={containerRef} className="relative"><input type="text" readOnly value={display} placeholder="请选择日期" className="form-input cursor-pointer" style={{ color: value ? "#374151" : "#9ca3af" }} onClick={() => setOpen(!open)} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
    {open && (<div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4" style={{ width: 260 }}><div className="flex items-center justify-between mb-2"><button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">‹</button><span className="text-base font-medium text-gray-700">{viewYear}年{viewMonth}月</span><button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">›</button></div><div className="grid grid-cols-7 gap-0.5">{[..."日一二三四五六"].map((w,i) => (<div key={i} className="text-center text-xs text-gray-400 py-0.5">{w}</div>))}{cells.map((c,i) => (<div key={i} className={`text-center py-1 text-sm rounded-md ${c?"cursor-pointer hover:bg-gray-100 text-gray-700":""}`} onClick={() => c && (() => { onChange(`${viewYear}-${String(viewMonth).padStart(2,"0")}-${String(c).padStart(2,"0")}`); setOpen(false); })()}>{c??""}</div>))}</div><div className="flex gap-2 mt-3 pt-2 border-t border-gray-100"><button type="button" onClick={() => { const n=new Date(); onChange(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}`); setOpen(false); }} className="flex-1 py-1.5 text-sm font-medium rounded-lg transition-colors text-white" style={{ backgroundColor: "#10b981" }}>今天</button><button type="button" onClick={() => { onChange(""); setOpen(false); }} className="flex-1 py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">清除</button></div></div>)}
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

export function PhysicalTestPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [semester, setSemester] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [name, setName] = useState("");
  const [stuId, setStuId] = useState("");
  const [gender, setGender] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [gradeDirector, setGradeDirector] = useState("");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [lungCapacity, setLungCapacity] = useState("");
  const [run50m, setRun50m] = useState("");
  const [sitReach, setSitReach] = useState("");
  const [longJump, setLongJump] = useState("");
  const [run800m, setRun800m] = useState("");
  const [run1000m, setRun1000m] = useState("");
  const [rope, setRope] = useState("");
  const [sitUp, setSitUp] = useState("");
  const [pullUp, setPullUp] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { raw: termList } = useTermInfo();
  const semesterOptions = useMemo(() => [...new Set(termList.map((t) => t.学期名称).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [termList]);

  const { raw: gradeList } = useGradeInfo();
  const gradeOptions = useMemo(() => [...new Set(gradeList.map((g) => g.年级).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [gradeList]);

  const handleSelectStudent = (record: StudentInfoRecord | null) => {
    if (record) {
      setClassName(record.班级名称 || "");
      setStuId(record.宏德学号 || "");
      setGender(record.性别 || "");
    } else {
      setClassName("");
      setStuId("");
      setGender("");
    }
  };

  const handleSubmit = () => { setSubmitted(true); if ([semester, name, height, weight].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader breadcrumbs={[{ label: "学生成长" }, { label: "体质检测录入", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6"><div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">
      <SectionHeader title="学生信息" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <Field label="录入学期" required><SelectField value={semester} onChange={setSemester} options={semesterOptions} />{submitted && !semester && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="年级"><SelectField value={grade} onChange={setGrade} options={gradeOptions} /></Field>
        <Field label="班级名称"><Input value={className} onChange={setClassName} /></Field>
        <Field label="级部"><Input value={gradeLevel} onChange={setGradeLevel} placeholder="请输入级部" /></Field>
        <Field label="姓名" required><StudentPicker value={name} onChange={setName} onSelectRecord={handleSelectStudent} />{submitted && !name && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学号"><Input value={stuId} onChange={setStuId} placeholder="请输入学号" /></Field>
        <Field label="性别"><Input value={gender} onChange={setGender} placeholder="请输入性别" /></Field>
        <Field label="班主任"><MiniStaffPicker value={classTeacher} onChange={setClassTeacher} /></Field>
        <Field label="级部主任"><MiniStaffPicker value={gradeDirector} onChange={setGradeDirector} /></Field>
      </div>
      <SectionHeader title="学生成绩" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <Field label="考试名称"><Input value={examName} onChange={setExamName} placeholder="请输入考试名称" /></Field>
        <Field label="考试时间"><DatePicker value={examDate} onChange={setExamDate} /></Field>
        <Field label="身高" required hint="单位为厘米（cm），保留一位小数。"><Input value={height} onChange={setHeight} placeholder="例：175.0" />{submitted && !height && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="体重" required hint="单位为公斤（kg），保留一位小数。"><Input value={weight} onChange={setWeight} placeholder="例：65.0" />{submitted && !weight && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="肺活量" hint="请按照学生测试的数据填写。"><Input value={lungCapacity} onChange={setLungCapacity} placeholder="请输入肺活量" /></Field>
        <Field label="50米跑" hint="单位为秒（s），例：6.7"><Input value={run50m} onChange={setRun50m} placeholder="例：6.7" /></Field>
        <Field label="坐位体前屈" hint="单位为厘米（cm），保留一位小数。"><Input value={sitReach} onChange={setSitReach} placeholder="例：15.0" /></Field>
        <Field label="立定跳远" hint="单位为厘米（cm），例：235"><Input value={longJump} onChange={setLongJump} placeholder="例：235" /></Field>
        <Field label="800米跑" hint="单位为分（min），例：402"><Input value={run800m} onChange={setRun800m} placeholder="例：402" /></Field>
        <Field label="1000米跑" hint="单位为分（min），例：402"><Input value={run1000m} onChange={setRun1000m} placeholder="例：402" /></Field>
        <Field label="一分钟跳绳"><Input value={rope} onChange={setRope} placeholder="请输入次数" /></Field>
        <Field label="一分钟仰卧起坐"><Input value={sitUp} onChange={setSitUp} placeholder="请输入次数" /></Field>
        <Field label="引体向上"><Input value={pullUp} onChange={setPullUp} placeholder="请输入次数" /></Field>
      </div>
    </div></div></div>
    <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
