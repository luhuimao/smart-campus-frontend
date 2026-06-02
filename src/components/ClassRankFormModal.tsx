"use client";

import { useEffect, useState } from "react";
import { StaffPicker } from "./ui/StaffPicker";
import { useTermInfo, useGradeInfo, useCourses, useDepartmentMembers, type ClassRankRecord, type DeptMemberRecord } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, CLASS_RANK_WIDGET_IDS, jdyCreate, jdyUpdate, jdyDelete } from "@/lib/jdy-api";
import { useCurrentUser } from "@/lib/user-context";
import { useQueryClient } from "@tanstack/react-query";

const teal = "#00b095";
const errorColor = "#ef4444";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 2px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#d9d9d9", boxShadow: "none" };
const selectArrow = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E\")";
const selectBase: React.CSSProperties = {
  height: 38, borderRadius: 4, width: "100%", fontSize: 14,
  backgroundImage: selectArrow, backgroundRepeat: "no-repeat",
  backgroundPosition: "right 0.6rem center", backgroundSize: "0.85rem",
  paddingRight: "2rem", appearance: "none",
  paddingTop: 0, paddingBottom: 0,
};

function Field({ label, hint, required, error, children }: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-base font-semibold mb-2" style={{ color: "#262626" }}>
        {label}
        {required && <span style={{ color: errorColor, marginLeft: 2 }}>*</span>}
      </label>
      {hint && <p className="text-sm mb-2" style={{ color: "#8c8c8c" }}>{hint}</p>}
      {children}
      {error && <p className="text-xs mt-1" style={{ color: errorColor }}>{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder = "", error }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
}) {
  const hasError = !!error;
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="form-input"
      style={{
        height: 38, borderRadius: 4,
        borderColor: hasError ? errorColor : undefined,
        boxShadow: hasError ? "0 0 0 2px rgba(239,68,68,0.08)" : undefined,
      }}
      onFocus={e => { if (!hasError) Object.assign(e.currentTarget.style, focusStyle); }}
      onBlur={e => { if (!hasError) Object.assign(e.currentTarget.style, blurStyle); }}
    />
  );
}

interface Props {
  record: ClassRankRecord | null;   // null = add mode
  open: boolean;                    // drawer visibility
  onClose: () => void;
  canDelete?: boolean;              // show delete button in edit mode
}

