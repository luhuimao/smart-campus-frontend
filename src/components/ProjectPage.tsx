"use client";

import { Plus, ClipboardList, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { DeptStaffPicker } from "@/components/ui/DeptStaffPicker";
import { useStaffDirectory, useDepartmentMembers } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, TEACHER_RESEARCH_TOPIC_WIDGET_IDS, jdyCreate, jdyUploadFiles } from "@/lib/jdy-api";
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

type ProjectRow = {
  id: number;
  name: string;
  level: string;
  status: string;
  images: File[];
};

export function ProjectPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
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
  const [hasProject, setHasProject] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftToast, setDraftToast] = useState(false);
  const draftImageCount = useRef(0);

  const [rows, setRows] = useState<ProjectRow[]>([
    { id: 1, name: "", level: "", status: "", images: [] },
  ]);
  const [nextId, setNextId] = useState(2);

  const { raw: staffList } = useStaffDirectory();
  const { raw: deptMembers } = useDepartmentMembers();

  const updateRow = useCallback((id: number, field: string, value: unknown) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { id: nextId, name: "", level: "", status: "", images: [] }]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const removeRow = useCallback((id: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const anyMissing = useMemo(
    () => rows.some((r) => !r.name || !r.level || !r.status || r.images.length === 0),
    [rows],
  );

  const hasImages = useMemo(() => rows.some(r => r.images.length > 0), [rows]);

  // ── API Logic ──────────────────────────────────────────────

  const toMember = (name: string) => {
    const m = deptMembers.find(d => d.name === name);
    return m ? m.username : name;
  };

  const H = TEACHER_RESEARCH_TOPIC_WIDGET_IDS;

  const buildData = (allKeys: string[]) => {
    let ki = 0;
    const subRecords = rows.map(row => ({
      [H.课题_编号]: { value: "" },
      [H.课题_课题名称]: { value: row.name },
      [H.课题_级别]: { value: row.level },
      [H["课题_立项/结项"]]: { value: row.status },
      [H.课题_图片证明材料]: { value: row.images.map(() => allKeys[ki++]) },
    }));

    const data: Record<string, { value: unknown }> = {
      [H.教师姓名]: { value: toMember(teacherName) },
      [H.身份证号码]: { value: idCard },
      [H.有无课题]: { value: hasProject === "yes" ? "有" : "暂无" },
      [H["教师姓名（文本）"]]: { value: teacherName },
    };
    if (hasProject === "yes") {
      data[H.部门] = { value: department };
      data[H.岗位] = { value: position };
      data[H.岗位类型] = { value: positionType };
      data[H["党委/行政职务"]] = { value: partyJob };
      data[H.联系方式] = { value: phone };
      data[H.担任学科] = { value: subject };
      data[H.课题] = { value: subRecords };
    }
    return data;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasProject === "yes" && anyMissing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!teacherName || !idCard) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const allFiles = rows.flatMap(r => r.images);
      let allKeys: string[] = [];
      let transaction_id: string | undefined;
      if (allFiles.length > 0) {
        transaction_id = crypto.randomUUID();
        const { keys } = await jdyUploadFiles(
          allFiles,
          JDY_CONFIG.TEACHER_RESEARCH_TOPIC_INFO.app_id,
          JDY_CONFIG.TEACHER_RESEARCH_TOPIC_INFO.entry_id,
          transaction_id,
        );
        allKeys = keys;
      }
      const res = await jdyCreate({
        app_id: JDY_CONFIG.TEACHER_RESEARCH_TOPIC_INFO.app_id,
        entry_id: JDY_CONFIG.TEACHER_RESEARCH_TOPIC_INFO.entry_id,
        data: buildData(allKeys),
        data_creator: currentUser?.userId,
        transaction_id,
        is_start_workflow: true,
        is_start_trigger: false,
      });
      if (!res.success) {
        alert(res.message || "提交失败，请重试");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["project"] });
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
      || rows.some(r => r.name || r.level || r.status);
    if (!hasContent) return;
    if (hasImages) { draftImageCount.current = rows.reduce((s, r) => s + r.images.length, 0); setDraftToast(true); }
    localStorage.setItem("project-draft", JSON.stringify({
      teacherName, idCard, department, position, positionType, partyJob, phone, subject,
      hasProject, rows: rows.map(r => ({ id: r.id, name: r.name, level: r.level, status: r.status })),
      _imageCount: rows.reduce((s, r) => s + r.images.length, 0),
    }));
  };

  const handleClearForm = () => {
    setTeacherName(""); setIdCard(""); setDepartment(""); setPosition("");
    setPositionType(""); setPartyJob(""); setPhone(""); setSubject("");
    setRows([{ id: 1, name: "", level: "", status: "", images: [] }]);
    setNextId(2);
    setSubmitted(false);
    localStorage.removeItem("project-draft");
  };

  useEffect(() => {
    if (!draftToast) return;
    const t = setTimeout(() => setDraftToast(false), 3000);
    return () => clearTimeout(t);
  }, [draftToast]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("project-draft");
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
      if (d.hasProject) setHasProject(d.hasProject);
      if (d.rows && d.rows.length > 0) {
        setRows(d.rows.map((r: ProjectRow) => ({ ...r, images: [] })));
        setNextId(Math.max(...d.rows.map((r: ProjectRow) => r.id)) + 1);
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
        breadcrumbs={[{ label: "教师基础档案" }, { label: "课题", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-6xl mx-auto pt-4 md:pt-6 px-3 md:px-6 pb-24">

          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>课题</h2>
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
              <Field label="有无课题" required>
                <div className="flex items-center gap-10 py-2">
                  {[{ v: "yes" as const, l: "有" }, { v: "no" as const, l: "暂无" }].map(({ v, l }) => (
                    <label key={v} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setHasProject(v)}>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white"
                        style={{ borderColor: hasProject === v ? teal : "#d1d5db" }}
                      >
                        {hasProject === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}
                      </div>
                      <span className="text-base font-medium text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              </Field>
            </div>

            {hasProject === "yes" && (
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

                {/* Project table */}
                <div className="p-8 bg-white border-t border-gray-50">
                  <p className="text-base font-semibold mb-5">
                    <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>课题
                  </p>

                  <div className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm"
                    style={{ display: "grid", gridTemplateColumns: "48px 2fr 1fr 1.2fr 160px 52px" }}>
                    {["", "课题名称", "级别", "立项/结项", "图片证明材料", ""].map((h, i) => (
                      <div key={i} className="px-3 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0">
                        {i > 0 && i !== 4 && i !== 5 && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
                        {h}
                      </div>
                    ))}

                    {rows.map((row, idx) => (
                      <>
                        <div key={`n-${row.id}`} className="px-3 py-2.5 bg-white border-b border-r border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">
                          {idx + 1}
                        </div>
                        <div key={`nm-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => updateRow(row.id, "name", e.target.value)}
                            className="table-input"
                            style={submitted && !row.name ? { borderColor: "#ff4d4f" } : undefined}
                            onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                            onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                          />
                        </div>
                        <div key={`lv-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <CellSelect value={row.level} onChange={(v) => updateRow(row.id, "level", v)} options={["国家级", "省级", "市级", "区县级", "校级"]} />
                        </div>
                        <div key={`st-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100">
                          <CellSelect value={row.status} onChange={(v) => updateRow(row.id, "status", v)} options={["立项", "结项"]} />
                        </div>
                        <div key={`img-${row.id}`} className="px-1 py-2 bg-white border-b border-r border-gray-100">
                          <div className="flex items-center gap-1 overflow-x-auto" style={{ maxWidth: 152 }}>
                            {row.images.map((file, fi) => (
                              <div key={fi} className="relative shrink-0 w-7 h-7 rounded overflow-hidden border border-gray-200 group">
                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => {
                                    const updated = [...row.images]; updated.splice(fi, 1);
                                    updateRow(row.id, "images", updated);
                                  }}
                                >
                                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </button>
                              </div>
                            ))}
                            <label
                              className="shrink-0 w-7 h-7 border border-dashed rounded flex items-center justify-center cursor-pointer hover:border-[#00b095] hover:bg-teal-50/30 bg-gray-50"
                              style={{ borderColor: submitted && row.images.length === 0 ? "#ff4d4f" : "#e5e7eb" }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files) updateRow(row.id, "images", [...row.images, ...Array.from(e.target.files)]);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                          </div>
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

                  {submitted && hasProject === "yes" && anyMissing && (
                    <div className="mt-3 space-y-0.5">
                      {rows.some((r) => !r.name) && <p className="text-xs" style={{ color: "#ff4d4f" }}>课题名称为必填项</p>}
                      {rows.some((r) => !r.level) && <p className="text-xs" style={{ color: "#ff4d4f" }}>级别为必填项</p>}
                      {rows.some((r) => !r.status) && <p className="text-xs" style={{ color: "#ff4d4f" }}>立项/结项为必填项</p>}
                      {rows.some((r) => r.images.length === 0) && <p className="text-xs" style={{ color: "#ff4d4f" }}>图片证明材料为必填项</p>}
                    </div>
                  )}

                  <div className="flex items-center gap-8 mt-5">
                    <button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }} onClick={addRow}>
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
