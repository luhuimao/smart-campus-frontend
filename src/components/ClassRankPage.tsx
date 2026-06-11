"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { Trash2, Clock, Search, ChevronDown } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DataTable, type ColDef } from "./DataTable";
import { useClassRank, useTermInfo, useGradeInfo, useCourses, useDepartmentMembers, type ClassRankRecord } from "@/hooks/use-research-dashboard";
import { useFormPermissions } from "@/hooks/use-form-permissions";
import { JDY_CONFIG, CLASS_RANK_WIDGET_IDS, jdyCreate, jdyUpdate, jdyDelete } from "@/lib/jdy-api";
import { DeptStaffPicker } from "@/components/ui/DeptStaffPicker";
import { useCurrentUser } from "@/lib/user-context";
import { useQueryClient } from "@tanstack/react-query";

const teal = "#00b095";
const formFocusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const formBlurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Tooltip({ text, disabled, children }: { text: string; disabled?: boolean; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className="relative flex items-center justify-center"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && !disabled && (
        <div
          className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white px-2.5 py-1.5 rounded-md pointer-events-none z-50"
          style={{ background: "rgba(30,30,30,0.88)", backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderBottomColor: "rgba(30,30,30,0.88)" }} />
          {text}
        </div>
      )}
    </div>
  );
}

