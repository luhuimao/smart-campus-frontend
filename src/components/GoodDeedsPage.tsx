"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { ChevronDown, Trash2, Clock, Search, X, Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { StudentPicker } from "./ui/StudentPicker";
import { DataTable, type ColDef } from "./DataTable";
import { useGoodDeeds, useTermInfo, useGradeInfo, useStaffDirectory, useDepartmentMembers, type GoodDeedsRecord, type StudentInfoRecord } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, GOOD_DEEDS_WIDGET_IDS, jdyCreate, jdyUpdate, jdyDelete } from "@/lib/jdy-api";
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

const H = GOOD_DEEDS_WIDGET_IDS;

const COLUMNS: ColDef<GoodDeedsRecord>[] = [
  { key: "学期",       label: "学期" },
  { key: "年级",       label: "年级" },
  { key: "班级名称",   label: "班级" },
  { key: "学生姓名",   label: "学生姓名" },
  { key: "事件发生时间", label: "事件时间" },
  { key: "事件地点",   label: "事件地点" },
  { key: "事件描述",   label: "事件描述", minWidth: 200 },
  { key: "班主任",     label: "班主任" },
  { key: "提交人",     label: "提交人", minWidth: 80 },
  { key: "提交时间",   label: "提交时间", minWidth: 160 },
];

const SORT_OPTIONS: { label: string; field: keyof GoodDeedsRecord }[] = [
  { label: "提交时间", field: "提交时间" },
  { label: "事件发生时间", field: "事件发生时间" },
  { label: "学期", field: "学期" },
  { label: "班级名称", field: "班级名称" },
];

// ── Helpers ──────────────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

function TextInput({ value, onChange, placeholder = "" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (<input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="form-input"
    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="relative"><select value={value} onChange={e => onChange(e.target.value)} className="form-input appearance-none pr-9"
    style={{ color: value ? "#1d1d1f" : "#9ca3af" }}
    onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}>
    <option value="" disabled />{options.map(o => <option key={o}>{o}</option>)}
    {value && !options.includes(value) && <option value={value}>{value}</option>}
  </select></div>);
}

