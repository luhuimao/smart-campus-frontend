"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (<div className="flex items-center gap-6 pt-1">{options.map(opt => (<label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none"><span onClick={() => onChange(opt)} className="shrink-0 flex items-center justify-center rounded-full border transition-colors" style={{ width: 18, height: 18, borderColor: value === opt ? "#10b981" : "#d1d5db", background: "white" }}>{value === opt && <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />}</span><span className="text-sm" style={{ color: "#374151" }}>{opt}</span></label>))}</div>);
}

export function SemesterConfigPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isCurrent, setIsCurrent] = useState("");
  const [schoolYear, setSchoolYear] = useState("");
  const [quarter, setQuarter] = useState("");
  const [semester, setSemester] = useState("");
  const [semesterName, setSemesterName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("semester-config-draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.startDate) setStartDate(new Date(d.startDate));
      if (d.endDate) setEndDate(new Date(d.endDate));
      if (d.isCurrent) setIsCurrent(d.isCurrent);
      if (d.schoolYear) setSchoolYear(d.schoolYear);
      if (d.quarter) setQuarter(d.quarter);
      if (d.semester) setSemester(d.semester);
      if (d.semesterName) setSemesterName(d.semesterName);
    } catch {}
  }, []);

  const handleClearForm = () => {
    setStartDate(null); setEndDate(null); setIsCurrent("");
    setSchoolYear(""); setQuarter(""); setSemester(""); setSemesterName("");
    setSubmitted(false);
    localStorage.removeItem("semester-config-draft");
  };

  const handleSaveDraft = () => {
    localStorage.setItem("semester-config-draft", JSON.stringify({
      startDate: startDate?.toISOString(), endDate: endDate?.toISOString(),
      isCurrent, schoolYear, quarter, semester, semesterName,
    }));
  };

  const handleSubmit = () => { setSubmitted(true); if ([startDate, endDate, isCurrent, schoolYear, quarter, semester, semesterName].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader breadcrumbs={[{ label: "基础数据" }, { label: "学期", active: true }]} onMenuOpen={onMenuOpen} />

    <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
      <main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6 pb-24">
        <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <Field label="学期开始时间" required><DatePicker value={startDate} onChange={setStartDate} dateOnly />{submitted && !startDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="学期结束时间" required><DatePicker value={endDate} onChange={setEndDate} dateOnly />{submitted && !endDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="是否是当前学期" required><RadioGroup options={["是", "否"]} value={isCurrent} onChange={setIsCurrent} />{submitted && !isCurrent && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="学年" required><Input value={schoolYear} onChange={setSchoolYear} placeholder="请输入学年" />{submitted && !schoolYear && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="学期季度" required><Input value={quarter} onChange={setQuarter} placeholder="请输入学期季度" />{submitted && !quarter && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="学期" required><Input value={semester} onChange={setSemester} placeholder="请输入学期" />{submitted && !semester && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
            <Field label="学期名称" required><Input value={semesterName} onChange={setSemesterName} placeholder="请输入学期名称" />{submitted && !semesterName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
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
