"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { StaffPicker } from "./ui/StaffPicker";
import { useStaffDirectory, useDepartmentMembers, type StaffDirectoryRecord } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, TEACHER_EDUCATIONAL_BACKGROUND_WIDGET_IDS, jdyCreate, jdyUploadFiles } from "@/lib/jdy-api";
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

type EduRow = {
  id: number;
  school: string;
  degree: string;
  degreeType: string;
  certFiles: File[];
  degreeCerts: File[];
  studyType: string;
  startDate: string;
  endDate: string;
};

export function EducationPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
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
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftToast, setDraftToast] = useState(false);
  const draftImageCount = useRef(0);

  const [rows, setRows] = useState<EduRow[]>([
    { id: 1, school: "", degree: "", degreeType: "", certFiles: [], degreeCerts: [], studyType: "", startDate: "", endDate: "" },
  ]);
  const [nextId, setNextId] = useState(2);

  const { raw: staffList } = useStaffDirectory();
  const { raw: deptMembers } = useDepartmentMembers();

  const updateRow = useCallback((id: number, field: string, value: unknown) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, { id: nextId, school: "", degree: "", degreeType: "", certFiles: [], degreeCerts: [], studyType: "", startDate: "", endDate: "" }]);
    setNextId((n) => n + 1);
  }, [nextId]);

  const removeRow = useCallback((id: number) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }, []);

  const anyMissing = useMemo(
    () => rows.some((r) => !r.school || !r.degree || !r.degreeType || r.certFiles.length === 0 || r.degreeCerts.length === 0 || !r.studyType || !r.startDate),
    [rows],
  );

  const hasImages = useMemo(() => rows.some(r => r.certFiles.length > 0 || r.degreeCerts.length > 0), [rows]);

  // ── API Logic ──────────────────────────────────────────────

  const toMember = (name: string) => {
    const m = deptMembers.find(d => d.name === name);
    return m ? m.username : name;
  };

  const H = TEACHER_EDUCATIONAL_BACKGROUND_WIDGET_IDS;

  const buildData = (allKeys: string[]) => {
    let ki = 0;
    const subRecords = rows.map(row => {
      const certKeys = row.certFiles.map(() => allKeys[ki++]);
      const degreeKeys = row.degreeCerts.map(() => allKeys[ki++]);
      return {
        [H["教育经历.编号"]]: { value: "" },
        [H["教育经历.就读学校"]]: { value: row.school },
        [H["教育经历.学历"]]: { value: row.degree },
        [H["教育经历.学位"]]: { value: row.degreeType },
        [H["教育经历.学历证书（pdf/图片）"]]: { value: certKeys },
        [H["教育经历.学位证书（pdf/图片）"]]: { value: degreeKeys },
        [H["教育经历.学习形式"]]: { value: row.studyType },
        [H["教育经历.开始日期"]]: { value: row.startDate },
        [H["教育经历.结束日期"]]: { value: row.endDate },
      };
    });

    const data: Record<string, { value: unknown }> = {
      [H.教师姓名]: { value: toMember(teacherName) },
      [H.身份证号码]: { value: idCard },
      [H["教师姓名（文本）"]]: { value: teacherName },
      [H.部门]: { value: department },
      [H.岗位]: { value: position },
      [H.岗位类型]: { value: positionType },
      [H["党委/行政职务"]]: { value: partyJob },
      [H.联系方式]: { value: phone },
      [H.担任学科]: { value: subject },
      [H.教育经历]: { value: subRecords },
    };
    return data;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if (anyMissing) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!teacherName || !idCard) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const allFiles = [...rows.flatMap(r => r.certFiles), ...rows.flatMap(r => r.degreeCerts)];
      let allKeys: string[] = [];
      let transaction_id: string | undefined;
      if (allFiles.length > 0) {
        transaction_id = crypto.randomUUID();
        const { keys } = await jdyUploadFiles(
          allFiles,
          JDY_CONFIG.TEACHER_EDUCATIONAL_BACKGROUND_INFO.app_id,
          JDY_CONFIG.TEACHER_EDUCATIONAL_BACKGROUND_INFO.entry_id,
          transaction_id,
        );
        allKeys = keys;
      }
      const res = await jdyCreate({
        app_id: JDY_CONFIG.TEACHER_EDUCATIONAL_BACKGROUND_INFO.app_id,
        entry_id: JDY_CONFIG.TEACHER_EDUCATIONAL_BACKGROUND_INFO.entry_id,
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
      queryClient.invalidateQueries({ queryKey: ["education"] });
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
      || rows.some(r => r.school || r.degree || r.degreeType || r.studyType || r.startDate);
    if (!hasContent) return;
    if (hasImages) { draftImageCount.current = rows.reduce((s, r) => s + r.certFiles.length + r.degreeCerts.length, 0); setDraftToast(true); }
    localStorage.setItem("education-draft", JSON.stringify({
      teacherName, idCard, department, position, positionType, partyJob, phone, subject,
      rows: rows.map(r => ({ id: r.id, school: r.school, degree: r.degree, degreeType: r.degreeType, studyType: r.studyType, startDate: r.startDate, endDate: r.endDate })),
      _imageCount: rows.reduce((s, r) => s + r.certFiles.length + r.degreeCerts.length, 0),
    }));
  };

  const handleClearForm = () => {
    setTeacherName(""); setIdCard(""); setDepartment(""); setPosition("");
    setPositionType(""); setPartyJob(""); setPhone(""); setSubject("");
    setRows([{ id: 1, school: "", degree: "", degreeType: "", certFiles: [], degreeCerts: [], studyType: "", startDate: "", endDate: "" }]);
    setNextId(2);
    setSubmitted(false);
    localStorage.removeItem("education-draft");
  };

  useEffect(() => {
    if (!draftToast) return;
    const t = setTimeout(() => setDraftToast(false), 3000);
    return () => clearTimeout(t);
  }, [draftToast]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("education-draft");
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
      if (d.rows && d.rows.length > 0) {
        setRows(d.rows.map((r: EduRow) => ({ ...r, certFiles: [], degreeCerts: [] })));
        setNextId(Math.max(...d.rows.map((r: EduRow) => r.id)) + 1);
      }
    } catch {}
  }, []);

  // ── Staff ──────────────────────────────────────────────────

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

  function ImageCardGrid({ files, onUpdate, borderColor, label }: { files: File[]; onUpdate: (files: File[]) => void; borderColor: string; label: string }) {
    return (
      <div>
        <p className="text-xs font-semibold mb-2" style={{ color: "#6b7280" }}>
          <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>{label}
        </p>
        <div className="flex flex-wrap gap-2">
          {files.map((file, fi) => (
            <div key={fi} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => { const updated = [...files]; updated.splice(fi, 1); onUpdate(updated); }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
          <label
            className="w-16 h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:border-[#00b095] hover:bg-teal-50/30 bg-gray-50"
            style={{ borderColor }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span className="text-[10px]" style={{ color: "#9ca3af" }}>添加</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) onUpdate([...files, ...Array.from(e.target.files)]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      <PageHeader
        centered
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教育经历", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="max-w-6xl mx-auto pt-4 md:pt-6 px-3 md:px-6 pb-24">

          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>教育经历</h2>
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
                <StaffPicker value={teacherName} onChange={setTeacherName} onSelectRecord={handleSelectStaff} />
                {submitted && !teacherName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
              <Field label="身份证号码" required>
                <Input value={idCard} onChange={setIdCard} />
                {submitted && !idCard && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}
              </Field>
            </div>

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

            {/* Education cards */}
            <div className="p-8 border-t border-gray-50 bg-white">
              <div className="flex items-center justify-between mb-5">
                <p className="text-base font-semibold">
                  <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>教育经历（{rows.length}）
                </p>
                <button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }} onClick={addRow}>
                  <Plus className="w-4 h-4" /> 添加经历
                </button>
              </div>

              <div className="space-y-4">
                {rows.map((row, idx) => (
                  <div key={row.id} className="rounded-2xl border border-gray-150 p-5 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                      {rows.length > 1 && (
                        <button
                          type="button"
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => removeRow(row.id)}
                        >
                          <Trash2 className="w-3 h-3" /> 删除此行
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 mb-5">
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>
                          <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>就读学校
                        </label>
                        <input
                          type="text"
                          value={row.school}
                          onChange={(e) => updateRow(row.id, "school", e.target.value)}
                          className="form-input"
                          style={submitted && !row.school ? { borderColor: "#ff4d4f" } : undefined}
                          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>
                          <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>学历
                        </label>
                        <select
                          value={row.degree}
                          onChange={(e) => updateRow(row.id, "degree", e.target.value)}
                          className="form-input appearance-none pr-9"
                          style={{ color: row.degree ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !row.degree ? "#ff4d4f" : undefined }}
                          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                        >
                          <option value="" disabled>请选择</option>
                          {["博士研究生", "硕士研究生", "本科", "大专","中专","高中","高中阶段以下","其他"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>
                          <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>学位
                        </label>
                        <select
                          value={row.degreeType}
                          onChange={(e) => updateRow(row.id, "degreeType", e.target.value)}
                          className="form-input appearance-none pr-9"
                          style={{ color: row.degreeType ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !row.degreeType ? "#ff4d4f" : undefined }}
                          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                        >
                          <option value="" disabled>请选择</option>
                          {["博士学位", "硕士学位", "学士学位"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>
                          <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>学习形式
                        </label>
                        <select
                          value={row.studyType}
                          onChange={(e) => updateRow(row.id, "studyType", e.target.value)}
                          className="form-input appearance-none pr-9"
                          style={{ color: row.studyType ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !row.studyType ? "#ff4d4f" : undefined }}
                          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                        >
                          <option value="" disabled>请选择</option>
                          {["普通全日制","成人教育","网络教育","其他形式","其他"].map(o => <option key={o}>{o}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>
                          <span style={{ color: "#ff4d4f", marginRight: 2 }}>*</span>开始时间
                        </label>
                        <input
                          type="date"
                          value={row.startDate}
                          onChange={(e) => updateRow(row.id, "startDate", e.target.value)}
                          className="form-input"
                          style={{ color: row.startDate ? "#1d1d1f" : "#9ca3af", borderColor: submitted && !row.startDate ? "#ff4d4f" : undefined }}
                          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1.5" style={{ color: "#6b7280" }}>结束时间</label>
                        <input
                          type="date"
                          value={row.endDate}
                          onChange={(e) => updateRow(row.id, "endDate", e.target.value)}
                          className="form-input"
                          style={{ color: row.endDate ? "#1d1d1f" : "#9ca3af" }}
                          onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <ImageCardGrid
                        files={row.certFiles}
                        onUpdate={(f) => updateRow(row.id, "certFiles", f)}
                        borderColor={submitted && row.certFiles.length === 0 ? "#ff4d4f" : "#e5e7eb"}
                        label="学历证书"
                      />
                      <ImageCardGrid
                        files={row.degreeCerts}
                        onUpdate={(f) => updateRow(row.id, "degreeCerts", f)}
                        borderColor={submitted && row.degreeCerts.length === 0 ? "#ff4d4f" : "#e5e7eb"}
                        label="学位证书"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {submitted && anyMissing && (
                <div className="mt-3 space-y-0.5">
                  {rows.some((r) => !r.school) && <p className="text-xs" style={{ color: "#ff4d4f" }}>就读学校为必填项</p>}
                  {rows.some((r) => !r.degree) && <p className="text-xs" style={{ color: "#ff4d4f" }}>学历为必填项</p>}
                  {rows.some((r) => !r.degreeType) && <p className="text-xs" style={{ color: "#ff4d4f" }}>学位为必填项</p>}
                  {rows.some((r) => r.certFiles.length === 0) && <p className="text-xs" style={{ color: "#ff4d4f" }}>学历证书为必填项</p>}
                  {rows.some((r) => r.degreeCerts.length === 0) && <p className="text-xs" style={{ color: "#ff4d4f" }}>学位证书为必填项</p>}
                  {rows.some((r) => !r.studyType) && <p className="text-xs" style={{ color: "#ff4d4f" }}>学习形式为必填项</p>}
                  {rows.some((r) => !r.startDate) && <p className="text-xs" style={{ color: "#ff4d4f" }}>开始时间为必填项</p>}
                </div>
              )}
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
              {submitting ? "提交中..." : "提交"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
