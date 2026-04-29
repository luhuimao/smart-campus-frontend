"use client";

import { useState } from "react";
import { ChevronDown, Plus, Camera } from "lucide-react";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder = "", disabled }: { placeholder?: string; disabled?: boolean }) {
  return (
    <input placeholder={placeholder} disabled={disabled}
      className="form-input"
      style={disabled ? { background: "#f9fafb", color: "#9ca3af" } : undefined}
      onFocus={e => { if (!disabled) Object.assign(e.currentTarget.style, focusStyle); }}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

function SelectField({ options }: { options: string[] }) {
  return (
    <div className="relative">
      <select className="form-input appearance-none pr-9" defaultValue=""
        style={{ color: "#1d1d1f" }}
        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}>
        <option value="" disabled />
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-3 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

function RadioGroup({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-6 pt-1">
      {options.map(opt => (
        <label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none">
          <span
            onClick={() => onChange(opt)}
            className="shrink-0 flex items-center justify-center rounded-full border-2 transition-colors"
            style={{ width: 18, height: 18, borderColor: value === opt ? "#10b981" : "#d1d5db", background: "white" }}>
            {value === opt && <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />}
          </span>
          <span className="text-sm" style={{ color: "#374151" }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function MemberPicker({ label, required }: { label: string; required?: boolean }) {
  const [members, setMembers] = useState<string[]>([]);
  return (
    <Field label={label} required={required}>
      <button type="button"
        onClick={() => setMembers(prev => prev.length === 0 ? ["王老师"] : prev)}
        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1 hover:border-emerald-400 transition-colors bg-white"
        style={{ color: "#9ca3af" }}>
        <Plus size={16} />
        <span className="text-sm">选择成员</span>
      </button>
      {members.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {members.map(m => (
            <span key={m} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white" style={{ background: "#10b981" }}>
              {m}
              <button type="button" onClick={() => setMembers([])} className="ml-1 hover:opacity-70">×</button>
            </span>
          ))}
        </div>
      )}
    </Field>
  );
}

const BUILDINGS = [
  { label: "佳慧楼", color: "#ef4444" },
  { label: "自强楼", color: "#f59e0b" },
  { label: "自立楼", color: "#10b981" },
];

export function DormAttendancePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [building, setBuilding] = useState("");
  const [scene, setScene]       = useState("");
  const [checkItem, setCheckItem] = useState("");

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生管理" }, { label: "NFC宿舍考勤（桂宏）" }, { label: "宿舍考勤记录", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              <Field label="学期">
                <Input placeholder="请输入学期" />
              </Field>

              <Field label="宿舍号" required>
                <Input placeholder="请输入宿舍号" />
              </Field>

              <Field label="宿舍楼栋">
                <div className="flex flex-col gap-3 pt-1">
                  {BUILDINGS.map(({ label, color }) => (
                    <label key={label} className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <span
                        onClick={() => setBuilding(label)}
                        className="shrink-0 flex items-center justify-center rounded-full border-2 transition-colors"
                        style={{ width: 18, height: 18, borderColor: building === label ? "#10b981" : "#d1d5db", background: "white" }}>
                        {building === label && <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold text-white" style={{ background: color }}>
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="场景" required>
                <RadioGroup options={["宿舍", "学生"]} value={scene} onChange={setScene} />
              </Field>

              <Field label="学生编号" required>
                <Input placeholder="请输入学生编号" />
              </Field>

              <Field label="学生姓名" required>
                <Input placeholder="请输入学生姓名" />
              </Field>

              <Field label="年级">
                <Input placeholder="请输入年级" />
              </Field>

              <Field label="级部">
                <Input placeholder="请输入级部" />
              </Field>

              <Field label="班级名称">
                <Input placeholder="请输入班级名称" />
              </Field>

              <div />

              <MemberPicker label="班主任" />

              <MemberPicker label="级部主任" />

              <Field label="检查项" required>
                <RadioGroup options={["缺勤", "纪律", "卫生"]} value={checkItem} onChange={setCheckItem} />
              </Field>

              <Field label="扣分项">
                <SelectField options={["迟到", "早退", "旷课", "违规使用手机", "宿舍卫生不达标", "其他"]} />
              </Field>

              <Field label="扣分">
                <Input placeholder="请输入扣分" />
              </Field>

              <Field label="违纪情况说明">
                <textarea rows={5} className="form-input resize-none"
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
              </Field>

              <Field label="违纪图片">
                <div className="flex gap-2">
                  <div className="flex-1 border-2 border-dashed border-gray-200 rounded-xl py-4 flex items-center justify-center gap-1 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
                    <span className="text-sm font-medium" style={{ color: "#10b981" }}>选择</span>
                    <span className="text-sm" style={{ color: "#9ca3af" }}>拖拽或单击后粘贴图片，单张 20MB 以内</span>
                  </div>
                  <button type="button" className="w-12 h-12 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0" style={{ color: "#9ca3af" }}>
                    <Camera size={20} />
                  </button>
                </div>
              </Field>

              <Field label="提交人手机号" required>
                <Input placeholder="请输入手机号" />
              </Field>

            </div>

          </div>
        </div>
      </div>

      <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4">
        <button
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }}>
          提交
        </button>
        <button className="btn-secondary">保存草稿</button>
      </div>
    </div>
  );
}
