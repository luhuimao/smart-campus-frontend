"use client";

import { useState } from "react";
import { ChevronDown, Calendar, Plus, Camera } from "lucide-react";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder = "", type = "text", value, disabled }: {
  placeholder?: string; type?: string; value?: string; disabled?: boolean;
}) {
  return (
    <input type={type} placeholder={placeholder} defaultValue={value} disabled={disabled}
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

function DateTimeInput() {
  return (
    <div className="relative">
      <input type="datetime-local" className="form-input pr-10"
        onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
        onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
      />
      <Calendar size={15} className="absolute right-3.5 top-3 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

function MemberPicker({ label, required, error }: { label: string; required?: boolean; error?: string }) {
  const [members, setMembers] = useState<string[]>([]);
  return (
    <Field label={label} required={required}>
      <div className={error ? "rounded-lg p-1" : ""} style={error ? { background: "#fff7ed" } : undefined}>
        <button type="button"
          onClick={() => setMembers(prev => prev.length === 0 ? ["张老师"] : prev)}
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
        {error && <p className="text-xs mt-2 ml-1" style={{ color: "#f87171" }}>{error}</p>}
      </div>
    </Field>
  );
}

const TALK_TOPICS = [
  "了解学生家庭情况",
  "了解学生性格与兴趣爱好",
  "了解学生的人际关系",
  "了解学生的需求与希望",
  "了解学生的梦想和目标",
  "学情分析、学法指导",
  "心理疏导",
];

export function TalkRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [checkedTopics, setCheckedTopics] = useState<Set<string>>(new Set());

  const toggleTopic = (t: string) =>
    setCheckedTopics(prev => { const s = new Set(prev); s.has(t) ? s.delete(t) : s.add(t); return s; });

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生成长" }, { label: "一生一案谈心谈话记录表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
          <div className="rounded-2xl md:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white px-6 md:px-10 py-8">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">

              {/* 谈心教师 */}
              <MemberPicker label="谈心教师" required />

              {/* 学生姓名 */}
              <Field label="学生姓名" required>
                <SelectField options={["张三", "李四", "王五"]} />
              </Field>

              {/* 谈心教师学科 */}
              <Field label="谈心教师学科" required>
                <Input placeholder="请输入学科" />
              </Field>

              {/* 谈心谈话时间 */}
              <Field label="谈心谈话时间" required>
                <DateTimeInput />
              </Field>

              {/* 谈话内容 */}
              <Field label="谈话内容" required>
                <div className="grid grid-cols-2 gap-y-3 pt-1">
                  {TALK_TOPICS.map(t => (
                    <label key={t} className="flex items-center gap-2 cursor-pointer select-none">
                      <span
                        onClick={() => toggleTopic(t)}
                        className="shrink-0 flex items-center justify-center rounded-full border transition-colors"
                        style={{
                          width: 18, height: 18,
                          borderColor: checkedTopics.has(t) ? "#10b981" : "#d1d5db",
                          background: "white",
                        }}>
                        {checkedTopics.has(t) && (
                          <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />
                        )}
                      </span>
                      <span className="text-sm" style={{ color: "#374151" }}>{t}</span>
                    </label>
                  ))}
                </div>
              </Field>

              {/* 谈心谈话内容记录 */}
              <Field label="谈心谈话内容记录" required>
                <textarea rows={5} className="form-input resize-none"
                  placeholder="请输入谈话内容记录"
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
              </Field>

              {/* 教师指导建议 */}
              <Field label="教师指导建议" required>
                <textarea rows={6} className="form-input resize-none"
                  placeholder="请输入教师指导建议"
                  onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                  onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
              </Field>

              {/* 沟通照片 */}
              <Field label="沟通照片">
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
