"use client";

import { Bell, ChevronRight, ChevronDown, Calendar, Plus, QrCode, Upload, Menu } from "lucide-react";
import { PageHeader, FlowButton } from "./PageHeader";

const teal = "#00b095";

const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };
const inputCls   = "w-full bg-white border border-gray-200 rounded-[10px] px-3.5 py-2.5 text-sm outline-none transition-all";

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold" style={{ color: "#1d1d1f" }}>
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

function Textarea({ rows = 6, placeholder = "" }: { rows?: number; placeholder?: string }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      className={inputCls + " resize-none placeholder:text-gray-300"}
      style={{ height: "auto" }}
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

export function ScienceFestFormPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif', color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        breadcrumbs={[{ label: "教师组织参与的活动" }, { label: "科技节活动" }, { label: "科技节活动登记", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white p-5 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

              {/* 活动名称 */}
              <Field label="活动名称" required>
                <Input />
              </Field>

              {/* 教研组 */}
              <Field label="教研组" required>
                <Select options={["理化生教研组", "数学教研组", "信息技术教研组"]} />
              </Field>

              {/* 活动负责教师 */}
              <Field label="活动负责教师" required>
                <button
                  className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-sm text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600"
                  style={{ minHeight: 44 }}
                >
                  <Plus className="w-4 h-4 opacity-60" /> 选择成员
                </button>
              </Field>

              {/* 活动时间 */}
              <Field label="活动时间" required>
                <div className="relative">
                  <Input />
                  <Calendar className="w-4 h-4 absolute right-3.5 top-3 text-gray-400 pointer-events-none" />
                </div>
              </Field>

              {/* 活动地点 */}
              <Field label="活动地点" required>
                <Input />
              </Field>

              {/* 参与人员 — row-span-2 */}
              <div className="space-y-1.5 row-span-2">
                <label className="block text-sm font-semibold" style={{ color: "#1d1d1f" }}>
                  <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>参与人员
                </label>
                <textarea
                  rows={10}
                  placeholder="例如：高一年级全体同学"
                  className={inputCls + " resize-none placeholder:text-gray-300 h-full"}
                  style={{ minHeight: 200 }}
                  onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                />
              </div>

              {/* 活动描述 */}
              <Field label="活动描述" required>
                <Textarea rows={6} placeholder="说明：类似于新闻简讯50字左右" />
              </Field>

              {/* 活动图片 */}
              <Field label="活动图片" required>
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

              {/* 活动视频 */}
              <Field label="活动视频" required>
                <div className="border border-dashed border-gray-200 rounded-[10px] px-4 py-3 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors cursor-pointer gap-2">
                  <Upload className="w-4 h-4 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    <span className="font-semibold" style={{ color: teal }}>选择</span> 拖拽或单击后粘贴文件，单个500MB以内
                  </p>
                </div>
              </Field>

              {/* 备注 */}
              <Field label="备注">
                <Textarea rows={6} />
              </Field>
            </div>

            {/* Buttons */}
            <div className="mt-10 pt-6 flex justify-start gap-3" style={{ borderTop: "1px dashed #e5e7eb" }}>
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
