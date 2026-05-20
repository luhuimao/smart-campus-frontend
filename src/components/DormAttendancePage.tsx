"use client";

import { useState, useRef, useMemo } from "react";
import { Plus, X, Search } from "lucide-react";
import { useStaffDirectory, useTermInfo } from "@/hooks/use-research-dashboard";
import { StudentPicker } from "./ui/StudentPicker";
import type { StudentInfoRecord } from "@/hooks/use-research-dashboard";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled />{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (<div className="flex items-center gap-6 pt-1">{options.map(opt => (<label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none"><span onClick={() => onChange(opt)} className="shrink-0 flex items-center justify-center rounded-full border-2 transition-colors" style={{ width: 18, height: 18, borderColor: value === opt ? "#10b981" : "#d1d5db", background: "white" }}>{value === opt && <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />}</span><span className="text-sm" style={{ color: "#374151" }}>{opt}</span></label>))}</div>);
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
    <div className="flex items-center gap-2 mb-2"><div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl py-3 px-3.5 flex items-center justify-center gap-1 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors" onClick={() => inputRef.current?.click()}><span className="text-sm font-medium" style={{ color: "#10b981" }}>选择</span><span className="text-sm" style={{ color: "#9ca3af" }}>{hint}</span></div><input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={(e) => { if (e.target.files) onChange([...files, ...Array.from(e.target.files)]); e.target.value = ""; }} /></div>
    {files.length > 0 && (<div className="flex flex-wrap gap-2">{files.map((f, i) => (<div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600"><span className="max-w-[160px] truncate">{f.name}</span><X className="w-3 h-3 cursor-pointer hover:text-red-500 flex-shrink-0" onClick={() => onChange(files.filter((_, j) => j !== i))} /></div>))}</div>)}
  </div>);
}

const BUILDINGS = [
  { label: "佳慧楼", color: "#ef4444" },
  { label: "自强楼", color: "#f59e0b" },
  { label: "自立楼", color: "#10b981" },
];

export function DormAttendancePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [semester, setSemester] = useState("");
  const [dormNo, setDormNo] = useState("");
  const [building, setBuilding] = useState("");
  const [scene, setScene] = useState("");
  const [stuNum, setStuNum] = useState("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [className, setClassName] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [gradeDirector, setGradeDirector] = useState("");
  const [checkItem, setCheckItem] = useState("");
  const [deductItem, setDeductItem] = useState("");
  const [deductPoints, setDeductPoints] = useState("");
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { raw: termList } = useTermInfo();
  const semesterOptions = useMemo(() => [...new Set(termList.map((t) => t.学期名称).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [termList]);

  const handleSelectStudent = (record: StudentInfoRecord | null) => {
    if (record) {
      setGrade(record.年级名称 || record.年级别名 || "");
      setGradeLevel(record.级部 || "");
      setClassName(record.班级名称 || "");
      setStuNum(record.宏德学号 || "");
    } else {
      setGrade("");
      setGradeLevel("");
      setClassName("");
      setStuNum("");
    }
  };

  const handleSubmit = () => { setSubmitted(true); if ([dormNo, scene, stuNum, studentName, checkItem, phone].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader breadcrumbs={[{ label: "学生管理" }, { label: "NFC宿舍考勤（桂宏）" }, { label: "宿舍考勤记录", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6"><div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <Field label="学期"><SelectField value={semester} onChange={setSemester} options={semesterOptions} /></Field>
        <Field label="宿舍号" required><Input value={dormNo} onChange={setDormNo} placeholder="请输入宿舍号" />{submitted && !dormNo && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="宿舍楼栋"><div className="flex flex-col gap-3 pt-1">{BUILDINGS.map(({ label, color }) => (<label key={label} className="inline-flex items-center gap-2 cursor-pointer select-none"><span onClick={() => setBuilding(label)} className="shrink-0 flex items-center justify-center rounded-full border-2 transition-colors" style={{ width: 18, height: 18, borderColor: building === label ? "#10b981" : "#d1d5db", background: "white" }}>{building === label && <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />}</span><span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ background: color }}>{label}</span></label>))}</div></Field>
        <Field label="场景" required><RadioGroup options={["宿舍", "学生"]} value={scene} onChange={setScene} />{submitted && !scene && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学生编号" required><Input value={stuNum} onChange={setStuNum} placeholder="请输入学生编号" />{submitted && !stuNum && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学生姓名" required><StudentPicker value={studentName} onChange={setStudentName} onSelectRecord={handleSelectStudent} />{submitted && !studentName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="年级"><Input value={grade} onChange={setGrade} placeholder="请输入年级" /></Field>
        <Field label="级部"><Input value={gradeLevel} onChange={setGradeLevel} placeholder="请输入级部" /></Field>
        <div><Field label="班级名称"><Input value={className} onChange={setClassName} placeholder="请输入班级名称" /></Field></div>
        <Field label="班主任"><MiniStaffPicker value={classTeacher} onChange={setClassTeacher} /></Field>
        <Field label="级部主任"><MiniStaffPicker value={gradeDirector} onChange={setGradeDirector} /></Field>
        <Field label="检查项" required><RadioGroup options={["缺勤", "纪律", "卫生"]} value={checkItem} onChange={setCheckItem} />{submitted && !checkItem && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="扣分项"><SelectField value={deductItem} onChange={setDeductItem} options={["迟到", "早退", "旷课", "违规使用手机", "宿舍卫生不达标", "其他"]} /></Field>
        <Field label="扣分"><Input value={deductPoints} onChange={setDeductPoints} placeholder="请输入扣分" /></Field>
        <Field label="违纪情况说明"><textarea rows={5} value={note} onChange={(e) => setNote(e.target.value)} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /></Field>
        <Field label="违纪图片"><FileUpload files={photos} onChange={setPhotos} accept="image/*" hint="拖拽或单击后粘贴图片，单张 20MB 以内" /></Field>
        <Field label="提交人手机号" required><Input value={phone} onChange={setPhone} placeholder="请输入手机号" />{submitted && !phone && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
      </div>
    </div></div></div>
    <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
