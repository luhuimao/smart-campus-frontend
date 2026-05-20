"use client";

import { useState } from "react";
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

export function SubjectConfigPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [subject, setSubject] = useState("");
  const [nationalSubject, setNationalSubject] = useState("");
  const [nationalGroup, setNationalGroup] = useState("");
  const [stage, setStage] = useState("");
  const [stageSubjectName, setStageSubjectName] = useState("");
  const [researchSubjectName, setResearchSubjectName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => { setSubmitted(true); if ([subject, nationalSubject, nationalGroup, stage, stageSubjectName, researchSubjectName].find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader breadcrumbs={[{ label: "基础数据" }, { label: "科目", active: true }]} onMenuOpen={onMenuOpen} />

    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6"><div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        <Field label="科目" required><Input value={subject} onChange={setSubject} placeholder="请输入科目" />{submitted && !subject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学科（国标）" required><SelectField value={nationalSubject} onChange={setNationalSubject} options={["语文", "数学", "外语", "物理", "化学", "生物", "历史", "地理", "政治", "体育", "音乐", "美术", "信息技术"]} />{submitted && !nationalSubject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="分组（国标）" required><SelectField value={nationalGroup} onChange={setNationalGroup} options={["人文与社会", "数学与自然", "艺术与体育", "综合实践"]} />{submitted && !nationalGroup && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学段" required><SelectField value={stage} onChange={setStage} options={["小学", "初中", "高中", "中职"]} />{submitted && !stage && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="学段科目名" required><Input value={stageSubjectName} onChange={setStageSubjectName} placeholder="请输入学段科目名" />{submitted && !stageSubjectName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
        <Field label="教研学科名" required><Input value={researchSubjectName} onChange={setResearchSubjectName} placeholder="请输入教研学科名" />{submitted && !researchSubjectName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
      </div>
    </div></div></div>

    <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
