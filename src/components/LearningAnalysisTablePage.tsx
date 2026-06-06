"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { ChevronDown, Trash2, Clock, Search, X, Plus, Image } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DatePicker } from "./ui/DatePicker";
import { StudentPicker } from "./ui/StudentPicker";
import { DataTable, type ColDef } from "./DataTable";
import { useLearningAnalysis, useCourses, type LearningAnalysisRecord, type StudentInfoRecord } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS, jdyCreate, jdyUpdate, jdyDelete, jdyUploadFiles } from "@/lib/jdy-api";
import { useCurrentUser } from "@/lib/user-context";
import { useQueryClient } from "@tanstack/react-query";

const teal = "#00b095";

const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

type Mode = "add-only" | "add-manage-own" | "all-permitted";

const modeOptions: { value: Mode; label: string }[] = [
  { value: "add-only",       label: "仅添加数据" },
  { value: "add-manage-own", label: "添加并管理本人数据" },
  { value: "all-permitted",  label: "全部有权限的数据" },
];

const H = STUDENT_LEARNING_ANALYSIS_WIDGET_IDS;

// ── Column definitions ──────────────────────────────────────────

const COLUMNS: ColDef<LearningAnalysisRecord>[] = [
  { key: "班级",       label: "班级" },
  { key: "学生姓名",   label: "学生姓名" },
  { key: "学科",       label: "学科" },
  { key: "学情分析开始时间", label: "开始时间" },
  { key: "学情分析结束时间", label: "结束时间" },
  { key: "教师指导措施", label: "教师指导措施", minWidth: 200 },
  { key: "提交人",     label: "提交人", minWidth: 80 },
  { key: "提交时间",   label: "提交时间", minWidth: 160 },
];

const SORT_OPTIONS: { label: string; field: keyof LearningAnalysisRecord }[] = [
  { label: "提交时间", field: "提交时间" },
  { label: "班级", field: "班级" },
  { label: "学生姓名", field: "学生姓名" },
  { label: "学科", field: "学科" },
];

// ── Helpers ──────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

