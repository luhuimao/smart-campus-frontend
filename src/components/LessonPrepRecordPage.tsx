"use client";

import { Bell, ChevronRight, ChevronDown, Calendar, Plus, QrCode, X, Menu } from "lucide-react";
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
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 -mt-0.5">{hint}</p>}
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
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function Select({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select
        className={inputCls + " appearance-none"}
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

function Textarea({ rows = 5 }: { rows?: number }) {
  return (
    <textarea
      rows={rows}
      className={inputCls + " resize-none"}
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function MemberPicker({ minHeight }: { minHeight?: number }) {
  return (
    <button
      className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600"
      style={{ minHeight: minHeight ?? 44 }}
    >
      <Plus className="w-4 h-4 opacity-60" /> 选择成员
    </button>
  );
}

export function LessonPrepRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [recorder, setRecorder] = useState<string | null>("卢辉茂");

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif', color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        breadcrumbs={[{ label: "备课活动" }, { label: "备课组活动记录", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white p-5 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

              {/* 主题 */}
              <Field label="主题" required>
                <Input />
              </Field>

              {/* 备课学科 */}
              <Field label="备课学科" required>
                <Select options={["数学", "语文", "英语", "物理", "化学", "生物", "历史", "地理", "政治"]} />
              </Field>

              {/* 时间 */}
              <Field label="时间" required>
                <div className="relative">
                  <Input />
                  <Calendar className="w-4 h-4 absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              {/* 周次 */}
              <Field label="周次" required>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-sm text-gray-400 pointer-events-none">第</span>
                  <input
                    type="text"
                    className={inputCls + " px-8"}
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                  />
                  <span className="absolute right-3.5 text-sm text-gray-400 pointer-events-none">周</span>
                </div>
              </Field>

              {/* 地点 */}
              <Field label="地点" required>
                <Input />
              </Field>

              {/* 备课组 */}
              <Field label="备课组" required>
                <Select options={["高一数学组", "高二数学组", "高三数学组"]} />
              </Field>

              {/* 备课组长 */}
              <Field label="备课组长" required>
                <MemberPicker />
              </Field>

              {/* 主持人 */}
              <Field label="主持人" required>
                <MemberPicker />
              </Field>

              {/* 记录人 */}
              <Field label="记录人" required>
                {recorder ? (
                  <div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center flex-wrap gap-2 min-h-[44px] transition-all">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#fff1f2", color: "#dc2626", borderColor: "#fecaca" }}>
                      <div className="w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center text-[10px] font-bold">卢</div>
                      {recorder}
                      <button className="ml-1 opacity-60 hover:opacity-100 transition-opacity" onClick={() => setRecorder(null)}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600"
                    style={{ minHeight: 44 }}
                    onClick={() => setRecorder("卢辉茂")}
                  >
                    <Plus className="w-4 h-4 opacity-60" /> 选择成员
                  </button>
                )}
              </Field>

              {/* 参与人员 */}
              <Field label="参与人员" required>
                <MemberPicker minHeight={64} />
              </Field>

              {/* 应到人数 */}
              <Field label="应到人数" required>
                <Input />
              </Field>

              {/* 实到人数 */}
              <Field label="实到人数" required>
                <Input />
              </Field>

              {/* 未到场人员情况说明 */}
              <Field label="未到场人员情况说明" required>
                <Textarea rows={5} />
              </Field>

              {/* 内容记录 */}
              <Field label="内容记录" required>
                <Textarea rows={5} />
              </Field>

              {/* 照片 */}
              <Field label="照片" required hint="请上传现场照片">
                <div className="flex gap-2">
                  <div className="flex-1 border border-dashed border-gray-200 rounded-[10px] px-4 py-3 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                    <p className="text-sm text-gray-400 text-center leading-relaxed">
                      <span className="font-semibold" style={{ color: teal }}>选择</span> 拖拽或单击后粘贴图片，单张20MB以内
                    </p>
                  </div>
                  <button className="w-12 border border-gray-200 rounded-[10px] flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400">
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </Field>

              {/* 附件 */}
              <Field label="附件" hint="教案、课件、教学设计、备课记录等">
                <div className="border border-dashed border-gray-200 rounded-[10px] px-4 py-3 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold" style={{ color: teal }}>选择</span> 拖拽或单击后粘贴文件，单个20MB以内
                  </p>
                </div>
              </Field>

            </div>

            {/* 学科部门 */}
            <div className="mt-10 pt-6" style={{ borderTop: "1px solid #f3f4f6" }}>
              <Field label="学科部门" required>
                <button
                  className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600"
                  style={{ minHeight: 44 }}
                >
                  <Plus className="w-4 h-4 opacity-60" /> 选择部门
                </button>
              </Field>
            </div>

            {/* Buttons */}
            <div className="mt-8 pt-6 flex justify-start gap-3" style={{ borderTop: "1px dashed #e5e7eb" }}>
              <button
                className="px-10 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
                style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
              >
                提交登记
              </button>
              <button className="px-8 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all">
                保存草稿
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
