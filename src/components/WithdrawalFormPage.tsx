"use client";

import { useState } from "react";
import { ChevronDown, Pen, Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, hint, full, children }: {
  label: string; required?: boolean; hint?: string; full?: boolean; children: React.ReactNode;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {hint && <p className="mb-2 text-xs leading-relaxed" style={{ color: "#6b7280" }}>{hint}</p>}
      {children}
    </div>
  );
}

function Input({ placeholder = "", disabled }: { placeholder?: string; disabled?: boolean }) {
  return (
    <input placeholder={placeholder} disabled={disabled}
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

function RadioGroup({ name, options, value, onChange }: {
  name: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-6 pt-1">
      {options.map(opt => (
        <label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none">
          <span
            onClick={() => onChange(opt)}
            className="shrink-0 flex items-center justify-center rounded-full border transition-colors"
            style={{ width: 18, height: 18, borderColor: value === opt ? "#10b981" : "#d1d5db", background: "white" }}>
            {value === opt && <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />}
          </span>
          <span className="text-sm" style={{ color: "#374151" }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function SignatureBox() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      style={{ height: 100, color: "#6b7280" }}>
      <Pen size={16} />
      <span className="text-sm">添加签名</span>
    </div>
  );
}

const REASONS = ["身体疾病", "与同学有关", "与老师有关", "与学校管理有关", "食堂伙食", "课程教学", "学费", "学校活动", "宿舍环境", "校园环境"];

export function WithdrawalFormPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [action, setAction]         = useState("");
  const [isNew, setIsNew]           = useState("");
  const [reasons, setReasons]       = useState<Set<string>>(new Set());
  const [extraReasons, setExtra]    = useState<string[]>([]);

  const toggleReason = (r: string) =>
    setReasons(prev => { const s = new Set(prev); s.has(r) ? s.delete(r) : s.add(r); return s; });

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生管理" }, { label: "学生退/转/休学申请表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              <Field label="班级" required>
                <SelectField options={["高一(1)班", "高一(2)班", "高二(1)班", "高三(1)班"]} />
              </Field>

              <Field label="学生姓名" required>
                <SelectField options={["张三", "李四", "王五"]} />
              </Field>

              <Field label="联系电话" required>
                <Input placeholder="请输入联系电话" />
              </Field>

              <Field label="办理时间" required>
                <DatePicker dateOnly />
              </Field>

              <Field label="办理事项" required
                hint={"1) 退学：如果办理退学，学籍无法恢复，无法再读高中，请学生和家长知晓；\n2) 休学：请向学籍管理部门提交休学申请。"}>
                <RadioGroup name="action" options={["退学", "转学", "休学"]} value={action} onChange={setAction} />
              </Field>

              <Field label="学生离校时间" required>
                <DatePicker dateOnly />
              </Field>

              <Field label="退/转/休学原因（可多选）" required
                hint="其他原因请【添加选项】">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2">
                  {[...REASONS, ...extraReasons].map(r => (
                    <label key={r} className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <span
                        onClick={() => toggleReason(r)}
                        className="shrink-0 flex items-center justify-center rounded border-2 transition-colors"
                        style={{ width: 18, height: 18, borderColor: reasons.has(r) ? "#10b981" : "#d1d5db", background: reasons.has(r) ? "#10b981" : "white" }}>
                        {reasons.has(r) && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm" style={{ color: "#374151" }}>{r}</span>
                    </label>
                  ))}
                </div>
                <button type="button"
                  onClick={() => setExtra(prev => [...prev, `自定义原因${prev.length + 1}`])}
                  className="mt-3 flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: "#10b981" }}>
                  <Plus size={16} />
                  添加选项
                </button>
              </Field>

              <Field label="是否是插班生/复读生/高一新生第一学期结束前？" required
                hint="如果您是插班生/复读生/高一新生，且目前办理申请时处于第一学期结束前，请选择【是】，否则选择【否】">
                <RadioGroup name="is_new" options={["是", "否"]} value={isNew} onChange={setIsNew} />
              </Field>

              <Field label="对学校的意见和建议" required>
                <textarea rows={6} className="form-input resize-none"
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
              </Field>

              <div className="flex flex-col gap-6">
                <Field label="如有退费，退费接收银行账号" required>
                  <Input placeholder="请输入银行账号" />
                </Field>
                <Field label="银行账号户名" required>
                  <Input placeholder="请输入户名" />
                </Field>
                <Field label="开户行" required>
                  <Input placeholder="请输入开户行" />
                </Field>
              </div>

              <Field label="学生签字" required>
                <SignatureBox />
              </Field>

              <Field label="签字时间" required>
                <DatePicker dateOnly />
              </Field>

              <Field label="家长签字" required>
                <SignatureBox />
              </Field>

              <Field label="与学生关系" required>
                <SelectField options={["父亲", "母亲", "祖父", "祖母", "其他监护人"]} />
              </Field>

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
