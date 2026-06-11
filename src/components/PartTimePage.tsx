"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { DeptStaffPicker } from "@/components/ui/DeptStaffPicker";
import { useStaffDirectory, useDepartmentMembers } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, TEACHER_PART_TIME_TEACHING_WIDGET_IDS, jdyCreate } from "@/lib/jdy-api";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "./PageHeader";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}
      {children}
    </div>
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

type JobRow = { id: number; role: string; unit: string; startDate: string; endDate: string; years: string };

export function PartTimePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const [teacherName, setTeacherName] = useState(currentUser?.name ?? "");
  const [idCard, setIdCard] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [positionType, setPositionType] = useState("");
  const [partyJob, setPartyJob] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [hasJob, setHasJob] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftToast, setDraftToast] = useState(false);

  const [rows, setRows] = useState<JobRow[]>([{ id: 1, role: "", unit: "", startDate: "", endDate: "", years: "" }]);
  const [nextId, setNextId] = useState(2);

  const { raw: staffList } = useStaffDirectory();
  const { raw: deptMembers } = useDepartmentMembers();

  const updateRow = useCallback((id: number, field: string, value: unknown) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { id: nextId, role: "", unit: "", startDate: "", endDate: "", years: "" }]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const removeRow = useCallback((id: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  // Auto-calculate years from date range
  useEffect(() => {
    let changed = false;
    const next = rows.map((r) => {
      if (r.startDate && r.endDate) {
        const s = new Date(r.startDate);
        const e = new Date(r.endDate);
        if (!Number.isNaN(s.getTime()) && !Number.isNaN(e.getTime()) && e >= s) {
          const diffMs = e.getTime() - s.getTime();
          const years = Math.round((diffMs / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10;
          const str = String(years);
          if (str !== r.years) { changed = true; return { ...r, years: str }; }
        }
      }
      return r;
    });
    if (changed) setRows(next);
  }, [rows]);

  const anyMissing = useMemo(
    () => rows.some((r) => !r.role || !r.unit || !r.startDate || !r.years),
    [rows],
  );

  // ── API Logic ──────────────────────────────────────────────

  const toMember = (name: string) => {
    const m = deptMembers.find(d => d.name === name);
    return m ? m.username : name;
  };

  const H = TEACHER_PART_TIME_TEACHING_WIDGET_IDS;

  const buildData = () => {
    const subRecords = rows.map(row => ({
      [H["教学兼职.编号"]]: { value: "" },
      [H["教学兼职.兼职职务"]]: { value: row.role },
      [H["教学兼职.其他兼职职务"]]: { value: "" },
      [H["教学兼职.任职单位"]]: { value: row.unit },
      [H["教学兼职.兼职开始日期"]]: { value: row.startDate },
      [H["教学兼职.兼职结束日期"]]: { value: row.endDate },
      [H["教学兼职.年限"]]: { value: row.years },
    }));

    const data: Record<string, { value: unknown }> = {
      [H.教师姓名]: { value: toMember(teacherName) },
      [H.身份证号码]: { value: idCard },
      [H.有无教学兼职]: { value: hasJob === "yes" ? "有" : "暂无" },
      [H["教师姓名（文本）"]]: { value: teacherName },
    };
    if (hasJob === "yes") {
      data[H.部门] = { value: department };
      data[H.岗位] = { value: position };
      data[H.岗位类型] = { value: positionType };
      data[H["党委/行政职务"]] = { value: partyJob };
      data[H.联系方式] = { value: phone };
      data[H.担任学科] = { value: subject };
      data[H.教学兼职] = { value: subRecords };
    }
    return data;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasJob === "yes" && anyMissing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!teacherName || !idCard) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await jdyCreate({
        app_id: JDY_CONFIG.TEACHER_PART_TIME_TEACHING_INFO.app_id,
        entry_id: JDY_CONFIG.TEACHER_PART_TIME_TEACHING_INFO.entry_id,
        data: buildData(),
        data_creator: currentUser?.userId,
        is_start_workflow: true,
        is_start_trigger: false,
      });
      if (!res.success) {
        alert(res.message || "提交失败，请重试");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["part-time"] });
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
    const hasContent = teacherName || idCard || department || position || positionType || partyJob || phone || subject
      || rows.some(r => r.role || r.unit || r.startDate);
    if (!hasContent) return;
    setDraftToast(true);
    localStorage.setItem("part-time-draft", JSON.stringify({
      teacherName, idCard, department, position, positionType, partyJob, phone, subject,
      hasJob, rows: rows.map(r => ({ id: r.id, role: r.role, unit: r.unit, startDate: r.startDate, endDate: r.endDate, years: r.years })),
    }));
  };

  const handleClearForm = () => {
    setTeacherName(""); setIdCard(""); setDepartment(""); setPosition("");
    setPositionType(""); setPartyJob(""); setPhone(""); setSubject("");
    setRows([{ id: 1, role: "", unit: "", startDate: "", endDate: "", years: "" }]);
    setNextId(2);
    setSubmitted(false);
    localStorage.removeItem("part-time-draft");
  };

  useEffect(() => {
    if (!draftToast) return;
    const t = setTimeout(() => setDraftToast(false), 3000);
    return () => clearTimeout(t);
  }, [draftToast]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("part-time-draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.teacherName) setTeacherName(d.teacherName);
      if (d.idCard) setIdCard(d.idCard);
      if (d.department) setDepartment(d.department);
      if (d.position) setPosition(d.position);
      if (d.positionType) setPositionType(d.positionType);
      if (d.partyJob) setPartyJob(d.partyJob);
      if (d.phone) setPhone(d.phone);
      if (d.subject) setSubject(d.subject);
      if (d.hasJob) setHasJob(d.hasJob);
      if (d.rows && d.rows.length > 0) {
        setRows(d.rows.map((r: JobRow) => r));
        setNextId(Math.max(...d.rows.map((r: JobRow) => r.id)) + 1);
      }
    } catch {}
  }, []);

  // ── Staff ──────────────────────────────────────────────────

  useEffect(() => {
    if (teacherName && staffList.length > 0) {
      const match = staffList.find((s) => s.教职工姓名 === teacherName);
      if (match) {
        setIdCard(match.身份证号);
        setDepartment(match.部门);
        setPosition(match.岗位);
        setPositionType(match.岗位类型);
        setPhone(match.手机号码);
        setSubject(match.担任学科);
      }
    }
  }, [teacherName, staffList]);


  // ── Render ─────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教学兼职", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-6xl mx-auto pt-4 md:pt-6 px-3 md:px-6 pb-24">

          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>教学兼职</h2>
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
              <Field label="教师姓名" required>
                <DeptStaffPicker staffList={deptMembers} value={teacherName} onChange={(v) => setTeacherName(v as string)} />
                {submitted && !teacherName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="身份证号码" required>
                <Input value={idCard} onChange={setIdCard} />
                {submitted && !idCard && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            <div className="p-8 bg-white">
              <Field label="有无教学兼职" required>
                <div className="flex items-center gap-10 py-2">
                  {[{ v: "yes" as const, l: "有" }, { v: "no" as const, l: "暂无" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setHasJob(v)}>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white"
                        style={{ borderColor: hasJob === v ? teal : "#d1d5db" }}
                      >
                        {hasJob === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}
                      </div>
                      <span className="text-base font-medium text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {hasJob === "yes" && (
              <>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                  <Field label="部门" required>
                    <Input value={department} onChange={setDepartment} />
                    {submitted && !department && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                  </Field>
                  <Field label="岗位" required>
                    <Input value={position} onChange={setPosition} />
                    {submitted && !position && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                  </Field>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                  <Field label="岗位类型" hint="可填任意一个：教学岗 教辅岗 行政岗 工勤岗 技能岗 管理岗" required>
                    <Input value={positionType} onChange={setPositionType} />
                    {submitted && !positionType && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                  </Field>
                  <Field label="党委/行政职务" required>
                    <Input value={partyJob} onChange={setPartyJob} />
                    {submitted && !partyJob && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                  </Field>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                  <Field label="联系方式" required>
                    <Input value={phone} onChange={setPhone} />
                    {submitted && !phone && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                  </Field>
                  <Field label="担任学科" required>
                    <Input value={subject} onChange={setSubject} />
                    {submitted && !subject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                  </Field>
                </div>

                {/* Part-time table */}
                <div className="p-8 bg-white border-t border-gray-50">
                  <p className="text-base font-semibold mb-5">
                    <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>教学兼职
                  </p>

                  <div className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm"
                    style={{ display: "grid", gridTemplateColumns: "48px 1.1fr 1.2fr 1fr 1.2fr 0.7fr 52px" }}>
                    {["", "兼职职务", "任职单位", "兼职开始日期", "兼职结束日期", "年限", ""].map((h, i) => (
                      <div key={i} className="px-3 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0">
                        {(i === 1 || i === 2 || i === 3 || i === 5) && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                        {h}
                      </div>
                    ))}

                    {rows.map((row, idx) => (
                      <>
                        <div key={`n-${row.id}`} className="px-3 py-2.5 bg-white border-b border-r border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                          {idx + 1}
                        </div>
                        <div key={`rl-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <select
                            value={row.role}
                            onChange={(e) => updateRow(row.id, "role", e.target.value)}
                            className="table-input appearance-none"
                            style={!row.role ? { color: "#9ca3af" } : undefined}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          >
                            <option value=""></option>
                            {["顾问", "客座教授", "兼职讲师"].map(o => <option key={o}>{o}</option>)}
                          </select>
                        </div>
                        <div key={`un-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="text"
                            value={row.unit}
                            onChange={(e) => updateRow(row.id, "unit", e.target.value)}
                            className="table-input"
                            style={submitted && !row.unit ? { borderColor: "#ff4d4f" } : undefined}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`sd-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="date"
                            value={row.startDate}
                            onChange={(e) => updateRow(row.id, "startDate", e.target.value)}
                            className="table-input w-full"
                            style={{ color: row.startDate ? "#374151" : "#9ca3af", borderColor: submitted && !row.startDate ? "#ff4d4f" : undefined }}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`ed-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="date"
                            value={row.endDate}
                            onChange={(e) => updateRow(row.id, "endDate", e.target.value)}
                            className="table-input w-full"
                            style={{ color: row.endDate ? "#374151" : "#9ca3af" }}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`yr-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="text"
                            value={row.years}
                            onChange={(e) => updateRow(row.id, "years", e.target.value)}
                            className="table-input text-center"
                            style={submitted && !row.years ? { borderColor: "#ff4d4f" } : undefined}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`del-${row.id}`} className="px-2 py-2 bg-white border-b border-gray-100 flex items-center justify-center">
                          <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => removeRow(row.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ))}
                  </div>

                  {submitted && hasJob === "yes" && anyMissing && (
                    <div className="mt-3 space-y-0.5">
                      {rows.some((r) => !r.role) && <p className="text-xs" style={{ color: "#ff4d4f" }}>兼职职务为必填项</p>}
                      {rows.some((r) => !r.unit) && <p className="text-xs" style={{ color: "#ff4d4f" }}>任职单位为必填项</p>}
                      {rows.some((r) => !r.startDate) && <p className="text-xs" style={{ color: "#ff4d4f" }}>兼职开始日期为必填项</p>}
                      {rows.some((r) => !r.years) && <p className="text-xs" style={{ color: "#ff4d4f" }}>年限为必填项</p>}
                    </div>
                  )}

                  <div className="flex items-center gap-8 mt-5">
                    <button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }} onClick={addRow}>
                      <Plus className="w-4 h-4" /> 添加
                    </button>
                  </div>
                </div>
              </>
            )}
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
