"use client";

import { useState, useEffect } from "react";
import { StudentPicker } from "./ui/StudentPicker";
import type { StudentInfoRecord } from "@/hooks/use-research-dashboard";
import { PageHeader } from "./PageHeader";
import { JDY_CONFIG, STUDENT_CHANGING_MAJORS_CLASSES_WIDGET_IDS, jdyCreate } from "@/lib/jdy-api";
import { useCurrentUser } from "@/lib/user-context";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

const H = STUDENT_CHANGING_MAJORS_CLASSES_WIDGET_IDS;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

function TextInput({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input placeholder={placeholder} value={value ?? ""} onChange={e => onChange?.(e.target.value)} className="form-input" onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="relative"><select value={value} onChange={e => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled />{options.map(o => <option key={o}>{o}</option>)}</select></div>);
}

const CHANGE_TYPES = [
  { label: "变更选科和班级", color: teal },
  { label: "仅变更选科",     color: teal },
  { label: "仅变更班级",     color: "#f87171" },
];

export function ClassTransferPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [studentClass, setStudentClass] = useState("");
  const [studentName, setStudentName] = useState("");
  const [changeType, setChangeType] = useState("变更选科和班级");
  const [reason, setReason] = useState("");
  const [oldSubject, setOldSubject] = useState("");
  const [oldLang, setOldLang] = useState("");
  const [oldClass, setOldClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newLang, setNewLang] = useState("");
  const [newClass, setNewClass] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useCurrentUser();

  const handleSelectStudent = (record: StudentInfoRecord | null) => {
    if (record) setStudentClass(record.班级名称 || "");
    else setStudentClass("");
  };

  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("class-transfer-draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.studentClass) setStudentClass(d.studentClass);
      if (d.studentName) setStudentName(d.studentName);
      if (d.changeType) setChangeType(d.changeType);
      if (d.reason) setReason(d.reason);
      if (d.oldSubject) setOldSubject(d.oldSubject);
      if (d.oldLang) setOldLang(d.oldLang);
      if (d.oldClass) setOldClass(d.oldClass);
      if (d.newSubject) setNewSubject(d.newSubject);
      if (d.newLang) setNewLang(d.newLang);
      if (d.newClass) setNewClass(d.newClass);
    } catch {}
  }, []);

  // ── API logic ────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!studentName.trim()) errs.studentName = "请选择学生";
    if (!reason.trim())      errs.reason = "请输入转科（班）原因";
    if (changeType === "变更选科和班级") {
      if (!oldSubject.trim()) errs.oldSubject = "请输入原选科科目";
      if (!oldLang.trim())    errs.oldLang = "请输入原外语选科";
      if (!oldClass.trim())   errs.oldClass = "请选择原班级";
      if (!newSubject.trim()) errs.newSubject = "请选择新选科科目";
      if (!newLang.trim())    errs.newLang = "请选择新外语选科";
      if (!newClass.trim())   errs.newClass = "请选择新班级";
    } else if (changeType === "仅变更选科") {
      if (!oldSubject.trim()) errs.oldSubject = "请输入原选科科目";
      if (!oldLang.trim())    errs.oldLang = "请输入原外语选科";
      if (!newSubject.trim()) errs.newSubject = "请选择新选科科目";
      if (!newLang.trim())    errs.newLang = "请选择新外语选科";
    } else {
      if (!oldClass.trim()) errs.oldClass = "请选择原班级";
      if (!newClass.trim()) errs.newClass = "请选择新班级";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => { if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; }); };

  const buildData = () => {
    const now = new Date().toISOString();
    return {
      [H.学生班级]: { value: studentClass },
      [H.学生姓名]: { value: studentName },
      [H.变更类型]: { value: changeType },
      [H.转科原因]: { value: reason },
      [H.原选科科目]: { value: oldSubject },
      [H.原外语选科]: { value: oldLang },
      [H.新选科科目]: { value: newSubject },
      [H.新外语选科]: { value: newLang },
      [H.新班级]: { value: newClass },
      [H.家长签名]: { value: "" },
      [H.提交人]: { value: currentUser?.name ?? "" },
      [H.提交时间]: { value: now },
    };
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      await jdyCreate({
        app_id: JDY_CONFIG.STUDENT_CHANGING_MAJORS_CLASSES_APPLICATION.app_id,
        entry_id: JDY_CONFIG.STUDENT_CHANGING_MAJORS_CLASSES_APPLICATION.entry_id,
        data: buildData(),
        data_creator: currentUser?.userId,
        is_start_workflow: false,
        is_start_trigger: false,
      });
      handleClearForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setStudentClass(""); setStudentName(""); setChangeType("变更选科和班级"); setReason("");
    setOldSubject(""); setOldLang(""); setOldClass("");
    setNewSubject(""); setNewLang(""); setNewClass("");
    setErrors({}); setSubmitted(false);
    localStorage.removeItem("class-transfer-draft");
  };

  const handleSaveDraft = () => {
    if (!studentName.trim() && !reason.trim()) return;
    localStorage.setItem("class-transfer-draft", JSON.stringify({
      studentClass, studentName, changeType, reason,
      oldSubject, oldLang, oldClass, newSubject, newLang, newClass,
    }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader breadcrumbs={[{ label: "学生管理" }, { label: "转科（班）申请表", active: true }]} onMenuOpen={onMenuOpen} />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6 pb-24">

          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>转科（班）申请表</h2>
              <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
            </div>
          </div>

          <div className="rounded-[28px] shadow-sm border border-gray-100 bg-white">
            <div className="p-8 space-y-10">

              {/* 申请信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="学生班级">
                  <TextInput value={studentClass} onChange={setStudentClass} />
                </Field>
                <Field label="学生姓名" required>
                  <StudentPicker value={studentName} onChange={v => { setStudentName(v); clearError("studentName"); }} onSelectRecord={handleSelectStudent} />
                  {(submitted && !studentName || errors.studentName) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.studentName || "此项为必填项"}</p>}
                </Field>
                <Field label="变更类型" required>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {CHANGE_TYPES.map(({ label, color }) => (
                      <label key={label} className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <span onClick={() => setChangeType(label)} className="shrink-0 flex items-center justify-center rounded-full border-2 transition-colors" style={{ width: 18, height: 18, borderColor: changeType === label ? teal : "#d1d5db", background: "white" }}>
                          {changeType === label && <span className="rounded-full" style={{ width: 10, height: 10, background: teal, display: "block" }} />}
                        </span>
                        <span className="px-3 py-0.5 rounded text-xs font-semibold text-white transition-opacity" style={{ background: color, opacity: changeType === label ? 1 : 0.45 }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="转科（班）原因" required>
                  <textarea rows={6} value={reason} onChange={e => { setReason(e.target.value); clearError("reason"); }}
                    className="form-input resize-none" onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                  {(submitted && !reason || errors.reason) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.reason || "此项为必填项"}</p>}
                </Field>

                {(changeType === "变更选科和班级" || changeType === "仅变更选科") && (<>
                  <Field label="原选科科目" required>
                    <TextInput value={oldSubject} onChange={v => { setOldSubject(v ?? ""); clearError("oldSubject"); }} placeholder="请输入原选科科目" />
                    {(submitted && !oldSubject || errors.oldSubject) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.oldSubject || "此项为必填项"}</p>}
                  </Field>
                  <Field label="原外语选科" required>
                    <TextInput value={oldLang} onChange={v => { setOldLang(v ?? ""); clearError("oldLang"); }} placeholder="请输入原外语选科" />
                    {(submitted && !oldLang || errors.oldLang) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.oldLang || "此项为必填项"}</p>}
                  </Field>
                  <Field label="新选科科目" required>
                    <SelectField value={newSubject} onChange={v => { setNewSubject(v); clearError("newSubject"); }} options={["物理+化学+生物", "物理+化学+地理", "历史+政治+地理", "物理+历史+化学"]} />
                    {(submitted && !newSubject || errors.newSubject) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.newSubject || "此项为必填项"}</p>}
                  </Field>
                  <Field label="新外语选科" required>
                    <SelectField value={newLang} onChange={v => { setNewLang(v); clearError("newLang"); }} options={["英语", "日语", "德语", "法语"]} />
                    {(submitted && !newLang || errors.newLang) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.newLang || "此项为必填项"}</p>}
                  </Field>
                </>)}

                {(changeType === "变更选科和班级" || changeType === "仅变更班级") && (<>
                  <Field label="原班级" required>
                    <SelectField value={oldClass} onChange={v => { setOldClass(v); clearError("oldClass"); }} options={["高一(1)班", "高一(2)班", "高二(1)班", "高三(1)班"]} />
                    {(submitted && !oldClass || errors.oldClass) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.oldClass || "此项为必填项"}</p>}
                  </Field>
                  <Field label="新班级" required>
                    <SelectField value={newClass} onChange={v => { setNewClass(v); clearError("newClass"); }} options={["高一(1)班", "高一(2)班", "高二(1)班", "高三(1)班"]} />
                    {(submitted && !newClass || errors.newClass) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.newClass || "此项为必填项"}</p>}
                  </Field>
                </>)}
              </div>

              {changeType !== "仅变更班级" && (
                <div className="border-t border-gray-100 pt-10">
                  <Field label="家长签名">
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 hover:bg-gray-50 transition-colors bg-white"
                      style={{ height: 100, color: "#9ca3af" }}>
                      <span className="text-sm">请在纸质表上签字后拍照上传</span>
                    </div>
                  </Field>
                </div>
              )}

            </div>
          </div>

          <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">
            <button className="btn-secondary" onClick={handleClearForm}>清空数据</button>
            <button className="btn-secondary" onClick={handleSaveDraft}>保存草稿</button>
            <div className="flex-1" />
            <button onClick={handleSubmit} disabled={submitting}
              className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px disabled:opacity-60"
              style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}>
              {submitting ? "提交中..." : "提交流程"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
