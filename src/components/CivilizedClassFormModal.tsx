"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 2px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#d9d9d9", boxShadow: "none" };

const GRADE_OPTIONS   = ["高一", "高二", "高三"];
const CLASS_OPTIONS: Record<string, string[]> = {
  "高一": ["高一(1)班", "高一(2)班", "高一(3)班", "高一(4)班", "高一(5)班"],
  "高二": ["高二(1)班", "高二(2)班", "高二(3)班", "高二(4)班", "高二(5)班"],
  "高三": ["高三(1)班", "高三(2)班", "高三(3)班", "高三(4)班", "高三(5)班"],
};

function Field({ label, required, children }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "#262626" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function TextInput({ placeholder = "", value, onChange }: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="form-input"
      style={{ height: 38, borderRadius: 4 }}
      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function SelectInput({ options, placeholder = "请选择", value, onChange, disabled }: {
  options: string[];
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none text-sm px-3 pr-8 border outline-none transition-all"
        style={{
          height: 38, borderRadius: 4,
          borderColor: "#d9d9d9", color: value ? "#262626" : "#bfbfbf",
          background: disabled ? "#f5f5f5" : "white", cursor: disabled ? "not-allowed" : "pointer",
        }}
        onFocus={e => !disabled && Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <svg
        className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke={disabled ? "#bfbfbf" : "#8c8c8c"} strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

interface FormState {
  year: string;
  week: string;
  grade: string;
  className: string;
  headTeacher: string;
  gradeDirector: string;
}

interface Props { onClose: () => void }

export function CivilizedClassFormModal({ onClose }: Props) {
  const [maximized, setMaximized] = useState(false);
  const [form, setForm] = useState<FormState>({
    year: "", week: "", grade: "", className: "", headTeacher: "", gradeDirector: "",
  });
  const overlayRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof FormState) => (v: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: v };
      if (key === "grade") next.className = "";
      return next;
    });
  };

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const classOptions = form.grade ? CLASS_OPTIONS[form.grade] ?? [] : [];

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
          maxWidth: maximized ? "100%" : 720,
          maxHeight: maximized ? "100vh" : "90vh",
          height: maximized ? "100vh" : "auto",
        }}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold" style={{ color: "#111827" }}>文明班级登记</h2>
          <div className="flex items-center gap-4" style={{ color: "#9ca3af" }}>
            <button onClick={() => setMaximized(v => !v)} className="hover:text-gray-600 transition-colors">
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

            <Field label="年份" required>
              <TextInput placeholder="例：2025" value={form.year} onChange={set("year")} />
            </Field>

            <Field label="周次" required>
              <TextInput placeholder="例：第3周" value={form.week} onChange={set("week")} />
            </Field>

            <Field label="级部" required>
              <SelectInput
                options={GRADE_OPTIONS}
                value={form.grade}
                onChange={set("grade")}
              />
            </Field>

            <Field label="班级" required>
              <SelectInput
                options={classOptions}
                placeholder={form.grade ? "请选择班级" : "请先选择级部"}
                value={form.className}
                onChange={set("className")}
                disabled={!form.grade}
              />
            </Field>

            <Field label="班主任" required>
              <TextInput placeholder="请输入班主任姓名" value={form.headTeacher} onChange={set("headTeacher")} />
            </Field>

            <Field label="级部主任" required>
              <TextInput placeholder="请输入级部主任姓名" value={form.gradeDirector} onChange={set("gradeDirector")} />
            </Field>

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