function IconDropdown({ icon, tooltip, options, onSelect, disabledOptions }: {
  icon: React.ReactNode;
  tooltip: string;
  options: string[];
  onSelect?: (option: string) => void;
  disabledOptions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const disabledSet = new Set(disabledOptions ?? []);

  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <Tooltip text={tooltip} disabled={open}>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-black/[0.05]"
          style={{ color: "#8c8c8c" }}
        >
          {icon}
        </button>
      </Tooltip>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-50"
          style={{ minWidth: 148, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          {options.map(opt => {
            const isDisabled = disabledSet.has(opt);
            return (
              <button
                key={opt}
                onClick={() => { if (!isDisabled) { setOpen(false); onSelect?.(opt); } }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "#374151" }}
                disabled={isDisabled}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function expand() {
    setExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function collapse() {
    if (!value) setExpanded(false);
  }

  return (
    <div
      className="flex items-center rounded-lg border transition-all duration-200 bg-white overflow-hidden"
      style={{
        width: expanded ? 200 : 32,
        height: 32,
        borderColor: expanded ? "#d1d5db" : "transparent",
        background: expanded ? "white" : "transparent",
      }}
    >
      <button
        onClick={expand}
        className="flex items-center justify-center w-8 h-8 shrink-0 transition-colors"
        style={{ color: expanded ? teal : "#8c8c8c" }}
      >
        <Search className="w-4 h-4" />
      </button>
      {expanded && (
        <input
          ref={inputRef}
          type="text"
          placeholder="搜索数据"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={collapse}
          className="outline-none text-sm bg-transparent pr-2 w-full"
          style={{ color: "#374151" }}
        />
      )}
    </div>
  );
}

function Field({ label, required, hint, error, children }: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: error ? "#fffbe6" : "transparent", borderRadius: 8, padding: error ? "10px 12px" : 0 }}>
      <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}
      {children}
      {error && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{error}</p>}
    </div>
  );
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="form-input appearance-none pr-9"
        style={{ color: value ? "#1d1d1f" : "#9ca3af" }}
        onFocus={e => Object.assign(e.currentTarget.style, formFocusStyle)}
        onBlur={e => Object.assign(e.currentTarget.style, formBlurStyle)}>
        <option value="" disabled>请选择</option>
        {options.map(o => <option key={o}>{o}</option>)}
        {value && !options.includes(value) && <option value={value}>{value}</option>}
      </select>
    </div>
  );
}

function TextInput({ value, onChange, placeholder = "" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input type="text" placeholder={placeholder} value={value ?? ""} onChange={e => onChange(e.target.value)}
      className="form-input" onFocus={e => Object.assign(e.currentTarget.style, formFocusStyle)} onBlur={e => Object.assign(e.currentTarget.style, formBlurStyle)} />
  );
}

type Row = ClassRankRecord;

const COLUMNS: ColDef<Row>[] = [
  { key: "学期",     label: "学期",   textSize: "text-sm" },
  { key: "考试名称", label: "考试名称" },
  { key: "年级",     label: "年级" },
  { key: "班级",     label: "班级",   cellColor: "#1e40af" },
  { key: "教师姓名", label: "教师姓名" },
  { key: "学科",     label: "学科" },
  { key: "班级排名", label: "班级排名", headerColor: "#3b82f6" },
  { key: "提交人",   label: "提交人",   minWidth: 80 },
  { key: "提交时间",  label: "提交时间",  minWidth: 160 },
  { key: "更新时间",  label: "更新时间",  minWidth: 160 },
];

const DATA_MODES = ["添加数据", "管理本人创建数据", "全部有权限数据"] as const;

const SORT_OPTIONS: { label: string; field: keyof ClassRankRecord }[] = [
  { label: "提交时间", field: "提交时间" },
  { label: "更新时间", field: "更新时间" },
  { label: "学期", field: "学期" },
  { label: "考试名称", field: "考试名称" },
  { label: "班级排名", field: "班级排名" },
];

export function ClassRankPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [search, setSearch] = useState("");
  const [dataMode, setDataMode] = useState<string>(DATA_MODES[1]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<keyof ClassRankRecord>("提交时间");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const { raw, isPending, isError, refetch, isFetching } = useClassRank();
  const perms = useFormPermissions(JDY_CONFIG.CLASS_RANK.entry_id);
  const { raw: terms } = useTermInfo();
  const { raw: grades } = useGradeInfo();
  const { raw: courses } = useCourses();
  const { raw: staffList } = useDepartmentMembers();

  const termOptions = useMemo(() => terms.map(t => t.学期名称).filter(Boolean), [terms]);
  const gradeOptions = useMemo(() => grades.map(g => g.年级别名).filter(Boolean), [grades]);
  const courseOptions = useMemo(() => [...new Set(courses.map(c => c.教研学科名).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [courses]);

  // Form state
  const [editRecord, setEditRecord] = useState<ClassRankRecord | null>(null);
  const [semester, setSemester] = useState("");
  const [examName, setExamName] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [subject, setSubject] = useState("");
  const [rank, setRank] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = editRecord !== null;

  useEffect(() => {
    if (!dropdownOpen) return;
    function h(e: MouseEvent) { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!sortOpen) return;
    function h(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [sortOpen]);

  // Pre-fill form when editing
  useEffect(() => {
    if (!editRecord) return;
    setSemester(editRecord.学期);
    setExamName(editRecord.考试名称);
    setGrade(editRecord.年级);
    setClassName(editRecord.班级);
    setTeacherName(editRecord.教师姓名);
    setSubject(editRecord.学科);
    setRank(editRecord.班级排名);
  }, [editRecord]);

  // Restore draft when entering add mode
  useEffect(() => {
    if (editRecord || dataMode !== DATA_MODES[0]) return;
    try {
      const rawDraft = localStorage.getItem("class-rank-draft");
      if (!rawDraft) return;
      const d = JSON.parse(rawDraft);
      if (d.semester) setSemester(d.semester);
      if (d.examName) setExamName(d.examName);
      if (d.grade) setGrade(d.grade);
      if (d.className) setClassName(d.className);
      if (d.teacherName) { setTeacherName(d.teacherName); }
      if (d.subject) setSubject(d.subject);
      if (d.rank) setRank(d.rank);
    } catch {}
  }, [dataMode, editRecord]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!semester.trim())    errs.semester = "请选择学期";
    if (!examName.trim())    errs.examName = "请输入考试名称";
    if (!grade.trim())       errs.grade = "请选择年级";
    if (!className.trim())   errs.className = "请输入班级";
    if (!teacherName.trim()) errs.teacherName = "请选择教师";
    if (!subject.trim())     errs.subject = "请选择学科";
    if (!rank.trim())        errs.rank = "请输入班级排名";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const toMember = (name: string) => {
    const m = staffList.find(d => d.name === name);
    return m ? m.username : name;
  };

  const buildData = () => {
    const now = new Date().toISOString();
    return {
      [CLASS_RANK_WIDGET_IDS.学期]: { value: semester },
      [CLASS_RANK_WIDGET_IDS.考试名称]: { value: examName },
      [CLASS_RANK_WIDGET_IDS.年级]: { value: grade },
      [CLASS_RANK_WIDGET_IDS.班级]: { value: className },
      [CLASS_RANK_WIDGET_IDS.教师姓名]: { value: toMember(teacherName) },
      [CLASS_RANK_WIDGET_IDS.学科]: { value: subject },
      [CLASS_RANK_WIDGET_IDS.班级排名]: { value: rank },
      [CLASS_RANK_WIDGET_IDS.提交人]: { value: isEditMode ? editRecord!.提交人 : (currentUser?.name ?? "") },
      [CLASS_RANK_WIDGET_IDS.提交时间]: { value: isEditMode ? editRecord!.提交时间 : now },
      [CLASS_RANK_WIDGET_IDS.更新时间]: { value: now },
    };
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (isEditMode) {
        await jdyUpdate({
          app_id: JDY_CONFIG.CLASS_RANK.app_id,
          entry_id: JDY_CONFIG.CLASS_RANK.entry_id,
          data_id: editRecord!._id,
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
      localStorage.removeItem("class-rank-draft");
      if (isEditMode) setEditRecord(null);
      setDataMode(DATA_MODES[1]);
      setSemester(""); setExamName(""); setGrade(""); setClassName("");
      setTeacherName(""); setSubject(""); setRank("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setSemester(""); setExamName(""); setGrade(""); setClassName("");
    setTeacherName(""); setSubject(""); setRank("");
    setErrors({});
    localStorage.removeItem("class-rank-draft");
  };

  const handleSaveDraft = () => {
    if (!semester.trim() && !examName.trim() && !teacherName.trim()) return;
    localStorage.setItem("class-rank-draft", JSON.stringify({
      semester, examName, grade, className, teacherName, subject, rank,
    }));
  };

  const handleDeleteSelected = async (mode: string) => {
    const idSet = new Set(selectedIds);
    const targetData = mode === "勾选的数据"
      ? tableData.filter(r => idSet.has(r.id))
      : tableData;
    if (targetData.length === 0) return;
    if (!confirm(`确定要删除 ${targetData.length} 条记录吗？此操作不可撤销。`)) return;
    try {
      for (const r of targetData) {
        await jdyDelete({ app_id: JDY_CONFIG.CLASS_RANK.app_id, entry_id: JDY_CONFIG.CLASS_RANK.entry_id, data_id: r._id });
      }
      queryClient.invalidateQueries({ queryKey: ["class-rank", "list"] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败，请重试");
    }
  };

  const doExport = (data: ClassRankRecord[]) => {
    const headers = COLUMNS.map(c => c.label);
    const rows = data.map(r => COLUMNS.map(c => String(r[c.key as keyof ClassRankRecord] ?? "")));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "班级排名");
    XLSX.writeFile(wb, `教师所带班级排名_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Table data
  const tableData = useMemo(() => {
    if (dataMode === DATA_MODES[1]) return raw.filter(r => r.提交人 === currentUser?.name);
    if (dataMode === DATA_MODES[2]) return raw;
    return raw;
  }, [raw, dataMode, currentUser]);

  const filtered = tableData.filter(r =>
    r.班级.includes(search) || r.考试名称.includes(search) || r.学科.includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    const va = String(a[sortField] ?? "");
    const vb = String(b[sortField] ?? "");
    const cmp = va.localeCompare(vb, "zh");
    return sortDir === "desc" ? -cmp : cmp;
  });

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#111827" }}>
      <PageHeader
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教师所带班级排名", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">

        {/* 页面模式切换下拉框 */}
        <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6">
          <div className="relative shrink-0 inline-block" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-2 h-9 px-4 text-[15px] font-semibold rounded-xl transition-all duration-150 shrink-0"
              style={{
                minWidth: 200,
                background: "white",
                color: "#374151",
                border: "1px solid rgba(0,0,0,0.1)",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <span className="flex-1 text-left">{dataMode}</span>
              <ChevronDown
                className="w-4 h-4 shrink-0 transition-transform duration-200"
                style={{ color: "#9ca3af", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              />
            </button>
            {dropdownOpen && (
              <div
                className="absolute left-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
                style={{
                  minWidth: 200,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
                  animation: "classRankDropdownIn 0.15s ease-out",
                }}
              >
                {DATA_MODES.map((opt, i) => {
                  const isSelected = opt === dataMode;
                  const disabled = opt === DATA_MODES[0] && !perms.canCreate;
                  return (
                    <button
                      key={opt}
                      onClick={() => { if (!disabled) { if (opt !== DATA_MODES[0]) { setEditRecord(null); } else { setEditRecord(null); handleClearForm(); } setDataMode(opt); setDropdownOpen(false); } }}
                      className="w-full text-left px-4 h-11 text-[15px] font-medium transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={disabled}
                      style={{
                        color: isSelected ? teal : "#374151",
                        background: isSelected ? "rgba(0,176,149,0.06)" : "transparent",
                        borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none",
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <style>{`@keyframes classRankDropdownIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>

        {/* Form mode */}
        {(dataMode === DATA_MODES[0] || editRecord) ? (
          <main className="max-w-6xl mx-auto px-3 md:px-6 pb-24">
            <div className="mb-8 text-center">
              <div className="inline-flex flex-col items-center">
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>
                  {editRecord ? "编辑班级排名" : "教师所带班级排名"}
                </h2>
                <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
                {editRecord && <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>修改表单字段后点击保存</p>}
              </div>
            </div>

            <div className="rounded-[28px] shadow-sm border border-gray-100 bg-white">
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="学期" required error={errors.semester}>
                  <SelectField value={semester} onChange={v => { setSemester(v); clearError("semester"); }} options={termOptions} />
                </Field>
                <Field label="考试名称" required error={errors.examName}>
                  <TextInput value={examName} onChange={v => { setExamName(v); clearError("examName"); }} />
                </Field>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="年级" required error={errors.grade}>
                  <SelectField value={grade} onChange={v => { setGrade(v); clearError("grade"); }} options={gradeOptions} />
                </Field>
                <Field label="班级" required error={errors.className}>
                  <TextInput value={className} onChange={v => { setClassName(v); clearError("className"); }} />
                </Field>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="教师姓名" required error={errors.teacherName}>
                  <DeptStaffPicker
                    staffList={staffList}
                    value={teacherName}
                    onChange={v => { setTeacherName(v as string); clearError("teacherName"); }}
                  />
                </Field>
                <Field label="学科" required error={errors.subject}>
                  <SelectField value={subject} onChange={v => { setSubject(v); clearError("subject"); }} options={courseOptions} />
                </Field>
              </div>
              <div className="p-8 bg-white">
                <Field label="班级排名" required error={errors.rank} hint="格式示例：某老师带的班级15个班里考第2名，则填入：2/15">
                  <TextInput value={rank} onChange={v => { setRank(v); clearError("rank"); }} placeholder="例：2/15" />
                </Field>
              </div>
            </div>

            {/* Form footer */}
            <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">
              {editRecord ? (
                <button className="btn-secondary" onClick={() => { setEditRecord(null); handleClearForm(); }}>
                  取消编辑
                </button>
              ) : (
                <>
                  <button className="btn-secondary" onClick={handleClearForm}>清空数据</button>
                  <button className="btn-secondary" onClick={handleSaveDraft}>保存草稿</button>
                </>
              )}
              <div className="flex-1" />
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px disabled:opacity-60"
                style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}
              >
                {submitting ? "提交中..." : (editRecord ? "保存" : "提交")}
              </button>
            </div>
          </main>
        ) : (
          /* Table mode */
          <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6 pb-24">
            <div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-sm" style={{ minHeight: 500 }}>

              {/* 操作栏 */}
              <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">

                {/* icon buttons */}
                <div className="flex items-center gap-0.5">
                  {perms.canExport && (
                    <IconDropdown
                      tooltip="导出"
                      icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>}
                      options={["勾选的数据", "全部数据"]}
                      disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                      onSelect={opt => {
                        if (opt === "勾选的数据") {
                          const idSet = new Set(selectedIds);
                          doExport(raw.filter(r => idSet.has(r.id)));
                        } else {
                          doExport(raw);
                        }
                      }}
                    />
                  )}
                  {perms.canDelete && (
                    <IconDropdown
                      tooltip="删除"
                      icon={<Trash2 className="w-5 h-5" />}
                      options={["勾选的数据", "全部数据"]}
                      disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                      onSelect={handleDeleteSelected}
                    />
                  )}
                  <IconDropdown
                    tooltip="操作记录"
                    icon={<Clock className="w-5 h-5" />}
                    options={["批量修改记录", "批量打印模板记录"]}
                  />
                </div>

                <div className="flex-1" />

                <SearchBox value={search} onChange={setSearch} />

                <button
                  className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-sm transition-all hover:bg-black/[0.05] shrink-0"
                  style={{ color: "#8c8c8c", fontSize: 15 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  </svg>
                  筛选
                </button>

                <div className="flex items-center gap-0.5 pl-2 border-l border-gray-200" style={{ color: "#9ca3af" }}>
                  <div className="relative" ref={sortRef}>
                    <Tooltip text="排序">
                      <button
                        onClick={() => setSortOpen(v => !v)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all"
                        style={{ color: sortField !== "提交时间" || sortDir !== "desc" ? teal : "#9ca3af" }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" /><path d="M6 12h12" /><path d="M9 18h6" />
                        </svg>
                      </button>
                    </Tooltip>
                    {sortOpen && (
                      <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 160, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                          <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>排序字段</span>
                          <div className="flex-1" />
                          <button
                            onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                            className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-black/[0.04]"
                            style={{ color: teal }}
                          >
                            {sortDir === "desc" ? "降序" : "升序"}
                          </button>
                        </div>
                        {SORT_OPTIONS.map(opt => {
                          const active = sortField === opt.field;
                          return (
                            <button
                              key={opt.field}
                              onClick={() => { setSortField(opt.field); setSortOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] flex items-center gap-2"
                              style={{ color: active ? teal : "#374151", fontWeight: active ? 600 : 400 }}
                            >
                              {opt.label}
                              {active && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <Tooltip text="刷新">
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" onClick={() => refetch()} disabled={isFetching}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFetching ? "animate-spin" : ""}>
                        <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </div>

              {isPending ? (
                <div className="flex items-center justify-center py-20 text-sm text-gray-400">加载中...</div>
              ) : isError ? (
                <div className="flex items-center justify-center py-20 text-sm text-red-400">加载失败，请稍后重试</div>
              ) : (
                <DataTable
                  columns={COLUMNS}
                  rows={sorted}
                  minWidth={1200}
                  onSelectionChange={setSelectedIds}
                  onRowClick={r => { setEditRecord(r as ClassRankRecord); }}
                />
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
