"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { ChevronDown, Clock, Search, X, Plus } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { DataTable, type ColDef } from "./DataTable";
import { useStudentInfo, type StudentInfoRecord, type StudentInfoFilters } from "@/hooks/use-research-dashboard";
import { JDY_CONFIG, STUDENT_INFO_WIDGET_IDS, jdyCreate, jdyUpdate, jdyUploadFiles } from "@/lib/jdy-api";
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

const H = STUDENT_INFO_WIDGET_IDS;

const COLUMNS: ColDef<StudentInfoRecord>[] = [
  { key: "姓名",     label: "姓名" },
  { key: "性别",     label: "性别" },
  { key: "班级名称", label: "班级" },
  { key: "宏德学号", label: "学号" },
  { key: "学生本人电话",   label: "联系电话" },
  { key: "监护人1姓名",    label: "监护人" },
  { key: "监护人1联系",    label: "监护人电话" },
  { key: "宿舍号",   label: "宿舍号" },
  { key: "提交人",   label: "提交人", minWidth: 80 },
  { key: "提交时间", label: "提交时间", minWidth: 160 },
];

const SORT_OPTIONS: { label: string; field: keyof StudentInfoRecord }[] = [
  { label: "提交时间", field: "提交时间" },
  { label: "姓名", field: "姓名" },
  { label: "班级名称", field: "班级名称" },
  { label: "性别", field: "性别" },
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

function ImageField({ files, onChange, label, existingUrls }: { files: File[]; onChange: (f: File[]) => void; label: string; existingUrls?: string[] }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const previews = useMemo(() => files.map(f => URL.createObjectURL(f)), [files]);
  useEffect(() => { return () => previews.forEach(url => URL.revokeObjectURL(url)); }, [previews]);
  return (<div>
    <div className="flex flex-wrap gap-2 mb-2">
      {(existingUrls ?? []).map((url, i) => (
        <div key={`e${i}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 shrink-0">
          <img src={url} alt="" className="w-full h-full object-cover" />
        </div>))}
      {previews.map((url, i) => (
        <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group shrink-0">
          <img src={url} alt="" className="w-full h-full object-cover" />
          <button onClick={() => onChange(files.filter((_, j) => j !== i))} className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"><X className="w-3 h-3 text-gray-500" /></button>
        </div>))}
      <button type="button" onClick={() => inputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:border-emerald-300 hover:text-emerald-400 transition-colors shrink-0">
        <Plus className="w-4 h-4" /><span className="text-[9px] leading-none">上传</span>
      </button>
    </div>
    <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) onChange([...files, ...Array.from(e.target.files)]); e.target.value = ""; }} />
    <p className="text-xs text-gray-400" style={{ marginTop: 2 }}>{label}</p>
  </div>);
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(180deg, ${teal}, #5BC8F5)` }} />
      <span className="text-lg font-semibold tracking-wide" style={{ color: "#374151" }}>{title}</span>
      <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.06)" }} />
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────

function StudentDrawer({ record, onClose, onEdit }: { record: StudentInfoRecord | null; onClose: () => void; onEdit: (r: StudentInfoRecord) => void }) {
  useEffect(() => { if (!record) return; function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); } document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [record, onClose]);

  return (<>
    <div className="fixed inset-0 z-40 transition-opacity duration-300" style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }} onClick={onClose} />
    <div className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl" style={{ width: 520, maxWidth: "100vw", background: "#fff", transform: record ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
      {record && (<>
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-semibold text-blue-500 mb-1">{record.班级名称 || "—"}</p>
            <h2 className="text-base font-bold text-gray-900 leading-snug">{record.姓名 || "—"}</h2>
          </div>
          <button onClick={() => { onEdit(record); onClose(); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors mr-2" style={{ background: "rgba(0,176,149,0.08)", color: teal }}>编辑</button>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <Section title="身份信息">
            {kv("学号", record.宏德学号)}{kv("性别", record.性别)}{kv("民族", record.民族)}
            {kv("出生日期", record.出生日期)}{kv("年龄", String(record.年龄))}{kv("政治面貌", record.政治面貌)}
            {kv("学生本人电话", record.学生本人电话)}{kv("户籍地址", record.户籍地址)}{kv("现居地址", record.现居地址)}
          </Section>
          <Section title="监护人信息">
            {kv("监护人1姓名", record.监护人1姓名)}{kv("监护人1关系", record.监护人1角色)}{kv("监护人1电话", record.监护人1联系)}{kv("监护人1工作单位", record.监护人1工作单位)}
            {kv("监护人2姓名", record.监护人2姓名)}{kv("监护人2关系", record.监护人2角色)}{kv("监护人2电话", record.监护人2联系)}{kv("监护人2工作单位", record.监护人2工作单位)}
          </Section>
          <Section title="就读信息">
            {kv("年级", record.年级名称)}{kv("班级", record.班级名称)}{kv("班主任", record.班主任)}{kv("级部", record.级部)}
            {kv("学生类型", record.学生类型)}{kv("毕业学校", record.毕业学校)}
          </Section>
          <Section title="身体与资助">
            {kv("既往病史", record.既往病史)}{kv("是否残疾", record.是否残疾)}
            {kv("寄宿生补助", record.享受寄宿生生活补助金额)}{kv("营养改善补助", record.享受营养改善计划补助金额)}
            {kv("建档立卡贫困户", record.是建档立卡贫困户)}{kv("脱贫户子女", record.建档立卡脱贫户子女)}
            {kv("随迁子女", record.随迁子女入)}{kv("留守儿童", record.在校农村留守儿童)}
          </Section>
          <Section title="宿舍">
            {kv("入住状态", record.宿舍入住状态)}{kv("宿舍楼栋", record.宿舍楼栋)}{kv("宿舍号", record.宿舍号)}
          </Section>
          <Section title="选科">
            {kv("选科科目", record.选科科目)}{kv("选科方向", record.选科方向)}
            {kv("选科1", record.选科1)}{kv("选科2", record.选科2)}{kv("外语选科", record.外语选科)}
          </Section>
          {record.备注 ? <Section title="备注"><p className="text-base text-gray-800 leading-relaxed">{record.备注}</p></Section> : null}
        </div>
      </>)}
    </div>
  </>);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<section><p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</p><div className="grid grid-cols-2 gap-x-6 gap-y-4">{children}</div></section>);
}
function kv(label: string, value: string) {
  return (<div><p className="text-sm text-gray-400 mb-0.5">{label}</p><p className="text-base font-medium text-gray-800">{value || "—"}</p></div>);
}

// ── Toolbar helpers ──────────────────────────────────────────────

function Tooltip({ text, disabled, children }: { text: string; disabled?: boolean; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (<div className="relative flex items-center justify-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>{children}
    {visible && !disabled && (<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white px-2.5 py-1.5 rounded-md pointer-events-none z-50" style={{ background: "rgba(30,30,30,0.88)", backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}><div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderBottomColor: "rgba(30,30,30,0.88)" }} />{text}</div>)}
  </div>);
}

function IconDropdown({ icon, tooltip, options, onSelect, disabledOptions }: { icon: React.ReactNode; tooltip: string; options: string[]; onSelect?: (o: string) => void; disabledOptions?: string[] }) {
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
  return (<div className="relative shrink-0 inline-block" ref={ref}><button onClick={() => setOpen(v => !v)} className="flex items-center gap-2 h-9 px-4 text-[15px] font-semibold rounded-xl transition-all duration-150 shrink-0" style={{ minWidth: 200, background: "white", color: "#374151", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}><span className="flex-1 text-left">{currentLabel}</span><ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: "#9ca3af", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} /></button>
    {open && (<div className="absolute left-0 top-full mt-2 rounded-2xl overflow-hidden z-50" style={{ minWidth: 200, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)" }}>{modeOptions.map((opt, i) => { const isSelected = opt.value === value; return (<button key={opt.value} onClick={() => { setOpen(false); onChange(opt.value); }} className="w-full text-left px-4 h-11 text-[15px] font-medium transition-colors duration-100" style={{ color: isSelected ? teal : "#374151", background: isSelected ? "rgba(0,176,149,0.06)" : "transparent", borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>{opt.label}</button>); })}</div>)}
  </div>);
}

// ── Main component ───────────────────────────────────────────────

export function StudentRosterPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [mode, setMode] = useState<Mode>("all-permitted");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof StudentInfoRecord>("提交时间");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<StudentInfoRecord | null>(null);

  // Form state
  const [editRecord, setEditRecord] = useState<StudentInfoRecord | null>(null);
  const [name, setName] = useState(""); const [formerName, setFormerName] = useState("");
  const [idCard, setIdCard] = useState(""); const [gender, setGender] = useState("");
  const [nation, setNation] = useState(""); const [birthDate, setBirthDate] = useState("");
  const [political, setPolitical] = useState(""); const [phone, setPhone] = useState("");
  const [householdType, setHouseholdType] = useState(""); const [regAddress, setRegAddress] = useState("");
  const [address, setAddress] = useState(""); const [g1Name, setG1Name] = useState("");
  const [g1Relation, setG1Relation] = useState(""); const [g1Phone, setG1Phone] = useState("");
  const [g1Work, setG1Work] = useState(""); const [g2Name, setG2Name] = useState("");
  const [g2Relation, setG2Relation] = useState(""); const [g2Phone, setG2Phone] = useState("");
  const [g2Work, setG2Work] = useState(""); const [campus, setCampus] = useState("");
  const [gradeAlias, setGradeAlias] = useState(""); const [gradeName, setGradeName] = useState("");
  const [className, setClassName] = useState(""); const [classTeacher, setClassTeacher] = useState("");
  const [gradeLevel, setGradeLevel] = useState(""); const [studentType, setStudentType] = useState("");
  const [gradSchool, setGradSchool] = useState(""); const [medicalHistory, setMedicalHistory] = useState("");
  const [isDisabled, setIsDisabled] = useState(""); const [boardingSubsidy, setBoardingSubsidy] = useState("");
  const [nutritionSubsidy, setNutritionSubsidy] = useState(""); const [isPoor, setIsPoor] = useState("");
  const [isPovertyRelief, setIsPovertyRelief] = useState(""); const [isMigrant, setIsMigrant] = useState("");
  const [isLeftBehind, setIsLeftBehind] = useState(""); const [remark, setRemark] = useState("");
  const [dormStatus, setDormStatus] = useState(""); const [dormBuilding, setDormBuilding] = useState("");
  const [dormNo, setDormNo] = useState(""); const [bedNo, setBedNo] = useState("");
  const [electiveSubject, setElectiveSubject] = useState(""); const [electiveDirection, setElectiveDirection] = useState("");
  const [elective1, setElective1] = useState(""); const [elective2, setElective2] = useState("");
  const [foreignLang, setForeignLang] = useState(""); const [examNo, setExamNo] = useState("");
  const [idPhoto, setIdPhoto] = useState<File[]>([]); const [lifePhoto, setLifePhoto] = useState<File[]>([]);
  const [regStatus, setRegStatus] = useState(""); const [regStatusOps, setRegStatusOps] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const { raw, isPending, isError, refetch, isFetching } = useStudentInfo();

  const isEditMode = editRecord !== null;
  const existingIdPhotoUrls = useMemo(() => isEditMode ? editRecord!.证件照.map(f => f.url) : [], [editRecord, isEditMode]);
  const existingLifePhotoUrls = useMemo(() => isEditMode ? editRecord!.生活照.map(f => f.url) : [], [editRecord, isEditMode]);

  useEffect(() => { if (!sortOpen) return; function h(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [sortOpen]);

  // Pre-fill form
  useEffect(() => {
    if (!editRecord) return;
    setRegStatus(editRecord.学籍状态); setRegStatusOps(editRecord.学籍状态_运营);
    setName(editRecord.姓名); setFormerName(editRecord.曾用名); setIdCard(editRecord.身份证号);
    setGender(editRecord.性别); setNation(editRecord.民族);
    setBirthDate(editRecord.出生日期 ? editRecord.出生日期.slice(0, 10) : "");
    setPolitical(editRecord.政治面貌); setRegAddress(editRecord.户籍地址);
    setPhone(editRecord.学生本人电话); setAddress(editRecord.现居地址);
    setG1Name(editRecord.监护人1姓名); setG1Relation(editRecord.监护人1角色); setG1Phone(editRecord.监护人1联系);
    setG1Work(editRecord.监护人1工作单位); setG2Name(editRecord.监护人2姓名); setG2Relation(editRecord.监护人2角色);
    setG2Phone(editRecord.监护人2联系); setG2Work(editRecord.监护人2工作单位);
    setGradeAlias(editRecord.年级别名); setGradeName(editRecord.年级名称);
    setClassName(editRecord.班级名称); setClassTeacher(editRecord.班主任); setGradeLevel(editRecord.级部);
    setStudentType(editRecord.学生类型); setGradSchool(editRecord.毕业学校);
    setMedicalHistory(editRecord.既往病史); setIsDisabled(editRecord.是否残疾);
    setBoardingSubsidy(editRecord.享受寄宿生生活补助金额); setNutritionSubsidy(editRecord.享受营养改善计划补助金额);
    setIsPoor(editRecord.是建档立卡贫困户); setIsPovertyRelief(editRecord.建档立卡脱贫户子女);
    setIsMigrant(editRecord.随迁子女入); setIsLeftBehind(editRecord.在校农村留守儿童);
    setRemark(editRecord.备注); setDormStatus(editRecord.宿舍入住状态); setDormBuilding(editRecord.宿舍楼栋);
    setDormNo(editRecord.宿舍号);
    setElectiveSubject(editRecord.选科科目); setElectiveDirection(editRecord.选科方向);
    setElective1(editRecord.选科1); setElective2(editRecord.选科2); setForeignLang(editRecord.外语选科);
    setIdPhoto([]); setLifePhoto([]);
  }, [editRecord]);

  // Restore draft
  useEffect(() => {
    if (editRecord || mode !== "add-only") return;
    try { const d = JSON.parse(localStorage.getItem("student-roster-draft") || "{}");
      if (d.name) setName(d.name); if (d.gender) setGender(d.gender); if (d.phone) setPhone(d.phone);
      if (d.className) setClassName(d.className); if (d.g1Name) setG1Name(d.g1Name);
      if (d.g1Phone) setG1Phone(d.g1Phone); if (d.g1Relation) setG1Relation(d.g1Relation);
      if (d.address) setAddress(d.address); if (d.dormNo) setDormNo(d.dormNo);
      if (d.electiveSubject) setElectiveSubject(d.electiveSubject);
    } catch {}
  }, [mode, editRecord]);

  // ── API logic ────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "请输入姓名";
    if (!gender.trim()) errs.gender = "请选择性别";
    if (!className.trim()) errs.className = "请输入班级名称";
    if (!g1Name.trim()) errs.g1Name = "请输入监护人1姓名";
    if (!g1Phone.trim()) errs.g1Phone = "请输入监护人1电话";
    if (!g1Relation.trim()) errs.g1Relation = "请输入监护人1关系";
    if (!electiveSubject.trim()) errs.electiveSubject = "请选择选科科目";
    if (!electiveDirection.trim()) errs.electiveDirection = "请输入选科方向";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (f: string) => { if (errors[f]) setErrors(p => { const n = { ...p }; delete n[f]; return n; }); };

  const buildData = (photoKeys?: { idPhoto?: string[]; lifePhoto?: string[] }) => {
    const now = new Date().toISOString();
    const data: Record<string, { value: unknown }> = {
      [H.学籍状态_教务]: { value: regStatus }, [H.学籍状态_运营]: { value: regStatusOps },
      [H.姓名]: { value: name }, [H.曾用名]: { value: formerName }, [H.身份证号]: { value: idCard },
      [H.性别]: { value: gender }, [H.民族]: { value: nation },
      [H.出生日期]: { value: birthDate }, [H.政治面貌]: { value: political },
      [H.户籍地址]: { value: regAddress },
      [H.学生本人电话]: { value: phone }, [H.现居地址]: { value: address },
      [H.监护人1姓名]: { value: g1Name }, [H.监护人1角色]: { value: g1Relation }, [H.监护人1电话]: { value: g1Phone },
      [H.监护人1工作单位]: { value: g1Work }, [H.监护人2姓名]: { value: g2Name }, [H.监护人2角色]: { value: g2Relation },
      [H.监护人2电话]: { value: g2Phone }, [H.监护人2工作单位]: { value: g2Work },
      [H.校区]: { value: campus }, [H.年级别名]: { value: gradeAlias }, [H.年级名称]: { value: gradeName },
      [H.班级名称]: { value: className }, [H.班主任]: { value: classTeacher }, [H.级部]: { value: gradeLevel },
      [H.学生类型]: { value: studentType }, [H.毕业学校]: { value: gradSchool },
      [H.既往病史]: { value: medicalHistory }, [H.是否残疾]: { value: isDisabled },
      [H.享受寄宿生生活补助金额]: { value: boardingSubsidy }, [H.享受营养改善计划补助金额]: { value: nutritionSubsidy },
      [H.是建档立卡贫困户]: { value: isPoor }, [H.建档立卡脱贫户子女]: { value: isPovertyRelief },
      [H.随迁子女入]: { value: isMigrant }, [H.在校农村留守儿童]: { value: isLeftBehind },
      [H.备注]: { value: remark }, [H.宿舍入住状态]: { value: dormStatus }, [H.宿舍楼栋]: { value: dormBuilding },
      [H.宿舍号]: { value: dormNo }, [H.床位]: { value: bedNo },
      [H.选科科目]: { value: electiveSubject }, [H.选科方向]: { value: electiveDirection },
      [H.选科1]: { value: elective1 }, [H.选科2]: { value: elective2 }, [H.外语选科]: { value: foreignLang },
      [H.考号]: { value: examNo },
      [H.提交人]: { value: isEditMode ? editRecord!.提交人 : (currentUser?.name ?? "") },
      [H.提交时间]: { value: isEditMode ? editRecord!.提交时间 : now },
    };
    if (photoKeys?.idPhoto) data[H.证件照] = { value: photoKeys.idPhoto };
    if (photoKeys?.lifePhoto) data[H.生活照] = { value: photoKeys.lifePhoto };
    return data;
  };

  const handleSubmit = async () => {
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      const allPhotos = [...idPhoto, ...lifePhoto];
      const transaction_id = allPhotos.length > 0 ? crypto.randomUUID() : undefined;
      let idKeys: string[] | undefined;
      let lifeKeys: string[] | undefined;

      if (transaction_id) {
        const result = await jdyUploadFiles(allPhotos, JDY_CONFIG.STUDENT_INFO.app_id, JDY_CONFIG.STUDENT_INFO.entry_id, transaction_id);
        if (idPhoto.length > 0) { idKeys = result.keys.slice(0, idPhoto.length); }
        if (lifePhoto.length > 0) { lifeKeys = result.keys.slice(idPhoto.length); }
      }

      const data = buildData({ idPhoto: idKeys, lifePhoto: lifeKeys });
      if (isEditMode) {
        await jdyUpdate({ app_id: JDY_CONFIG.STUDENT_INFO.app_id, entry_id: JDY_CONFIG.STUDENT_INFO.entry_id, data_id: editRecord!._id, data, data_creator: currentUser?.userId, transaction_id });
      } else {
        await jdyCreate({ app_id: JDY_CONFIG.STUDENT_INFO.app_id, entry_id: JDY_CONFIG.STUDENT_INFO.entry_id, data, data_creator: currentUser?.userId, transaction_id, is_start_workflow: false, is_start_trigger: false });
      }
      queryClient.invalidateQueries({ queryKey: ["student-info", "list"] });
      handleClearForm(); if (isEditMode) setEditRecord(null);
      setMode("all-permitted"); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { alert(err instanceof Error ? err.message : "提交失败，请重试"); }
    finally { setSubmitting(false); }
  };

  const clearFormFields = () => {
    setRegStatus(""); setRegStatusOps(""); setName(""); setFormerName(""); setIdCard("");
    setGender(""); setNation(""); setBirthDate(""); setPolitical(""); setHouseholdType("");
    setRegAddress(""); setPhone(""); setAddress(""); setG1Name(""); setG1Relation(""); setG1Phone("");
    setG1Work(""); setG2Name(""); setG2Relation(""); setG2Phone(""); setG2Work("");
    setCampus(""); setGradeAlias(""); setGradeName(""); setClassName(""); setClassTeacher(""); setGradeLevel("");
    setStudentType(""); setGradSchool(""); setMedicalHistory(""); setIsDisabled("");
    setBoardingSubsidy(""); setNutritionSubsidy(""); setIsPoor(""); setIsPovertyRelief("");
    setIsMigrant(""); setIsLeftBehind(""); setRemark(""); setDormStatus(""); setDormBuilding("");
    setDormNo(""); setBedNo(""); setElectiveSubject(""); setElectiveDirection("");
    setElective1(""); setElective2(""); setForeignLang(""); setExamNo("");
    setIdPhoto([]); setLifePhoto([]); setErrors({});
  };

  const handleClearForm = () => { clearFormFields(); localStorage.removeItem("student-roster-draft"); };

  const handleSaveDraft = () => {
    if (!name.trim() && !className.trim()) return;
    localStorage.setItem("student-roster-draft", JSON.stringify({
      name, gender, phone, className, g1Name, g1Phone, g1Relation, address, dormNo, electiveSubject,
    }));
  };

  const doExport = (data: StudentInfoRecord[]) => {
    const h = COLUMNS.map(c => c.label); const rows = data.map(r => COLUMNS.map(c => String(r[c.key as keyof StudentInfoRecord] ?? "")));
    const ws = XLSX.utils.aoa_to_sheet([h, ...rows]); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "学生花名册"); XLSX.writeFile(wb, `学生花名册_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ── Table data ───────────────────────────────────────────────

  const handleModeChange = (newMode: Mode) => {
    if (newMode === "add-only") { setEditRecord(null); clearFormFields(); }
    else setEditRecord(null);
    setMode(newMode);
  };

  const tableData = useMemo(() => {
    if (mode === "add-manage-own") return raw.filter(r => r.提交人 === currentUser?.name);
    return raw;
  }, [raw, mode, currentUser]);

  const filtered = tableData.filter(r => r.姓名.includes(search) || r.班级名称.includes(search) || r.宏德学号?.includes(search));
  const sorted = [...filtered].sort((a, b) => { const va = String(a[sortField] ?? ""); const vb = String(b[sortField] ?? ""); return sortDir === "desc" ? vb.localeCompare(va, "zh") : va.localeCompare(vb, "zh"); });

  // ── Render ───────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader breadcrumbs={[{ label: "学生档案" }, { label: "学生花名册", active: true }]} onMenuOpen={onMenuOpen} />
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6">
          <ModeSelector value={mode} onChange={handleModeChange} />
        </div>

        {(mode === "add-only" || editRecord) ? (
          <main className="max-w-6xl mx-auto px-3 md:px-6 pb-24">
            <div className="mb-8 text-center"><div className="inline-flex flex-col items-center"><h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>{editRecord ? "编辑学生信息" : "学生花名册"}</h2><div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />{editRecord && <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>修改表单字段后点击保存</p>}</div></div>

            <div className="rounded-[28px] shadow-sm border border-gray-100 bg-white"><div className="p-8 space-y-10">
              <SectionHeader title="学籍信息" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="学籍状态-教务"><SelectField value={regStatus} onChange={setRegStatus} options={["招生【增加】","转入【增加】","复读【增加】","复学【增加】","留级【增加】","其他【增加】","毕业【减少】","结业【减少】","休学【减少】","退学【减少】","转出【减少】","死亡【减少】","其他【减少】"]} /></Field>
                <Field label="学籍状态-运营"><SelectField value={regStatusOps} onChange={setRegStatusOps} options={["招生【增加】","转入【增加】","复读【增加】","复学【增加】","留级【增加】","其他【增加】","毕业【减少】","结业【减少】","休学【减少】","退学【减少】","转出【减少】","死亡【减少】","其他【减少】"]} /></Field>
              </div>
              <SectionHeader title="照片" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="证件照"><ImageField files={idPhoto} onChange={setIdPhoto} label="支持 jpg/png 格式，建议尺寸 120×160 像素" existingUrls={existingIdPhotoUrls} /></Field>
                <Field label="生活照"><ImageField files={lifePhoto} onChange={setLifePhoto} label="支持 jpg/png 格式，建议尺寸 120×160 像素" existingUrls={existingLifePhotoUrls} /></Field>
              </div>

              <SectionHeader title="身份信息" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="姓名" required><TextInput value={name} onChange={v => { setName(v); clearError("name"); }} />{errors.name && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.name}</p>}</Field>
                <Field label="曾用名"><TextInput value={formerName} onChange={setFormerName} /></Field>
                <Field label="性别" required><SelectField value={gender} onChange={v => { setGender(v); clearError("gender"); }} options={["男","女"]} />{errors.gender && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.gender}</p>}</Field>
                <Field label="民族"><TextInput value={nation} onChange={setNation} /></Field>
                <Field label="身份证号"><TextInput value={idCard} onChange={setIdCard} /></Field>
                <Field label="出生日期"><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="form-input" style={{ color: birthDate ? "#1d1d1f" : "#9ca3af" }} onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} /></Field>
                <Field label="政治面貌"><SelectField value={political} onChange={setPolitical} options={["群众","共青团员","中共党员"]} /></Field>
                <Field label="本人手机号"><TextInput value={phone} onChange={setPhone} /></Field>
                <Field label="户籍地址"><TextInput value={regAddress} onChange={setRegAddress} /></Field>
                <Field label="现居地址"><textarea rows={2} value={address} onChange={e => setAddress(e.target.value)} className="form-input resize-none" onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} /></Field>
              </div>

              <SectionHeader title="监护人信息" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="监护人1 姓名" required><TextInput value={g1Name} onChange={v => { setG1Name(v); clearError("g1Name"); }} />{errors.g1Name && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.g1Name}</p>}</Field>
                <Field label="监护人1 关系" required><TextInput value={g1Relation} onChange={v => { setG1Relation(v); clearError("g1Relation"); }} />{errors.g1Relation && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.g1Relation}</p>}</Field>
                <Field label="监护人1 电话" required><TextInput value={g1Phone} onChange={v => { setG1Phone(v); clearError("g1Phone"); }} />{errors.g1Phone && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.g1Phone}</p>}</Field>
                <Field label="监护人1 工作单位"><TextInput value={g1Work} onChange={setG1Work} /></Field>
                <Field label="监护人2 姓名"><TextInput value={g2Name} onChange={setG2Name} /></Field>
                <Field label="监护人2 关系"><TextInput value={g2Relation} onChange={setG2Relation} /></Field>
                <Field label="监护人2 电话"><TextInput value={g2Phone} onChange={setG2Phone} /></Field>
                <Field label="监护人2 工作单位"><TextInput value={g2Work} onChange={setG2Work} /></Field>
              </div>

              <SectionHeader title="就读信息" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="校区"><SelectField value={campus} onChange={setCampus} options={["北区校内","南区校外"]} /></Field>
                <Field label="年级别名"><TextInput value={gradeAlias} onChange={setGradeAlias} /></Field>
                <Field label="年级名称"><TextInput value={gradeName} onChange={setGradeName} /></Field>
                <Field label="班级名称" required><TextInput value={className} onChange={v => { setClassName(v); clearError("className"); }} />{errors.className && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.className}</p>}</Field>
                <Field label="班主任"><TextInput value={classTeacher} onChange={setClassTeacher} /></Field>
                <Field label="级部"><TextInput value={gradeLevel} onChange={setGradeLevel} /></Field>
                <Field label="学生类型"><SelectField value={studentType} onChange={setStudentType} options={["文化生","体育生","舞蹈生","音乐声"]} /></Field>
                <Field label="毕业学校"><TextInput value={gradSchool} onChange={setGradSchool} /></Field>
              </div>

              <SectionHeader title="身体与资助" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="既往病史"><TextInput value={medicalHistory} onChange={setMedicalHistory} /></Field>
                <Field label="是否残疾"><SelectField value={isDisabled} onChange={setIsDisabled} options={["是","否"]} /></Field>
                <Field label="寄宿生补助"><TextInput value={boardingSubsidy} onChange={setBoardingSubsidy} /></Field>
                <Field label="营养改善补助"><TextInput value={nutritionSubsidy} onChange={setNutritionSubsidy} /></Field>
                <Field label="建档立卡贫困户"><SelectField value={isPoor} onChange={setIsPoor} options={["是","否"]} /></Field>
                <Field label="脱贫户子女"><SelectField value={isPovertyRelief} onChange={setIsPovertyRelief} options={["是","否"]} /></Field>
                <Field label="随迁子女"><SelectField value={isMigrant} onChange={setIsMigrant} options={["是","否"]} /></Field>
                <Field label="留守儿童"><SelectField value={isLeftBehind} onChange={setIsLeftBehind} options={["是","否"]} /></Field>
                <Field label="备注"><textarea rows={2} value={remark} onChange={e => setRemark(e.target.value)} className="form-input resize-none" onFocus={e => Object.assign(e.currentTarget.style, focusStyle)} onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} /></Field>
              </div>

              <SectionHeader title="宿舍信息" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="入住状态"><SelectField value={dormStatus} onChange={setDormStatus} options={["是","否"]} /></Field>
                <Field label="宿舍楼栋"><TextInput value={dormBuilding} onChange={setDormBuilding} /></Field>
                <Field label="宿舍号"><TextInput value={dormNo} onChange={setDormNo} /></Field>
                <Field label="床位"><TextInput value={bedNo} onChange={setBedNo} /></Field>
              </div>

              <SectionHeader title="选科信息" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <Field label="选科科目" required><SelectField value={electiveSubject} onChange={v => { setElectiveSubject(v); clearError("electiveSubject"); }} options={["物化生","物化政","物化地","物生政","物生地","物政地"]} />{errors.electiveSubject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.electiveSubject}</p>}</Field>
                <Field label="选科方向" required><TextInput value={electiveDirection} onChange={v => { setElectiveDirection(v); clearError("electiveDirection"); }} />{errors.electiveDirection && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{errors.electiveDirection}</p>}</Field>
                <Field label="选科1"><TextInput value={elective1} onChange={setElective1} /></Field>
                <Field label="选科2"><TextInput value={elective2} onChange={setElective2} /></Field>
                <Field label="外语选科"><SelectField value={foreignLang} onChange={setForeignLang} options={["英语","日语"]} /></Field>
                <Field label="考号"><TextInput value={examNo} onChange={setExamNo} /></Field>
              </div>
            </div></div>

            <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">
              {editRecord ? (<button className="btn-secondary" onClick={() => { setEditRecord(null); handleClearForm(); }}>取消编辑</button>)
              : (<><button className="btn-secondary" onClick={handleClearForm}>清空数据</button><button className="btn-secondary" onClick={handleSaveDraft}>保存草稿</button></>)}
              <div className="flex-1" />
              <button onClick={handleSubmit} disabled={submitting} className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px disabled:opacity-60" style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }}>{submitting ? "提交中..." : (editRecord ? "保存" : "提交")}</button>
            </div>
          </main>
        ) : (
          <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6 pb-24">
            <div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-sm" style={{ minHeight: 500 }}>
              <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
                <div className="flex items-center gap-0.5">
                  <IconDropdown tooltip="导出" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>} options={["勾选的数据", "全部数据"]} disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined} onSelect={opt => { if (opt === "勾选的数据") { const idSet = new Set(selectedIds); doExport(raw.filter(r => idSet.has(r.id))); } else doExport(raw); }} />
                  <IconDropdown tooltip="操作记录" icon={<Clock className="w-5 h-5" />} options={["批量修改记录", "批量打印模板记录"]} />
                </div>
                <div className="flex-1" /><SearchBox value={search} onChange={setSearch} />
                <button className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-sm transition-all hover:bg-black/[0.05] shrink-0" style={{ color: "#8c8c8c", fontSize: 15 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>筛选</button>
                <div className="flex items-center gap-0.5 pl-2 border-l border-gray-200" style={{ color: "#9ca3af" }}>
                  <div className="relative" ref={sortRef}><Tooltip text="排序"><button onClick={() => setSortOpen(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" style={{ color: sortField !== "提交时间" || sortDir !== "desc" ? teal : "#9ca3af" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M6 12h12" /><path d="M9 18h6" /></svg></button></Tooltip>
                    {sortOpen && (<div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 160, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}><div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2"><span className="text-xs font-medium" style={{ color: "#9ca3af" }}>排序字段</span><div className="flex-1" /><button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-black/[0.04]" style={{ color: teal }}>{sortDir === "desc" ? "降序" : "升序"}</button></div>{SORT_OPTIONS.map(opt => { const active = sortField === opt.field; return (<button key={opt.field} onClick={() => { setSortField(opt.field); setSortOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] flex items-center gap-2" style={{ color: active ? teal : "#374151", fontWeight: active ? 600 : 400 }}>{opt.label}{active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto"><polyline points="20 6 9 17 4 12" /></svg>}</button>); })}</div>)}
                  </div>
                  <Tooltip text="刷新"><button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" onClick={() => refetch()} disabled={isFetching}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFetching ? "animate-spin" : ""}><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg></button></Tooltip>
                </div>
              </div>
              {isPending ? (<div className="flex items-center justify-center py-20 text-sm text-gray-400">加载中...</div>)
              : isError ? (<div className="flex items-center justify-center py-20 text-sm text-red-400">加载失败，请稍后重试</div>)
              : (<DataTable columns={COLUMNS} rows={sorted} minWidth={1100} onSelectionChange={setSelectedIds} onRowClick={r => { setSelectedRecord(r as StudentInfoRecord); }} />)}
            </div>
          </div>
        )}
      </div>
      <StudentDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} onEdit={r => { setSelectedRecord(null); setEditRecord(r); }} />
    </div>
  );
}
