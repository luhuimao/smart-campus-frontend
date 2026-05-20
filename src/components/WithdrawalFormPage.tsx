"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { ChevronDown, Pen, Plus, Menu } from "lucide-react";
import { StudentPicker } from "./ui/StudentPicker";
import type { StudentInfoRecord } from "@/hooks/use-research-dashboard";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, hint, full, children }: { label: string; required?: boolean; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (<div className={full ? "md:col-span-2" : ""}><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{hint && <p className="mb-2 text-xs leading-relaxed" style={{ color: "#6b7280" }}>{hint}</p>}{children}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled />{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (<div className="flex items-center gap-6 pt-1">{options.map(opt => (<label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none"><span onClick={() => onChange(opt)} className="shrink-0 flex items-center justify-center rounded-full border transition-colors" style={{ width: 18, height: 18, borderColor: value === opt ? "#10b981" : "#d1d5db", background: "white" }}>{value === opt && <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />}</span><span className="text-sm" style={{ color: "#374151" }}>{opt}</span></label>))}</div>);
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

const REASONS = ["身体疾病", "与同学有关", "与老师有关", "与学校管理有关", "食堂伙食", "课程教学", "学费", "学校活动", "宿舍环境", "校园环境"];

export function WithdrawalFormPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [cls, setCls] = useState("");
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [handleDate, setHandleDate] = useState("");
  const [action, setAction] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [reasons, setReasons] = useState<Set<string>>(new Set());
  const [extraReasons, setExtra] = useState<string[]>([]);
  const [isNew, setIsNew] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [signDate, setSignDate] = useState("");
  const [parentRelation, setParentRelation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleReason = (r: string) => setReasons(prev => { const s = new Set(prev); s.has(r) ? s.delete(r) : s.add(r); return s; });

  const handleSelectStudent = (record: StudentInfoRecord | null) => {
    if (record) {
      setCls(record.班级名称 || "");
      setPhone(record.学生本人电话 || "");
    } else {
      setCls("");
      setPhone("");
    }
  };

  const handleSubmit = () => { setSubmitted(true); if ([cls, studentName, phone, handleDate, action, leaveDate, reasons.size > 0, isNew, suggestion, bankAccount, bankName, bankBranch, signDate, parentRelation].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader breadcrumbs={[{ label: "学生管理" }, { label: "学生退/转/休学申请表", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6"><div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <Field label="班级" required><Input value={cls} onChange={setCls} placeholder="请输入班级" />{submitted && !cls && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学生姓名" required><StudentPicker value={studentName} onChange={setStudentName} onSelectRecord={handleSelectStudent} />{submitted && !studentName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="联系电话" required><Input value={phone} onChange={setPhone} placeholder="请输入联系电话" />{submitted && !phone && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="办理时间" required><DatePicker value={handleDate} onChange={setHandleDate} />{submitted && !handleDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="办理事项" required hint={"1) 退学：如果办理退学，学籍无法恢复，无法再读高中，请学生和家长知晓；\n2) 休学：请向学籍管理部门提交休学申请。"}><RadioGroup options={["退学", "转学", "休学"]} value={action} onChange={setAction} />{submitted && !action && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学生离校时间" required><DatePicker value={leaveDate} onChange={setLeaveDate} />{submitted && !leaveDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="退/转/休学原因（可多选）" required hint="其他原因请【添加选项】"><div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2">{[...REASONS, ...extraReasons].map(r => (<label key={r} className="inline-flex items-center gap-2 cursor-pointer select-none"><span onClick={() => toggleReason(r)} className="shrink-0 flex items-center justify-center rounded border-2 transition-colors" style={{ width: 18, height: 18, borderColor: reasons.has(r) ? "#10b981" : "#d1d5db", background: reasons.has(r) ? "#10b981" : "white" }}>{reasons.has(r) && (<svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>)}</span><span className="text-sm" style={{ color: "#374151" }}>{r}</span></label>))}</div><button type="button" onClick={() => setExtra(prev => [...prev, `自定义原因${prev.length + 1}`])} className="mt-3 flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80" style={{ color: "#10b981" }}><Plus size={16} />添加选项</button>{submitted && reasons.size === 0 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>请至少选择一项原因</p>}</Field>
        <Field label="是否是插班生/复读生/高一新生第一学期结束前？" required hint="如果您是插班生/复读生/高一新生，且目前办理申请时处于第一学期结束前，请选择【是】，否则选择【否】"><RadioGroup options={["是", "否"]} value={isNew} onChange={setIsNew} />{submitted && !isNew && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="对学校的意见和建议" required><textarea rows={6} value={suggestion} onChange={(e) => setSuggestion(e.target.value)} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />{submitted && !suggestion && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <div className="flex flex-col gap-6">
          <Field label="如有退费，退费接收银行账号" required><Input value={bankAccount} onChange={setBankAccount} placeholder="请输入银行账号" />{submitted && !bankAccount && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
          <Field label="银行账号户名" required><Input value={bankName} onChange={setBankName} placeholder="请输入户名" />{submitted && !bankName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
          <Field label="开户行" required><Input value={bankBranch} onChange={setBankBranch} placeholder="请输入开户行" />{submitted && !bankBranch && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        </div>
        <Field label="学生签字" required><div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" style={{ height: 100, color: "#6b7280" }}><Pen size={16} /><span className="text-sm">添加签名</span></div>{submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="签字时间" required><DatePicker value={signDate} onChange={setSignDate} />{submitted && !signDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="家长签字" required><div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" style={{ height: 100, color: "#6b7280" }}><Pen size={16} /><span className="text-sm">添加签名</span></div>{submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="与学生关系" required><SelectField value={parentRelation} onChange={setParentRelation} options={["父亲", "母亲", "祖父", "祖母", "其他监护人"]} />{submitted && !parentRelation && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
      </div>
    </div></div></div>
    <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