export function ClassRankFormDrawer({ record, open, onClose, canDelete = false }: Props) {
  const isEdit = record !== null;
  const queryClient = useQueryClient();
  const { raw: terms } = useTermInfo();
  const { raw: grades } = useGradeInfo();
  const { raw: courses } = useCourses();
  const { raw: staffList } = useDepartmentMembers();
  const currentUser = useCurrentUser();

  const [semester, setSemester] = useState("");
  const [examName, setExamName] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [subject, setSubject] = useState("");
  const [rank, setRank] = useState("");
  const [selectedMember, setSelectedMember] = useState<DeptMemberRecord | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  // Pre-fill when editing
  useEffect(() => {
    if (!record) {
      setSemester(""); setExamName(""); setGrade(""); setClassName("");
      setTeacherName(""); setSubject(""); setRank(""); setSelectedMember(null);
    } else {
      setSemester(record.学期); setExamName(record.考试名称);
      setGrade(record.年级); setClassName(record.班级);
      setTeacherName(record.教师姓名); setSubject(record.学科);
      setRank(record.班级排名);
    }
    setErrors({}); setStatus("idle"); setStatusMessage("");
  }, [record]);

  // Look up member for edit mode (separate effect so staffList load doesn't clear add-mode form)
  useEffect(() => {
    if (!record || staffList.length === 0) return;
    const m = staffList.find(s => s.name === record.教师姓名) ?? null;
    setSelectedMember(m);
  }, [record, staffList]);

  // Restore draft from localStorage (add mode only)
  useEffect(() => {
    if (isEdit || !open) return;
    try {
      const raw = localStorage.getItem("class-rank-draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.semester)    setSemester(d.semester);
      if (d.examName)    setExamName(d.examName);
      if (d.grade)       setGrade(d.grade);
      if (d.className)   setClassName(d.className);
      if (d.teacherName) { setTeacherName(d.teacherName); setSelectedMember(null); }
      if (d.subject)     setSubject(d.subject);
      if (d.rank)        setRank(d.rank);
    } catch {}
  }, [isEdit, open]);

  // Esc to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!semester.trim())    errs.semester = "请选择或输入学期";
    if (!examName.trim())    errs.examName = "请输入考试名称";
    if (!grade.trim())       errs.grade = "请输入年级";
    if (!className.trim())   errs.className = "请输入班级";
    if (!teacherName.trim()) errs.teacherName = "请选择教师";
    if (!subject.trim())     errs.subject = "请输入学科";
    if (!rank.trim())        errs.rank = "请输入班级排名";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildData = () => {
    const now = new Date().toISOString();
    const teacherValue = selectedMember?.username ?? teacherName;
    return {
      [CLASS_RANK_WIDGET_IDS.学期]: { value: semester },
      [CLASS_RANK_WIDGET_IDS.考试名称]: { value: examName },
      [CLASS_RANK_WIDGET_IDS.年级]: { value: grade },
      [CLASS_RANK_WIDGET_IDS.班级]: { value: className },
      [CLASS_RANK_WIDGET_IDS.教师姓名]: { value: teacherValue },
      [CLASS_RANK_WIDGET_IDS.学科]: { value: subject },
      [CLASS_RANK_WIDGET_IDS.班级排名]: { value: rank },
      [CLASS_RANK_WIDGET_IDS.提交人]: { value: isEdit ? record.提交人 : (currentUser?.name ?? "") },
      [CLASS_RANK_WIDGET_IDS.提交时间]: { value: isEdit ? record.提交时间 : now },
      [CLASS_RANK_WIDGET_IDS.更新时间]: { value: now },
    };
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setStatus("idle"); setStatusMessage("");
    setSubmitting(true);
    try {
      if (isEdit) {
        await jdyUpdate({
          app_id: JDY_CONFIG.CLASS_RANK.app_id,
          entry_id: JDY_CONFIG.CLASS_RANK.entry_id,
          data_id: record._id,
          data: buildData(),
          data_creator: currentUser?.userId,
        });
      } else {
        await jdyCreate({
          app_id: JDY_CONFIG.CLASS_RANK.app_id,
          entry_id: JDY_CONFIG.CLASS_RANK.entry_id,
          data: buildData(),
          data_creator: currentUser?.userId,
          is_start_workflow: false,
          is_start_trigger: false,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["class-rank", "list"] });
      setStatus("success");
      setStatusMessage(isEdit ? "修改成功" : "数据提交成功");
      setTimeout(() => onClose(), 600);
    } catch (err) {
      setStatus("error");
      setStatusMessage(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!record) return;
    if (!confirm("确定要删除这条记录吗？此操作不可撤销。")) return;
    setDeleting(true);
    try {
      await jdyDelete({
        app_id: JDY_CONFIG.CLASS_RANK.app_id,
        entry_id: JDY_CONFIG.CLASS_RANK.entry_id,
        data_id: record._id,
      });
      queryClient.invalidateQueries({ queryKey: ["class-rank", "list"] });
      onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败，请重试");
    } finally {
      setDeleting(false);
    }
  };

  const handleClearForm = () => {
    setSemester(""); setExamName(""); setGrade(""); setClassName("");
    setTeacherName(""); setSubject(""); setRank(""); setSelectedMember(null);
    setErrors({}); setStatus("idle"); setStatusMessage("");
    localStorage.removeItem("class-rank-draft");
  };

  const handleSaveDraft = () => {
    if (!semester.trim() && !examName.trim() && !teacherName.trim()) return;
    localStorage.setItem("class-rank-draft", JSON.stringify({
      semester, examName, grade, className, teacherName, subject, rank,
    }));
    onClose();
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-5"
      style={{ background: "rgba(0,0,0,0.45)", zIndex: 1000 }}
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white flex flex-col shadow-xl"
        style={{
          borderRadius: 8,
          width: "100%",
          maxWidth: 800,
          maxHeight: "90vh",
        }}
      >
        {/* 头部 */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-xl font-bold" style={{ color: "#111827" }}>
            {isEdit ? "编辑班级排名" : "教师所带班级排名"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* 主体 */}
        <div className="overflow-y-auto px-6 py-6 flex-1">
          {status === "success" && (
            <div className="flex items-center gap-2 mb-4 text-sm font-medium rounded-lg px-4 py-2.5"
              style={{ background: "rgba(0,176,149,0.08)", color: teal }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              {statusMessage}
            </div>
          )}
          {status === "error" && (
            <div className="mb-4 text-sm font-medium rounded-lg px-4 py-2.5"
              style={{ background: "rgba(239,68,68,0.08)", color: errorColor }}>
              {statusMessage || "提交失败，请重试"}
            </div>
          )}

          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            <Field label="学期" required error={errors.semester}>
              <select
                value={semester}
                onChange={e => { setSemester(e.target.value); clearError("semester"); }}
                className="form-input"
                style={{ ...selectBase, borderColor: errors.semester ? errorColor : "#d9d9d9", boxShadow: errors.semester ? "0 0 0 2px rgba(239,68,68,0.08)" : "none" }}
              >
                <option value="">请选择学期</option>
                {terms.map(t => (
                  <option key={t._id} value={t.学期名称}>{t.学期名称}</option>
                ))}
                {semester && !terms.some(t => t.学期名称 === semester) && (
                  <option value={semester}>{semester}</option>
                )}
              </select>
            </Field>
            <Field label="考试名称" required error={errors.examName}>
              <TextInput value={examName} onChange={v => { setExamName(v); clearError("examName"); }} error={errors.examName} />
            </Field>

            <Field label="年级" required error={errors.grade}>
              <select
                value={grade}
                onChange={e => { setGrade(e.target.value); clearError("grade"); }}
                className="form-input"
                style={{ ...selectBase, borderColor: errors.grade ? errorColor : "#d9d9d9", boxShadow: errors.grade ? "0 0 0 2px rgba(239,68,68,0.08)" : "none" }}
              >
                <option value="">请选择年级</option>
                {grades.map(g => (
                  <option key={g._id} value={g.年级别名}>{g.年级别名}</option>
                ))}
                {grade && !grades.some(g => g.年级别名 === grade) && (
                  <option value={grade}>{grade}</option>
                )}
              </select>
            </Field>
            <Field label="班级" required error={errors.className}>
              <TextInput value={className} onChange={v => { setClassName(v); clearError("className"); }} error={errors.className} />
            </Field>

            <Field label="教师姓名" required error={errors.teacherName}>
              <StaffPicker value={teacherName} onChange={v => { setTeacherName(v); clearError("teacherName"); }} onSelectMember={setSelectedMember} />
            </Field>
            <Field label="学科" required error={errors.subject}>
              <select
                value={subject}
                onChange={e => { setSubject(e.target.value); clearError("subject"); }}
                className="form-input"
                style={{ ...selectBase, borderColor: errors.subject ? errorColor : "#d9d9d9", boxShadow: errors.subject ? "0 0 0 2px rgba(239,68,68,0.08)" : "none" }}
              >
                <option value="">请选择学科</option>
                {courses.map(c => (
                  <option key={c._id} value={c.教研学科名}>{c.教研学科名}</option>
                ))}
                {subject && !courses.some(c => c.教研学科名 === subject) && (
                  <option value={subject}>{subject}</option>
                )}
              </select>
            </Field>

            <div className="col-span-2">
              <Field label="班级排名" required error={errors.rank} hint="格式示例：某老师带的班级15个班里考第2名，则填入：2/15">
                <TextInput value={rank} onChange={v => { setRank(v); clearError("rank"); }} placeholder="例：2/15" error={errors.rank} />
              </Field>
            </div>
          </div>
        </div>

        {/* 底部 */}
        <div className="form-footer shrink-0 flex items-center gap-3 px-6 py-4">
          {isEdit && canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-[15px] font-medium px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 hover:opacity-80"
              style={{ color: errorColor, background: "rgba(239,68,68,0.06)" }}
            >
              {deleting ? "删除中..." : "删除"}
            </button>
          )}
          <div className="flex-1" />
          {!isEdit && (
            <>
              <button className="btn-secondary text-[15px] font-medium px-6 py-2.5 rounded-xl" onClick={handleClearForm}>
                清空数据
              </button>
              <button className="btn-secondary text-[15px] font-medium px-6 py-2.5 rounded-xl" onClick={handleSaveDraft}>
                保存草稿
              </button>
            </>
          )}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="relative text-[15px] font-semibold text-white rounded-xl transition-all duration-200 disabled:opacity-60 overflow-hidden"
            style={{
              padding: "10px 32px",
              background: "linear-gradient(135deg, #00b095 0%, #009a7e 100%)",
              boxShadow: "0 4px 14px rgba(0,176,149,0.25)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(0,176,149,0.35)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(0,176,149,0.25)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                提交中...
              </span>
            ) : (isEdit ? "保存" : "提交")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Keep backward-compatible alias
export { ClassRankFormDrawer as ClassRankFormModal };
