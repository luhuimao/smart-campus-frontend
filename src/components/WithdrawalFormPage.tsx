"use client";

import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { StudentPicker } from "./ui/StudentPicker";
import type { StudentInfoRecord } from "@/hooks/use-research-dashboard";
import { PageHeader } from "./PageHeader";
import { JDY_CONFIG, STUDENT_WITHDRAWAL_TRANSFER_LEAVE_WIDGET_IDS, jdyCreate } from "@/lib/jdy-api";
import { useCurrentUser } from "@/lib/user-context";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

const H = STUDENT_WITHDRAWAL_TRANSFER_LEAVE_WIDGET_IDS;

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{hint && <p className="mb-2 text-xs leading-relaxed" style={{ color: "#6b7280" }}>{hint}</p>}{children}</div>);
}

function TextInput({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input placeholder={placeholder} value={value ?? ""} onChange={e => onChange?.(e.target.value)} className="form-input" onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="relative"><select value={value} onChange={e => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled />{options.map(o => <option key={o}>{o}</option>)}</select></div>);
}

function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (<div className="flex items-center gap-6 pt-1">{options.map(opt => (<label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none"><span onClick={() => onChange(opt)} className="shrink-0 flex items-center justify-center rounded-full border transition-colors" style={{ width: 18, height: 18, borderColor: value === opt ? teal : "#d1d5db", background: "white" }}>{value === opt && <span className="rounded-full" style={{ width: 10, height: 10, background: teal, display: "block" }} />}</span><span className="text-sm" style={{ color: "#374151" }}>{opt}</span></label>))}</div>);
}

const REASONS = ["身体疾病", "与同学有关", "与老师有关", "与学校管理有关", "食堂伙食", "课程教学", "学费", "学校活动", "宿舍环境", "校园环境"];

export function WithdrawalFormPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [cls, setCls] = useState("");
  const [studentName, setStudentName] = useState("");
  const [phone, setPhone] = useState("");
  const [handleDate, setHandleDate] = useState("");
  const [action, setAction] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [reasons, setReasons] = useState<Set<string>>(new Set());
  const [extraReasons, setExtra] = useState<string[]>([]);
  const [isNew, setIsNew] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [signDate, setSignDate] = useState("");
  const [parentRelation, setParentRelation] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useCurrentUser();

  const toggleReason = (r: string) => setReasons(prev => { const s = new Set(prev); s.has(r) ? s.delete(r) : s.add(r); return s; });

  const handleSelectStudent = (record: StudentInfoRecord | null) => {
    if (record) { setCls(record.班级名称 || ""); setPhone(record.学生本人电话 || ""); }
    else { setCls(""); setPhone(""); }
  };

  // Restore draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem("withdrawal-form-draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.cls) setCls(d.cls);
      if (d.studentName) setStudentName(d.studentName);
      if (d.phone) setPhone(d.phone);
      if (d.handleDate) setHandleDate(d.handleDate);
      if (d.action) setAction(d.action);
      if (d.leaveDate) setLeaveDate(d.leaveDate);
      if (d.reasons) setReasons(new Set(d.reasons));
      if (d.extraReasons) setExtra(d.extraReasons);
      if (d.isNew) setIsNew(d.isNew);
      if (d.suggestion) setSuggestion(d.suggestion);
      if (d.bankAccount) setBankAccount(d.bankAccount);
      if (d.bankName) setBankName(d.bankName);
      if (d.bankBranch) setBankBranch(d.bankBranch);
      if (d.signDate) setSignDate(d.signDate);
      if (d.parentRelation) setParentRelation(d.parentRelation);
    } catch {}
  }, []);

  // ── API logic ────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!cls.trim())            errs.cls = "请输入班级";
    if (!studentName.trim())    errs.studentName = "请选择学生";
    if (!phone.trim())          errs.phone = "请输入联系电话";
    if (!handleDate.trim())     errs.handleDate = "请选择办理时间";
    if (!action.trim())         errs.action = "请选择办理事项";
    if (!leaveDate.trim())      errs.leaveDate = "请选择离校时间";
    if (reasons.size === 0)     errs.reasons = "请至少选择一项原因";
    if (!isNew.trim())          errs.isNew = "请选择";
    if (!suggestion.trim())     errs.suggestion = "请输入意见和建议";
    if (!bankAccount.trim())    errs.bankAccount = "请输入银行账号";
    if (!bankName.trim())       errs.bankName = "请输入户名";
    if (!bankBranch.trim())     errs.bankBranch = "请输入开户行";
    if (!signDate.trim())       errs.signDate = "请选择签字时间";
    if (!parentRelation.trim()) errs.parentRelation = "请选择与学生关系";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => { if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; }); };

  const buildData = () => {
    const now = new Date().toISOString();
    return {
      [H.班级]: { value: cls },
      [H.学生姓名]: { value: studentName },
      [H.联系电话]: { value: phone },
      [H.办理时间]: { value: handleDate },
      [H.办理事项]: { value: action },
      [H.学生离校时间]: { value: leaveDate },
      [H.退转休学原因]: { value: [...reasons, ...extraReasons] },
      [H.是否插班生]: { value: isNew },
      [H.意见建议]: { value: suggestion },
      [H.银行账号]: { value: bankAccount },
      [H.户名]: { value: bankName },
      [H.开户行]: { value: bankBranch },
      [H.学生签字]: { value: "" },
      [H.签字时间]: { value: signDate },
      [H.家长签字]: { value: "" },
      [H.与学生关系]: { value: parentRelation },
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
        app_id: JDY_CONFIG.STUDENT_WITHDRAWAL_TRANSFER_LEAVE_APPLICATION.app_id,
        entry_id: JDY_CONFIG.STUDENT_WITHDRAWAL_TRANSFER_LEAVE_APPLICATION.entry_id,
        data: buildData(),
        data_creator: currentUser?.userId,
        is_start_workflow: true,
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
    setCls(""); setStudentName(""); setPhone(""); setHandleDate(""); setAction(""); setLeaveDate("");
    setReasons(new Set()); setExtra([]); setIsNew(""); setSuggestion("");
    setBankAccount(""); setBankName(""); setBankBranch(""); setSignDate(""); setParentRelation("");
    setErrors({}); setSubmitted(false);
    localStorage.removeItem("withdrawal-form-draft");
  };

  const handleSaveDraft = () => {
    if (!studentName.trim() && !cls.trim()) return;
    localStorage.setItem("withdrawal-form-draft", JSON.stringify({
      cls, studentName, phone, handleDate, action, leaveDate,
      reasons: [...reasons], extraReasons, isNew, suggestion,
      bankAccount, bankName, bankBranch, signDate, parentRelation,
    }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader breadcrumbs={[{ label: "学生管理" }, { label: "学生退/转/休学申请表", active: true }]} onMenuOpen={onMenuOpen} />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6 pb-24">

          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>学生退/转/休学申请表</h2>
              <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
            </div>
          </div>

          <div className="rounded-[28px] shadow-sm border border-gray-100 bg-white">
            <div className="p-8 space-y-10">

              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="班级" required>
                  <TextInput value={cls} onChange={v => { setCls(v ?? ""); clearError("cls"); }} placeholder="请输入班级" />
                  {(submitted && !cls || errors.cls) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.cls || "此项为必填项"}</p>}
                </Field>
                <Field label="学生姓名" required>
                  <StudentPicker value={studentName} onChange={v => { setStudentName(v); clearError("studentName"); }} onSelectRecord={handleSelectStudent} />
                  {(submitted && !studentName || errors.studentName) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.studentName || "此项为必填项"}</p>}
                </Field>
                <Field label="联系电话" required>
                  <TextInput value={phone} onChange={v => { setPhone(v ?? ""); clearError("phone"); }} placeholder="请输入联系电话" />
                  {(submitted && !phone || errors.phone) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.phone || "此项为必填项"}</p>}
                </Field>
                <Field label="办理时间" required>
                  <input type="date" value={handleDate} onChange={e => { setHandleDate(e.target.value); clearError("handleDate"); }} className="form-input"
                    style={{ color: handleDate ? "#1d1d1f" : "#9ca3af" }}
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                  {(submitted && !handleDate || errors.handleDate) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.handleDate || "此项为必填项"}</p>}
                </Field>
                <Field label="办理事项" required hint="1) 退学：如果办理退学，学籍无法恢复，无法再读高中，请学生和家长知晓；) 休学：请向学籍管理部门提交休学申请。">
                  <RadioGroup options={["退学", "转学", "休学"]} value={action} onChange={v => { setAction(v); clearError("action"); }} />
                  {(submitted && !action || errors.action) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.action || "此项为必填项"}</p>}
                </Field>
                <Field label="学生离校时间" required>
                  <input type="date" value={leaveDate} onChange={e => { setLeaveDate(e.target.value); clearError("leaveDate"); }} className="form-input"
                    style={{ color: leaveDate ? "#1d1d1f" : "#9ca3af" }}
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                  {(submitted && !leaveDate || errors.leaveDate) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.leaveDate || "此项为必填项"}</p>}
                </Field>
              </div>

              <div className="border-t border-gray-100" />

              {/* 退/转/休学原因 */}
              <Field label="退/转/休学原因（可多选）" required hint="其他原因请【添加选项】">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2">
                  {[...REASONS, ...extraReasons].map(r => (
                    <label key={r} className="inline-flex items-center gap-2 cursor-pointer select-none" onClick={() => { toggleReason(r); clearError("reasons"); }}>
                      <span className="shrink-0 flex items-center justify-center rounded border-2 transition-colors" style={{ width: 18, height: 18, borderColor: reasons.has(r) ? teal : "#d1d5db", background: reasons.has(r) ? teal : "white" }}>
                        {reasons.has(r) && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <span className="text-sm" style={{ color: "#374151" }}>{r}</span>
                    </label>
                  ))}
                </div>
                <button type="button" onClick={() => setExtra(prev => [...prev, `自定义原因${prev.length + 1}`])}
                  className="mt-3 flex items-center gap-1 text-sm font-medium transition-colors hover:opacity-80" style={{ color: teal }}>
                  <Plus size={16} />添加选项
                </button>
                {(submitted && reasons.size === 0 || errors.reasons) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.reasons || "请至少选择一项原因"}</p>}
              </Field>

              <div className="border-t border-gray-100" />

              {/* 补充信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="是否是插班生/复读生/高一新生第一学期结束前？" required hint="如果您是插班生/复读生/高一新生，且目前办理申请时处于第一学期结束前，请选择【是】，否则选择【否】">
                  <RadioGroup options={["是", "否"]} value={isNew} onChange={v => { setIsNew(v); clearError("isNew"); }} />
                  {(submitted && !isNew || errors.isNew) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.isNew || "此项为必填项"}</p>}
                </Field>
                <Field label="对学校的意见和建议" required>
                  <textarea rows={6} value={suggestion} onChange={e => { setSuggestion(e.target.value); clearError("suggestion"); }}
                    className="form-input resize-none" onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                  {(submitted && !suggestion || errors.suggestion) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.suggestion || "此项为必填项"}</p>}
                </Field>
              </div>

              <div className="border-t border-gray-100" />

              {/* 银行信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="如有退费，退费接收银行账号" required>
                  <TextInput value={bankAccount} onChange={v => { setBankAccount(v ?? ""); clearError("bankAccount"); }} placeholder="请输入银行账号" />
                  {(submitted && !bankAccount || errors.bankAccount) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.bankAccount || "此项为必填项"}</p>}
                </Field>
                <div>
                  <Field label="银行账号户名" required>
                    <TextInput value={bankName} onChange={v => { setBankName(v ?? ""); clearError("bankName"); }} placeholder="请输入户名" />
                    {(submitted && !bankName || errors.bankName) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.bankName || "此项为必填项"}</p>}
                  </Field>
                  <div className="mt-6">
                    <Field label="开户行" required>
                      <TextInput value={bankBranch} onChange={v => { setBankBranch(v ?? ""); clearError("bankBranch"); }} placeholder="请输入开户行" />
                      {(submitted && !bankBranch || errors.bankBranch) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.bankBranch || "此项为必填项"}</p>}
                    </Field>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* 签名 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="学生签字" required>
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 hover:bg-gray-50 transition-colors bg-white"
                    style={{ height: 100, color: "#9ca3af" }}>
                    <span className="text-sm">请在纸质表上签字后拍照上传</span>
                  </div>
                </Field>
                <Field label="签字时间" required>
                  <input type="date" value={signDate} onChange={e => { setSignDate(e.target.value); clearError("signDate"); }} className="form-input"
                    style={{ color: signDate ? "#1d1d1f" : "#9ca3af" }}
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                  {(submitted && !signDate || errors.signDate) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.signDate || "此项为必填项"}</p>}
                </Field>
                <Field label="家长签字" required>
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 hover:bg-gray-50 transition-colors bg-white"
                    style={{ height: 100, color: "#9ca3af" }}>
                    <span className="text-sm">请在纸质表上签字后拍照上传</span>
                  </div>
                </Field>
                <Field label="与学生关系" required>
                  <SelectField value={parentRelation} onChange={v => { setParentRelation(v); clearError("parentRelation"); }} options={["父亲", "母亲", "祖父", "祖母", "其他监护人"]} />
                  {(submitted && !parentRelation || errors.parentRelation) && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.parentRelation || "此项为必填项"}</p>}
                </Field>
              </div>

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
