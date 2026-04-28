"use client";

import { ChevronDown } from "lucide-react";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder = "" }: { placeholder?: string }) {
  return (
    <input
      placeholder={placeholder}
      className="form-input"
      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function SelectField({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select
        className="form-input appearance-none pr-9"
        defaultValue=""
        style={{ color: "#1d1d1f" }}
        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
      >
        <option value="" disabled />
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-3 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

export function StudentScorePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学情分析" }, { label: "学生成绩" }, { label: "学生成绩表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              <Field label="学期" required>
                <SelectField options={["2023-2024学年第一学期", "2023-2024学年第二学期", "2024-2025学年第一学期", "2024-2025学年第二学期"]} />
              </Field>

              <Field label="考试名称" required>
                <Input placeholder="请输入考试名称" />
              </Field>

              <Field label="班级" required>
                <SelectField options={["高一(1)班", "高一(2)班", "高一(3)班", "高二(1)班", "高二(2)班", "高三(1)班", "高三(2)班"]} />
              </Field>

              <Field label="学生姓名" required>
                <SelectField options={[]} />
              </Field>

              <Field label="学科" required>
                <SelectField options={["语文", "数学", "英语", "物理", "化学", "生物", "历史", "地理", "政治"]} />
              </Field>

              <Field label="分数" required>
                <Input placeholder="请输入分数" />
              </Field>

            </div>
          </div>
        </div>
      </div>

      <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4">
        <button
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }}
        >
          提交
        </button>
        <button className="btn-secondary">保存草稿</button>
      </div>
    </div>
  );
}
