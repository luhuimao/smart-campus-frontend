"use client";

import { Bell, ChevronDown, ChevronRight, Plus, Image, Calendar, ClipboardList, X, Menu } from "lucide-react";
import { useState } from "react";
import { PageHeader, FlowButton } from "./PageHeader";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };
const inputCls   = "w-full bg-white border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-sm outline-none transition-all";

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: "#1d1d1f" }}>
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
      className={inputCls}
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e)  => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

export function TitleInfoPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [hasTitle, setHasTitle] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif', color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        left={<FlowButton />}
        breadcrumbs={[{ label: "教师基础档案" }, { label: "职称信息", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          {/* Decorative title */}
          <div className="flex items-center justify-center gap-5 mb-10">
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }}>
              <div className="absolute h-px inset-x-2.5 -top-px opacity-40" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            </div>
            <div
              className="flex items-center gap-3 px-12 py-2 text-white text-sm font-semibold tracking-[0.2em]"
              style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}
            >
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
              职称信息
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }}>
              <div className="absolute h-px inset-x-2.5 -top-px opacity-40" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Row 1 — cream: 教师姓名 + 身份证号码 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6" style={{ backgroundColor: "#fffcf2" }}>
              <Field label="教师姓名" required>
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 rounded-[10px] min-h-[44px] bg-white"
                  style={{ border: "1px dashed #d1d5db" }}>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border"
                    style={{ background: "#f3f4f6", borderColor: "#e5e7eb" }}>
                    <span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">卢</span>
                    卢辉茂
                    <X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" />
                  </span>
                </div>
                {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="身份证号码" required>
                <Input />
                {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            {/* Row 2 — white: 有无职称 + 部门 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"
              style={{ gridTemplateColumns: hasTitle === "no" ? "1fr" : undefined }}>
              <Field label="有无职称" required>
                <div className="flex items-center gap-10 py-2">
                  {[{ v: "yes", l: "有" }, { v: "no", l: "暂无" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white"
                        style={{ borderColor: hasTitle === v ? teal : "#d1d5db" }}
                        onClick={() => setHasTitle(v as "yes" | "no")}
                      >
                        {hasTitle === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}
                      </div>
                      <span className="text-sm font-medium text-gray-700" onClick={() => setHasTitle(v as "yes" | "no")}>{l}</span>
                    </label>
                  ))}
                </div>
              </Field>
              {hasTitle === "yes" && (
                <Field label="部门" required>
                  <Input />
                </Field>
              )}
            </div>

            {/* Row 3 — cream: 岗位 + 岗位类型（隐藏当暂无） */}
            {hasTitle === "yes" && (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6" style={{ backgroundColor: "#fffcf2" }}>
                <Field label="岗位" required>
                  <Input />
                </Field>
                <Field label="岗位类型" hint="可填写任意一个：教学岗 教辅岗 行政岗 工勤岗 技能岗 管理岗" required>
                  <Input />
                </Field>
              </div>
            )}

            {/* Row 4 — white: 党委/行政职务 + 联系方式（隐藏当暂无） */}
            {hasTitle === "yes" && (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="党委/行政职务" required>
                  <Input />
                </Field>
                <Field label="联系方式" required>
                  <Input />
                </Field>
              </div>
            )}

            {/* Row 5 — cream: 担任学科（隐藏当暂无） */}
            {hasTitle === "yes" && (
              <div className="p-8" style={{ backgroundColor: "#fffcf2" }}>
                <div className="max-w-md">
                  <Field label="担任学科" required>
                    <Input />
                  </Field>
                </div>
              </div>
            )}

            {/* Row 6 — white: 职称信息表格（隐藏当暂无） */}
            {hasTitle === "yes" && (
              <div className="p-8 bg-white border-t border-gray-50">
                <p className="text-sm font-semibold mb-6">
                  <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>职称信息
                </p>

                <div
                  className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm"
                  style={{ display: "grid", gridTemplateColumns: "80px 1.5fr 1.5fr 1fr 1fr" }}
                >
                  {/* Header */}
                  {[
                    { label: "",         req: false },
                    { label: "证书编号",    req: true  },
                    { label: "教师职称级别", req: true  },
                    { label: "获评时间",    req: true  },
                    { label: "职称证书",    req: true  },
                  ].map(({ label, req }, i) => (
                    <div key={i} className="px-3 py-3 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0 flex items-center">
                      {req && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                      {label}
                    </div>
                  ))}

                  {/* Row 1 */}
                  <div className="px-3 py-2.5 bg-white border-b border-r border-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">1</div>
                  <div className="px-2 py-2 bg-white border-b border-r border-gray-100">
                    <input type="text" className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none transition-all"
                      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={(e)  => Object.assign(e.currentTarget.style, blurStyle)} />
                  </div>
                  <div className="px-2 py-2 bg-white border-b border-r border-gray-100">
                    <select className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none appearance-none transition-all"
                      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                      onBlur={(e)  => Object.assign(e.currentTarget.style, blurStyle)}>
                      <option value=""></option>
                      <option>正高级教师</option>
                      <option>副高级教师</option>
                      <option>一级教师</option>
                      <option>二级教师</option>
                      <option>三级教师</option>
                    </select>
                  </div>
                  <div className="px-2 py-2 bg-white border-b border-r border-gray-100">
                    <div className="w-full h-8 border border-gray-200 rounded-lg flex items-center justify-between px-3 bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-[10px]">请选择</span>
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="px-2 py-2 bg-white border-b border-gray-100">
                    <div className="w-full h-8 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 text-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
                      <Image className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 mt-5">
                  <button className="flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: teal }}>
                    <Plus className="w-4 h-4" /> 添加
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-bold transition-colors" style={{ color: teal }}>
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
        className="shrink-0 flex gap-3 px-10 py-4"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", borderTop: "1px dashed #e5e7eb" }}
      >
        <button
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
          onClick={() => setSubmitted(true)}
        >
          提交
        </button>
        <button className="px-8 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
          保存草稿
        </button>
      </div>
    </div>
  );
}
