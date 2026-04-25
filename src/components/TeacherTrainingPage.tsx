"use client";

import { Bell, ChevronDown, ChevronRight, Calendar, Plus, Menu } from "lucide-react";
import { PageHeader, FlowButton } from "./PageHeader";

const teal = "#00b095";

const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

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

function Input({ placeholder = "" }: { placeholder?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="form-input"
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function DateInput() {
  return (
    <div className="relative">
      <Input />
      <Calendar className="w-4 h-4 absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Select({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select
        className="form-input appearance-none"
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
      >
        <option value=""></option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
    </div>
  );
}

export function TeacherTrainingPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        left={<FlowButton />}
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教师培训", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          {/* Decorative title — blue theme */}
          <div className="flex items-center justify-center gap-5 mb-12">
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            <div
              className="flex items-center gap-3 px-12 py-2 text-white text-sm font-semibold tracking-[0.2em]"
              style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}
            >
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
              培训信息
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
          </div>

          {/* Form card */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Row 1 — cream: 培训渠道 + 培训名称 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6" style={{ backgroundColor: "#fffcf2" }}>
              <Field label="培训渠道" required>
                <Select options={["校内培训", "校外培训"]} />
              </Field>
              <Field label="培训名称" required>
                <Input />
              </Field>
            </div>

            {/* Row 2 — white: 培训开始时间 + 培训结束时间 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="培训开始时间" required>
                <DateInput />
              </Field>
              <Field label="培训结束时间" required>
                <DateInput />
              </Field>
            </div>

            {/* Row 3 — cream: 主讲人 + 参训人员 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6" style={{ backgroundColor: "#fffcf2" }}>
              <Field label="主讲人" required>
                <Input />
              </Field>
              <Field label="参训人员" required>
                <button
                  className="w-full border border-dashed border-gray-300 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-500 transition-all hover:border-teal-400 hover:text-teal-600"
                  style={{ minHeight: 44 }}
                >
                  <Plus className="w-4 h-4 opacity-60" /> 选择成员
                </button>
              </Field>
            </div>

            {/* Row 4 — white: 具体人数 + 培训形式 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="具体人数" required>
                <Input />
              </Field>
              <Field label="培训形式" required>
                <Select options={["线上培训", "线下培训"]} />
              </Field>
            </div>

            {/* Row 5 — cream: 备注（全宽） */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12" style={{ backgroundColor: "#fffcf2" }}>
              <Field label="备注" full>
                <textarea
                  rows={5}
                  className="form-input resize-none"
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                />
              </Field>
            </div>
          </div>
        </main>
      </div>

      {/* Fixed footer */}
      <div
        className="form-footer shrink-0 flex gap-3 px-10 py-4"
      >
        <button
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
        >
          提交
        </button>
        <button className="btn-secondary">
          保存草稿
        </button>
      </div>
    </div>
  );
}
