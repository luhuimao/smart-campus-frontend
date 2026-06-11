"use client";

import { Upload, X } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { DeptStaffPicker } from "@/components/ui/DeptStaffPicker";
import { useStaffDirectory, useCourses, useDepartmentMembers } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS, jdyCreate, jdyUploadFiles } from "@/lib/jdy-api";
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

export function TeacherCertPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
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
  const [hasCert, setHasCert] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);

  const [certNumber, setCertNumber] = useState("");
  const [certType, setCertType] = useState("");
  const [certSubject, setCertSubject] = useState("");
  const [certImages, setCertImages] = useState<File[]>([]);
  const [certDate, setCertDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [draftToast, setDraftToast] = useState(false);
  const draftImageCount = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { raw: staffList } = useStaffDirectory();
  const { raw: deptMembers } = useDepartmentMembers();
  const { raw: courseList } = useCourses();

  const courseOptions = useMemo(
    () => [...new Set(courseList.map((c) => c.科目).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")),
    [courseList],
  );

  const toMember = (name: string) => {
    const m = deptMembers.find(d => d.name === name);
    return m ? m.username : name;
  };

  const validate = (): boolean => {
    setSubmitted(true);
    const required: { field: unknown; name: string }[] = [
      { field: teacherName, name: "教师姓名" },
      { field: idCard, name: "身份证号码" },
    ];
    if (hasCert === "yes") {
      required.push(
        { field: department, name: "部门" },
        { field: position, name: "岗位" },
        { field: positionType, name: "岗位类型" },
        { field: partyJob, name: "党委/行政职务" },
        { field: phone, name: "联系方式" },
        { field: subject, name: "担任学科" },
        { field: certNumber, name: "教资证书编号" },
        { field: certType, name: "教师资格种类" },
        { field: certSubject, name: "任教科目" },
        { field: certImages.length > 0, name: "教师资格证书图片" },
        { field: certDate, name: "获证时间" },
      );
    }
    const firstMissing = required.find((r) => !r.field);
    if (firstMissing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }
    return true;
  };

  const buildData = (certKeys: string[]): Record<string, { value: unknown }> => {
    const data: Record<string, { value: unknown }> = {
      [TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.教师姓名]: { value: toMember(teacherName) },
      [TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.身份证号码]: { value: idCard },
      [TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.有无教师资格证]: { value: hasCert === "yes" ? "有" : "暂无" },
      [TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS["教师姓名（文本）"]]: { value: teacherName },
    };
    if (hasCert === "yes") {
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.部门] = { value: department };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.岗位] = { value: position };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.岗位类型] = { value: positionType };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS["党委/行政职务"]] = { value: partyJob };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.联系方式] = { value: phone };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.担任学科] = { value: subject };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.教资证书编号] = { value: certNumber };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.教师资格种类] = { value: certType };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.任教科目] = { value: certSubject };
      data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.获证时间] = { value: certDate };
      if (certKeys.length > 0) data[TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS.教师资格证书图片] = { value: certKeys };
    }
    return data;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      let certKeys: string[] = [];
      let transaction_id: string | undefined;
      if (hasCert === "yes" && certImages.length > 0) {
        transaction_id = crypto.randomUUID();
        const { keys } = await jdyUploadFiles(
          certImages,
          JDY_CONFIG.TEACHER_QUALIFICATION_CERTIFICATE_INFO.app_id,
          JDY_CONFIG.TEACHER_QUALIFICATION_CERTIFICATE_INFO.entry_id,
          transaction_id,
        );
        certKeys = keys;
      }
      const res = await jdyCreate({
        app_id: JDY_CONFIG.TEACHER_QUALIFICATION_CERTIFICATE_INFO.app_id,
        entry_id: JDY_CONFIG.TEACHER_QUALIFICATION_CERTIFICATE_INFO.entry_id,
        data: buildData(certKeys),
        data_creator: currentUser?.userId,
        transaction_id,
        is_start_workflow: true,
        is_start_trigger: false,
      });
      if (!res.success) {
        alert(res.message || "提交失败，请重试");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["teacher-cert"] });
      handleClearForm();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

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

  const handleSaveDraft = () => {
    const hasContent = teacherName || idCard || department || position || positionType || partyJob || phone || subject
      || certNumber || certType || certSubject || certDate;
    if (!hasContent) return;
    if (certImages.length > 0) { draftImageCount.current = certImages.length; setDraftToast(true); }
    localStorage.setItem("teacher-cert-draft", JSON.stringify({
      teacherName, idCard, department, position, positionType, partyJob, phone, subject,
      hasCert, certNumber, certType, certSubject, certDate,
      _imageCount: certImages.length,
    }));
  };

  const handleClearForm = () => {
    setTeacherName(""); setIdCard(""); setDepartment(""); setPosition("");
    setPositionType(""); setPartyJob(""); setPhone(""); setSubject("");
    setCertNumber(""); setCertType(""); setCertSubject(""); setCertImages([]); setCertDate("");
    setSubmitted(false);
    localStorage.removeItem("teacher-cert-draft");
  };

  // Auto-dismiss draft toast
  useEffect(() => {
    if (!draftToast) return;
    const t = setTimeout(() => setDraftToast(false), 3000);
    return () => clearTimeout(t);
  }, [draftToast]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("teacher-cert-draft");
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
      if (d.hasCert) setHasCert(d.hasCert);
      if (d.certNumber) setCertNumber(d.certNumber);
      if (d.certType) setCertType(d.certType);
      if (d.certSubject) setCertSubject(d.certSubject);
      if (d.certDate) setCertDate(d.certDate);
    } catch {}
  }, []);


  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
       
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教师资格证", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-6xl mx-auto pt-4 md:pt-6 px-3 md:px-6 pb-24">

          {/* Title */}
          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>教师资格证</h2>
              <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
            </div>
          </div>

          {draftToast && (
            <div className="mb-4 flex items-center gap-2 text-sm rounded-lg px-4 py-2.5 max-w-lg mx-auto"
              style={{ background: "rgba(245,158,11,0.08)", color: "#d97706" }}>
              <span>草稿已保存</span>
              <span className="opacity-60">—</span>
              <span className="opacity-60">已选的 {draftImageCount.current} 张图片未保存，提交前请重新上传</span>
            </div>
          )}

          {/* Form card */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Row 1 — cream */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教师姓名" required>
                <DeptStaffPicker staffList={deptMembers} value={teacherName} onChange={(v) => setTeacherName(v as string)} />
                {submitted && !teacherName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="身份证号码" required>
                <Input value={idCard} onChange={setIdCard} />
                {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            {/* Row 2 — white */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white" style={{ gridTemplateColumns: hasCert === "no" ? "1fr" : undefined }}>
              <Field label="有无教师资格证" required>
                <div className="flex items-center gap-10 py-2">
                  {[{ v: "yes", l: "有" }, { v: "no", l: "暂无" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white"
                        style={{ borderColor: hasCert === v ? teal : "#d1d5db" }}
                        onClick={() => setHasCert(v as "yes" | "no")}
                      >
                        {hasCert === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}
                      </div>
                      <span className="text-base font-medium text-gray-700" onClick={() => setHasCert(v as "yes" | "no")}>{l}</span>
                    </label>
                  ))}
                </div>
              </Field>
              {hasCert === "yes" && (
                <Field label="部门" required>
                  <Input value={department} onChange={setDepartment} />
                  {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                </Field>
              )}
            </div>

            {/* Row 3 — white（隐藏当暂无） */}
            {hasCert === "yes" && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="岗位" required>
                <Input value={position} onChange={setPosition} />
                {submitted && !position && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="岗位类型" hint="可填写任意一个：教学岗 教辅岗 行政岗 工勤岗 技能岗 管理岗" required>
                <Input value={positionType} onChange={setPositionType} />
                {submitted && !positionType && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>
            )}

            {/* Row 4 — cream（隐藏当暂无） */}
            {hasCert === "yes" && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="党委/行政职务" required>
                <Input value={partyJob} onChange={setPartyJob} />
                {submitted && !partyJob && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="联系方式" required>
                <Input value={phone} onChange={setPhone} />
                {submitted && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>
            )}

            {/* Row 5 — white（隐藏当暂无） */}
            {hasCert === "yes" && (
            <div className="p-8 bg-white">
              <div className="max-w-md">
                <Field label="担任学科" required>
                  <Input value={subject} onChange={setSubject} />
                  {submitted && !subject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                </Field>
              </div>
            </div>
            )}

            {/* Section: 教资信息（隐藏当暂无） */}
            {hasCert === "yes" && (
            <>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="教资证书编号" required>
                  <Input value={certNumber} onChange={setCertNumber} />
                  {submitted && !certNumber && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                </Field>
                <Field label="教师资格种类" required>
                  <select
                    value={certType}
                    onChange={e => setCertType(e.target.value)}
                    className="form-input appearance-none pr-9"
                    style={{ color: certType ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !certType ? "#ff4d4f" : undefined }}
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
                  >
                    <option value="" disabled>请选择</option>
                    <option>高等学校教师资格</option>
                    <option>中等职业学校教师资格</option>
                    <option>高中教师资格</option>
                    <option>初中教师资格</option>
                    <option>小学教师资格</option>
                    <option>幼儿园教师资格</option>
                  </select>
                  {submitted && !certType && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                </Field>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="任教科目" required>
                  <select
                    value={certSubject}
                    onChange={e => setCertSubject(e.target.value)}
                    className="form-input appearance-none pr-9"
                    style={{ color: certSubject ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !certSubject ? "#ff4d4f" : undefined }}
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
                  >
                    <option value="" disabled>请选择</option>
                    {courseOptions.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {submitted && !certSubject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                </Field>
                <Field label="获证时间" required>
                  <input
                    type="date"
                    value={certDate}
                    onChange={e => setCertDate(e.target.value)}
                    className="form-input"
                    style={{ color: certDate ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !certDate ? "#ff4d4f" : undefined }}
                    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                    onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
                  />
                  {submitted && !certDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                </Field>
              </div>
              <div className="p-8 bg-white">
                <Field label="教师资格证书图片" required>
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="flex-1 flex items-center gap-2 border border-dashed border-gray-200 rounded-[10px] px-3.5 py-2.5 cursor-pointer"
                      style={{ fontSize: 13, color: "#9ca3af", borderColor: submitted && certImages.length === 0 ? "#ff4d4f" : "#e5e7eb" }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={14} className="shrink-0" style={{ color: "#9ca3af" }} />
                      <span style={{ color: teal }}>选择</span>
                      <span>支持多张图片上传</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => { if (e.target.files) setCertImages([...certImages, ...Array.from(e.target.files)]); e.target.value = ""; }}
                    />
                  </div>
                  {certImages.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {certImages.map((file, i) => (
                        <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group">
                          <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            className="absolute top-0.5 right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => setCertImages(certImages.filter((_, j) => j !== i))}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {submitted && certImages.length === 0 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
                </Field>
              </div>
            </>
            )}

          </div>

          {/* Form footer */}
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
