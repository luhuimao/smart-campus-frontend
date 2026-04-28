"use client";

import { useState } from "react";
import { ChevronDown, Pen } from "lucide-react";
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
    <input placeholder={placeholder} className="form-input"
      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
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

function SignatureBox() {
  return (
    <div className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
      style={{ height: 100, color: "#6b7280" }}>
      <Pen size={16} />
      <span className="text-sm">添加签名</span>
    </div>
  );
}

const CHANGE_TYPES = [
  { label: "变更选科和班级", color: "#10b981" },
  { label: "仅变更选科",     color: "#10b981" },
  { label: "仅变更班级",     color: "#f87171" },
];

export function ClassTransferPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [changeType, setChangeType] = useState("变更选科和班级");

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生管理" }, { label: "转科（班）申请表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            <SectionHeader title="申请信息" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              <Field label="学生班级">
                <SelectField options={["高一(1)班", "高一(2)班", "高二(1)班", "高三(1)班"]} />
              </Field>

              <Field label="学生姓名" required>
                <SelectField options={["张三", "李四", "王五"]} />
              </Field>

              <Field label="变更类型" required>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {CHANGE_TYPES.map(({ label, color }) => (
                    <label key={label} className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <span
                        onClick={() => setChangeType(label)}
                        className="shrink-0 flex items-center justify-center rounded-full border-2 transition-colors"
                        style={{ width: 18, height: 18, borderColor: changeType === label ? "#10b981" : "#d1d5db", background: "white" }}>
                        {changeType === label && (
                          <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />
                        )}
                      </span>
                      <span
                        className="px-3 py-0.5 rounded text-xs font-semibold text-white transition-opacity"
                        style={{ background: color, opacity: changeType === label ? 1 : 0.45 }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="转科（班）原因" required>
                <textarea rows={6} className="form-input resize-none"
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
              </Field>

              {/* 变更选科和班级：科目 + 班级字段 */}
              {changeType === "变更选科和班级" && (<>
                <Field label="原选科科目" required>
                  <Input placeholder="请输入原选科科目" />
                </Field>
                <Field label="原外语选科" required>
                  <Input placeholder="请输入原外语选科" />
                </Field>
                <Field label="原班级" required>
                  <SelectField options={["高一(1)班", "高一(2)班", "高二(1)班", "高三(1)班"]} />
                </Field>
                <Field label="新选科科目" required>
                  <SelectField options={["物理+化学+生物", "物理+化学+地理", "历史+政治+地理", "物理+历史+化学"]} />
                </Field>
                <Field label="新外语选科" required>
                  <SelectField options={["英语", "日语", "德语", "法语"]} />
                </Field>
                <Field label="新班级" required>
                  <SelectField options={["高一(1)班", "高一(2)班", "高二(1)班", "高三(1)班"]} />
                </Field>
              </>)}

              {/* 仅变更选科：原/新科目字段 */}
              {changeType === "仅变更选科" && (<>
                <Field label="原选科科目" required>
                  <Input placeholder="请输入原选科科目" />
                </Field>
                <Field label="原外语选科" required>
                  <Input placeholder="请输入原外语选科" />
                </Field>
                <Field label="新选科科目" required>
                  <SelectField options={["物理+化学+生物", "物理+化学+地理", "历史+政治+地理", "物理+历史+化学"]} />
                </Field>
                <Field label="新外语选科" required>
                  <SelectField options={["英语", "日语", "德语", "法语"]} />
                </Field>
              </>)}

              {/* 仅变更班级：原/新班级字段 */}
              {changeType === "仅变更班级" && (<>
                <Field label="原班级" required>
                  <SelectField options={["高一(1)班", "高一(2)班", "高二(1)班", "高三(1)班"]} />
                </Field>
                <Field label="新班级" required>
                  <SelectField options={["高一(1)班", "高一(2)班", "高二(1)班", "高三(1)班"]} />
                </Field>
              </>)}

            </div>

            {changeType !== "仅变更班级" && (
              <div className="mt-6">
                <Field label="家长签名" required>
                  <SignatureBox />
                </Field>
              </div>
            )}

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
