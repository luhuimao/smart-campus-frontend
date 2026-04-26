"use client";

import { useState } from "react";
import { ChevronDown, Plus, Upload, ScanLine } from "lucide-react";
import { PageHeader, FlowButton } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

const SUBJECTS        = ["高中思想政治","高中数学","高中英语","高中历史","高中地理","高中物理","高中生物学","高中语文","高中俄语","日语","心理"];
const RESEARCH_GROUPS = ["政治教研组","数学教研组","英语教研组","史地教研组","理化教研组","语文教研组","外语教研组","德育教研组"];

// ── 通用控件 ──────────────────────────────────────────────────────────────────

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: error ? "#fffbe6" : "transparent", borderRadius: 8, padding: error ? "10px 12px" : 0 }}>
      <label className="block text-sm font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}
      {children}
      {error && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{error}</p>}
    </div>
  );
}

function Input({ placeholder = "", type = "text" }: { placeholder?: string; type?: string }) {
  return (
    <input type={type} placeholder={placeholder} className="form-input"
      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function SelectField({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select className="form-input appearance-none pr-9" defaultValue=""
        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
        style={{ color: "#1d1d1f" }}>
        <option value="" disabled />
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-3 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

function Textarea({ rows = 6 }: { rows?: number }) {
  return (
    <textarea rows={rows} className="form-input resize-none"
      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function MemberPicker({ tall }: { tall?: boolean }) {
  return (
    <button className="w-full border border-dashed border-gray-300 bg-white rounded-[10px] flex items-center justify-center gap-2 text-sm text-gray-500 transition-all hover:border-[#00b095] hover:text-[#00b095]"
      style={{ minHeight: tall ? 72 : 44 }}>
      <Plus size={15} className="opacity-70" /> 选择成员
    </button>
  );
}

function WeekInput() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm shrink-0 text-gray-500">第</span>
      <input type="text" className="form-input text-center flex-1"
        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
      />
      <span className="text-sm shrink-0 text-gray-500">周</span>
    </div>
  );
}

function UploadArea({ hint, showScan }: { hint: string; showScan?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 flex items-center gap-2 border border-dashed border-gray-200 rounded-[10px] px-3.5 py-2.5"
        style={{ fontSize: 13, color: "#9ca3af" }}>
        <Upload size={14} className="shrink-0" style={{ color: "#9ca3af" }} />
        <span className="cursor-pointer" style={{ color: teal }}>选择</span>
        <span>{hint}</span>
      </div>
      {showScan && (
        <button className="border border-gray-200 rounded-[10px] flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0"
          style={{ width: 44, height: 44, color: "#9ca3af" }}>
          <ScanLine size={16} />
        </button>
      )}
    </div>
  );
}

// ── 页面 ──────────────────────────────────────────────────────────────────────

export function ResearchActivityRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}>

      <PageHeader
        centered
        left={<FlowButton />}
        breadcrumbs={[{ label: "教研活动" }, { label: "教研活动记录", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* 可滚动内容区 */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          {/* 装饰标题 */}
          <div className="flex items-center justify-center gap-5 mb-10">
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            <div className="flex items-center gap-3 px-12 py-2 text-white text-sm font-semibold tracking-[0.2em]"
              style={{ backgroundColor: teal, clipPath: "polygon(10% 0,90% 0,100% 50%,90% 100%,10% 100%,0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}>
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
              教研活动记录
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
          </div>

          {/* 表单卡片 */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* 第一行 — 米色 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教研主题" required>
                <Input />
              </Field>
              <Field label="教研学科" required>
                <SelectField options={SUBJECTS} />
              </Field>
            </div>

            {/* 第二行 — 白色 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="时间" required>
                <DatePicker dateOnly />
              </Field>
              <Field label="周次" required>
                <WeekInput />
              </Field>
            </div>

            {/* 第三行 — 米色 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="地点" required>
                <Input />
              </Field>
              <Field label="教研组" required>
                <SelectField options={RESEARCH_GROUPS} />
              </Field>
            </div>

            {/* 第四行 — 白色 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教研组长" required>
                <MemberPicker />
              </Field>
              <Field label="主持人" required>
                <MemberPicker />
              </Field>
            </div>

            {/* 第五行 — 米色 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="记录人" required error={submitted ? "此项为必填项" : undefined}>
                <MemberPicker />
              </Field>
              <Field label="参与人员" required>
                <MemberPicker tall />
              </Field>
            </div>

            {/* 第六行 — 白色 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="应到人数" required>
                <Input type="number" />
              </Field>
              <Field label="实到人数" required>
                <Input type="number" />
              </Field>
            </div>

            {/* 第七行 — 米色 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="未到场人员情况说明" required>
                <Textarea rows={6} />
              </Field>
              <Field label="内容记录" required>
                <Textarea rows={6} />
              </Field>
            </div>

            {/* 第八行 — 白色 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="照片" required hint="请上传现场照片">
                <UploadArea hint="拖拽或单击后粘贴图片，单张 20MB 以内" showScan />
              </Field>
              <Field label="其他附件" hint="其他文件">
                <UploadArea hint="拖拽或单击后粘贴文件，单个 500MB 以内" />
              </Field>
            </div>

          </div>
        </main>
      </div>

      {/* 底部固定按钮（左对齐） */}
      <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4">
        <button
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
          onClick={() => setSubmitted(true)}>
          提交
        </button>
        <button
          className="btn-secondary">
          保存草稿
        </button>
      </div>

    </div>
  );
}
