"use client";

import { Bell, ChevronDown, ChevronRight, Plus, Image, Calendar, ClipboardList, X, Menu } from "lucide-react";
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

function CellInput({ placeholder = "" }: { placeholder?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="table-input"
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function CellSelect({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select
        className="w-full bg-white border border-gray-200 rounded-lg px-2 py-1 text-sm outline-none appearance-none transition-all"
        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
      >
        <option value=""></option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1.5 text-gray-400 pointer-events-none" />
    </div>
  );
}

type AwardRow = { id: number };

export function AwardRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [hasAward, setHasAward] = useState<"yes" | "no" | null>(null);
  const [rows, setRows] = useState<AwardRow[]>([{ id: 1 }]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        left={<FlowButton />}
        breadcrumbs={[{ label: "教师基础档案" }, { label: "获奖记录", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          {/* Decorative title */}
          <div className="flex items-center justify-center gap-5 mb-12">
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            <div
              className="flex items-center gap-3 px-12 py-2 text-white text-base font-semibold tracking-[0.2em]"
              style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}
            >
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
              获奖记录
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
          </div>

          {/* Form card */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Row 1 — cream */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教师" required>
                <div className="border border-dashed border-gray-300 bg-white rounded-[10px] px-3 py-2 min-h-[44px] flex items-center flex-wrap gap-2">
                  <div className="flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-lg text-sm border border-red-100 gap-1.5">
                    <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">卢</div>
                    卢辉茂
                    <X className="w-3.5 h-3.5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity" />
                  </div>
                </div>
              </Field>
              <Field label="身份证号码" required>
                <Input />
              </Field>
            </div>

            {/* Row 2 — white: radio */}
            <div className="p-8 bg-white">
              <Field label="有无获奖记录" required>
                <div className="flex items-center gap-10 py-2">
                  {[{ v: "yes" as const, l: "有" }, { v: "no" as const, l: "暂无" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setHasAward(v)}>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white"
                        style={{ borderColor: hasAward === v ? teal : "#d1d5db" }}
                      >
                        {hasAward === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}
                      </div>
                      <span className="text-base font-medium text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {/* Conditional fields */}
            {hasAward === "yes" && (
              <>
                {/* Row 3 — cream */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                  <Field label="部门" required><Input /></Field>
                  <Field label="岗位" required><Input /></Field>
                </div>

                {/* Row 4 — white */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                  <Field label="岗位类型" hint="可填任意一个：教学岗 教辅岗 行政岗 工勤岗 技能岗 管理岗" required>
                    <Input />
                  </Field>
                  <Field label="党委/行政职务" required><Input /></Field>
                </div>

                {/* Row 5 — cream */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                  <Field label="联系方式" required><Input /></Field>
                  <Field label="担任学科" required><Input /></Field>
                </div>

                {/* Award table */}
                <div className="p-8 bg-white border-t border-gray-50">
                  <p className="text-base font-semibold mb-5">
                    <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>教师奖状
                  </p>

                  <div className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm">
                    {/* Header */}
                    <div className="grid bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: "48px 1fr 1.2fr 1fr 1fr 1.2fr 80px" }}>
                      {["", "获奖时间", "获奖名称", "获奖级别", "荣获奖项", "颁发单位", "奖状照片"].map((h, i) => (
                        <div key={i} className="px-3 py-3 text-sm font-semibold text-gray-600 border-r border-gray-100 last:border-r-0">
                          {i > 0 && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                          {h}
                        </div>
                      ))}
                    </div>

                    {/* Rows */}
                    {rows.map((row, index) => (
                      <div key={row.id} className="grid border-b border-gray-100 last:border-0" style={{ gridTemplateColumns: "48px 1fr 1.2fr 1fr 1fr 1.2fr 80px" }}>
                        <div className="px-3 py-3 flex items-center justify-center text-sm font-bold text-gray-400 border-r border-gray-100">
                          {index + 1}
                        </div>
                        {/* 获奖时间 */}
                        <div className="px-2 py-2 border-r border-gray-100">
                          <div className="w-full h-8 border border-gray-200 rounded-lg flex items-center justify-between px-2.5 bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                            <span className="text-[10px]">请选择</span>
                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                          </div>
                        </div>
                        {/* 获奖名称 */}
                        <div className="px-2 py-2 border-r border-gray-100">
                          <CellInput />
                        </div>
                        {/* 获奖级别 */}
                        <div className="px-2 py-2 border-r border-gray-100">
                          <CellSelect options={["国家级", "省级", "市级", "区县级", "校级"]} />
                        </div>
                        {/* 荣获奖项 */}
                        <div className="px-2 py-2 border-r border-gray-100">
                          <CellSelect options={["一等奖", "二等奖", "三等奖", "优胜奖"]} />
                        </div>
                        {/* 颁发单位 */}
                        <div className="px-2 py-2 border-r border-gray-100">
                          <CellInput />
                        </div>
                        {/* 奖状照片 */}
                        <div className="px-2 py-2">
                          <div className="w-full h-8 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 text-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
                            <Image className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-8 mt-5">
                    <button
                      className="flex items-center gap-1.5 text-base font-bold transition-colors"
                      style={{ color: teal }}
                      onClick={() => setRows((r) => [...r, { id: Date.now() }])}
                    >
                      <Plus className="w-4 h-4" /> 添加
                    </button>
                    <button className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }}>
                      <ClipboardList className="w-4 h-4" /> 快速填报
                    </button>
                  </div>
                </div>
              </>
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
