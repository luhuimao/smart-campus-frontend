"use client";

import { useState } from "react";
import { ChevronDown, Plus, Upload } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children, full }: {
  label: string; required?: boolean; children: React.ReactNode; full?: boolean;
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

function Textarea({ placeholder = "", rows = 3 }: { placeholder?: string; rows?: number }) {
  return (
    <textarea placeholder={placeholder} rows={rows}
      className="form-input resize-none"
      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
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

export function StudentCadreePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生成长" }, { label: "学生干部风采", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              <Field label="录入学期" required>
                <Input defaultValue="2025-2026学年下学期" disabled />
              </Field>

              <Field label="年级">
                <SelectField options={["高一","高二","高三"]} />
              </Field>

              <Field label="班级名称">
                <Input placeholder="请输入班级名称" />
              </Field>

              <Field label="级部">
                <Input placeholder="请输入级部" />
              </Field>

              <Field label="姓名">
                <Input placeholder="请输入姓名" />
              </Field>

              <Field label="学号" required>
                <Input placeholder="请输入学号" />
              </Field>

              <Field label="职务">
                <Input placeholder="请输入职务" />
              </Field>

              <Field label="自我介绍" full>
                <Textarea placeholder="请输入自我介绍" rows={3} />
              </Field>

              <Field label="任职宣言" full>
                <Textarea placeholder="请输入任职宣言" rows={3} />
              </Field>

              <Field label="家长寄语" full>
                <Textarea placeholder="请输入家长寄语" rows={3} />
              </Field>

              <Field label="德育处评价" full>
                <Textarea placeholder="请输入德育处评价" rows={3} />
              </Field>

              <Field label="学生照片">
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
                  style={{ minHeight: 110 }}>
                  
                  <Upload className="w-6 h-6 text-gray-300" />
                  <span className="text-sm text-gray-400 text-center px-4">选择拖拽或单击后粘贴图片，单张 20MB 以内</span>
                </div>
              </Field>

              <Field label="任职开始时间">
                <DatePicker dateOnly />
              </Field>

              <Field label="任职结束时间">
                <DatePicker dateOnly />
              </Field>

              <MemberPicker label="班主任" />

              <MemberPicker label="级部主任" />

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
