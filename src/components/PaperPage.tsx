"use client";

import { Plus, ClipboardList, Menu, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { StaffPicker } from "./ui/StaffPicker";
import { useStaffDirectory, type StaffDirectoryRecord } from "@/hooks/use-research-dashboard";
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

function CellSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
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

type PaperRow = {
  id: number;
  type: string;
  name: string;
  author: string;
  date: string;
  level: string;
};

export function PaperPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const currentUser = useCurrentUser();
  const [teacherName, setTeacherName] = useState(currentUser?.name ?? "");
  const [idCard, setIdCard] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [positionType, setPositionType] = useState("");
  const [partyJob, setPartyJob] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [hasThesis, setHasThesis] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);

  const [paperRows, setPaperRows] = useState<PaperRow[]>([
    { id: 1, type: "", name: "", author: "", date: "", level: "" },
  ]);
  const [nextPaperId, setNextPaperId] = useState(2);

  const updatePaperRow = useCallback((id: number, field: string, value: string | null) => {
    setPaperRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const addPaperRow = useCallback(() => {
    setPaperRows((prev) => [...prev, { id: nextPaperId, type: "", name: "", author: "", date: "", level: "" }]);
    setNextPaperId((n) => n + 1);
  }, [nextPaperId]);

  const removePaperRow = useCallback((id: number) => {
    setPaperRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const anyPaperMissing = useMemo(
    () => paperRows.some((r) => !r.type || !r.name || !r.author || !r.date || !r.level),
    [paperRows],
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
      ...(hasThesis === "yes"
        ? [
          { field: department, name: "部门" },
          { field: position, name: "岗位" },
          { field: positionType, name: "岗位类型" },
          { field: partyJob, name: "党委/行政职务" },
          { field: phone, name: "联系方式" },
          { field: subject, name: "担任学科" },
          { field: !anyPaperMissing, name: "论文发表" },
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
        left={<FlowButton />}
        breadcrumbs={[{ label: "教师基础档案" }, { label: "论文", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          {/* Decorative title */}
          <div className="flex items-center justify-center gap-5 mb-12">
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
            <div
              className="flex items-center gap-3 px-12 py-2 text-white text-base font-semibold tracking-[0.2em]"
              style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}
            >
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
              论文
              <span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />
            </div>
            <div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} />
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

            {/* Row 2 — 有无论文 */}
            <div className="p-8 bg-white">
              <Field label="有无论文" required>
                <div className="flex items-center gap-10 py-2">
                  {[{ v: "yes" as const, l: "有" }, { v: "no" as const, l: "暂无" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setHasThesis(v)}>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white"
                        style={{ borderColor: hasThesis === v ? teal : "#d1d5db" }}
                      >
                        {hasThesis === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}
                      </div>
                      <span className="text-base font-medium text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {hasThesis === "yes" && (
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

                {/* Paper table */}
                <div className="p-8 bg-white border-t border-gray-50">
                  <p className="text-base font-semibold mb-5">
                    <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>论文发表
                  </p>

                  <div className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm"
                    style={{ display: "grid", gridTemplateColumns: "48px 1fr 1.4fr 1fr 1fr 1fr 52px" }}>
                    {/* Header */}
                    {["", "类型", "成果名称", "作者", "时间", "级别", ""].map((h, i) => (
                      <div key={i} className="px-3 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0">
                        {i > 0 && i !== 5 && i !== 6 && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                        {h}
                      </div>
                    ))}

                    {paperRows.map((row, idx) => (
                      <>
                        <div key={`num-${row.id}`} className="px-3 py-2.5 bg-white border-b border-r border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                          {idx + 1}
                        </div>
                        <div key={`type-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <CellSelect value={row.type} onChange={(v) => updatePaperRow(row.id, "type", v)} options={["论文发表", "论文获奖"]} />
                        </div>
                        <div key={`name-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => updatePaperRow(row.id, "name", e.target.value)}
                            className="table-input"
                            style={submitted && !row.name ? { borderColor: "#ff4d4f" } : undefined}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`author-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="text"
                            value={row.author}
                            onChange={(e) => updatePaperRow(row.id, "author", e.target.value)}
                            className="table-input"
                            style={submitted && !row.author ? { borderColor: "#ff4d4f" } : undefined}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`date-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="date"
                            value={row.date}
                            onChange={(e) => updatePaperRow(row.id, "date", e.target.value)}
                            className="table-input w-full"
                            style={{ color: row.date ? "#374151" : "#9ca3af", borderColor: submitted && !row.date ? "#ff4d4f" : undefined }}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`level-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <CellSelect
                            value={row.level}
                            onChange={(v) => updatePaperRow(row.id, "level", v)}
                            options={["国家级", "省级", "市级","区级","校级","其他"]}
                          />
                        </div>
                        <div key={`del-${row.id}`} className="px-2 py-2 bg-white border-b border-gray-100 flex items-center justify-center">
                          <button
                            type="button"
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => removePaperRow(row.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    ))}
                  </div>

                  {submitted && hasThesis === "yes" && anyPaperMissing && (
                    <div className="mt-3 space-y-0.5">
                      {paperRows.some((r) => !r.type) && <p className="text-xs" style={{ color: "#ff4d4f" }}>类型为必填项</p>}
                      {paperRows.some((r) => !r.name) && <p className="text-xs" style={{ color: "#ff4d4f" }}>成果名称为必填项</p>}
                      {paperRows.some((r) => !r.author) && <p className="text-xs" style={{ color: "#ff4d4f" }}>作者为必填项</p>}
                      {paperRows.some((r) => !r.date) && <p className="text-xs" style={{ color: "#ff4d4f" }}>时间为必填项</p>}
                      {paperRows.some((r) => !r.level) && <p className="text-xs" style={{ color: "#ff4d4f" }}>级别为必填项</p>}
                    </div>
                  )}

                  <div className="flex items-center gap-8 mt-5">
                    <button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }} onClick={addPaperRow}>
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
