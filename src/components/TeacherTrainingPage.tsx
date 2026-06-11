"use client";

import { useState, useEffect } from "react";
import { useDepartmentMembers } from "@/hooks/use-research-dashboard";
import { DeptStaffPicker } from "@/components/ui/DeptStaffPicker";
import { JDY_CONFIG, TEACHER_TRAINING_EXPERIENCE_WIDGET_IDS, jdyCreate } from "@/lib/jdy-api";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/user-context";
import { PageHeader } from "./PageHeader";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
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

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="form-input appearance-none"
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    >
      <option value=""></option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => onChange?.(e.target.value)}
      className="form-input"
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

const H = TEACHER_TRAINING_EXPERIENCE_WIDGET_IDS;

export function TeacherTrainingPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState("");
  const [trainName, setTrainName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lecturer, setLecturer] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [count, setCount] = useState("");
  const [trainType, setTrainType] = useState("");
  const [remark, setRemark] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftToast, setDraftToast] = useState(false);

  const { raw: deptMembers } = useDepartmentMembers();

  // ── API Logic ──────────────────────────────────────────────

  const buildData = () => {
    const memberUsernames = participants.map(name => {
      const m = deptMembers.find(d => d.name === name);
      return m ? m.username : name;
    });

    return {
      [H.培训渠道]: { value: channel },
      [H.培训名称]: { value: trainName },
      [H.培训开始时间]: { value: startDate },
      [H.培训结束时间]: { value: endDate },
      [H.主讲人]: { value: lecturer },
      [H.培训地点]: { value: "" },
      [H.参训人员]: { value: memberUsernames },
      [H.具体人数]: { value: count },
      [H.培训形式]: { value: trainType },
      [H.备注]: { value: remark },
    };
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!channel || !trainName || !startDate || !endDate || !lecturer || participants.length === 0 || !count || !trainType) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await jdyCreate({
        app_id: JDY_CONFIG.TEACHER_TRAINING_EXPERIENCE_INFO.app_id,
        entry_id: JDY_CONFIG.TEACHER_TRAINING_EXPERIENCE_INFO.entry_id,
        data: buildData(),
        data_creator: currentUser?.userId,
        is_start_workflow: true,
        is_start_trigger: false,
      });
      if (!res.success) {
        alert(res.message || "提交失败，请重试");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["teacher-training"] });
      handleClearForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Draft ──────────────────────────────────────────────────

  const handleSaveDraft = () => {
    const hasContent = channel || trainName || startDate || endDate || lecturer || participants.length > 0 || count || trainType;
    if (!hasContent) return;
    setDraftToast(true);
    localStorage.setItem("teacher-training-draft", JSON.stringify({
      channel, trainName, startDate, endDate, lecturer, participants, count, trainType, remark,
    }));
  };

  const handleClearForm = () => {
    setChannel(""); setTrainName(""); setStartDate(""); setEndDate("");
    setLecturer(""); setParticipants([]); setCount(""); setTrainType(""); setRemark("");
    setSubmitted(false);
    localStorage.removeItem("teacher-training-draft");
  };

  useEffect(() => {
    if (!draftToast) return;
    const t = setTimeout(() => setDraftToast(false), 3000);
    return () => clearTimeout(t);
  }, [draftToast]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("teacher-training-draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.channel) setChannel(d.channel);
      if (d.trainName) setTrainName(d.trainName);
      if (d.startDate) setStartDate(d.startDate);
      if (d.endDate) setEndDate(d.endDate);
      if (d.lecturer) setLecturer(d.lecturer);
      if (d.participants) setParticipants(d.participants);
      if (d.count) setCount(d.count);
      if (d.trainType) setTrainType(d.trainType);
      if (d.remark) setRemark(d.remark);
    } catch {}
  }, []);

  // ── Render ─────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader centered breadcrumbs={[{ label: "教师基础档案" }, { label: "教师培训", active: true }]} onMenuOpen={onMenuOpen} />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-6xl mx-auto pt-4 md:pt-6 px-3 md:px-6 pb-24">

          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>培训信息</h2>
              <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
            </div>
          </div>

          {draftToast && (
            <div className="mb-4 flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 max-w-lg mx-auto"
              style={{ background: "rgba(245,158,11,0.08)", color: "#d97706" }}>
              <span>草稿已保存</span>
            </div>
          )}

          <div className="rounded-[28px] shadow-sm border border-gray-100 bg-white">

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="培训渠道" required>
                <Select value={channel} onChange={setChannel} options={["校内培训", "校外培训", "线上培训"]} />
                {submitted && !channel && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="培训名称" required>
                <Input value={trainName} onChange={setTrainName} />
                {submitted && !trainName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="培训开始时间" required>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" style={{ color: startDate ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !startDate ? "#ff4d4f" : undefined }} />
                {submitted && !startDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="培训结束时间" required>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" style={{ color: endDate ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !endDate ? "#ff4d4f" : undefined }} />
                {submitted && !endDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="主讲人" required>
                <Input value={lecturer} onChange={setLecturer} />
                {submitted && !lecturer && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="参训人员" required>
                <DeptStaffPicker staffList={deptMembers} value={participants} onChange={(v) => setParticipants(v as string[])} multi />
                {submitted && participants.length === 0 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="具体人数" required>
                <Input value={count} onChange={setCount} />
                {submitted && !count && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="培训形式" required>
                <Select value={trainType} onChange={setTrainType} options={["校本培训", "远程培训", "集中培训"]} />
                {submitted && !trainType && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            <div className="p-8 bg-white">
              <div className="max-w-md">
                <Field label="备注">
                  <textarea rows={5} value={remark} onChange={(e) => setRemark(e.target.value)} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
                </Field>
              </div>
            </div>
          </div>

          <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">
            <button className="btn-secondary" onClick={handleSaveDraft}>保存草稿</button>
            <div className="flex-1" />
            <button
              className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px disabled:opacity-60"
              style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "提交中..." : "提交流程"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
