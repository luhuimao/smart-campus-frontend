"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children, full }: {
  label: string; required?: boolean; children: React.ReactNode; full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
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

export function GoodDeedsPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生成长" }, { label: "好人好事记录", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              <Field label="学期" required>
                <Input defaultValue="2025-2026学年下学期" />
              </Field>

              <Field label="填报时间" required>
                <DatePicker />
              </Field>

              <MemberPicker label="填报人" required />

              <Field label="年级" required>
                <SelectField options={["高一","高二","高三"]} />
              </Field>

              <Field label="班级名称" required>
                <SelectField options={["高一(1)班","高一(2)班","高二(1)班","高三(1)班"]} />
              </Field>

              <Field label="级部">
                <Input placeholder="请输入级部" />
              </Field>

              <Field label="学生姓名" required>
                <SelectField options={["张三","李四","王五"]} />
              </Field>

              <Field label="学生学号" required>
                <Input placeholder="请输入学号" />
              </Field>

              <Field label="事件发生时间" required>
                <DatePicker />
              </Field>

              <Field label="事件地点">
                <SelectField options={["校内","校外"]} />
                <div className="mt-2">
                  <textarea placeholder="请填写详细地址" rows={3}
                    className="form-input resize-none"
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                </div>
              </Field>

              <Field label="事件描述" required full>
                <textarea placeholder="请输入事件描述" rows={4}
                  className="form-input resize-none"
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
              </Field>

              <MemberPicker label="班主任" required />

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
