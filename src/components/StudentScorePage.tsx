"use client";

import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { StudentPicker } from "./ui/StudentPicker";
import { useCourses, useTermInfo, type StudentInfoRecord } from "@/hooks/use-research-dashboard";
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
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled />{options.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={15} className="absolute right-3.5 top-3 pointer-events-none" style={{ color: "#9ca3af" }} /></div>);
}

export function StudentScorePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [semester, setSemester] = useState("");
  const [examName, setExamName] = useState("");
  const [className, setClassName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { raw: courseList } = useCourses();
  const subjectOptions = useMemo(() => [...new Set(courseList.map((c) => c.教研学科名 || c.科目).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [courseList]);

  const { raw: termList } = useTermInfo();
  const semesterOptions = useMemo(() => [...new Set(termList.map((t) => t.学期名称).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [termList]);

  const handleSelectStudent = (record: StudentInfoRecord | null) => {
    if (record) setClassName(record.班级名称 || "");
    else setClassName("");
  };

  const handleSubmit = () => { setSubmitted(true); if ([semester, examName, className, studentName, subject, score].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader breadcrumbs={[{ label: "学情分析" }, { label: "学生成绩" }, { label: "学生成绩表", active: true }]} onMenuOpen={onMenuOpen} />

    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6"><div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <Field label="学期" required><SelectField value={semester} onChange={setSemester} options={semesterOptions} />{submitted && !semester && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="考试名称" required><Input value={examName} onChange={setExamName} placeholder="请输入考试名称" />{submitted && !examName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="班级" required><Input value={className} onChange={setClassName} placeholder="请输入班级" />{submitted && !className && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学生姓名" required><StudentPicker value={studentName} onChange={setStudentName} onSelectRecord={handleSelectStudent} />{submitted && !studentName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学科" required><SelectField value={subject} onChange={setSubject} options={subjectOptions} />{submitted && !subject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="分数" required><Input value={score} onChange={setScore} placeholder="请输入分数" />{submitted && !score && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
      </div>
    </div></div></div>

    <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
