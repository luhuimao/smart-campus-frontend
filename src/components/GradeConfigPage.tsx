"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
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

export function GradeConfigPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [grade, setGrade] = useState("");
  const [gradeAlias, setGradeAlias] = useState("");
  const [gradeName, setGradeName] = useState("");
  const [enrollmentYear, setEnrollmentYear] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("grade-config-draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.grade) setGrade(d.grade);
      if (d.gradeAlias) setGradeAlias(d.gradeAlias);
      if (d.gradeName) setGradeName(d.gradeName);
      if (d.enrollmentYear) setEnrollmentYear(d.enrollmentYear);
    } catch {}
  }, []);

  const handleClearForm = () => {
    setGrade(""); setGradeAlias(""); setGradeName(""); setEnrollmentYear("");
    setSubmitted(false);
    localStorage.removeItem("grade-config-draft");
  };

  const handleSaveDraft = () => {
    localStorage.setItem("grade-config-draft", JSON.stringify({
      grade, gradeAlias, gradeName, enrollmentYear,
    }));
  };

  const handleSubmit = () => { setSubmitted(true); if ([grade, gradeAlias, gradeName, enrollmentYear].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader breadcrumbs={[{ label: "基础数据" }, { label: "年级", active: true }]} onMenuOpen={onMenuOpen} />

    <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
      <main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6 pb-24">
        <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <Field label="年级" required><Input value={grade} onChange={setGrade} placeholder="请输入年级" />{submitted && !grade && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="年级别名" required><Input value={gradeAlias} onChange={setGradeAlias} placeholder="请输入年级别名" />{submitted && !gradeAlias && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="年级固有名" required><SelectField value={gradeName} onChange={setGradeName} options={["高中一年级", "高中二年级", "高中三年级"]} />{submitted && !gradeName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="入学年份" required><Input value={enrollmentYear} onChange={setEnrollmentYear} placeholder="请输入入学年份" />{submitted && !enrollmentYear && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
          </div>
        </div>
        <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">
          <button className="btn-secondary" onClick={handleClearForm}>清空数据</button>
          <button className="btn-secondary" onClick={handleSaveDraft}>保存草稿</button>
          <div className="flex-1" />
          <button onClick={handleSubmit} className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }}>提交</button>
        </div>
      </main>
    </div>
  </div>);
}