function MiniStaffPicker({ value, onChange, placeholder = "选择成员" }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const { raw: staffList } = useStaffDirectory();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? staffList.filter(s => s.教职工姓名.includes(q)) : staffList; return list.slice(0, 30); }, [staffList, query]);
  useEffect(() => { if (!open) return; function h(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  return (<div ref={containerRef} className="relative">
    {value ? (<div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center min-h-[44px]"><span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}><span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">{value.slice(0, 1)}</span>{value}<button className="ml-1 opacity-60 hover:opacity-100" onClick={() => onChange("")}><X className="w-3 h-3" /></button></span></div>)
      : (<button type="button" className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1 hover:border-emerald-400 transition-colors bg-white" style={{ color: "#9ca3af", minHeight: 44 }} onClick={() => setOpen(true)}><Plus size={16} /><span className="text-sm">{placeholder}</span></button>)}
    {open && (<><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 320, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索教职工姓名..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map(s => (<button key={s._id} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => { onChange(s.教职工姓名); setOpen(false); }}><div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.教职工姓名.slice(0, 1)}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{s.教职工姓名}</p><p className="text-xs text-gray-400 truncate">{[s.部门, s.担任学科].filter(Boolean).join(" · ") || "—"}</p></div></button>))}</div></div></>)}
  </div>);
}

// ── Toolbar helpers ──────────────────────────────────────────────

function Tooltip({ text, disabled, children }: { text: string; disabled?: boolean; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (<div className="relative flex items-center justify-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>{children}
    {visible && !disabled && (<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white px-2.5 py-1.5 rounded-md pointer-events-none z-50" style={{ background: "rgba(30,30,30,0.88)", backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}><div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderBottomColor: "rgba(30,30,30,0.88)" }} />{text}</div>)}
  </div>);
}

function IconDropdown({ icon, tooltip, options, onSelect, disabledOptions }: {
  icon: React.ReactNode; tooltip: string; options: string[]; onSelect?: (o: string) => void; disabledOptions?: string[];
}) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const disabledSet = new Set(disabledOptions ?? []);
  useEffect(() => { if (!open) return; function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  return (<div className="relative" ref={ref}><Tooltip text={tooltip} disabled={open}><button onClick={() => setOpen(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-black/[0.05]" style={{ color: "#8c8c8c" }}>{icon}</button></Tooltip>
    {open && (<div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 148, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>{options.map(opt => (<button key={opt} onClick={() => { if (!disabledSet.has(opt)) { setOpen(false); onSelect?.(opt); } }} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: "#374151" }} disabled={disabledSet.has(opt)}>{opt}</button>))}</div>)}
  </div>);
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [expanded, setExpanded] = useState(false); const inputRef = useRef<HTMLInputElement>(null);
  function expand() { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 50); }
  function collapse() { if (!value) setExpanded(false); }
  return (<div className="flex items-center rounded-lg border transition-all duration-200 bg-white overflow-hidden" style={{ width: expanded ? 200 : 32, height: 32, borderColor: expanded ? "#d1d5db" : "transparent", background: expanded ? "white" : "transparent" }}>
    <button onClick={expand} className="flex items-center justify-center w-8 h-8 shrink-0 transition-colors" style={{ color: expanded ? teal : "#8c8c8c" }}><Search className="w-4 h-4" /></button>
    {expanded && <input ref={inputRef} type="text" placeholder="搜索数据" value={value} onChange={e => onChange(e.target.value)} onBlur={collapse} className="outline-none text-sm bg-transparent pr-2 w-full" style={{ color: "#374151" }} />}
  </div>);
}

function ModeSelector({ value, onChange }: { value: Mode; onChange: (v: Mode) => void }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!open) return; function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  const currentLabel = modeOptions.find(o => o.value === value)?.label ?? value;
  return (<div className="relative shrink-0 inline-block" ref={ref}>
    <button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 h-9 px-4 text-[15px] font-semibold rounded-xl transition-all duration-150 shrink-0"
      style={{ minWidth: 200, background: "white", color: "#374151", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <span className="flex-1 text-left">{currentLabel}</span>
      <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: "#9ca3af", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
    </button>
    {open && (<div className="absolute left-0 top-full mt-2 rounded-2xl overflow-hidden z-50" style={{ minWidth: 200, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)" }}>
      {modeOptions.map((opt, i) => { const isSelected = opt.value === value; return (<button key={opt.value} onClick={() => { setOpen(false); onChange(opt.value); }} className="w-full text-left px-4 h-11 text-[15px] font-medium transition-colors duration-100" style={{ color: isSelected ? teal : "#374151", background: isSelected ? "rgba(0,176,149,0.06)" : "transparent", borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>{opt.label}</button>); })}
    </div>)}
  </div>);
}

// ── Main component ───────────────────────────────────────────────

export function GoodDeedsPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [mode, setMode] = useState<Mode>("add-manage-own");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof GoodDeedsRecord>("提交时间");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Form state
  const [editRecord, setEditRecord] = useState<GoodDeedsRecord | null>(null);
  const [semester, setSemester] = useState("");
  const [fillDate, setFillDate] = useState("");
  const [filler, setFiller] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [studentName, setStudentName] = useState("");
  const [stuId, setStuId] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventPlace, setEventPlace] = useState("");
  const [eventAddress, setEventAddress] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [gradeDirector, setGradeDirector] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const { raw, isPending, isError, refetch, isFetching } = useGoodDeeds();
  const { raw: termList } = useTermInfo();
  const { raw: gradeList } = useGradeInfo();
  const { raw: deptMembers } = useDepartmentMembers();

  const isEditMode = editRecord !== null;
  const semesterOptions = useMemo(() => [...new Set(termList.map(t => t.学期名称).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [termList]);
  const gradeOptions = useMemo(() => [...new Set(gradeList.map(g => g.年级).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [gradeList]);

  useEffect(() => { if (!sortOpen) return; function h(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [sortOpen]);

  // Pre-fill form when editing
  useEffect(() => {
    if (!editRecord) return;
    setSemester(editRecord.学期);
    setFillDate(editRecord.填报时间 ? editRecord.填报时间.slice(0, 10) : "");
    setFiller(editRecord.填报人);
    setGrade(editRecord.年级);
    setClassName(editRecord.班级名称);
    setGradeLevel(editRecord.级部);
    setStudentName(editRecord.学生姓名);
    setStuId(editRecord.学生学号);
    setEventDate(editRecord.事件发生时间 ? editRecord.事件发生时间.slice(0, 10) : "");
    setEventPlace(editRecord.事件地点);
    setEventDesc(editRecord.事件描述);
    setClassTeacher(editRecord.班主任);
    setGradeDirector(editRecord.级部主任);
  }, [editRecord]);

  // Restore draft when entering add mode
  useEffect(() => {
    if (editRecord || mode !== "add-only") return;
    try {
      const rawDraft = localStorage.getItem("good-deeds-draft");
      if (!rawDraft) return;
      const d = JSON.parse(rawDraft);
      if (d.semester) setSemester(d.semester);
      if (d.fillDate) setFillDate(d.fillDate);
      if (d.filler) setFiller(d.filler);
      if (d.grade) setGrade(d.grade);
      if (d.className) setClassName(d.className);
      if (d.gradeLevel) setGradeLevel(d.gradeLevel);
      if (d.studentName) setStudentName(d.studentName);
      if (d.stuId) setStuId(d.stuId);
      if (d.eventDate) setEventDate(d.eventDate);
      if (d.eventPlace) setEventPlace(d.eventPlace);
      if (d.eventAddress) setEventAddress(d.eventAddress);
      if (d.eventDesc) setEventDesc(d.eventDesc);
      if (d.classTeacher) setClassTeacher(d.classTeacher);
      if (d.gradeDirector) setGradeDirector(d.gradeDirector);
    } catch {}
  }, [mode, editRecord]);

  // ── API logic ────────────────────────────────────────────────

  const handleSelectStudent = (record: StudentInfoRecord | null) => {
    if (record) { setClassName(record.班级名称 || ""); setStuId(record.宏德学号 || ""); }
    else { setClassName(""); setStuId(""); }
  };

  const toMemberUsername = (name: string) => {
    const m = deptMembers.find(d => d.name === name);
    return m ? m.username : name;
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!semester.trim())     errs.semester = "请选择学期";
    if (!fillDate.trim())     errs.fillDate = "请选择填报时间";
    if (!filler.trim())       errs.filler = "请选择填报人";
    if (!grade.trim())        errs.grade = "请选择年级";
    if (!className.trim())    errs.className = "请输入班级名称";
    if (!studentName.trim())  errs.studentName = "请选择学生";
    if (!stuId.trim())        errs.stuId = "请输入学生学号";
    if (!eventDate.trim())    errs.eventDate = "请选择事件发生时间";
    if (!eventDesc.trim())    errs.eventDesc = "请输入事件描述";
    if (!classTeacher.trim()) errs.classTeacher = "请选择班主任";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => { if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; }); };

  const buildData = () => {
    const now = new Date().toISOString();
    const location = [eventPlace, eventAddress].filter(Boolean).join(" ");
    return {
      [H.学期]: { value: semester },
      [H.填报时间]: { value: fillDate },
      [H.填报人]: { value: toMemberUsername(filler) },
      [H.年级]: { value: grade },
      [H.班级名称]: { value: className },
      [H.级部]: { value: gradeLevel },
      [H.学生姓名]: { value: studentName },
      [H.学生学号]: { value: stuId },
      [H.事件发生时间]: { value: eventDate },
      [H.事件地点]: { value: location },
      [H.事件描述]: { value: eventDesc },
      [H.班主任]: { value: toMemberUsername(classTeacher) },
      [H.级部主任]: { value: gradeDirector ? toMemberUsername(gradeDirector) : "" },
      [H.提交人]: { value: isEditMode ? editRecord!.提交人 : (currentUser?.name ?? "") },
      [H.提交时间]: { value: isEditMode ? editRecord!.提交时间 : now },
    };
  };

  const handleSubmit = async () => {
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      if (isEditMode) {
        await jdyUpdate({
          app_id: JDY_CONFIG.GOOD_DEEDS_INFO.app_id,
          entry_id: JDY_CONFIG.GOOD_DEEDS_INFO.entry_id,
          data_id: editRecord!._id,
          data: buildData(),
          data_creator: currentUser?.userId,
        });
      } else {
        await jdyCreate({
          app_id: JDY_CONFIG.GOOD_DEEDS_INFO.app_id,
          entry_id: JDY_CONFIG.GOOD_DEEDS_INFO.entry_id,
          data: buildData(),
          data_creator: currentUser?.userId,
          is_start_workflow: false,
          is_start_trigger: false,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["good-deeds", "list"] });
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
    setSemester(""); setFillDate(""); setFiller(""); setGrade(""); setClassName(""); setGradeLevel("");
    setStudentName(""); setStuId(""); setEventDate(""); setEventPlace(""); setEventAddress("");
    setEventDesc(""); setClassTeacher(""); setGradeDirector("");
    setErrors({});
  };

  const handleClearForm = () => { clearFormFields(); localStorage.removeItem("good-deeds-draft"); };

  const handleSaveDraft = () => {
    if (!semester.trim() && !studentName.trim()) return;
    localStorage.setItem("good-deeds-draft", JSON.stringify({
      semester, fillDate, filler, grade, className, gradeLevel, studentName, stuId,
      eventDate, eventPlace, eventAddress, eventDesc, classTeacher, gradeDirector,
    }));
  };

  const handleDeleteSelected = async (opt: string) => {
    const idSet = new Set(selectedIds);
    const targetData = opt === "勾选的数据" ? tableData.filter(r => idSet.has(r.id)) : tableData;
    if (targetData.length === 0) return;
    if (!confirm(`确定要删除 ${targetData.length} 条记录吗？此操作不可撤销。`)) return;
    try {
      for (const r of targetData) { await jdyDelete({ app_id: JDY_CONFIG.GOOD_DEEDS_INFO.app_id, entry_id: JDY_CONFIG.GOOD_DEEDS_INFO.entry_id, data_id: r._id }); }
      queryClient.invalidateQueries({ queryKey: ["good-deeds", "list"] });
    } catch (err) { alert(err instanceof Error ? err.message : "删除失败，请重试"); }
  };

  const doExport = (data: GoodDeedsRecord[]) => {
    const headers = COLUMNS.map(c => c.label);
    const rows = data.map(r => COLUMNS.map(c => String(r[c.key as keyof GoodDeedsRecord] ?? "")));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "好人好事记录");
    XLSX.writeFile(wb, `好人好事记录_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ── Table data ───────────────────────────────────────────────

  const handleModeChange = (newMode: Mode) => {
    if (newMode === "add-only") { setEditRecord(null); clearFormFields(); }
    else setEditRecord(null);
    setMode(newMode);
  };

  const tableData = useMemo(() => {
    if (mode === "add-manage-own") return raw.filter(r => r.提交人 === currentUser?.name);
    if (mode === "all-permitted") return raw;
    return raw;
  }, [raw, mode, currentUser]);

  const filtered = tableData.filter(r =>
    r.班级名称.includes(search) || r.学生姓名.includes(search) || r.事件描述.includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    const va = String(a[sortField] ?? ""); const vb = String(b[sortField] ?? "");
    const cmp = va.localeCompare(vb, "zh"); return sortDir === "desc" ? -cmp : cmp;
  });

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader breadcrumbs={[{ label: "学生成长" }, { label: "好人好事记录", active: true }]} onMenuOpen={onMenuOpen} />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">

        <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6">
          <ModeSelector value={mode} onChange={handleModeChange} />
        </div>

        {(mode === "add-only" || editRecord) ? (
          <main className="max-w-6xl mx-auto px-3 md:px-6 pb-24">
            <div className="mb-8 text-center">
              <div className="inline-flex flex-col items-center">
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>{editRecord ? "编辑好人好事" : "好人好事记录"}</h2>
                <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
                {editRecord && <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>修改表单字段后点击保存</p>}
              </div>
            </div>

            <div className="rounded-[28px] shadow-sm border border-gray-100 bg-white">
              <div className="p-8 space-y-10">

                {/* 基本信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <Field label="学期" required>
                    <SelectField value={semester} onChange={v => { setSemester(v); clearError("semester"); }} options={semesterOptions} />
                    {errors.semester && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.semester}</p>}
                  </Field>
                  <Field label="填报时间" required>
                    <input type="date" value={fillDate} onChange={e => { setFillDate(e.target.value); clearError("fillDate"); }} className="form-input"
                      style={{ color: fillDate ? "#1d1d1f" : "#9ca3af" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                    {errors.fillDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.fillDate}</p>}
                  </Field>
                  <Field label="填报人" required>
                    <MiniStaffPicker value={filler} onChange={v => { setFiller(v); clearError("filler"); }} />
                    {errors.filler && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.filler}</p>}
                  </Field>
                  <Field label="年级" required>
                    <SelectField value={grade} onChange={v => { setGrade(v); clearError("grade"); }} options={gradeOptions} />
                    {errors.grade && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.grade}</p>}
                  </Field>
                  <Field label="班级名称" required>
                    <TextInput value={className} onChange={v => { setClassName(v); clearError("className"); }} />
                    {errors.className && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.className}</p>}
                  </Field>
                  <Field label="级部">
                    <TextInput value={gradeLevel} onChange={setGradeLevel} placeholder="请输入级部" />
                  </Field>
                </div>

                <div className="border-t border-gray-100" />

                {/* 学生与事件信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <Field label="学生姓名" required>
                    <StudentPicker value={studentName} onChange={setStudentName} onSelectRecord={handleSelectStudent} />
                    {errors.studentName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.studentName}</p>}
                  </Field>
                  <Field label="学生学号" required>
                    <TextInput value={stuId} onChange={v => { setStuId(v); clearError("stuId"); }} placeholder="请输入学号" />
                    {errors.stuId && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.stuId}</p>}
                  </Field>
                  <Field label="事件发生时间" required>
                    <input type="date" value={eventDate} onChange={e => { setEventDate(e.target.value); clearError("eventDate"); }} className="form-input"
                      style={{ color: eventDate ? "#1d1d1f" : "#9ca3af" }}
                      onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                    {errors.eventDate && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.eventDate}</p>}
                  </Field>
                  <div>
                    <Field label="事件地点">
                      <SelectField value={eventPlace} onChange={setEventPlace} options={["校内", "校外"]} />
                      {eventPlace && (
                        <div className="mt-2">
                          <textarea placeholder="请填写详细地址" rows={3} value={eventAddress} onChange={e => setEventAddress(e.target.value)}
                            className="form-input resize-none" onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                        </div>
                      )}
                    </Field>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* 事件描述 */}
                <Field label="事件描述" required>
                  <textarea placeholder="请输入事件描述" rows={4} value={eventDesc} onChange={e => { setEventDesc(e.target.value); clearError("eventDesc"); }}
                    className="form-input resize-none" onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                  {errors.eventDesc && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.eventDesc}</p>}
                </Field>

                <div className="border-t border-gray-100" />

                {/* 负责人 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  <Field label="班主任" required>
                    <MiniStaffPicker value={classTeacher} onChange={v => { setClassTeacher(v); clearError("classTeacher"); }} />
                    {errors.classTeacher && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.classTeacher}</p>}
                  </Field>
                  <Field label="级部主任">
                    <MiniStaffPicker value={gradeDirector} onChange={setGradeDirector} placeholder="选择级部主任" />
                  </Field>
                </div>

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
              <button onClick={handleSubmit} disabled={submitting}
                className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px disabled:opacity-60"
                style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}>
                {submitting ? "提交中..." : (editRecord ? "保存" : "提交")}
              </button>
            </div>
          </main>
        ) : (
          <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6 pb-24">
            <div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-sm" style={{ minHeight: 500 }}>

              <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
                <div className="flex items-center gap-0.5">
                  <IconDropdown tooltip="导出"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>}
                    options={["勾选的数据", "全部数据"]}
                    disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                    onSelect={opt => { if (opt === "勾选的数据") { const idSet = new Set(selectedIds); doExport(raw.filter(r => idSet.has(r.id))); } else doExport(raw); }}
                  />
                  <IconDropdown tooltip="删除" icon={<Trash2 className="w-5 h-5" />}
                    options={["勾选的数据", "全部数据"]}
                    disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                    onSelect={handleDeleteSelected}
                  />
                  <IconDropdown tooltip="操作记录" icon={<Clock className="w-5 h-5" />} options={["批量修改记录", "批量打印模板记录"]} />
                </div>
                <div className="flex-1" />
                <SearchBox value={search} onChange={setSearch} />
                <button className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-sm transition-all hover:bg-black/[0.05] shrink-0" style={{ color: "#8c8c8c", fontSize: 15 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>筛选
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
                          <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>排序字段</span><div className="flex-1" />
                          <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-black/[0.04]" style={{ color: teal }}>{sortDir === "desc" ? "降序" : "升序"}</button>
                        </div>
                        {SORT_OPTIONS.map(opt => { const active = sortField === opt.field; return (
                          <button key={opt.field} onClick={() => { setSortField(opt.field); setSortOpen(false); }}
                            className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] flex items-center gap-2"
                            style={{ color: active ? teal : "#374151", fontWeight: active ? 600 : 400 }}>{opt.label}
                            {active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto"><polyline points="20 6 9 17 4 12" /></svg>}
                          </button>); })}
                      </div>
                    )}
                  </div>
                  <Tooltip text="刷新"><button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" onClick={() => refetch()} disabled={isFetching}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFetching ? "animate-spin" : ""}><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
                  </button></Tooltip>
                </div>
              </div>

              {isPending ? (
                <div className="flex items-center justify-center py-20 text-sm text-gray-400">加载中...</div>
              ) : isError ? (
                <div className="flex items-center justify-center py-20 text-sm text-red-400">加载失败，请稍后重试</div>
              ) : (
                <DataTable columns={COLUMNS} rows={sorted} minWidth={1200}
                  onSelectionChange={setSelectedIds}
                  onRowClick={r => { setEditRecord(r as GoodDeedsRecord); }} />
              )}

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
