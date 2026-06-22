"use client";

import { Plus, ClipboardList, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { DeptStaffPicker } from "@/components/ui/DeptStaffPicker";
import { useStaffDirectory, useDepartmentMembers } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, TEACHER_PAPER_WIDGET_IDS, jdyCreate, jdyUploadFiles } from "@/lib/jdy-api";
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

type PaperRow = {
  id: number;
  type: string;
  name: string;
  author: string;
  date: string;
  level: string;
  images: File[];
};

export function PaperPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
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
  const [hasThesis, setHasThesis] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftToast, setDraftToast] = useState(false);
  const draftImageCount = useRef(0);

  const [paperRows, setPaperRows] = useState<PaperRow[]>([
    { id: 1, type: "", name: "", author: "", date: "", level: "", images: [] },
  ]);
  const [nextPaperId, setNextPaperId] = useState(2);

  const { raw: staffList } = useStaffDirectory();
  const { raw: deptMembers } = useDepartmentMembers();

  const updatePaperRow = useCallback((id: number, field: string, value: unknown) => {
    setPaperRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const addPaperRow = useCallback(() => {
    setPaperRows((prev) => [...prev, { id: nextPaperId, type: "", name: "", author: "", date: "", level: "", images: [] }]);
    setNextPaperId((n) => n + 1);
  }, [nextPaperId]);

  const removePaperRow = useCallback((id: number) => {
    setPaperRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const anyPaperMissing = useMemo(
    () => paperRows.some((r) => !r.type || !r.name || !r.author || !r.date || !r.level || r.images.length === 0),
    [paperRows],
  );

  const hasImages = useMemo(() => paperRows.some(r => r.images.length > 0), [paperRows]);

  // ── API Logic ──────────────────────────────────────────────

  const toMember = (name: string) => {
    const m = deptMembers.find(d => d.name === name);
    return m ? m.username : name;
  };

  const H = TEACHER_PAPER_WIDGET_IDS;

  const buildData = (allKeys: string[]) => {
    let ki = 0;
    const subRecords = paperRows.map(row => ({
      [H.论文发表_编号]: { value: "" },
      [H.论文发表_类型]: { value: row.type },
      [H.论文发表_成果名称]: { value: row.name },
      [H.论文发表_作者]: { value: row.author },
      [H.论文发表_时间]: { value: row.date },
      [H.论文发表_级别]: { value: row.level },
      [H.论文发表_等级]: { value: "" },
      [H.论文发表_刊物名称]: { value: "" },
      [H.论文发表_证明图片]: { value: row.images.map(() => allKeys[ki++]) },
    }));

    const data: Record<string, { value: unknown }> = {
      [H.教师姓名]: { value: toMember(teacherName) },
      [H.身份证号码]: { value: idCard },
      [H.有无论文]: { value: hasThesis === "yes" ? "有" : "暂无" },
      [H["教师姓名（文本）"]]: { value: teacherName },
    };
    if (hasThesis === "yes") {
      data[H.部门] = { value: department };
      data[H.岗位] = { value: position };
      data[H.岗位类型] = { value: positionType };
      data[H["党委/行政职务"]] = { value: partyJob };
      data[H.联系方式] = { value: phone };
      data[H.担任学科] = { value: subject };
      data[H.论文发表] = { value: subRecords };
    }
    return data;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (hasThesis === "yes" && anyPaperMissing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!teacherName || !idCard) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const allFiles = paperRows.flatMap(r => r.images);
      let allKeys: string[] = [];
      let transaction_id: string | undefined;
      if (allFiles.length > 0) {
        transaction_id = crypto.randomUUID();
        const { keys } = await jdyUploadFiles(
          allFiles,
          JDY_CONFIG.TEACHER_PAPER_INFO.app_id,
          JDY_CONFIG.TEACHER_PAPER_INFO.entry_id,
          transaction_id,
        );
        allKeys = keys;
      }
      const res = await jdyCreate({
        app_id: JDY_CONFIG.TEACHER_PAPER_INFO.app_id,
        entry_id: JDY_CONFIG.TEACHER_PAPER_INFO.entry_id,
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
      queryClient.invalidateQueries({ queryKey: ["paper"] });
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
      || paperRows.some(r => r.type || r.name || r.author || r.date || r.level);
    if (!hasContent) return;
    if (hasImages) { draftImageCount.current = paperRows.reduce((s, r) => s + r.images.length, 0); setDraftToast(true); }
    localStorage.setItem("paper-draft", JSON.stringify({
      teacherName, idCard, department, position, positionType, partyJob, phone, subject,
      hasThesis, paperRows: paperRows.map(r => ({ id: r.id, type: r.type, name: r.name, author: r.author, date: r.date, level: r.level })),
      _imageCount: paperRows.reduce((s, r) => s + r.images.length, 0),
    }));
  };

  const handleClearForm = () => {
    setTeacherName(""); setIdCard(""); setDepartment(""); setPosition("");
    setPositionType(""); setPartyJob(""); setPhone(""); setSubject("");
    setPaperRows([{ id: 1, type: "", name: "", author: "", date: "", level: "", images: [] }]);
    setNextPaperId(2);
    setSubmitted(false);
    localStorage.removeItem("paper-draft");
  };

  useEffect(() => {
    if (!draftToast) return;
    const t = setTimeout(() => setDraftToast(false), 3000);
    return () => clearTimeout(t);
  }, [draftToast]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("paper-draft");
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
      if (d.hasThesis) setHasThesis(d.hasThesis);
      if (d.paperRows && d.paperRows.length > 0) {
        setPaperRows(d.paperRows.map((r: PaperRow) => ({ ...r, images: [] })));
        setNextPaperId(Math.max(...d.paperRows.map((r: PaperRow) => r.id)) + 1);
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
        breadcrumbs={[{ label: "教师基础档案" }, { label: "论文", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-6xl mx-auto pt-4 md:pt-6 px-3 md:px-6 pb-24">

          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>论文</h2>
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

          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

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

                {/* Paper table */}
                <div className="p-8 bg-white border-t border-gray-50">
                  <p className="text-base font-semibold mb-5">
                    <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>论文发表
                  </p>

                  <div className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm"
                    style={{ display: "grid", gridTemplateColumns: "48px 1fr 1.4fr 1fr 1fr 1fr 160px 52px" }}>
                    {["", "类型", "成果名称", "作者", "时间", "级别", "证明图片", ""].map((h, i) => (
                      <div key={i} className="px-3 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0">
                        {i > 0 && i !== 6 && i !== 7 && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}
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
                                    updatePaperRow(row.id, "images", updated);
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
                                  if (e.target.files) updatePaperRow(row.id, "images", [...row.images, ...Array.from(e.target.files)]);
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
                      {paperRows.some((r) => r.images.length === 0) && <p className="text-xs" style={{ color: "#ff4d4f" }}>证明图片为必填项</p>}
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

          <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">
            <button className="btn-secondary" onClick={handleClearForm}>清空数据</button>
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