function FSelect({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled>{placeholder ?? ""}</option>{options.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown className="w-4 h-4 absolute right-3.5 top-3 text-gray-400 pointer-events-none" /></div>);
}

function ImageField({ files, onChange, label, existingUrls }: { files: File[]; onChange: (f: File[]) => void; label: string; existingUrls?: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);

  useEffect(() => {
    return () => previews.forEach(url => URL.revokeObjectURL(url));
  }, [previews]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {/* Existing remote images (edit mode) */}
        {(existingUrls ?? []).map((url, i) => (
          <div key={`existing-${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
            <img src={url} alt="" className="w-full h-full object-cover" />
          </div>
        ))}
        {/* New local file previews */}
        {previews.map((url, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group shrink-0">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => onChange(files.filter((_, j) => j !== i))}
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="w-3 h-3 text-gray-500" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-emerald-300 hover:text-emerald-400 transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[9px] leading-none">上传</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) onChange([...files, ...Array.from(e.target.files)]); e.target.value = ""; }} />
      <p className="text-xs text-gray-400" style={{ marginTop: 2 }}>{label}</p>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="relative flex items-center justify-center my-2" style={{ height: 32 }}>
      <div className="absolute inset-0 rounded" style={{ background: "linear-gradient(90deg, transparent 0%, #00b095 10%, #00b095 90%, transparent 100%)" }} />
      <div className="absolute left-[9%] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45" style={{ background: "white", opacity: 0.6 }} />
      <div className="absolute right-[9%] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45" style={{ background: "white", opacity: 0.6 }} />
      <span className="relative text-sm font-semibold text-white tracking-wider">{title}</span>
    </div>
  );
}

// ── Toolbar helpers ──────────────────────────────────────────────

function Tooltip({ text, disabled, children }: { text: string; disabled?: boolean; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && !disabled && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white px-2.5 py-1.5 rounded-md pointer-events-none z-50"
          style={{ background: "rgba(30,30,30,0.88)", backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderBottomColor: "rgba(30,30,30,0.88)" }} />
          {text}
        </div>
      )}
    </div>
  );
}

function IconDropdown({ icon, tooltip, options, onSelect, disabledOptions }: {
  icon: React.ReactNode; tooltip: string; options: string[]; onSelect?: (option: string) => void; disabledOptions?: string[];
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
        <button onClick={() => setOpen(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-black/[0.05]" style={{ color: "#8c8c8c" }}>{icon}</button>
      </Tooltip>
      {open && (
        <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 148, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
          {options.map(opt => {
            const isDisabled = disabledSet.has(opt);
            return (
              <button key={opt} onClick={() => { if (!isDisabled) { setOpen(false); onSelect?.(opt); } }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "#374151" }} disabled={isDisabled}>{opt}</button>
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
  function expand() { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 50); }
  function collapse() { if (!value) setExpanded(false); }
  return (
    <div className="flex items-center rounded-lg border transition-all duration-200 bg-white overflow-hidden"
      style={{ width: expanded ? 200 : 32, height: 32, borderColor: expanded ? "#d1d5db" : "transparent", background: expanded ? "white" : "transparent" }}>
      <button onClick={expand} className="flex items-center justify-center w-8 h-8 shrink-0 transition-colors" style={{ color: expanded ? teal : "#8c8c8c" }}><Search className="w-4 h-4" /></button>
      {expanded && <input ref={inputRef} type="text" placeholder="搜索数据" value={value} onChange={e => onChange(e.target.value)} onBlur={collapse} className="outline-none text-sm bg-transparent pr-2 w-full" style={{ color: "#374151" }} />}
    </div>
  );
}

// ── Mode selector ────────────────────────────────────────────────

function ModeSelector({ value, onChange }: { value: Mode; onChange: (v: Mode) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const currentLabel = modeOptions.find(o => o.value === value)?.label ?? value;
  return (
    <div className="relative shrink-0 inline-block" ref={ref}>
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 h-9 px-4 text-[15px] font-semibold rounded-xl transition-all duration-150 shrink-0"
        style={{ minWidth: 200, background: "white", color: "#374151", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <span className="flex-1 text-left">{currentLabel}</span>
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: "#9ca3af", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
          style={{ minWidth: 200, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)" }}>
          {modeOptions.map((opt, i) => {
            const isSelected = opt.value === value;
            return (
              <button key={opt.value} onClick={() => { setOpen(false); onChange(opt.value); }}
                className="w-full text-left px-4 h-11 text-[15px] font-medium transition-colors duration-100"
                style={{ color: isSelected ? teal : "#374151", background: isSelected ? "rgba(0,176,149,0.06)" : "transparent", borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────

export function LearningAnalysisTablePage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [mode, setMode] = useState<Mode>("add-manage-own");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof LearningAnalysisRecord>("提交时间");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Form state
  const [editRecord, setEditRecord] = useState<LearningAnalysisRecord | null>(null);
  const [cls, setCls] = useState("");
  const [studentName, setStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [goodPhotos, setGoodPhotos] = useState<File[]>([]);
  const [weakPhotos, setWeakPhotos] = useState<File[]>([]);
  const [guidance, setGuidance] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const { raw, isPending, isError, refetch, isFetching } = useLearningAnalysis();
  const { raw: courseList } = useCourses();

  const isEditMode = editRecord !== null;
  const existingGoodUrls = useMemo(() => isEditMode ? editRecord!.掌握较好的知识点.map(f => f.url) : [], [editRecord, isEditMode]);
  const existingWeakUrls = useMemo(() => isEditMode ? editRecord!.掌握不足的知识点.map(f => f.url) : [], [editRecord, isEditMode]);
  const subjectOptions = useMemo(() => [...new Set(courseList.map((c) => c.教研学科名 || c.科目).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [courseList]);

  // Click outside for sort dropdown
  useEffect(() => {
    if (!sortOpen) return;
    function h(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [sortOpen]);

  // Pre-fill form when editing
  useEffect(() => {
    if (!editRecord) return;
    setCls(editRecord.班级);
    setStudentName(editRecord.学生姓名);
    setSubject(editRecord.学科);
    setStartDate(editRecord.学情分析开始时间 ? new Date(editRecord.学情分析开始时间) : null);
    setEndDate(editRecord.学情分析结束时间 ? new Date(editRecord.学情分析结束时间) : null);
    setGuidance(editRecord.教师指导措施);
    setGoodPhotos([]);
    setWeakPhotos([]);
  }, [editRecord]);

  // Restore draft when entering add mode (without edit record)
  useEffect(() => {
    if (editRecord || mode !== "add-only") return;
    try {
      const rawDraft = localStorage.getItem("learning-analysis-draft");
      if (!rawDraft) return;
      const d = JSON.parse(rawDraft);
      if (d.cls) setCls(d.cls);
      if (d.studentName) setStudentName(d.studentName);
      if (d.subject) setSubject(d.subject);
      if (d.startDate) setStartDate(new Date(d.startDate));
      if (d.endDate) setEndDate(new Date(d.endDate));
      if (d.guidance) setGuidance(d.guidance);
    } catch {}
  }, [mode, editRecord]);

  // ── API logic ────────────────────────────────────────────────

  const handleSelectStudent = (record: StudentInfoRecord | null) => {
    if (record) setCls(record.班级名称 || "");
    else setCls("");
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!cls.trim())          errs.cls = "请输入班级";
    if (!studentName.trim())   errs.studentName = "请选择学生";
    if (!subject.trim())       errs.subject = "请选择学科";
    if (!startDate)            errs.startDate = "请选择开始时间";
    if (!endDate)              errs.endDate = "请选择结束时间";
    if (goodPhotos.length === 0 && !isEditMode) errs.goodPhotos = "请上传掌握较好的知识点图片";
    if (weakPhotos.length === 0 && !isEditMode) errs.weakPhotos = "请上传掌握不足的知识点图片";
    if (!guidance.trim())      errs.guidance = "请输入教师指导措施";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const buildData = (goodKeys: string[], weakKeys: string[]) => {
    const now = new Date().toISOString();
    const fmtDate = (d: Date | null) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";
    return {
      [H.班级]: { value: cls },
      [H.学生姓名]: { value: studentName },
      [H.学科]: { value: subject },
      [H.学情分析开始时间]: { value: fmtDate(startDate) },
      [H.学情分析结束时间]: { value: fmtDate(endDate) },
      [H.掌握较好的知识点]: { value: goodKeys },
      [H.掌握不足的知识点]: { value: weakKeys },
      [H.教师指导措施]: { value: guidance },
      [H.提交人]: { value: isEditMode ? editRecord!.提交人 : (currentUser?.name ?? "") },
      [H.提交时间]: { value: isEditMode ? editRecord!.提交时间 : now },
    };
  };

  const handleSubmit = async () => {
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      const allFiles = [...goodPhotos, ...weakPhotos];
      const transaction_id = allFiles.length > 0 ? crypto.randomUUID() : undefined;
      let goodKeys: string[] = isEditMode ? editRecord!.掌握较好的知识点.map(f => f.name) : [];
      let weakKeys: string[] = isEditMode ? editRecord!.掌握不足的知识点.map(f => f.name) : [];

      if (transaction_id) {
        const result = await jdyUploadFiles(allFiles, JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.app_id, JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.entry_id, transaction_id);
        let ki = 0;
        if (goodPhotos.length > 0) { goodKeys = result.keys.slice(ki, ki + goodPhotos.length); ki += goodPhotos.length; }
        if (weakPhotos.length > 0) { weakKeys = result.keys.slice(ki, ki + weakPhotos.length); }
      }

      if (isEditMode) {
        await jdyUpdate({
          app_id: JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.app_id,
          entry_id: JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.entry_id,
          data_id: editRecord!._id,
          data: buildData(goodKeys, weakKeys),
          data_creator: currentUser?.userId,
          transaction_id,
        });
      } else {
        await jdyCreate({
          app_id: JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.app_id,
          entry_id: JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.entry_id,
          data: buildData(goodKeys, weakKeys),
          data_creator: currentUser?.userId,
          transaction_id,
          is_start_workflow: false,
          is_start_trigger: false,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["learning-analysis", "list"] });
      handleClearForm();
      if (isEditMode) setEditRecord(null);
      setMode("add-manage-own");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const clearFormFields = () => {
    setCls(""); setStudentName(""); setSubject(""); setStartDate(null); setEndDate(null);
    setGoodPhotos([]); setWeakPhotos([]); setGuidance("");
    setErrors({});
  };

  const handleClearForm = () => {
    clearFormFields();
    localStorage.removeItem("learning-analysis-draft");
  };

  const handleSaveDraft = () => {
    const hasContent = cls || studentName || subject || guidance;
    if (!hasContent) return;
    localStorage.setItem("learning-analysis-draft", JSON.stringify({
      cls, studentName, subject, startDate: startDate?.toISOString(), endDate: endDate?.toISOString(), guidance,
    }));
  };

  const handleDeleteSelected = async (opt: string) => {
    const idSet = new Set(selectedIds);
    const targetData = opt === "勾选的数据" ? tableData.filter(r => idSet.has(r.id)) : tableData;
    if (targetData.length === 0) return;
    if (!confirm(`确定要删除 ${targetData.length} 条记录吗？此操作不可撤销。`)) return;
    try {
      for (const r of targetData) {
        await jdyDelete({ app_id: JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.app_id, entry_id: JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.entry_id, data_id: r._id });
      }
      queryClient.invalidateQueries({ queryKey: ["learning-analysis", "list"] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败，请重试");
    }
  };

  const doExport = (data: LearningAnalysisRecord[]) => {
    const headers = COLUMNS.map(c => c.label);
    const rows = data.map(r => COLUMNS.map(c => String(r[c.key as keyof LearningAnalysisRecord] ?? "")));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "学情分析表");
    XLSX.writeFile(wb, `学情分析表_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ── Table data ───────────────────────────────────────────────

  const handleModeChange = (newMode: Mode) => {
    if (newMode === "add-only") {
      setEditRecord(null);
      clearFormFields();
    } else {
      setEditRecord(null);
    }
    setMode(newMode);
  };

  const tableData = useMemo(() => {
    if (mode === "add-manage-own") return raw.filter(r => r.提交人 === currentUser?.name);
    if (mode === "all-permitted") return raw;
    return raw;
  }, [raw, mode, currentUser]);

  const filtered = tableData.filter(r =>
    r.班级.includes(search) || r.学生姓名.includes(search) || r.学科.includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    const va = String(a[sortField] ?? "");
    const vb = String(b[sortField] ?? "");
    const cmp = va.localeCompare(vb, "zh");
    return sortDir === "desc" ? -cmp : cmp;
  });

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        centered
        breadcrumbs={[{ label: "学情分析" }, { label: "学情分析表", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">

        <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6">
          <ModeSelector value={mode} onChange={handleModeChange} />
        </div>

        {(mode === "add-only" || editRecord) ? (
          <main className="max-w-6xl mx-auto px-3 md:px-6 pb-24">
            <div className="mb-8 text-center">
              <div className="inline-flex flex-col items-center">
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>
                  {editRecord ? "编辑学情分析" : "学情分析表"}
                </h2>
                <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
                {editRecord && <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>修改表单字段后点击保存</p>}
              </div>
            </div>

            <div className="rounded-[28px] shadow-sm border border-gray-100 bg-white">
              <div className="p-8 space-y-10">

                {/* Row 1: 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <Field label="班级" required>
                    <input value={cls} onChange={(e) => { setCls(e.target.value); clearError("cls"); }} placeholder="请输入班级" className="form-input"
                      onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
                    {errors.cls && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.cls}</p>}
                  </Field>

                  <Field label="学生姓名" required>
                    <StudentPicker value={studentName} onChange={setStudentName} onSelectRecord={handleSelectStudent} />
                    {errors.studentName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.studentName}</p>}
                  </Field>

                  <Field label="学科" required>
                    <FSelect value={subject} onChange={v => { setSubject(v); clearError("subject"); }} options={subjectOptions} />
                    {errors.subject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.subject}</p>}
                  </Field>

                  <div>
                    <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
                      <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>分析时间范围
                    </label>
                    <div className="flex items-center gap-2">
                      <DatePicker value={startDate} onChange={d => { setStartDate(d); clearError("startDate"); }} dateOnly />
                      <span className="text-gray-400 text-sm shrink-0">至</span>
                      <DatePicker value={endDate} onChange={d => { setEndDate(d); clearError("endDate"); }} dateOnly />
                    </div>
                    {(errors.startDate || errors.endDate) && (
                      <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.startDate || errors.endDate}</p>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Row 2: 知识点分析 — full width image fields */}
                <div className="space-y-6">
                  <Field label="掌握较好的知识点" required>
                    <ImageField files={goodPhotos} onChange={f => { setGoodPhotos(f); clearError("goodPhotos"); }} label="上传截图或照片，单张 20MB 以内" existingUrls={existingGoodUrls} />
                    {errors.goodPhotos && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.goodPhotos}</p>}
                  </Field>

                  <Field label="掌握不足的知识点" required>
                    <ImageField files={weakPhotos} onChange={f => { setWeakPhotos(f); clearError("weakPhotos"); }} label="上传截图或照片，单张 20MB 以内" existingUrls={existingWeakUrls} />
                    {errors.weakPhotos && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.weakPhotos}</p>}
                  </Field>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* Row 3: 教师指导措施 — full width */}
                <Field label="教师指导措施" required>
                  <textarea rows={6} value={guidance} onChange={(e) => { setGuidance(e.target.value); clearError("guidance"); }}
                    placeholder="根据薄弱知识点或题块给出具体指导措施" className="form-input resize-none"
                    onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
                  {errors.guidance && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.guidance}</p>}
                </Field>

              </div>
            </div>

            <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">
              {editRecord ? (
                <button className="btn-secondary" onClick={() => { setEditRecord(null); handleClearForm(); }}>取消编辑</button>
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
          <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6 pb-24">
            <div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-sm" style={{ minHeight: 500 }}>

              {/* Toolbar */}
              <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
                <div className="flex items-center gap-0.5">
                  <IconDropdown
                    tooltip="导出"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>}
                    options={["勾选的数据", "全部数据"]}
                    disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                    onSelect={opt => {
                      if (opt === "勾选的数据") { const idSet = new Set(selectedIds); doExport(raw.filter(r => idSet.has(r.id))); }
                      else doExport(raw);
                    }}
                  />
                  <IconDropdown
                    tooltip="删除"
                    icon={<Trash2 className="w-5 h-5" />}
                    options={["勾选的数据", "全部数据"]}
                    disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                    onSelect={handleDeleteSelected}
                  />
                  <IconDropdown
                    tooltip="操作记录"
                    icon={<Clock className="w-5 h-5" />}
                    options={["批量修改记录", "批量打印模板记录"]}
                  />
                </div>

                <div className="flex-1" />

                <SearchBox value={search} onChange={setSearch} />

                <button className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-sm transition-all hover:bg-black/[0.05] shrink-0" style={{ color: "#8c8c8c", fontSize: 15 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>
                  筛选
                </button>

                <div className="flex items-center gap-0.5 pl-2 border-l border-gray-200" style={{ color: "#9ca3af" }}>
                  <div className="relative" ref={sortRef}>
                    <Tooltip text="排序">
                      <button onClick={() => setSortOpen(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all"
                        style={{ color: sortField !== "提交时间" || sortDir !== "desc" ? teal : "#9ca3af" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M6 12h12" /><path d="M9 18h6" /></svg>
                      </button>
                    </Tooltip>
                    {sortOpen && (
                      <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 160, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
                        <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                          <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>排序字段</span>
                          <div className="flex-1" />
                          <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-black/[0.04]" style={{ color: teal }}>
                            {sortDir === "desc" ? "降序" : "升序"}
                          </button>
                        </div>
                        {SORT_OPTIONS.map(opt => {
                          const active = sortField === opt.field;
                          return (
                            <button key={opt.field} onClick={() => { setSortField(opt.field); setSortOpen(false); }}
                              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] flex items-center gap-2"
                              style={{ color: active ? teal : "#374151", fontWeight: active ? 600 : 400 }}>
                              {opt.label}
                              {active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto"><polyline points="20 6 9 17 4 12" /></svg>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <Tooltip text="刷新">
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" onClick={() => refetch()} disabled={isFetching}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFetching ? "animate-spin" : ""}><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
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
                  onRowClick={r => { setEditRecord(r as LearningAnalysisRecord); }}
                />
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
