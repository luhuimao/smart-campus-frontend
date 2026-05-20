"use client";

import { Bell, ChevronDown, ChevronRight, Plus, Image, ClipboardList, Menu, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { StaffPicker } from "./ui/StaffPicker";
import { useStaffDirectory, useCourses, type StaffDirectoryRecord } from "@/hooks/use-research-dashboard";
import { PageHeader, FlowButton } from "./PageHeader";

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

  const [certRows, setCertRows] = useState<{ id: number; certNumber: string; certType: string; teachingSubject: string; certImage: string | null; certDate: string }[]>([
    { id: 1, certNumber: "", certType: "", teachingSubject: "", certImage: null, certDate: "" },
  ]);
  const [nextCertId, setNextCertId] = useState(2);

  const updateCertRow = useCallback((id: number, field: string, value: string | null) => {
    setCertRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const addCertRow = useCallback(() => {
    setCertRows((prev) => [...prev, { id: nextCertId, certNumber: "", certType: "", teachingSubject: "", certImage: null, certDate: "" }]);
    setNextCertId((n) => n + 1);
  }, [nextCertId]);

  const removeCertRow = useCallback((id: number) => {
    setCertRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const anyCertMissing = useMemo(
    () => certRows.some((r) => !r.certNumber || !r.certType || !r.teachingSubject || !r.certImage || !r.certDate),
    [certRows],
  );

  const { raw: staffList } = useStaffDirectory();
  const { raw: courseList } = useCourses();

  const courseOptions = useMemo(
    () => [...new Set(courseList.map((c) => c.科目).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")),
    [courseList],
  );

  const handleSubmit = () => {
    setSubmitted(true);
    const required = [
      { field: teacherName, name: "教师姓名" },
      { field: idCard, name: "身份证号码" },
      ...(hasCert === "yes"
        ? [
          { field: department, name: "部门" },
          { field: position, name: "岗位" },
          { field: positionType, name: "岗位类型" },
          { field: partyJob, name: "党委/行政职务" },
          { field: phone, name: "联系方式" },
          { field: subject, name: "担任学科" },
          { field: !anyCertMissing, name: "教资信息" },
        ]
        : []),
    ];
    const firstMissing = required.find((r) => !r.field);
    if (firstMissing) {
      // scroll to top of form
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (teacherName && staffList.length > 0 && !idCard) {
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
  }, [teacherName, staffList, idCard]);

  const handleSelectStaff = (record: StaffDirectoryRecord | null) => {
    if (record) {
      setIdCard(record.身份证号);
      setDepartment(record.部门);
      setPosition(record.岗位);
      setPositionType(record.岗位类型);
      setPhone(record.手机号码);
      setSubject(record.担任学科);
    } else {
      setIdCard("");
      setDepartment("");
      setPosition("");
      setPositionType("");
      setPartyJob("");
      setPhone("");
      setSubject("");
    }
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        left={<FlowButton />}
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教师资格证", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          {/* Decorative title */}
          <div className="flex items-center justify-center gap-5 mb-12">
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }}>
              <div className="absolute h-px inset-x-2.5 -top-px opacity-40" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            </div>
            <div
              className="flex items-center gap-3 px-12 py-2 text-white text-base font-semibold tracking-[0.2em]"
              style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}
            >
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
              教师资格证
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }}>
              <div className="absolute h-px inset-x-2.5 -top-px opacity-40" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Row 1 — cream */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教师姓名" required>
                <StaffPicker value={teacherName} onChange={setTeacherName} onSelectRecord={handleSelectStaff} />
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

            {/* Section: 教资信息 table（隐藏当暂无） */}
            {hasCert === "yes" && (
            <div className="p-8 bg-white border-t border-gray-50">
              <p className="text-base font-semibold mb-6">
                <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>教资信息
              </p>

              {/* Grid table */}
              <div
                className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm"
                style={{ display: "grid", gridTemplateColumns: "48px 1.3fr 1fr 1fr 1.1fr 1.1fr 52px" }}
              >
                {/* Header */}
                {["", "教资证书编号", "教师资格种类", "任教科目", "教师资格证书图片", "获证时间", ""].map((h, i) => (
                  <div key={i} className="px-3 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0">
                    {i > 0 && i !== 3 && i !== 6 && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                    {h}
                  </div>
                ))}

                {certRows.map((row, idx) => (
                  <>
                    <div key={`num-${row.id}`} className="px-3 py-2.5 bg-white border-b border-r border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                      {idx + 1}
                    </div>
                    <div key={`cn-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                      <input
                        type="text"
                        value={row.certNumber}
                        onChange={(e) => updateCertRow(row.id, "certNumber", e.target.value)}
                        className="table-input"
                        style={submitted && !row.certNumber ? { borderColor: "#ff4d4f" } : undefined}
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                      />
                    </div>
                    <div key={`ct-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                      <select
                        value={row.certType}
                        onChange={(e) => updateCertRow(row.id, "certType", e.target.value)}
                        className="table-input appearance-none"
                        style={submitted && !row.certType ? { borderColor: "#ff4d4f" } : undefined}
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                      >
                        <option value=""></option>
                        <option>高等学校教师资格</option>
                        <option>中等职业学校教师资格</option>
                        <option>高中教师资格</option>
                        <option>初中教师资格</option>
                        <option>小学教师资格</option>
                        <option>幼儿园教师资格</option>
                      </select>
                    </div>
                    <div key={`ts-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                      <select
                        value={row.teachingSubject}
                        onChange={(e) => updateCertRow(row.id, "teachingSubject", e.target.value)}
                        className="table-input appearance-none"
                        style={submitted && !row.teachingSubject ? { borderColor: "#ff4d4f" } : undefined}
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                      >
                        <option value=""></option>
                        {courseOptions.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div key={`img-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                      <label className="w-full h-8 border rounded-lg flex items-center justify-center bg-gray-50 text-gray-300 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
                        style={{ borderColor: submitted && !row.certImage ? "#ff4d4f" : "#e5e7eb" }}>
                        {row.certImage ? (
                          <img src={row.certImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-4 h-4" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) updateCertRow(row.id, "certImage", URL.createObjectURL(file));
                          }}
                        />
                      </label>
                    </div>
                    <div key={`date-${row.id}`} className="px-2 py-2 bg-white border-b border-gray-100">
                      <input
                        type="date"
                        value={row.certDate}
                        onChange={(e) => updateCertRow(row.id, "certDate", e.target.value)}
                        className="table-input w-full"
                        style={{ color: row.certDate ? "#374151" : "#9ca3af", borderColor: submitted && !row.certDate ? "#ff4d4f" : undefined }}
                        onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                        onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                      />
                    </div>
                    <div key={`del-${row.id}`} className="px-2 py-2 bg-white border-b border-gray-100 flex items-center justify-center">
                      <button
                        type="button"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        onClick={() => removeCertRow(row.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ))}
              </div>

              {submitted && hasCert === "yes" && anyCertMissing && (
                <div className="mt-3 space-y-0.5">
                  {certRows.some((r) => !r.certNumber) && <p className="text-xs" style={{ color: "#ff4d4f" }}>教资证书编号为必填项</p>}
                  {certRows.some((r) => !r.certType) && <p className="text-xs" style={{ color: "#ff4d4f" }}>教师资格种类为必填项</p>}
                  {certRows.some((r) => !r.teachingSubject) && <p className="text-xs" style={{ color: "#ff4d4f" }}>任教科目为必填项</p>}
                  {certRows.some((r) => !r.certImage) && <p className="text-xs" style={{ color: "#ff4d4f" }}>教师资格证书图片为必填项</p>}
                  {certRows.some((r) => !r.certDate) && <p className="text-xs" style={{ color: "#ff4d4f" }}>获证时间为必填项</p>}
                </div>
              )}

              {/* Add / Quick fill */}
              <div className="flex items-center gap-8 mt-5">
                <button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }} onClick={addCertRow}>
                  <Plus className="w-4 h-4" /> 添加
                </button>
                <button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }}>
                  <ClipboardList className="w-4 h-4" /> 快速填报
                </button>
              </div>
            </div>
            )}

          </div>
        </main>
      </div>

      {/* Fixed footer */}
      <div
        className="form-footer shrink-0 flex gap-3 px-10 py-4"
      >
        <button
          className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
          onClick={handleSubmit}
        >
          提交
        </button>
        <button
          className="btn-secondary"
        >
          保存草稿
        </button>
      </div>
    </div>
  );
}
