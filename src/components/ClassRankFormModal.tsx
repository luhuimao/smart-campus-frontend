"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X, Maximize2 } from "lucide-react";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 2px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#d9d9d9", boxShadow: "none" };

function Field({ label, hint, children }: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "#262626" }}>{label}</label>
      {hint && <p className="text-sm mb-2" style={{ color: "#8c8c8c" }}>{hint}</p>}
      {children}
    </div>
  );
}

function TextInput({ placeholder = "" }: { placeholder?: string }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="form-input"
      style={{ height: 38, borderRadius: 4 }}
      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

interface Props {
  onClose: () => void;
}

export function ClassRankFormModal({ onClose }: Props) {
  const [maximized, setMaximized] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1000 }}
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className="bg-white flex flex-col shadow-xl transition-all duration-300"
        style={{
          borderRadius: 8,
          width: "100%",
          maxWidth: maximized ? "100%" : 800,
          maxHeight: maximized ? "100vh" : "90vh",
          height: maximized ? "100vh" : "auto",
        }}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold" style={{ color: "#111827" }}>教师所带班级排名</h2>
          <div className="flex items-center gap-4" style={{ color: "#9ca3af" }}>
            <button
              onClick={() => setMaximized(v => !v)}
              className="hover:text-gray-600 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 主体 */}
        <div className="overflow-y-auto px-6 py-6 flex-1">
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* 行1：学期 + 考试名称 */}
            <Field label="学期">
              <TextInput />
            </Field>
            <Field label="考试名称">
              <TextInput />
            </Field>

            {/* 行2：年级 + 班级 */}
            <Field label="年级">
              <TextInput />
            </Field>
            <Field label="班级">
              <TextInput />
            </Field>

            {/* 行3：教师姓名 + 学科 */}
            <Field label="教师姓名">
              <button
                className="w-full flex items-center justify-center gap-1 text-sm transition-all duration-150"
                style={{ height: 38, border: "1px dashed #d9d9d9", borderRadius: 4, color: "#8c8c8c", background: "white" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = teal; (e.currentTarget as HTMLButtonElement).style.color = teal; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#d9d9d9"; (e.currentTarget as HTMLButtonElement).style.color = "#8c8c8c"; }}
              >
                <Plus className="w-4 h-4" />
                选择成员
              </button>
            </Field>
            <Field label="学科">
              <TextInput />
            </Field>

            {/* 行4：班级排名（全宽，含提示文字） */}
            <div className="col-span-2">
              <Field label="班级排名" hint="格式示例：比如某老师带的高一的某班级15个班里这个班考第2，则填入：2/15">
                <TextInput placeholder="例：2/15" />
              </Field>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="form-footer shrink-0 flex gap-3 px-6 py-3">
          <button
            className="px-8 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:translate-y-px"
            style={{ background: teal }}
          >
            提交
          </button>
          <button className="btn-secondary text-sm px-6 py-1.5">
            保存草稿
          </button>
        </div>
      </div>
    </div>
  );
}
