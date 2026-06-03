"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { Plus, X, Search, Upload, Menu, ChevronDown, Trash2, Clock } from "lucide-react";
import * as XLSX from "xlsx";
import { useStaffDirectory, useTeachingResearchGroups, useDepartmentMembers, useScienceFestDashboard, type ScienceFestRecord } from "@/hooks/use-research-dashboard";
import { useFormPermissions } from "@/hooks/use-form-permissions";
import { JDY_CONFIG, SCIENTCE_FEST_WIDGET_IDS, jdyCreate, jdyUpdate, jdyDelete, jdyBatchDelete, jdyUploadFiles } from "@/lib/jdy-api";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "@/lib/user-context";
import { DataTable, type ColDef } from "./DataTable";
import { PageHeader } from "./PageHeader";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

function Tooltip({ text, disabled, children }: { text: string; disabled?: boolean; children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (<div className="relative flex items-center justify-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>{children}{visible && !disabled && (<div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-white px-2.5 py-1.5 rounded-md pointer-events-none z-50" style={{ background: "rgba(30,30,30,0.88)", backdropFilter: "blur(4px)", boxShadow: "0 4px 12px rgba(0,0,0,0.18)" }}><div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderBottomColor: "rgba(30,30,30,0.88)" }} />{text}</div>)}</div>);
}
function IconDropdown({ icon, tooltip, options, onSelect, disabledOptions }: { icon: React.ReactNode; tooltip: string; options: string[]; onSelect?: (o: string) => void; disabledOptions?: string[]; }) {
  const [open, setOpen] = useState(false); const ref = useRef<HTMLDivElement>(null); const disabledSet = new Set(disabledOptions ?? []);
  useEffect(() => { if (!open) return; function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [open]);
  return (<div className="relative" ref={ref}><Tooltip text={tooltip} disabled={open}><button onClick={() => setOpen(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-lg transition-all hover:bg-black/[0.05]" style={{ color: "#8c8c8c" }}>{icon}</button></Tooltip>{open && (<div className="absolute left-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 148, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>{options.map(opt => { const d = disabledSet.has(opt); return (<button key={opt} onClick={() => { if (!d) { setOpen(false); onSelect?.(opt); } }} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] disabled:opacity-40 disabled:cursor-not-allowed" style={{ color: "#374151" }} disabled={d}>{opt}</button>); })}</div>)}</div>);
}
function SearchBox2({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [expanded, setExpanded] = useState(false); const inputRef = useRef<HTMLInputElement>(null);
  function expand() { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 50); } function collapse() { if (!value) setExpanded(false); }
  return (<div className="flex items-center rounded-lg border transition-all duration-200 bg-white overflow-hidden" style={{ width: expanded ? 200 : 32, height: 32, borderColor: expanded ? "#d1d5db" : "transparent", background: expanded ? "white" : "transparent" }}><button onClick={expand} className="flex items-center justify-center w-8 h-8 shrink-0 transition-colors" style={{ color: expanded ? teal : "#8c8c8c" }}><Search className="w-4 h-4" /></button>{expanded && <input ref={inputRef} type="text" placeholder="搜索数据" value={value} onChange={e => onChange(e.target.value)} onBlur={collapse} className="outline-none text-sm bg-transparent pr-2 w-full" style={{ color: "#374151" }} />}</div>);
}

const SF_COLUMNS: ColDef<ScienceFestRecord>[] = [
  { key: "活动名称", label: "活动名称", minWidth: 160 },
  { key: "教研组", label: "教研组", minWidth: 120 },
  { key: "教研组长", label: "教研组长", minWidth: 80 },
  { key: "活动负责教师", label: "活动负责教师", minWidth: 80 },
  { key: "活动时间", label: "活动时间", minWidth: 140 },
  { key: "活动地点", label: "活动地点", minWidth: 100 },
  { key: "提交人", label: "提交人", minWidth: 80 },
];
const DATA_MODES = ["添加数据", "管理本人创建数据", "组长管理本组数据", "全部有权限数据"] as const;

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div className="space-y-1.5"><label className="block text-base font-semibold" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) {
  return (<input type="text" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function SelectField({ value, onChange, options, loading }: { value: string; onChange: (v: string) => void; options: string[]; loading?: boolean }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} className="form-input appearance-none pr-9" style={{ color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} disabled={loading}><option value="" disabled>{loading ? "加载中..." : ""}</option>{options.map((o) => <option key={o}>{o}</option>)}</select></div>);
}

function Textarea({ value, onChange, rows = 6, placeholder = "" }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (<textarea rows={rows} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

function DateTimePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false); const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date(); const [viewYear, setViewYear] = useState(now.getFullYear()); const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);
  const [timeStr, setTimeStr] = useState(value ? value.slice(11, 16) : `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  useEffect(() => { function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); } function onClick(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); } if (open) { document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick); } return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); }; }, [open]);
  const selectDay = (day: number) => { onChange(`${viewYear}-${String(viewMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}T${timeStr}`); setOpen(false); };
  const selectNow = () => { const n = new Date(); onChange(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,"0")}-${String(n.getDate()).padStart(2,"0")}T${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`); setOpen(false); };
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate(); const firstDow = new Date(viewYear, viewMonth - 1, 1).getDay();
  const cells: (number|null)[] = []; for (let i=0;i<firstDow;i++) cells.push(null); for (let d=1;d<=daysInMonth;d++) cells.push(d);
  const prevMonth = () => { if (viewMonth===1) { setViewYear(viewYear-1); setViewMonth(12); } else setViewMonth(viewMonth-1); };
  const nextMonth = () => { if (viewMonth===12) { setViewYear(viewYear+1); setViewMonth(1); } else setViewMonth(viewMonth+1); };
  const display = value ? value.replace("T"," ").slice(0,16) : "";
  return (<div ref={containerRef} className="relative"><input type="text" readOnly value={display} placeholder="请选择日期时间" className="form-input cursor-pointer" style={{ color: value ? "#374151" : "#9ca3af" }} onClick={() => setOpen(!open)} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
    {open && (<div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex gap-4" style={{ width: 380 }}><div className="flex-1"><div className="flex items-center justify-between mb-2"><button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">‹</button><span className="text-base font-medium text-gray-700">{viewYear}年{viewMonth}月</span><button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-gray-500 text-base">›</button></div><div className="grid grid-cols-7 gap-0.5">{["日","一","二","三","四","五","六"].map((w) => (<div key={w} className="text-center text-xs text-gray-400 py-0.5">{w}</div>))}{cells.map((c,i) => (<div key={i} className={`text-center py-1 text-sm rounded-md ${c?"cursor-pointer hover:bg-gray-100 text-gray-700":""}`} onClick={() => c && selectDay(c)}>{c??""}</div>))}</div></div><div className="flex flex-col gap-3 border-l border-gray-100 pl-4" style={{ width: 120 }}><p className="text-xs text-gray-400">选择时间</p><input type="time" value={timeStr} onChange={(e) => setTimeStr(e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none" style={{ color: "#374151" }} /><button type="button" onClick={selectNow} className="w-full py-1.5 text-sm font-medium rounded-lg transition-colors" style={{ backgroundColor: teal, color: "white" }}>此刻</button><button type="button" onClick={() => { onChange(""); setOpen(false); }} className="w-full py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">清除</button></div></div>)}
  </div>);
}

function MiniStaffPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const containerRef = useRef<HTMLDivElement>(null);
  const { raw: staffList } = useStaffDirectory();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? staffList.filter((s) => s.教职工姓名.includes(q)) : staffList; return list.slice(0, 30); }, [staffList, query]);
  const initial = value ? value.slice(0, 1) : "?";
  return (<div ref={containerRef} className="relative">
    {value ? (<div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center flex-wrap gap-2 min-h-[44px]"><div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#fff1f2", color: "#dc2626", borderColor: "#fecaca" }}><div className="w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center text-[10px] font-bold">{initial}</div>{value}<button className="ml-1 opacity-60 hover:opacity-100 transition-opacity" onClick={() => onChange("")}><X className="w-3 h-3" /></button></div></div>) : (<button type="button" className="w-full border border-dashed border-gray-200 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-1.5 text-base text-gray-400 transition-all hover:border-teal-400 hover:text-teal-600" style={{ minHeight: 44 }} onClick={() => setOpen(true)}><Plus className="w-4 h-4 opacity-60" /> 选择成员</button>)}
    {open && (<><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 320, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索教职工姓名..." value={query} onChange={(e) => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map((s) => (<button key={s._id} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => { onChange(s.教职工姓名); setOpen(false); }}><div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{s.教职工姓名.slice(0, 1)}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{s.教职工姓名}</p><p className="text-xs text-gray-400 truncate">{[s.部门, s.担任学科].filter(Boolean).join(" · ") || "—"}</p></div></button>))}</div></div></>)}
  </div>);
}

function RecorderPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const containerRef = useRef<HTMLDivElement>(null);
  const { raw: members } = useDepartmentMembers();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? members.filter(m => m.name.includes(q)) : members; return list.slice(0, 30); }, [members, query]);
  const initial = value ? value.slice(0, 1) : "?";
  return (<div ref={containerRef} className="relative">
    {value ? (<div className="border border-dashed border-gray-300 bg-white rounded-[10px] px-3 py-2 min-h-[44px] flex items-center flex-wrap gap-2"><div className="flex items-center bg-blue-50 text-blue-600 px-2 py-1 rounded-lg text-sm border border-blue-100 gap-1.5"><div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">{initial}</div>{value}<X className="w-3.5 h-3.5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity" onClick={() => onChange("")} /></div></div>) : (<button type="button" className="w-full border border-dashed border-gray-300 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-2 text-base text-gray-500 transition-all hover:border-[#00b095] hover:text-[#00b095]" style={{ minHeight: 44 }} onClick={() => setOpen(true)}><Plus size={15} className="opacity-70" /> 选择成员</button>)}
    {open && (<><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 320, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索成员..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map(m => (<button key={m.username} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => { onChange(m.name); setOpen(false); }}><div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">{m.name.slice(0, 1)}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{m.name}</p></div></button>))}</div></div></>)}
  </div>);
}

function DeptMultiPicker({ selected, onChange }: { selected: string[]; onChange: (names: string[]) => void }) {
  const [open, setOpen] = useState(false); const [query, setQuery] = useState(""); const containerRef = useRef<HTMLDivElement>(null);
  const { raw: members } = useDepartmentMembers();
  const filtered = useMemo(() => { const q = query.trim(); const list = q ? members.filter(m => m.name.includes(q)) : members; return list.slice(0, 30); }, [members, query]);
  const toggle = (name: string) => { if (selected.includes(name)) onChange(selected.filter(n => n !== name)); else onChange([...selected, name]); };
  return (<div ref={containerRef} className="relative">
    <div className="border border-dashed border-gray-300 bg-white rounded-[10px] px-3 py-2 min-h-[72px] flex items-start flex-wrap gap-2 cursor-pointer" onClick={() => setOpen(true)}>
      {selected.length === 0 ? <span className="text-base text-gray-400 flex items-center gap-1.5 py-2"><Plus size={15} className="opacity-70" /> 选择成员</span> : selected.map(name => (<span key={name} className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm" style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #e5e7eb" }}><span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold shrink-0">{name.slice(0, 1)}</span>{name}<X className="w-3 h-3 text-gray-400 cursor-pointer hover:text-gray-600" onClick={e => { e.stopPropagation(); toggle(name); }} /></span>))}
    </div>
    {open && (<><div className="fixed inset-0 z-40" onClick={() => setOpen(false)} /><div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden" style={{ width: 340, maxHeight: 360 }}><div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100"><Search className="w-4 h-4 text-gray-400 shrink-0" /><input autoFocus type="text" placeholder="搜索成员..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400" />{query && <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>}</div><div className="overflow-y-auto" style={{ maxHeight: 288 }}>{filtered.length === 0 ? <p className="text-base text-gray-400 text-center py-8">无匹配结果</p> : filtered.map(m => { const isSel = selected.includes(m.name); return (<button key={m.username} type="button" className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left" onClick={() => toggle(m.name)}><div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0" style={{ borderColor: isSel ? teal : "#d1d5db", backgroundColor: isSel ? teal : "transparent" }}>{isSel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}</div><div className="flex-1 min-w-0"><p className="text-base font-medium text-gray-800 truncate">{m.name}</p></div></button>); })}</div></div></>)}
  </div>);
}

function FileUpload({ files, onChange, accept, hint }: { files: File[]; onChange: (f: File[]) => void; accept: string; hint: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (<div>
    <div className="flex items-center gap-2 mb-2"><div className="flex-1 flex items-center gap-2 border border-dashed border-gray-200 rounded-[10px] px-3.5 py-2.5 cursor-pointer" style={{ fontSize: 13, color: "#9ca3af" }} onClick={() => inputRef.current?.click()}><Upload size={14} className="shrink-0" style={{ color: "#9ca3af" }} /><span style={{ color: teal }}>选择</span><span>{hint}</span></div><input ref={inputRef} type="file" accept={accept} multiple className="hidden" onChange={(e) => { if (e.target.files) onChange([...files, ...Array.from(e.target.files)]); e.target.value = ""; }} /></div>
    {files.length > 0 && (<div className="flex flex-wrap gap-2">{files.map((f, i) => (<div key={i} className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600"><span className="max-w-[160px] truncate">{f.name}</span><X className="w-3 h-3 cursor-pointer hover:text-red-500 flex-shrink-0" onClick={() => onChange(files.filter((_, j) => j !== i))} /></div>))}</div>)}
  </div>);
}

export function ScienceFestFormPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [dataMode, setDataMode] = useState<string>("管理本人创建数据");
  const [dropdownOpen, setDropdownOpen] = useState(false); const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();
  const { raw, isPending, isError, refetch, isFetching } = useScienceFestDashboard();
  const perms = useFormPermissions(JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id);
  const { raw: allGroups } = useTeachingResearchGroups();
  const { raw: deptMembers } = useDepartmentMembers();

  const isGroupLeader = useMemo(() => { if (!currentUser) return false; return allGroups.some(g => g.教研组长 === currentUser.name); }, [allGroups, currentUser]);
  const leaderGroups = useMemo(() => { if (!currentUser) return []; return allGroups.filter(g => g.教研组长 === currentUser.name).map(g => g.教研组); }, [allGroups, currentUser]);
  const tableData = useMemo(() => { if (dataMode === DATA_MODES[1]) return raw.filter(r => r.提交人 === currentUser?.name); if (dataMode === DATA_MODES[2]) return raw.filter(r => leaderGroups.includes(r.教研组)); if (dataMode === DATA_MODES[3]) return raw; return raw; }, [raw, dataMode, currentUser, leaderGroups]);
  useEffect(() => { if (!dropdownOpen) return; function h(e: MouseEvent) { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [dropdownOpen]);

  const [tbSearch, setTbSearch] = useState(""); const [sortField, setSortField] = useState<keyof ScienceFestRecord>("提交时间"); const [sortDir, setSortDir] = useState<"asc" | "desc">("desc"); const [sortOpen, setSortOpen] = useState(false); const sortRef = useRef<HTMLDivElement>(null); const [selectedIds, setSelectedIds] = useState<number[]>([]); const [editRecord, setEditRecord] = useState<ScienceFestRecord | null>(null);
  useEffect(() => { if (!sortOpen) return; function h(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); } document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, [sortOpen]);
  const [existingPhotos, setExistingPhotos] = useState<{ name: string; url: string; key?: string }[]>([]);
  const [existingVideos, setExistingVideos] = useState<{ name: string; url: string; key?: string }[]>([]);
  useEffect(() => { if (!editRecord) return; setActivityName(editRecord.活动名称); setGroup(editRecord.教研组); setGroupLeader(editRecord.教研组长); setTeacher(editRecord.活动负责教师); setDate(editRecord.活动时间); setLocation(editRecord.活动地点); setParticipants(editRecord.参与人员 ?? ""); setDescription(editRecord.活动描述); setRemark(editRecord.备注 ?? ""); setExistingPhotos(editRecord.活动图片 ?? []); setExistingVideos(editRecord.活动视频 ?? []); }, [editRecord]);

  const filtered = useMemo(() => { if (!tbSearch.trim()) return tableData; const q = tbSearch.trim(); return tableData.filter(r => r.活动名称.includes(q) || r.教研组.includes(q) || r.活动负责教师?.includes(q)); }, [tableData, tbSearch]);
  const sorted = useMemo(() => [...filtered].sort((a, b) => { const va = String(a[sortField] ?? ""); const vb = String(b[sortField] ?? ""); const cmp = va.localeCompare(vb, "zh"); return sortDir === "desc" ? -cmp : cmp; }), [filtered, sortField, sortDir]);
  const SORT_OPTIONS: { label: string; field: keyof ScienceFestRecord }[] = [{ label: "提交时间", field: "提交时间" }, { label: "活动名称", field: "活动名称" }, { label: "活动时间", field: "活动时间" }];
  const doExport = (data: ScienceFestRecord[]) => { const headers = SF_COLUMNS.map(c => c.label); const rows = data.map(r => SF_COLUMNS.map(c => String((r as unknown as Record<string, unknown>)[c.key] ?? ""))); const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "科技节活动"); XLSX.writeFile(wb, `科技节活动_${new Date().toISOString().slice(0, 10)}.xlsx`); };

  const [activityName, setActivityName] = useState(""); const [group, setGroup] = useState(""); const [groupLeader, setGroupLeader] = useState(""); const [teacher, setTeacher] = useState(currentUser?.name ?? ""); const [date, setDate] = useState(""); const [location, setLocation] = useState(""); const [participants, setParticipants] = useState(""); const [description, setDescription] = useState(""); const [photos, setPhotos] = useState<File[]>([]); const [videos, setVideos] = useState<File[]>([]); const [remark, setRemark] = useState(""); const [submitted, setSubmitted] = useState(false);
  const { raw: groupList, isPending: groupLoading } = useTeachingResearchGroups();
  const groupOptions = useMemo(() => [...new Set(groupList.map(g => g.教研组).filter(Boolean))].sort((a, b) => a.localeCompare(b, "zh")), [groupList]);
  const handleGroupChange = (v: string) => { setGroup(v); const match = groupList.find(g => g.教研组 === v); if (match) setGroupLeader(match.教研组长); };
  useEffect(() => { if (dataMode !== DATA_MODES[0]) { setEditRecord(null); setExistingPhotos([]); setExistingVideos([]); } }, [dataMode]);

  const handleClearForm = () => { setActivityName(""); setGroup(""); setGroupLeader(""); setTeacher(currentUser?.name ?? ""); setDate(""); setLocation(""); setParticipants(""); setDescription(""); setPhotos([]); setVideos([]); setExistingPhotos([]); setExistingVideos([]); setRemark(""); setSubmitted(false); localStorage.removeItem("sciencefest-draft"); };
  const handleSaveDraft = () => { if (!activityName.trim() && !group.trim()) return; localStorage.setItem("sciencefest-draft", JSON.stringify({ activityName, group, groupLeader, teacher, date, location, participants, description, remark })); };
  useEffect(() => { if (editRecord || dataMode !== DATA_MODES[0]) return; try { const raw = localStorage.getItem("sciencefest-draft"); if (!raw) return; const d = JSON.parse(raw); if (d.activityName) setActivityName(d.activityName); if (d.group) setGroup(d.group); if (d.groupLeader) setGroupLeader(d.groupLeader); if (d.teacher) setTeacher(d.teacher); if (d.date) setDate(d.date); if (d.location) setLocation(d.location); if (d.participants) setParticipants(String(d.participants)); if (d.description) setDescription(d.description); if (d.remark) setRemark(d.remark); } catch {} }, [dataMode, editRecord]);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toMember = (name: string) => { const m = deptMembers.find(d => d.name === name); return m ? m.username : name; };
  const isEditMode = editRecord !== null;

  const buildData = () => {
    const now = new Date().toISOString();
    return {
      [SCIENTCE_FEST_WIDGET_IDS.活动名称]: { value: activityName },
      [SCIENTCE_FEST_WIDGET_IDS.教研组]: { value: group },
      [SCIENTCE_FEST_WIDGET_IDS.教研组长]: { value: toMember(groupLeader) },
      [SCIENTCE_FEST_WIDGET_IDS.活动负责教师]: { value: toMember(teacher) },
      [SCIENTCE_FEST_WIDGET_IDS.活动时间]: { value: date },
      [SCIENTCE_FEST_WIDGET_IDS.活动地点]: { value: location },
      [SCIENTCE_FEST_WIDGET_IDS.参与人员]: { value: participants },
      [SCIENTCE_FEST_WIDGET_IDS.活动描述]: { value: description },
      [SCIENTCE_FEST_WIDGET_IDS.备注]: { value: remark },
      [SCIENTCE_FEST_WIDGET_IDS.提交人]: { value: isEditMode ? editRecord!.提交人 : (currentUser?.name ?? "") },
      [SCIENTCE_FEST_WIDGET_IDS.提交时间]: { value: isEditMode ? editRecord!.提交时间 : now },
    } as Record<string, { value: unknown }>;
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    if ([activityName, group, groupLeader, teacher, date, location, participants, description].find(f => !f)) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setSubmitting(true);
    try {
      const data = { ...buildData() };
      const needUpload = photos.length > 0 || videos.length > 0 || !isEditMode;
      const transaction_id = needUpload ? crypto.randomUUID() : undefined;
      if (photos.length > 0 || !isEditMode) { const { keys } = await jdyUploadFiles(photos, JDY_CONFIG.SCIENCE_FEST_ACTIVITY.app_id, JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id, transaction_id); data[SCIENTCE_FEST_WIDGET_IDS.活动图片] = { value: keys }; }
      if (videos.length > 0 || !isEditMode) { const { keys } = await jdyUploadFiles(videos, JDY_CONFIG.SCIENCE_FEST_ACTIVITY.app_id, JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id, transaction_id); data[SCIENTCE_FEST_WIDGET_IDS.活动视频] = { value: keys }; }
      if (isEditMode) {
        await jdyUpdate({ app_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.app_id, entry_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id, data_id: editRecord!._id, data, data_creator: currentUser?.userId, transaction_id });
      } else {
        await jdyCreate({ app_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.app_id, entry_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id, data, data_creator: currentUser?.userId, transaction_id, is_start_workflow: false, is_start_trigger: false });
      }
      queryClient.invalidateQueries({ queryKey: ["science-fest", "activity-list"] });
      localStorage.removeItem("sciencefest-draft");
      if (isEditMode) setEditRecord(null);
      setDataMode(DATA_MODES[1]);
      setSubmitted(false); setPhotos([]); setVideos([]); setExistingPhotos([]); setExistingVideos([]);
    } catch (err) { alert(err instanceof Error ? err.message : "提交失败，请重试"); }
    finally { setSubmitting(false); }
  };

  const handleDeleteSelected = async (mode: string) => { const targetData = mode === "勾选的数据" ? sorted.filter((_, i) => new Set(selectedIds).has(i + 1)) : tableData; if (targetData.length === 0) return; if (!confirm(`确定要删除 ${targetData.length} 条记录吗？此操作不可撤销。`)) return; setDeleting(true); try { if (targetData.length === 1) { await jdyDelete({ app_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.app_id, entry_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id, data_id: targetData[0]._id }); } else { await jdyBatchDelete({ app_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.app_id, entry_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id, data_ids: targetData.map(r => r._id) }); } queryClient.invalidateQueries({ queryKey: ["science-fest", "activity-list"] }); } catch (err) { alert(err instanceof Error ? err.message : "删除失败，请重试"); } finally { setDeleting(false); } };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader centered breadcrumbs={[{ label: "教师组织参与的活动" }, { label: "科技节活动" }, { label: "科技节活动登记", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6"><div className="relative shrink-0 inline-block" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(v => !v)} className="flex items-center gap-2 h-9 px-4 text-[15px] font-semibold rounded-xl transition-all duration-150" style={{ minWidth: 200, background: "white", color: "#374151", border: "1px solid rgba(0,0,0,0.1)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}><span className="flex-1 text-left">{dataMode}</span><ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: "#9ca3af", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} /></button>
        {dropdownOpen && (<div className="absolute left-0 top-full mt-2 rounded-2xl overflow-hidden z-50" style={{ minWidth: 200, background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}>{DATA_MODES.map((opt, i) => { const disabled = opt === DATA_MODES[2] && !isGroupLeader; return (<button key={opt} onClick={() => { if (!disabled) { setDataMode(opt); setDropdownOpen(false); } }} className="w-full text-left px-4 h-11 text-[15px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed" disabled={disabled} style={{ color: dataMode === opt ? teal : "#374151", background: dataMode === opt ? "rgba(0,176,149,0.06)" : "transparent", borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none" }}>{opt}</button>); })}</div>)}
      </div></div>

      {(dataMode === DATA_MODES[0] || editRecord) ? (<main className="max-w-6xl mx-auto px-3 md:px-6 pb-24">
        <div className="mb-8 text-center"><div className="inline-flex flex-col items-center"><h2 className="text-xl font-bold tracking-tight" style={{ color: "#111827" }}>{editRecord ? "编辑科技节活动" : "科技节活动登记"}</h2><div className="mt-2 h-0.5 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${teal}, #5BC8F5)` }} />{editRecord && <p className="text-xs mt-2" style={{ color: "#9ca3af" }}>修改表单字段后点击保存</p>}</div></div>
        <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"><Field label="活动名称" required><Input value={activityName} onChange={setActivityName} />{submitted && !activityName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field><Field label="教研组" required><SelectField value={group} onChange={handleGroupChange} options={groupOptions} loading={groupLoading} />{submitted && !group && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"><Field label="活动时间" required><DateTimePicker value={date} onChange={setDate} />{submitted && !date && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field><Field label="活动地点" required><Input value={location} onChange={setLocation} />{submitted && !location && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"><Field label="活动负责教师" required><RecorderPicker value={teacher} onChange={setTeacher} />{submitted && !teacher && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field><Field label="教研组长" required><MiniStaffPicker value={groupLeader} onChange={setGroupLeader} />{submitted && !groupLeader && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"><div /><Field label="参与人员" required><Input value={participants} onChange={setParticipants} placeholder="多个姓名用逗号分隔" />{submitted && !participants && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>

          <div className="p-8 bg-white"><Field label="活动描述" required><Textarea value={description} onChange={setDescription} rows={4} placeholder="说明：类似于新闻简讯50字左右" />{submitted && !description && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>
          <div className="p-8 bg-white"><Field label="备注"><Textarea value={remark} onChange={setRemark} rows={4} /></Field></div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white">
            <div><Field label="活动图片" required><FileUpload files={photos} onChange={setPhotos} accept="image/*" hint="拖拽或单击后粘贴图片，单张20MB以内" />{submitted && photos.length === 0 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}{existingPhotos.length > 0 && (<div className="mt-2 flex flex-wrap gap-1.5">{existingPhotos.map((f, i) => (<span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">{f.name}<X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setExistingPhotos(p => p.filter((_, j) => j !== i))} /></span>))}</div>)}</Field></div>
            <div><Field label="活动视频" required><FileUpload files={videos} onChange={setVideos} accept="video/*" hint="拖拽或单击后粘贴文件，单个500MB以内" />{submitted && videos.length === 0 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}{existingVideos.length > 0 && (<div className="mt-2 flex flex-wrap gap-1.5">{existingVideos.map((f, i) => (<span key={i} className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">{f.name}<X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => setExistingVideos(p => p.filter((_, j) => j !== i))} /></span>))}</div>)}</Field></div>
          </div>
        </div>
        <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4 mt-4 rounded-[28px]">{editRecord ? (<button className="btn-secondary" onClick={() => { setEditRecord(null); setExistingPhotos([]); setExistingVideos([]); }}>取消编辑</button>) : (<><button className="btn-secondary" onClick={handleClearForm}>清空数据</button><button className="btn-secondary" onClick={handleSaveDraft}>保存草稿</button></>)}<div className="flex-1" /><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px disabled:opacity-60" style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }} onClick={handleSubmit} disabled={submitting}>{submitting ? "提交中..." : (editRecord ? "保存" : "提交")}</button></div>
      </main>) : (<div className="max-w-7xl mx-auto px-3 md:px-6 pt-4 md:pt-6 pb-24"><div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-sm" style={{ minHeight: 400 }}>
        <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
          <div className="flex items-center gap-0.5">{perms.canExport && (<IconDropdown tooltip="导出" icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>} options={["勾选的数据", "全部数据"]} disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined} onSelect={opt => { if (opt === "勾选的数据") { const idSet = new Set(selectedIds); doExport(sorted.filter((_, i) => idSet.has(i + 1))); } else { doExport(tableData); } }} />)}{perms.canDelete && (<IconDropdown tooltip="删除" icon={<Trash2 className="w-5 h-5" />} options={["勾选的数据", "全部数据"]} disabledOptions={(selectedIds.length === 0 ? ["勾选的数据"] : []).concat(deleting ? ["勾选的数据", "全部数据"] : [])} onSelect={handleDeleteSelected} />)}<IconDropdown tooltip="操作记录" icon={<Clock className="w-5 h-5" />} options={["批量修改记录", "批量打印模板记录"]} /></div>
          <div className="flex-1" /><SearchBox2 value={tbSearch} onChange={setTbSearch} />
          <button className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-sm transition-all hover:bg-black/[0.05] shrink-0" style={{ color: "#8c8c8c", fontSize: 15 }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>筛选</button>
          <div className="flex items-center gap-0.5 pl-2 border-l border-gray-200" style={{ color: "#9ca3af" }}><div className="relative" ref={sortRef}><Tooltip text="排序"><button onClick={() => setSortOpen(v => !v)} className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" style={{ color: sortField !== "提交时间" || sortDir !== "desc" ? teal : "#9ca3af" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M6 12h12" /><path d="M9 18h6" /></svg></button></Tooltip>{sortOpen && (<div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 160, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}><div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2"><span className="text-xs font-medium" style={{ color: "#9ca3af" }}>排序字段</span><div className="flex-1" /><button onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")} className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-black/[0.04]" style={{ color: teal }}>{sortDir === "desc" ? "降序" : "升序"}</button></div>{SORT_OPTIONS.map(opt => { const active = sortField === opt.field; return (<button key={opt.field} onClick={() => { setSortField(opt.field); setSortOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] flex items-center gap-2" style={{ color: active ? teal : "#374151", fontWeight: active ? 600 : 400 }}>{opt.label}{active && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto"><polyline points="20 6 9 17 4 12" /></svg>}</button>); })}</div>)}</div><Tooltip text="刷新"><button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" onClick={() => refetch()} disabled={isFetching}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFetching ? "animate-spin" : ""}><path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg></button></Tooltip></div>
        </div>
        {isPending ? (<div className="flex items-center justify-center py-20 text-sm text-gray-400">加载中...</div>) : isError ? (<div className="flex items-center justify-center py-20 text-sm text-red-400">加载失败，请稍后重试</div>) : (<DataTable columns={SF_COLUMNS} rows={sorted.map((r, i) => ({ ...r, id: i + 1 }))} minWidth={1000} onSelectionChange={setSelectedIds} onRowClick={r => setEditRecord(r as ScienceFestRecord)} />)}
      </div></div>)}
    </div>
  </div>);}
