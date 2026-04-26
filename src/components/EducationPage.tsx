"use client";

import { Bell, ChevronDown, ChevronRight, Plus, Calendar, ClipboardList, Upload, X, Menu } from "lucide-react";
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

function Input() {
  return (
    <input
      type="text"
      className="form-input"
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function CellInput() {
  return (
    <input
      type="text"
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

function CellDate() {
  return (
    <div className="w-full h-8 border border-gray-200 rounded-lg flex items-center justify-between px-2.5 bg-gray-50 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
      <span className="text-[10px]">请选择</span>
      <Calendar className="w-3.5 h-3.5 shrink-0" />
    </div>
  );
}

type EduRow = { id: number };

export function EducationPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [rows, setRows] = useState<EduRow[]>([{ id: 1 }]);

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        left={<FlowButton />}
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教育经历", active: true }]}
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
              教育经历
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
          </div>

          {/* Form card */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Row 1 — cream: 教师姓名 + 身份证号码 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教师姓名" required>
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

            {/* Row 2 — white: 部门 + 岗位 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="部门" required><Input /></Field>
              <Field label="岗位" required><Input /></Field>
            </div>

            {/* Row 3 — cream: 岗位类型 + 党委/行政职务 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="岗位类型" hint="可填任意一个：教学岗 教辅岗 行政岗 工勤岗 技能岗 管理岗" required>
                <Input />
              </Field>
              <Field label="党委/行政职务" required><Input /></Field>
            </div>

            {/* Row 4 — white: 联系方式 + 担任学科 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="联系方式" required><Input /></Field>
              <Field label="担任学科" required><Input /></Field>
            </div>

            {/* Education table */}
            <div className="p-8 border-t border-gray-50 bg-white">
              <p className="text-base font-semibold mb-5">
                <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>教育经历
              </p>

              <div className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm bg-white">
                {/* Header */}
                <div className="grid bg-gray-50 border-b border-gray-100" style={{ gridTemplateColumns: "48px 1.4fr 1fr 1fr 1.2fr 1fr 1fr" }}>
                  {[
                    { label: "", req: false },
                    { label: "就读学校", req: true },
                    { label: "学历", req: true },
                    { label: "学位", req: true },
                    { label: "学历证书（pdf/图片）", req: true },
                    { label: "学习形式", req: true },
                    { label: "开始时间", req: true },
                  ].map((h, i) => (
                    <div key={i} className="px-3 py-3 text-sm font-semibold text-gray-600 border-r border-gray-100 last:border-r-0">
                      {h.req && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                      {h.label}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {rows.map((row, index) => (
                  <div key={row.id} className="grid border-b border-gray-100 last:border-0" style={{ gridTemplateColumns: "48px 1.4fr 1fr 1fr 1.2fr 1fr 1fr" }}>
                    <div className="px-3 py-3 flex items-center justify-center text-xs font-bold text-gray-400 border-r border-gray-100">
                      {index + 1}
                    </div>
                    {/* 就读学校 */}
                    <div className="px-2 py-2 border-r border-gray-100"><CellInput /></div>
                    {/* 学历 */}
                    <div className="px-2 py-2 border-r border-gray-100">
                      <CellSelect options={["博士研究生", "硕士研究生", "本科", "大专"]} />
                    </div>
                    {/* 学位 */}
                    <div className="px-2 py-2 border-r border-gray-100">
                      <CellSelect options={["博士学位", "硕士学位", "学士学位"]} />
                    </div>
                    {/* 学历证书 */}
                    <div className="px-2 py-2 border-r border-gray-100">
                      <div className="w-full h-8 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50 text-gray-300 cursor-pointer hover:bg-gray-100 transition-colors">
                        <Upload className="w-4 h-4" />
                      </div>
                    </div>
                    {/* 学习形式 */}
                    <div className="px-2 py-2 border-r border-gray-100">
                      <CellSelect options={["全日制", "非全日制"]} />
                    </div>
                    {/* 开始时间 */}
                    <div className="px-2 py-2"><CellDate /></div>
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
