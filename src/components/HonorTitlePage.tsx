"use client";

import { Plus, Image, ClipboardList, Menu, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { StaffPicker } from "./ui/StaffPicker";
import { useStaffDirectory, type StaffDirectoryRecord } from "@/hooks/use-research-dashboard";
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

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="table-input appearance-none"
      style={!value ? { color: "#9ca3af" } : undefined}
      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
      onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
    >
      <option value=""></option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );
}

type HonorRow = {
  id: number;
  date: string;
  title: string;
  level: string;
  unit: string;
  image: string | null;
};

export function HonorTitlePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const currentUser = useCurrentUser();
  const [teacherName, setTeacherName] = useState(currentUser?.name ?? "");
  const [idCard, setIdCard] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [positionType, setPositionType] = useState("");
  const [partyJob, setPartyJob] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [hasHonor, setHasHonor] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);

  const [honorRows, setHonorRows] = useState<HonorRow[]>([
    { id: 1, date: "", title: "", level: "", unit: "", image: null },
  ]);
  const [nextHonorId, setNextHonorId] = useState(2);

  const updateHonorRow = useCallback((id: number, field: string, value: string | null) => {
    setHonorRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const addHonorRow = useCallback(() => {
    setHonorRows((prev) => [...prev, { id: nextHonorId, date: "", title: "", level: "", unit: "", image: null }]);
    setNextHonorId((n) => n + 1);
  }, [nextHonorId]);

  const removeHonorRow = useCallback((id: number) => {
    setHonorRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const anyHonorMissing = useMemo(
    () => honorRows.some((r) => !r.date || !r.title || !r.level || !r.unit || !r.image),
    [honorRows],
  );

  const { raw: staffList } = useStaffDirectory();

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

  const handleSubmit = () => {
    setSubmitted(true);
    const check = [
      { field: teacherName, name: "教师姓名" },
      { field: idCard, name: "身份证号码" },
      ...(hasHonor === "yes"
        ? [
          { field: department, name: "部门" },
          { field: position, name: "岗位" },
          { field: positionType, name: "岗位类型" },
          { field: partyJob, name: "党委/行政职务" },
          { field: phone, name: "联系方式" },
          { field: subject, name: "担任学科" },
          { field: !anyHonorMissing, name: "荣誉称号" },
        ]
        : []),
    ];
    if (check.find((r) => !r.field)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
       
        breadcrumbs={[{ label: "教师基础档案" }, { label: "荣誉称号", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          {/* Decorative title */}
          <div className="flex items-center justify-center gap-5 mb-12">
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            <div
              className="flex items-center gap-3 px-12 py-2 text-white text-base font-semibold tracking-[0.2em]"
              style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}
            >
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
              荣誉称号
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="relative h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
          </div>

          {/* Form card */}
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Row 1 — 教师姓名 + 身份证号码 */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教师姓名" required>
                <StaffPicker value={teacherName} onChange={setTeacherName} onSelectRecord={handleSelectStaff} />
                {submitted && !teacherName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="身份证号码" required>
                <Input value={idCard} onChange={setIdCard} />
                {submitted && !idCard && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

            {/* Row 2 — 有无荣誉称号 */}
            <div className="p-8 bg-white">
              <Field label="有无荣誉称号" required>
                <div className="flex items-center gap-10 py-2">
                  {[{ v: "yes" as const, l: "有" }, { v: "no" as const, l: "暂无" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setHasHonor(v)}>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white"
                        style={{ borderColor: hasHonor === v ? teal : "#d1d5db" }}
                      >
                        {hasHonor === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}
                      </div>
                      <span className="text-base font-medium text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {hasHonor === "yes" && (
              <>
                {/* Row 3 — 部门 + 岗位 */}
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

                {/* Row 4 — 岗位类型 + 党委/行政职务 */}
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

                {/* Row 5 — 联系方式 + 担任学科 */}
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

                {/* Honor detail table */}
                <div className="p-8 bg-white border-t border-gray-50">
                  <div className="mb-5">
                    <p className="text-base font-semibold">
                      <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>荣誉称号
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">【颁发单位】与公示文件或证书一致</p>
                  </div>

                  <div className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm"
                    style={{ display: "grid", gridTemplateColumns: "48px 1fr 1.2fr 1fr 1.2fr 80px 52px" }}>
                    {/* Header */}
                    {["", "获评日期", "荣誉称号", "荣誉级别", "颁发单位", "相关照片", ""].map((h, i) => (
                      <div key={i} className="px-3 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0">
                        {i > 0 && i !== 5 && i !== 6 && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                        {h}
                      </div>
                    ))}

                    {honorRows.map((row, idx) => (
                      <>
                        <div key={`num-${row.id}`} className="px-3 py-2.5 bg-white border-b border-r border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                          {idx + 1}
                        </div>
                        <div key={`date-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => updateHonorRow(row.id, "date", e.target.value)}
                            className="table-input w-full"
                            style={{ color: row.date ? "#374151" : "#9ca3af", borderColor: submitted && !row.date ? "#ff4d4f" : undefined }}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`title-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <Select
                            value={row.title}
                            onChange={(v) => updateHonorRow(row.id, "title", v)}
                            options={["骨干教师", "学科带头人", "教坛新秀", "兼职教研员","教学名师","特级教师","三星星级教师","四星星级教师","三星星级班主任","四星星级班主任","其他"]}
                          />
                        </div>
                        <div key={`level-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <Select
                            value={row.level}
                            onChange={(v) => updateHonorRow(row.id, "level", v)}
                            options={["国家级", "省级", "市级", "区级", "校级"]}
                          />
                        </div>
                        <div key={`unit-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="text"
                            placeholder="与公示或证书一致"
                            value={row.unit}
                            onChange={(e) => updateHonorRow(row.id, "unit", e.target.value)}
                            className="table-input"
                            style={submitted && !row.unit ? { borderColor: "#ff4d4f" } : undefined}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`img-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <label className="w-full h-8 border rounded-lg flex items-center justify-center bg-gray-50 text-gray-300 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
                            style={{ borderColor: submitted && !row.image ? "#ff4d4f" : "#e5e7eb" }}>
                            {row.image ? (
                              <img src={row.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Image className="w-4 h-4" />
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) updateHonorRow(row.id, "image", URL.createObjectURL(file));
                              }}
                            />
                          </label>
                        </div>
                        <div key={`del-${row.id}`} className="px-2 py-2 bg-white border-b border-gray-100 flex items-center justify-center">
                          <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => removeHonorRow(row.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ))}
                  </div>

                  {submitted && hasHonor === "yes" && anyHonorMissing && (
                    <div className="mt-3 space-y-0.5">
                      {honorRows.some((r) => !r.date) && <p className="text-xs" style={{ color: "#ff4d4f" }}>获评日期为必填项</p>}
                      {honorRows.some((r) => !r.title) && <p className="text-xs" style={{ color: "#ff4d4f" }}>荣誉称号为必填项</p>}
                      {honorRows.some((r) => !r.level) && <p className="text-xs" style={{ color: "#ff4d4f" }}>荣誉级别为必填项</p>}
                      {honorRows.some((r) => !r.unit) && <p className="text-xs" style={{ color: "#ff4d4f" }}>颁发单位为必填项</p>}
                      {honorRows.some((r) => !r.image) && <p className="text-xs" style={{ color: "#ff4d4f" }}>相关照片为必填项</p>}
                    </div>
                  )}

                  <div className="flex items-center gap-8 mt-5">
                    <button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }} onClick={addHonorRow}>
                      <Plus className="w-4 h-4" /> 添加
                    </button>
                    <button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }}>
                      <ClipboardList className="w-4 h-4" /> 快速填报
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Fixed footer */}
      <div className="form-footer shrink-0 flex gap-3 px-10 py-4">
        <button
          className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
          onClick={handleSubmit}
        >
          提交
        </button>
        <button className="btn-secondary">
          保存草稿
        </button>
      </div>
    </div>
  );
}
