"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { X, Search, Upload, Image as ImageIcon, FileText, Menu, ChevronDown, Trash2, Clock } from "lucide-react";
import * as XLSX from "xlsx";
import { useCourses, useTeachingResearchGroups, useTermInfo, useResearchDashboard, useDepartmentMembers, type ResearchRecord } from "@/hooks/use-research-dashboard";
import { useFormPermissions } from "@/hooks/use-form-permissions";
import { JDY_CONFIG, WIDGET_IDS, jdyCreate, jdyUpdate, jdyDelete, jdyBatchDelete, jdyUploadFiles } from "@/lib/jdy-api";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/user-context";
import { DataTable, type ColDef } from "./DataTable";
import { PageHeader } from "./PageHeader";
import { DeptStaffPicker } from "@/components/ui/DeptStaffPicker";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Tooltip({ text, disabled, children }: { text: string; disabled?: boolean; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && !disabled && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white px-2.5 py-1.5 rounded-md pointer-events-none z-50" style={{ background: "rgba(30,30,30,0.88)", backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderBottomColor: "rgba(30,30,30,0.88)" }} />
          {text}
        </div>
      )}
    </div>
  );
}

function IconDropdown({ icon, tooltip, options, onSelect, disabledOptions }: {
  icon: React.ReactNode; tooltip: string; options: string[]; onSelect?: (o: string) => void; disabledOptions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const disabledSet = new Set(disabledOptions ?? []);
  useEffect(() => { if (!open) return; function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  return (
    <div className="relative" ref={ref}>
      <Tooltip text={tooltip} disabled={open}>
        <button onClick={() => setOpen(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-black/[0.05]" style={{ color: "#8c8c8c" }}>{icon}</button>
      </Tooltip>
      {open && (
        <div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 148, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
          {options.map(opt => { const d = disabledSet.has(opt); return (<button key={opt} onClick={() => { if (!d) { setOpen(false); onSelect?.(opt); } }} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: "#374151" }} disabled={d}>{opt}</button>); })}
        </div>
      )}
    </div>
  );
}

function SearchBox2({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [expanded, setExpanded] = useState(false); const inputRef = useRef<HTMLInputElement>(null);
  function expand() { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 50); }
  function collapse() { if (!value) setExpanded(false); }
  return (
    <div className="flex items-center rounded-lg border transition-all duration-200 bg-white overflow-hidden" style={{ width: expanded ? 200 : 32, height: 32, borderColor: expanded ? "#d1d5db" : "transparent", background: expanded ? "white" : "transparent" }}>
      <button onClick={expand} className="flex items-center justify-center w-8 h-8 shrink-0 transition-colors" style={{ color: expanded ? teal : "#8c8c8c" }}><Search className="w-4 h-4" /></button>
      {expanded && <input ref={inputRef} type="text" placeholder="搜索数据" value={value} onChange={e => onChange(e.target.value)} onBlur={collapse} className="outline-none text-sm bg-transparent pr-2 w-full" style={{ color: "#374151" }} />}
    </div>
  );
}

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (<div style={{ background: error ? "#fffbe6" : "transparent", borderRadius: 8, padding: error ? "10px 12px" : 0 }}><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}{children}{error && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>{error}</p>}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input type="text" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options, loading }: { value: string; onChange: (v: string) => void; options: string[]; loading?: boolean }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} disabled={loading}><option value="" disabled>{loading ? "加载中..." : ""}</option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [timeStr, setTimeStr] = useState(
    value ? value.slice(11, 16) : `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onClick(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); }
    if (open) { document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick); }
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  const selectDay = (day: number) => {
    const m = String(viewMonth).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    onChange(`${viewYear}-${m}-${d}T${timeStr}`);
    setOpen(false);
  };

  const selectNow = () => {
    const n = new Date();
    const y = n.getFullYear();
    const m = String(n.getMonth() + 1).padStart(2, "0");
    const d = String(n.getDate()).padStart(2, "0");
    const t = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
    setTimeStr(t);
    onChange(`${y}-${m}-${d}T${t}`);
    setOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate();
  const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prevMonth = () => { if (viewMonth === 1) { setViewYear(viewYear - 1); setViewMonth(12); } else setViewMonth(viewMonth - 1); };
  const nextMonth = () => { if (viewMonth === 12) { setViewYear(viewYear + 1); setViewMonth(1); } else setViewMonth(viewMonth + 1); };

  const display = value
    ? value.replace("T", " ").slice(0, 16)
    : "";

  return (<div ref={containerRef} className="relative">
    <input type="text" readOnly value={display} placeholder="请选择日期时间" className="form-input cursor-pointer" style={{ color: value ? "#374151" : "#9ca3af" }} onClick={() => setOpen(!open)} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
    {open && (<div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex gap-4" style={{ width: 380 }}>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">‹</button>
          <span className="text-base font-medium text-gray-700">{viewYear}年{viewMonth}月</span>
          <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">›</button>
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {["日","一","二","三","四","五","六"].map((w) => (<div key={w} className="text-center text-xs text-gray-400 py-0.5">{w}</div>))}
          {cells.map((c, i) => (<div key={i} className={`text-center py-1 text-sm rounded-md ${c ? "cursor-pointer hover:bg-gray-100 text-gray-700" : ""}`} onClick={() => c && selectDay(c)}>{c ?? ""}</div>))}
        </div>
      </div>
      <div className="flex flex-col gap-3 border-l border-gray-100 pl-4" style={{ width: 120 }}>
        <p className="text-xs text-gray-400">选择时间</p>
        <input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" style={{ color: "#374151" }} />
        <button type="button" onClick={selectNow} className="w-full py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ backgroundColor: teal, color: "white" }}>此刻</button>
        <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="w-full py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">清除</button>
      </div>
    </div>)}
  </div>);
}

function WeekInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (<div className="flex items-center gap-2"><span className="text-base shrink-0 text-gray-500">第</span><input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="form-input text-center flex-1" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /><span className="text-base shrink-0 text-gray-500">周</span></div>);
}

function Textarea({ value, onChange, rows = 6 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (<textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function FileUpload({ files, onChange, accept, hint }: { files: File[]; onChange: (f: File[]) => void; accept: string; hint: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (<div>
    <div className="flex items-center gap-2 mb-2">
      <div className="flex-1 flex items-center gap-2 border border-dashed border-gray-200 rounded-[10px] px-3.5 py-2.5 cursor-pointer" style={{ fontSize: 13, color: "#9ca3af" }} onClick={() => inputRef.current?.click()}>
        <Upload size={14} className="shrink-0" style={{ color: "#9ca3af" }} />
        <span style={{ color: teal }}>选择</span>
        <span>{hint}</span>
      </div>
      <input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={(e) => { if (e.target.files) onChange([...files, ...Array.from(e.target.files)]); e.target.value = ""; }} />
    </div>
    {files.length > 0 && (<div className="flex flex-wrap gap-2">{files.map((f, i) => (<div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600"><span className="max-w-[160px] truncate">{f.name}</span><X className="w-3 h-3 cursor-pointer hover:text-red-500 flex-shrink-0" onClick={() => onChange(files.filter((_, j) => j !== i))} /></div>))}</div>)}
  </div>);
}

const RESEARCH_COLUMNS: ColDef<ResearchRecord>[] = [
  { key: "学期", label: "学期", minWidth: 80 },
  { key: "教研主题", label: "教研主题", minWidth: 160 },
  { key: "教研学科", label: "教研学科", minWidth: 80 },
  { key: "教研组", label: "教研组", minWidth: 120 },
  { key: "教研组长", label: "教研组长", minWidth: 80 },
  { key: "主持人", label: "主持人", minWidth: 80 },
  { key: "时间", label: "时间", minWidth: 140 },
  { key: "地点", label: "地点", minWidth: 100 },
  { key: "提交人", label: "提交人", minWidth: 80 },
];

const DATA_MODES = ["添加数据", "管理本人创建数据", "组长管理本组数据", "全部有权限数据"] as const;

export function ResearchActivityRecordPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [dataMode, setDataMode] = useState<string>("管理本人创建数据");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const { raw, isPending, isError, refetch, isFetching } = useResearchDashboard();
  const perms = useFormPermissions(JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id);
  const { raw: allGroups } = useTeachingResearchGroups();
  const { raw: deptMembers } = useDepartmentMembers();

  const isGroupLeader = useMemo(() => {
    if (!currentUser) return false;
    return allGroups.some(g => g.教研组长 === currentUser.name);
  }, [allGroups, currentUser]);

  const leaderGroups = useMemo(() => {
    if (!currentUser) return [];
    return allGroups.filter(g => g.教研组长 === currentUser.name).map(g => g.教研组);
  }, [allGroups, currentUser]);

  const tableData = useMemo(() => {
    if (dataMode === DATA_MODES[1]) return raw.filter((r: ResearchRecord) => r.提交人 === currentUser?.name);
    if (dataMode === DATA_MODES[2]) return raw.filter((r: ResearchRecord) => leaderGroups.includes(r.教研组));
    if (dataMode === DATA_MODES[3]) return raw;
    return raw;
  }, [raw, dataMode, currentUser, leaderGroups]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function h(e: MouseEvent) { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropdownOpen]);

  const [tbSearch, setTbSearch] = useState("");
  const [sortField, setSortField] = useState<keyof ResearchRecord>("提交时间");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editRecord, setEditRecord] = useState<ResearchRecord | null>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function h(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [sortOpen]);

  // Pre-fill form when editing an existing record
  useEffect(() => {
    if (!editRecord) return;
    setSemester(editRecord.学期);
    setTopic(editRecord.教研主题);
    setSubject(editRecord.教研学科);
    setDate(editRecord.时间);
    setWeek(editRecord.周次);
    setLocation(editRecord.地点);
    setGroup(editRecord.教研组);
    setGroupLeader(editRecord.教研组长);
    setHost(editRecord.主持人);
    setRecorder(editRecord.记录人 ?? "");
    setParticipants(editRecord.参与人员 ? editRecord.参与人员.split(",").filter(Boolean) : []);
    setExpectedCount(String(editRecord.应到人数 ?? ""));
    setActualCount(String(editRecord.实到人数 ?? ""));
    setAbsentNote(editRecord.备注 ?? "");
    setContentRecord(editRecord.内容记录);
    setExistingPhotos(editRecord.照片 ?? []);
    setExistingAttachments(editRecord.附件 ?? []);
  }, [editRecord]);

  const filtered = useMemo(() => {
    if (!tbSearch.trim()) return tableData;
    const q = tbSearch.trim();
    return tableData.filter(r => r.教研主题.includes(q) || r.教研学科.includes(q) || r.教研组.includes(q) || r.主持人?.includes(q));
  }, [tableData, tbSearch]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => {
    const va = String(a[sortField] ?? ""); const vb = String(b[sortField] ?? "");
    const cmp = va.localeCompare(vb, "zh"); return sortDir === "desc" ? -cmp : cmp;
  }), [filtered, sortField, sortDir]);

  const SORT_OPTIONS: { label: string; field: keyof ResearchRecord }[] = [
    { label: "提交时间", field: "提交时间" },
    { label: "学期", field: "学期" },
    { label: "教研主题", field: "教研主题" },
    { label: "时间", field: "时间" },
  ];

  const doExport = (data: ResearchRecord[]) => {
    const headers = RESEARCH_COLUMNS.map(c => c.label);
    const rows = data.map(r => RESEARCH_COLUMNS.map(c => String((r as unknown as Record<string, unknown>)[c.key] ?? "")));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "教研活动记录");
    XLSX.writeFile(wb, `教研活动记录_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [week, setWeek] = useState("");
  const [location, setLocation] = useState("");
  const [group, setGroup] = useState("");
  const [groupLeader, setGroupLeader] = useState("");
  const [host, setHost] = useState(currentUser?.name ?? "");
  const [recorder, setRecorder] = useState(currentUser?.name ?? "");
  const [participants, setParticipants] = useState<string[]>([]);
  const [expectedCount, setExpectedCount] = useState("");
  const [actualCount, setActualCount] = useState("");
  const [absentNote, setAbsentNote] = useState("");
  const [semester, setSemester] = useState("");
  const [contentRecord, setContentRecord] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingPhotos, setExistingPhotos] = useState<{ name: string; url: string; key?: string }[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<{ name: string; url: string; key?: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const { raw: courseList, isPending: courseLoading } = useCourses();
  const courseOptions = useMemo(() => [...new Set(courseList.map((c) => c.教研学科名).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [courseList]);

  const { raw: termList } = useTermInfo();
  const termOptions = useMemo(() => termList.map(t => t.学期名称).filter(Boolean), [termList]);

  const { raw: groupList, isPending: groupLoading } = useTeachingResearchGroups();
  const groupOptions = useMemo(() => [...new Set(groupList.map((g) => g.教研组).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [groupList]);

  const handleGroupChange = (v: string) => {
    setGroup(v);
    const match = groupList.find((g) => g.教研组 === v);
    if (match) setGroupLeader(match.教研组长);
  };

  useEffect(() => {
    if (dataMode !== DATA_MODES[0]) { setEditRecord(null); setExistingPhotos([]); setExistingAttachments([]); }
  }, [dataMode]);

  const handleClearForm = () => {
    setSemester(""); setTopic(""); setSubject(""); setDate(""); setWeek(""); setLocation("");
    setGroup(""); setGroupLeader(""); setHost(currentUser?.name ?? ""); setRecorder(currentUser?.name ?? "");
    setParticipants([]); setExpectedCount(""); setActualCount("");
    setAbsentNote(""); setContentRecord(""); setPhotos([]); setAttachments([]);
    setExistingPhotos([]); setExistingAttachments([]); setSubmitted(false);
    localStorage.removeItem("research-activity-draft");
  };

  const handleSaveDraft = () => {
    if (!topic.trim() && !subject.trim() && !group.trim()) return;
    localStorage.setItem("research-activity-draft", JSON.stringify({
      semester, topic, subject, date, week, location, group, groupLeader,
      host, recorder, participants, expectedCount, actualCount,
      absentNote, contentRecord,
    }));
  };

  // Restore draft when entering add mode
  useEffect(() => {
    if (editRecord || dataMode !== DATA_MODES[0]) return;
    try {
      const raw = localStorage.getItem("research-activity-draft");
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.semester) setSemester(d.semester);
      if (d.topic) setTopic(d.topic);
      if (d.subject) setSubject(d.subject);
      if (d.date) setDate(d.date);
      if (d.week) setWeek(d.week);
      if (d.location) setLocation(d.location);
      if (d.group) setGroup(d.group);
      if (d.groupLeader) setGroupLeader(d.groupLeader);
      if (d.host) setHost(d.host);
      if (d.recorder) setRecorder(d.recorder);
      if (d.participants) setParticipants(d.participants);
      if (d.expectedCount) setExpectedCount(d.expectedCount);
      if (d.actualCount) setActualCount(d.actualCount);
      if (d.absentNote) setAbsentNote(d.absentNote);
      if (d.contentRecord) setContentRecord(d.contentRecord);
    } catch {}
  }, [dataMode, editRecord]);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toMember = (name: string) => {
    const m = deptMembers.find(d => d.name === name);
    return m ? m.username : name;
  };

  const buildData = () => {
    const now = new Date().toISOString();
    return {
      [WIDGET_IDS.学期]: { value: semester },
      [WIDGET_IDS.教研主题]: { value: topic },
      [WIDGET_IDS.教研学科]: { value: subject },
      [WIDGET_IDS.时间]: { value: date },
      [WIDGET_IDS.周次]: { value: week },
      [WIDGET_IDS.地点]: { value: location },
      [WIDGET_IDS.教研组]: { value: group },
      [WIDGET_IDS.教研组长]: { value: toMember(groupLeader) },
      [WIDGET_IDS.主持人]: { value: toMember(host) },
      [WIDGET_IDS.记录人]: { value: toMember(recorder) },
      [WIDGET_IDS.参与人员]: { value: participants.map(toMember) },
      [WIDGET_IDS.应到人数]: { value: expectedCount },
      [WIDGET_IDS.实到人数]: { value: actualCount },
      [WIDGET_IDS.备注]: { value: absentNote },
      [WIDGET_IDS.内容记录]: { value: contentRecord },
      [WIDGET_IDS.学科部门]: { value: "" },
      [WIDGET_IDS.提交人]: { value: isEditMode ? editRecord!.提交人 : (currentUser?.name ?? "") },
      [WIDGET_IDS.提交时间]: { value: isEditMode ? editRecord!.提交时间 : now },
    };
  };

  const isEditMode = editRecord !== null;

  const handleSubmit = async () => {
    setSubmitted(true);
    if ([semester, topic, subject, date, week, location, group, groupLeader, host, recorder, participants.length > 0, expectedCount, actualCount, absentNote, contentRecord].find((f) => !f)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);
    try {
      const data: Record<string, { value: unknown }> = { ...buildData() };
      const needUpload = photos.length > 0 || attachments.length > 0 || !isEditMode;
      const transaction_id = needUpload ? crypto.randomUUID() : undefined;

      // 编辑模式未上传新文件 → 不传文件字段，JDY 保留原值
      if (photos.length > 0 || !isEditMode) {
        const { keys } = await jdyUploadFiles(photos, JDY_CONFIG.JIAOYAN_ACTIVITY.app_id, JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id, transaction_id);
        data[WIDGET_IDS.照片] = { value: keys };
      }
      if (attachments.length > 0 || !isEditMode) {
        const { keys } = await jdyUploadFiles(attachments, JDY_CONFIG.JIAOYAN_ACTIVITY.app_id, JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id, transaction_id);
        data[WIDGET_IDS.附件] = { value: keys };
      }
      if (isEditMode) {
        await jdyUpdate({
          app_id: JDY_CONFIG.JIAOYAN_ACTIVITY.app_id,
          entry_id: JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id,
          data_id: editRecord!._id,
          data,
          data_creator: currentUser?.userId,
          transaction_id,
        });
      } else {
        await jdyCreate({
          app_id: JDY_CONFIG.JIAOYAN_ACTIVITY.app_id,
          entry_id: JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id,
          data,
          data_creator: currentUser?.userId,
          transaction_id,
          is_start_workflow: false,
          is_start_trigger: false,
        });
      }
      queryClient.invalidateQueries({ queryKey: ["research-dashboard", "activity-list"] });
      localStorage.removeItem("research-activity-draft");
      if (isEditMode) setEditRecord(null);
      setDataMode(DATA_MODES[1]);
      setSubmitted(false);
      setPhotos([]); setAttachments([]); setExistingPhotos([]); setExistingAttachments([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSelected = async (mode: string) => {
    const targetData = mode === "勾选的数据"
      ? sorted.filter((_, i) => new Set(selectedIds).has(i + 1))
      : tableData;
    if (targetData.length === 0) return;
    if (!confirm(`确定要删除 ${targetData.length} 条记录吗？此操作不可撤销。`)) return;
    setDeleting(true);
    try {
      if (targetData.length === 1) {
        await jdyDelete({ app_id: JDY_CONFIG.JIAOYAN_ACTIVITY.app_id, entry_id: JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id, data_id: targetData[0]._id });
      } else {
        await jdyBatchDelete({ app_id: JDY_CONFIG.JIAOYAN_ACTIVITY.app_id, entry_id: JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id, data_ids: targetData.map(r => r._id) });
      }
      queryClient.invalidateQueries({ queryKey: ["research-dashboard", "activity-list"] });
    } catch (err) {
      alert(err instanceof Error ? err.message : "删除失败，请重试");
    } finally {
      setDeleting(false);
    }
  };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader centered breadcrumbs={[{ label: "教研活动" }, { label: "教研活动记录", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
      {/* 页面模式切换下拉框 — 始终可见 */}
      <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6">
        <div className="relative shrink-0 inline-block" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2 h-9 px-4 text-[15px] font-semibold rounded-xl transition-all duration-150"
            style={{ minWidth: 200, background: "white", color: "#374151", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <span className="flex-1 text-left">{dataMode}</span>
            <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: "#9ca3af", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-2 rounded-2xl overflow-hidden z-50" style={{ minWidth: 200, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}>
              {DATA_MODES.map((opt, i) => {
                const disabled = opt === DATA_MODES[2] && !isGroupLeader;
                return (
                  <button
                    key={opt}
                    onClick={() => { if (!disabled) { setDataMode(opt); setDropdownOpen(false); } }}
                    className="w-full text-left px-4 h-11 text-[15px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={disabled}
                    style={{ color: dataMode === opt ? teal : "#374151", background: dataMode === opt ? "rgba(0,176,149,0.06)" : "transparent", borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none" }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {(dataMode === DATA_MODES[0] || editRecord) ? (
        <main className="max-w-6xl mx-auto px-3 md:px-6 pb-24">
          <div className="mb-8 text-center">
            <div className="inline-flex flex-col items-center">
              <h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>
                {editRecord ? "编辑教研活动记录" : "教研活动记录"}
              </h2>
              <div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />
              {editRecord && <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>修改表单字段后点击保存</p>}
            </div>
          </div>
          <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="学期" required error={submitted && !semester ? "此项为必填项" : undefined}><SelectField value={semester} onChange={setSemester} options={termOptions} /></Field>
              <Field label="教研主题" required error={submitted && !topic ? "此项为必填项" : undefined}><Input value={topic} onChange={setTopic} /></Field>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教研学科" required error={submitted && !subject ? "此项为必填项" : undefined}><SelectField value={subject} onChange={setSubject} options={courseOptions} loading={courseLoading} /></Field>
              <Field label="教研组" required error={submitted && !group ? "此项为必填项" : undefined}><SelectField value={group} onChange={handleGroupChange} options={groupOptions} loading={groupLoading} /></Field>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="时间" required error={submitted && !date ? "此项为必填项" : undefined}><DateTimePicker value={date} onChange={setDate} /></Field>
              <Field label="地点" required error={submitted && !location ? "此项为必填项" : undefined}><Input value={location} onChange={setLocation} /></Field>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="周次" required error={submitted && !week ? "此项为必填项" : undefined}><WeekInput value={week} onChange={setWeek} /></Field>
              <div />
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="教研组长" required error={submitted && !groupLeader ? "此项为必填项" : undefined}><DeptStaffPicker staffList={deptMembers} value={groupLeader} onChange={(v) => setGroupLeader(v as string)} /></Field>
              <Field label="主持人" required error={submitted && !host ? "此项为必填项" : undefined}><DeptStaffPicker staffList={deptMembers} value={host} onChange={(v) => setHost(v as string)} /></Field>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="记录人" required error={submitted && !recorder ? "此项为必填项" : undefined}><DeptStaffPicker staffList={deptMembers} value={recorder} onChange={(v) => setRecorder(v as string)} /></Field>
              <Field label="参与人员" required error={submitted && participants.length === 0 ? "此项为必填项" : undefined}><DeptStaffPicker staffList={deptMembers} value={participants} onChange={(v) => setParticipants(v as string[])} multi /></Field>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <Field label="应到人数" required error={submitted && !expectedCount ? "此项为必填项" : undefined}><Input value={expectedCount} onChange={setExpectedCount} /></Field>
              <Field label="实到人数" required error={submitted && !actualCount ? "此项为必填项" : undefined}><Input value={actualCount} onChange={setActualCount} /></Field>
            </div>

            <div className="p-8 bg-white">
              <Field label="内容记录" required error={submitted && !contentRecord ? "此项为必填项" : undefined}><Textarea value={contentRecord} onChange={setContentRecord} rows={5} /></Field>
            </div>
            <div className="p-8 bg-white">
              <Field label="未到场人员情况说明" required error={submitted && !absentNote ? "此项为必填项" : undefined}><Textarea value={absentNote} onChange={setAbsentNote} rows={5} /></Field>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
              <div>
                <Field label="照片" required hint="请上传现场照片"><FileUpload files={photos} onChange={setPhotos} accept="image/*" hint="拖拽或单击后粘贴图片，单张 20MB 以内" /></Field>
                {existingPhotos.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {existingPhotos.map((f, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                        {f.name}<X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setExistingPhotos(p => p.filter((_, j) => j !== i))} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <Field label="其他附件" hint="其他文件"><FileUpload files={attachments} onChange={setAttachments} accept="*" hint="拖拽或单击后粘贴文件，单个 500MB 以内" /></Field>
                {existingAttachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {existingAttachments.map((f, i) => (
                      <span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
                        {f.name}<X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setExistingAttachments(p => p.filter((_, j) => j !== i))} />
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">
            {editRecord ? (
              <button className="btn-secondary" onClick={() => { setEditRecord(null); setExistingPhotos([]); setExistingAttachments([]); }}>取消编辑</button>
            ) : (
              <>
                <button className="btn-secondary" onClick={handleClearForm}>清空数据</button>
                <button className="btn-secondary" onClick={handleSaveDraft}>保存草稿</button>
              </>
            )}
            <div className="flex-1" />
            <button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px disabled:opacity-60" style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }} onClick={handleSubmit} disabled={submitting}>{submitting ? "提交中..." : (editRecord ? "保存" : "提交")}</button>
          </div>
        </main>
      ) : (
        <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6 pb-24">
          <div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-sm" style={{ minHeight: 400 }}>
            {/* 工具栏 */}
            <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
              <div className="flex items-center gap-0.5">
                {perms.canExport && (
                  <IconDropdown
                    tooltip="导出"
                    icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>}
                    options={["勾选的数据", "全部数据"]}
                    disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                    onSelect={opt => { if (opt === "勾选的数据") { const idSet = new Set(selectedIds); doExport(sorted.filter((_, i) => idSet.has(i + 1))); } else { doExport(tableData); } }}
                  />
                )}
                {perms.canDelete && (
                  <IconDropdown tooltip="删除" icon={<Trash2 className="w-5 h-5" />} options={["勾选的数据", "全部数据"]} disabledOptions={(selectedIds.length === 0 ? ["勾选的数据"] : []).concat(deleting ? ["勾选的数据", "全部数据"] : [])} onSelect={handleDeleteSelected} />
                )}
                <IconDropdown tooltip="操作记录" icon={<Clock className="w-5 h-5" />} options={["批量修改记录", "批量打印模板记录"]} />
              </div>
              <div className="flex-1" />
              <SearchBox2 value={tbSearch} onChange={setTbSearch} />
              <button className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-sm transition-all hover:bg-black/[0.05] shrink-0" style={{ color: "#8c8c8c", fontSize: 15 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>筛选
              </button>
              <div className="flex items-center gap-0.5 pl-2 border-l border-gray-200" style={{ color: "#9ca3af" }}>
                <div className="relative" ref={sortRef}>
                  <Tooltip text="排序">
                    <button onClick={() => setSortOpen(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" style={{ color: sortField !== "提交时间" || sortDir !== "desc" ? teal : "#9ca3af" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M6 12h12" /><path d="M9 18h6" /></svg>
                    </button>
                  </Tooltip>
                  {sortOpen && (
                    <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 160, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
                      <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>排序字段</span>
                        <div className="flex-1" />
                        <button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-black/[0.04]" style={{ color: teal }}>{sortDir === "desc" ? "降序" : "升序"}</button>
                      </div>
                      {SORT_OPTIONS.map(opt => { const active = sortField === opt.field; return (
                        <button key={opt.field} onClick={() => { setSortField(opt.field); setSortOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] flex items-center gap-2" style={{ color: active ? teal : "#374151", fontWeight: active ? 600 : 400 }}>
                          {opt.label}{active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto"><polyline points="20 6 9 17 4 12" /></svg>}
                        </button>
                      );})}
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
              <DataTable columns={RESEARCH_COLUMNS} rows={sorted.map((r, i) => ({ ...r, id: i + 1 }))} minWidth={1000} onSelectionChange={setSelectedIds} onRowClick={r => setEditRecord(r as ResearchRecord)} />
            )}
          </div>
        </div>
      )}
    </div>
  </div>);
}
