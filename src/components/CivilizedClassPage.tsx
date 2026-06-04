"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import { Trash2, Clock, Search, ChevronDown } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DataTable, type ColDef } from "./DataTable";
import { useCurrentUser } from "@/lib/user-context";

const teal = "#00b095";
const formFocusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const formBlurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

const GRADE_OPTIONS = ["高一", "高二", "高三"];
const CLASS_OPTIONS: Record<string, string[]> = {
  "高一": ["高一(1)班", "高一(2)班", "高一(3)班", "高一(4)班", "高一(5)班"],
  "高二": ["高二(1)班", "高二(2)班", "高二(3)班", "高二(4)班", "高二(5)班"],
  "高三": ["高三(1)班", "高三(2)班", "高三(3)班", "高三(4)班", "高三(5)班"],
};

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

function SelectField({ value, onChange, options, disabled }: {
  value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="form-input appearance-none pr-9"
        style={{ color: value ? "#1d1d1f" : "#9ca3af" }}
        onFocus={e => { if (!disabled) Object.assign(e.currentTarget.style, formFocusStyle); }}
        onBlur={e => { if (!disabled) Object.assign(e.currentTarget.style, formBlurStyle); }}
        disabled={disabled}>
        <option value="" disabled>请选择</option>
        {options.map(o => <option key={o}>{o}</option>)}
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

interface CivilizedClassRow {
  id: number;
  year: string;
  week: string;
  grade: string;
  className: string;
  headTeacher: string;
  gradeDirector: string;
  submitter: string;
  submitTime: string;
  updateTime: string;
}

const INITIAL_ROWS: CivilizedClassRow[] = [
  { id: 1, year: "2026", week: "第3周", grade: "高一", className: "高一(1)班", headTeacher: "张晓燕", gradeDirector: "王建国", submitter: "张晓燕", submitTime: "2026-04-15 08:32", updateTime: "2026-04-15 08:32" },
  { id: 2, year: "2026", week: "第3周", grade: "高二", className: "高二(3)班", headTeacher: "刘明辉", gradeDirector: "陈淑芳", submitter: "刘明辉", submitTime: "2026-04-15 09:10", updateTime: "2026-04-15 09:10" },
  { id: 3, year: "2026", week: "第3周", grade: "高三", className: "高三(2)班", headTeacher: "黄志远", gradeDirector: "林佳琪", submitter: "黄志远", submitTime: "2026-04-15 10:05", updateTime: "2026-04-16 14:22" },
  { id: 4, year: "2026", week: "第2周", grade: "高一", className: "高一(4)班", headTeacher: "李秀英", gradeDirector: "王建国", submitter: "李秀英", submitTime: "2026-04-08 08:45", updateTime: "2026-04-08 08:45" },
  { id: 5, year: "2026", week: "第2周", grade: "高二", className: "高二(1)班", headTeacher: "吴凤莲", gradeDirector: "陈淑芳", submitter: "吴凤莲", submitTime: "2026-04-08 11:30", updateTime: "2026-04-09 09:15" },
  { id: 6, year: "2025", week: "第18周", grade: "高三", className: "高三(5)班", headTeacher: "赵鹏飞", gradeDirector: "林佳琪", submitter: "赵鹏飞", submitTime: "2025-12-20 14:18", updateTime: "2025-12-20 14:18" },
];

const COLUMNS: ColDef<CivilizedClassRow>[] = [
  { key: "year",          label: "年份" },
  { key: "week",          label: "周次",        textSize: "text-sm" },
  { key: "grade",         label: "级部" },
  { key: "className",     label: "班级",         cellColor: "#1e40af" },
  { key: "headTeacher",   label: "班主任" },
  { key: "gradeDirector", label: "级部主任" },
  { key: "submitter",     label: "提交人",       minWidth: 80 },
  { key: "submitTime",    label: "提交时间",     minWidth: 160, textSize: "text-sm" },
  { key: "updateTime",    label: "更新时间",     minWidth: 160, textSize: "text-sm" },
];

const DATA_MODES = ["添加数据", "管理本人创建数据", "全部有权限数据"] as const;

const SORT_OPTIONS: { label: string; field: keyof CivilizedClassRow }[] = [
  { label: "提交时间", field: "submitTime" },
  { label: "更新时间", field: "updateTime" },
  { label: "年份",     field: "year" },
  { label: "周次",     field: "week" },
  { label: "级部",     field: "grade" },
];

export function CivilizedClassPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [search, setSearch] = useState("");
  const [dataMode, setDataMode] = useState<string>(DATA_MODES[1]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [sortField, setSortField] = useState<keyof CivilizedClassRow>("submitTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const currentUser = useCurrentUser();

  // Mock data – local state for CRUD
  const [rows, setRows] = useState<CivilizedClassRow[]>(INITIAL_ROWS);
  const [nextId, setNextId] = useState(INITIAL_ROWS.length + 1);

  // Form state
  const [editRecord, setEditRecord] = useState<CivilizedClassRow | null>(null);
  const [year, setYear] = useState("");
  const [week, setWeek] = useState("");
  const [grade, setGrade] = useState("");
  const [className, setClassName] = useState("");
  const [headTeacher, setHeadTeacher] = useState("");
  const [gradeDirector, setGradeDirector] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = editRecord !== null;
  const classOptions = grade ? CLASS_OPTIONS[grade] ?? [] : [];

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
    setYear(editRecord.year);
    setWeek(editRecord.week);
    setGrade(editRecord.grade);
    setClassName(editRecord.className);
    setHeadTeacher(editRecord.headTeacher);
    setGradeDirector(editRecord.gradeDirector);
  }, [editRecord]);

  // Restore draft when entering add mode
  useEffect(() => {
    if (editRecord || dataMode !== DATA_MODES[0]) return;
    try {
      const rawDraft = localStorage.getItem("civilized-class-draft");
      if (!rawDraft) return;
      const d = JSON.parse(rawDraft);
      if (d.year) setYear(d.year);
      if (d.week) setWeek(d.week);
      if (d.grade) setGrade(d.grade);
      if (d.className) setClassName(d.className);
      if (d.headTeacher) setHeadTeacher(d.headTeacher);
      if (d.gradeDirector) setGradeDirector(d.gradeDirector);
    } catch {}
  }, [dataMode, editRecord]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!year.trim())           errs.year = "请输入年份";
    if (!week.trim())           errs.week = "请输入周次";
    if (!grade.trim())          errs.grade = "请选择级部";
    if (!className.trim())      errs.className = "请选择班级";
    if (!headTeacher.trim())    errs.headTeacher = "请输入班主任姓名";
    if (!gradeDirector.trim())  errs.gradeDirector = "请输入级部主任姓名";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const nowStr = () => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 300));
    try {
      const ts = nowStr();
      if (isEditMode) {
        setRows(prev => prev.map(r => r.id === editRecord!.id
          ? { ...r, year, week, grade, className, headTeacher, gradeDirector, updateTime: ts }
          : r));
      } else {
        const newRow: CivilizedClassRow = {
          id: nextId,
          year, week, grade, className, headTeacher, gradeDirector,
          submitter: currentUser?.name ?? "",
          submitTime: ts,
          updateTime: ts,
        };
        setRows(prev => [newRow, ...prev]);
        setNextId(id => id + 1);
      }
      localStorage.removeItem("civilized-class-draft");
      if (isEditMode) setEditRecord(null);
      setDataMode(DATA_MODES[1]);
      setYear(""); setWeek(""); setGrade(""); setClassName("");
      setHeadTeacher(""); setGradeDirector("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setYear(""); setWeek(""); setGrade(""); setClassName("");
    setHeadTeacher(""); setGradeDirector("");
    setErrors({});
    localStorage.removeItem("civilized-class-draft");
  };

  const handleSaveDraft = () => {
    if (!year.trim() && !week.trim() && !grade.trim()) return;
    localStorage.setItem("civilized-class-draft", JSON.stringify({
      year, week, grade, className, headTeacher, gradeDirector,
    }));
  };

  const handleDeleteSelected = async (mode: string) => {
    const idSet = new Set(selectedIds);
    const targetData = mode === "勾选的数据"
      ? tableData.filter(r => idSet.has(r.id))
      : tableData;
    if (targetData.length === 0) return;
    if (!confirm(`确定要删除 ${targetData.length} 条记录吗？此操作不可撤销。`)) return;
    const idDeleteSet = new Set(targetData.map(r => r.id));
    setRows(prev => prev.filter(r => !idDeleteSet.has(r.id)));
  };

  const doExport = (data: CivilizedClassRow[]) => {
    const headers = COLUMNS.map(c => c.label);
    const exportRows = data.map(r => COLUMNS.map(c => String(r[c.key as keyof CivilizedClassRow] ?? "")));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportRows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "文明班级");
    XLSX.writeFile(wb, `班主任所带文明班级_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Table data
  const tableData = useMemo(() => {
    if (dataMode === DATA_MODES[1]) return rows.filter(r => r.submitter === currentUser?.name);
    if (dataMode === DATA_MODES[2]) return rows;
    return rows;
  }, [rows, dataMode, currentUser]);

  const filtered = tableData.filter(r =>
    r.className.includes(search) || r.headTeacher.includes(search) || r.grade.includes(search)
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
        breadcrumbs={[{ label: "教师评价" }, { label: "班主任所带文明班级", active: true }]}
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
                  animation: "civilizedDropdownIn 0.15s ease-out",
                }}
              >
                {DATA_MODES.map((opt, i) => {
                  const isSelected = opt === dataMode;
                  return (
                    <button
                      key={opt}
                      onClick={() => { if (opt !== DATA_MODES[0]) { setEditRecord(null); } else { setEditRecord(null); handleClearForm(); } setDataMode(opt); setDropdownOpen(false); }}
                      className="w-full text-left px-4 h-11 text-[15px] font-medium transition-colors duration-100"
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

          <style>{`@keyframes civilizedDropdownIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>

        {/* Form mode */}
        {(dataMode === DATA_MODES[0] || editRecord) ? (
          <main className="max-w-6xl mx-auto px-3 md:px-6 pb-24">
            <div className="mb-8 text-center">
              <div className="inline-flex flex-col items-center">
                <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>
                  {editRecord ? "编辑文明班级" : "文明班级登记"}
                </h2>
                <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
                {editRecord && <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>修改表单字段后点击保存</p>}
              </div>
            </div>

            <div className="rounded-[28px] shadow-sm border border-gray-100 bg-white">
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="年份" required error={errors.year}>
                  <TextInput value={year} onChange={v => { setYear(v); clearError("year"); }} placeholder="例：2025" />
                </Field>
                <Field label="周次" required error={errors.week}>
                  <TextInput value={week} onChange={v => { setWeek(v); clearError("week"); }} placeholder="例：第3周" />
                </Field>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="级部" required error={errors.grade}>
                  <SelectField value={grade} onChange={v => { setGrade(v); setClassName(""); clearError("grade"); }} options={GRADE_OPTIONS} />
                </Field>
                <Field label="班级" required error={errors.className}>
                  <SelectField value={className} onChange={v => { setClassName(v); clearError("className"); }} options={classOptions} disabled={!grade} />
                </Field>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
                <Field label="班主任" required error={errors.headTeacher}>
                  <TextInput value={headTeacher} onChange={v => { setHeadTeacher(v); clearError("headTeacher"); }} placeholder="请输入班主任姓名" />
                </Field>
                <Field label="级部主任" required error={errors.gradeDirector}>
                  <TextInput value={gradeDirector} onChange={v => { setGradeDirector(v); clearError("gradeDirector"); }} placeholder="请输入级部主任姓名" />
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
                  <IconDropdown
                    tooltip="导出"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>}
                    options={["勾选的数据", "全部数据"]}
                    disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                    onSelect={opt => {
                      if (opt === "勾选的数据") {
                        const idSet = new Set(selectedIds);
                        doExport(rows.filter(r => idSet.has(r.id)));
                      } else {
                        doExport(rows);
                      }
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
                        style={{ color: sortField !== "submitTime" || sortDir !== "desc" ? teal : "#9ca3af" }}
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
                    <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" onClick={() => setRows(INITIAL_ROWS)}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                      </svg>
                    </button>
                  </Tooltip>
                </div>
              </div>

              <DataTable
                columns={COLUMNS}
                rows={sorted}
                minWidth={1000}
                onSelectionChange={setSelectedIds}
                onRowClick={r => { setEditRecord(r as CivilizedClassRow); }}
              />

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
