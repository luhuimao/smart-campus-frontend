"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="relative flex items-center justify-center my-6" style={{ height: 32 }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 0%, #10b981 10%, #10b981 90%, transparent 100%)" }} />
      <div className="absolute" style={{ left: "10%", width: 12, height: 12, background: "#10b981", transform: "rotate(45deg)" }} />
      <div className="absolute" style={{ right: "10%", width: 12, height: 12, background: "#10b981", transform: "rotate(45deg)" }} />
      <span className="relative z-10 text-white font-medium text-sm">{title}</span>
    </div>
  );
}

function Field({ label, required, full, children }: {
  label: string; required?: boolean; full?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-sm font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder = "", defaultValue, disabled }: {
  placeholder?: string; defaultValue?: string; disabled?: boolean;
}) {
  return (
    <input placeholder={placeholder} defaultValue={defaultValue} disabled={disabled}
      className="form-input"
      style={disabled ? { background: "#f9fafb", color: "#9ca3af" } : undefined}
      onFocus={e => { if (!disabled) Object.assign(e.currentTarget.style, focusStyle); }}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function SelectField({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select className="form-input appearance-none pr-9" defaultValue=""
        style={{ color: "#1d1d1f" }}
        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}>
        <option value="" disabled />
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-3 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

function MemberPicker({ label, required }: { label: string; required?: boolean }) {
  const [members, setMembers] = useState<string[]>([]);
  return (
    <Field label={label} required={required}>
      <button type="button"
        onClick={() => setMembers(prev => prev.length === 0 ? ["王老师"] : prev)}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1 hover:border-emerald-400 transition-colors bg-white"
        style={{ color: "#9ca3af" }}>
        <Plus size={16} />
        <span className="text-sm">选择成员</span>
      </button>
      {members.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {members.map(m => (
            <span key={m} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: "#10b981" }}>
              {m}
              <button type="button" onClick={() => setMembers([])} className="ml-1 hover:opacity-70">×</button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

interface AbsenceSection {
  key: string;
  title: string;
  nameLabel: string;
  countLabel: string;
  descLabel: string;
}

const ABSENCE_SECTIONS: AbsenceSection[] = [
  { key: "sick",     title: "病假学生情况",       nameLabel: "病假学生姓名",       countLabel: "病假学生人数",       descLabel: "病假具体情况说明" },
  { key: "personal", title: "事假学生情况",       nameLabel: "事假学生姓名",       countLabel: "事假学生人数",       descLabel: "事假具体情况说明" },
  { key: "training", title: "在外学习培训学生情况", nameLabel: "在外学习培训学生姓名", countLabel: "在外学习培训学生人数", descLabel: "在外学习培训具体情况说明" },
  { key: "suspend",  title: "休学学生情况",       nameLabel: "休学学生姓名",       countLabel: "休学学生人数",       descLabel: "休学具体情况说明" },
  { key: "dropout",  title: "流失学生情况",       nameLabel: "流失学生姓名",       countLabel: "流失学生人数",       descLabel: "流失学生具体情况说明" },
];

export function ReturnRegisterPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生管理" }, { label: "返校登记表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Field label="填报日期">
                <Input defaultValue="2026-04-29" disabled />
              </Field>
              <Field label="学期">
                <Input defaultValue="2025-2026学年下学期" disabled />
              </Field>
              <MemberPicker label="提交人" />
              <Field label="班级名称">
                <Input placeholder="暂无内容" disabled />
              </Field>
            </div>

            {/* 统计人数 */}
            <SectionHeader title="统计人数" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Field label="应到学生人数">
                <Input placeholder="暂无内容" disabled />
              </Field>
              <Field label="返校学生人数">
                <Input defaultValue="0" disabled />
              </Field>
              <Field label="未返校学生人数">
                <Input defaultValue="0" disabled />
              </Field>
              <Field label="转入学生人数">
                <input className="form-input"
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
              </Field>
            </div>

            {/* 各类学生情况 */}
            {ABSENCE_SECTIONS.map(s => (
              <div key={s.key}>
                <SectionHeader title={s.title} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <Field label={s.nameLabel}>
                    <SelectField options={["张三", "李四", "王五"]} />
                  </Field>
                  <Field label={s.countLabel}>
                    <Input defaultValue="0" disabled />
                  </Field>
                  <Field label={s.descLabel} full>
                    <textarea rows={4} className="form-input resize-none"
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                  </Field>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>

      <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4">
        <button
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }}>
          提交
        </button>
        <button className="btn-secondary">保存草稿</button>
      </div>
    </div>
  );
}
