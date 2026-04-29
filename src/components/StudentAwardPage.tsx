"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";

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

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder = "", type = "text", defaultValue, disabled }: {
  placeholder?: string; type?: string; defaultValue?: string; disabled?: boolean;
}) {
  return (
    <input type={type} placeholder={placeholder} defaultValue={defaultValue} disabled={disabled}
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

export function StudentAwardPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生成长" }, { label: "学生获奖记录", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            {/* 学期 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Field label="学期" required>
                <Input defaultValue="2025-2026学年下学期" />
              </Field>
            </div>

            {/* 获奖信息 */}
            <SectionHeader title="获奖信息" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <Field label="年级" required>
                <SelectField options={["高一","高二","高三"]} />
              </Field>
              <Field label="班级名称" required>
                <SelectField options={["高一(1)班","高一(2)班","高二(1)班","高三(1)班"]} />
              </Field>
              <Field label="学生姓名" required>
                <SelectField options={["张三","李四","王五"]} />
              </Field>
              <Field label="学生学号" required>
                <Input placeholder="请输入学号" />
              </Field>
              <Field label="获奖级别" required>
                <SelectField options={["国家级","省级","市级","县级","校级"]} />
              </Field>
              <Field label="获奖等级" required>
                <Input placeholder="例如：一等奖/第一名" />
              </Field>
              <Field label="参与比赛名称" required>
                <Input placeholder="请输入比赛名称" />
              </Field>
              <Field label="获奖时间" required>
                <DatePicker />
              </Field>
              <Field label="颁发单位" required>
                <Input placeholder="以证书公章为准" />
              </Field>
              <Field label="个人/团体获奖" required>
                <SelectField options={["个人","团体"]} />
              </Field>
            </div>

            {/* 指导老师 */}
            <SectionHeader title="指导老师" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <MemberPicker label="指导老师" />
            </div>

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
