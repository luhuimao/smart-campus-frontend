"use client";

import { Bell, ChevronDown, ChevronRight, Plus, Image, Calendar, ClipboardList, Menu } from "lucide-react";
import { useState } from "react";
import { PageHeader, FlowButton } from "./PageHeader";

const teal = "#00b095";

const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}
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

export function TeacherCertPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [hasCert, setHasCert] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        left={<FlowButton />}
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教师资格证", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          {/* Decorative title */}
          <div className="flex items-center justify-center gap-5 mb-12">
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }}>
              <div className="absolute h-px inset-x-2.5 -top-px opacity-40" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            </div>
            <div
              className="flex items-center gap-3 px-12 py-2 text-white text-base font-semibold tracking-[0.2em]"
              style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}
            >
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
              教师资格证
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }}>
              <div className="absolute h-px inset-x-2.5 -top-px opacity-40" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Row 1 — cream */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教师姓名" required>
                <button
                  className="w-full border border-dashed border-gray-300 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-2 text-base text-gray-500 transition-all hover:border-[#00b095] hover:text-[#00b095]"
                  style={{ minHeight: 44 }}
                >
                  <Plus className="w-4 h-4" /> 选择成员
                </button>
                {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="身份证号码" required>
                <Input />
                {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            {/* Row 2 — white */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white" style={{ gridTemplateColumns: hasCert === "no" ? "1fr" : undefined }}>
              <Field label="有无教师资格证" required>
                <div className="flex items-center gap-10 py-2">
                  {[{ v: "yes", l: "有" }, { v: "no", l: "暂无" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white"
                        style={{ borderColor: hasCert === v ? teal : "#d1d5db" }}
                        onClick={() => setHasCert(v as "yes" | "no")}
                      >
                        {hasCert === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}
                      </div>
                      <span className="text-base font-medium text-gray-700" onClick={() => setHasCert(v as "yes" | "no")}>{l}</span>
                    </label>
                  ))}
                </div>
              </Field>
              {hasCert === "yes" && (
                <Field label="部门" required>
                  <Input />
                  {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                </Field>
              )}
            </div>

            {/* Row 3 — white（隐藏当暂无） */}
            {hasCert === "yes" && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="岗位" required>
                <Input />
              </Field>
              <Field label="岗位类型" hint="可填写任意一个：教学岗 教辅岗 行政岗 工勤岗 技能岗 管理岗" required>
                <Input />
              </Field>
            </div>
            )}

            {/* Row 4 — cream（隐藏当暂无） */}
            {hasCert === "yes" && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="党委/行政职务" required>
                <Input />
              </Field>
              <Field label="联系方式" required>
                <Input />
                {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>
            )}

            {/* Row 5 — white（隐藏当暂无） */}
            {hasCert === "yes" && (
            <div className="p-8 bg-white">
              <div className="max-w-md">
                <Field label="担任学科" required>
                  <Input />
                </Field>
              </div>
            </div>
            )}

            {/* Section: 教资信息 table（隐藏当暂无） */}
            {hasCert === "yes" && (
            <div className="p-8 bg-white border-t border-gray-50">
              <p className="text-base font-semibold mb-6">
                <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>教资信息
              </p>

              {/* Grid table */}
              <div
                className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm"
                style={{ display: "grid", gridTemplateColumns: "48px 1.3fr 1fr 1fr 1.1fr 1.1fr" }}
              >
                {/* Header */}
                {["", "教资证书编号", "教师资格种类", "任教科目", "教师资格证书图片", "获证时间"].map((h, i) => (
                  <div key={i} className="px-3 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0">
                    {i > 0 && i !== 3 && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                    {h}
                  </div>
                ))}

                {/* Row 1 */}
                <div className="px-3 py-2.5 bg-white border-b border-r border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">1</div>
                <div className="px-2 py-2 bg-white border-b border-r border-gray-100">
                  <input
                    type="text"
                    className="table-input"
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                  />
                </div>
                <div className="px-2 py-2 bg-white border-b border-r border-gray-100">
                  <select
                    className="table-input appearance-none"
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                  >
                    <option value=""></option>
                    <option>高中</option>
                    <option>初中</option>
                    <option>小学</option>
                    <option>幼儿园</option>
                  </select>
                </div>
                <div className="px-2 py-2 bg-white border-b border-r border-gray-100">
                  <select
                    className="table-input appearance-none"
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                  >
                    <option value=""></option>
                    <option>语文</option>
                    <option>数学</option>
                    <option>英语</option>
                    <option>物理</option>
                    <option>化学</option>
                  </select>
                </div>
                <div className="px-2 py-2 bg-white border-b border-r border-gray-100">
                  <div className="w-full h-8 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 text-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
                    <Image className="w-4 h-4" />
                  </div>
                </div>
                <div className="px-2 py-2 bg-white border-b border-gray-100">
                  <div className="w-full h-8 border border-gray-200 rounded-lg flex items-center justify-between px-3 bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                    <span className="text-[10px]">请选择</span>
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Add / Quick fill */}
              <div className="flex items-center gap-8 mt-5">
                <button className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }}>
                  <Plus className="w-4 h-4" /> 添加
                </button>
                <button className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }}>
                  <ClipboardList className="w-4 h-4" /> 快速填报
                </button>
              </div>
            </div>
            )}

          </div>
        </main>
      </div>

      {/* Fixed footer */}
      <div
        className="form-footer shrink-0 flex gap-3 px-10 py-4"
      >
        <button
          className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
          onClick={() => setSubmitted(true)}
        >
          提交
        </button>
        <button
          className="btn-secondary"
        >
          保存草稿
        </button>
      </div>
    </div>
  );
}
