"use client";

import { Plus, ClipboardList, Menu, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useCurrentUser } from "@/lib/user-context";
import { StaffPicker } from "./ui/StaffPicker";
import { useStaffDirectory, type StaffDirectoryRecord } from "@/hooks/use-research-dashboard";
import { PageHeader } from "./PageHeader";

const teal = "#00b095";
const focusStyle = { borderColor: teal, boxShadow: "0 0 0 4px rgba(0,176,149,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) { return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{hint && <p className="text-[11px] text-gray-400 mb-2">{hint}</p>}{children}</div>); }
function Input({ placeholder = "", value, onChange }: { placeholder?: string; value?: string; onChange?: (v: string) => void }) { return (<input type="text" placeholder={placeholder} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />); }
function CellSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) { return (<select value={value} onChange={(e) => onChange(e.target.value)} className="table-input appearance-none" style={!value ? { color: "#9ca3af" } : undefined} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value=""></option>{options.map((o) => <option key={o}>{o}</option>)}</select>); }

type ExpRow = { id: number; unit: string; startDate: string; endDate: string; position: string; subject: string };

export function WorkHistoryPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const currentUser = useCurrentUser();
  const [teacherName, setTeacherName] = useState(currentUser?.name ?? "");
  const [idCard, setIdCard] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [positionType, setPositionType] = useState("");
  const [partyJob, setPartyJob] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [hasExp, setHasExp] = useState<"yes" | "no">("yes");
  const [submitted, setSubmitted] = useState(false);

  const [rows, setRows] = useState<ExpRow[]>([{ id: 1, unit: "", startDate: "", endDate: "", position: "", subject: "" }]);
  const [nextId, setNextId] = useState(2);
  const updateRow = useCallback((id: number, f: string, v: string | null) => setRows((p) => p.map((r) => (r.id === id ? { ...r, [f]: v } : r))), []);
  const addRow = useCallback(() => { setRows((p) => [...p, { id: nextId, unit: "", startDate: "", endDate: "", position: "", subject: "" }]); setNextId((n) => n + 1); }, [nextId]);
  const removeRow = useCallback((id: number) => setRows((p) => (p.length <= 1 ? p : p.filter((r) => r.id !== id))), []);
  const anyMissing = useMemo(() => rows.some((r) => !r.unit || !r.startDate || !r.position || !r.subject), [rows]);

  const { raw: staffList } = useStaffDirectory();
  useEffect(() => { if (teacherName && staffList.length > 0 && !idCard) { const m = staffList.find((s) => s.教职工姓名 === teacherName); if (m) { setIdCard(m.身份证号); setDepartment(m.部门); setPosition(m.岗位); setPositionType(m.岗位类型); setPhone(m.手机号码); setSubject(m.担任学科); } } }, [teacherName, staffList, idCard]);
  const handleSelectStaff = (r: StaffDirectoryRecord | null) => { if (r) { setIdCard(r.身份证号); setDepartment(r.部门); setPosition(r.岗位); setPositionType(r.岗位类型); setPhone(r.手机号码); setSubject(r.担任学科); } else { setIdCard(""); setDepartment(""); setPosition(""); setPositionType(""); setPartyJob(""); setPhone(""); setSubject(""); } };
  const handleSubmit = () => { setSubmitted(true); if ([{ f: teacherName }, { f: idCard }, ...(hasExp === "yes" ? [{ f: department }, { f: position }, { f: positionType }, { f: partyJob }, { f: phone }, { f: subject }, { f: !anyMissing }] : [])].find((x) => !x.f)) window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (<div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
    <PageHeader centered breadcrumbs={[{ label: "教师基础档案" }, { label: "工作履历", active: true }]} onMenuOpen={onMenuOpen} />
    <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24"><main className="max-w-6xl mx-auto mt-4 md:mt-10 px-3 md:px-6">
      <div className="flex items-center justify-center gap-5 mb-12"><div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} /><div className="flex items-center gap-3 px-12 py-2 text-white text-base font-semibold tracking-[0.2em]" style={{ backgroundColor: teal, clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", boxShadow: "0 4px 12px rgba(0,176,149,0.2)" }}><span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" />工作履历<span className="w-2 h-2 bg-white rotate-45 shrink-0 inline-block" /></div><div className="h-px w-20" style={{ background: `linear-gradient(to right, transparent, ${teal}, transparent)` }} /></div>
      <div className="rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"><Field label="教师姓名" required><StaffPicker value={teacherName} onChange={setTeacherName} onSelectRecord={handleSelectStaff} />{submitted && !teacherName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field><Field label="身份证号码" required><Input value={idCard} onChange={setIdCard} />{submitted && !idCard && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>
        <div className="p-8 bg-white"><Field label="有无工作经历" required><div className="flex items-center gap-10 py-2">{[{ v: "yes" as const, l: "有" }, { v: "no" as const, l: "暂无" }].map(({ v, l }) => (<label key={v} className="flex items-center gap-2.5 cursor-pointer" onClick={() => setHasExp(v)}><div className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 bg-white" style={{ borderColor: hasExp === v ? teal : "#d1d5db" }}>{hasExp === v && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: teal }} />}</div><span className="text-base font-medium text-gray-700">{l}</span></label>))}</div></Field></div>
        {hasExp === "yes" && (<>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"><Field label="部门" required><Input value={department} onChange={setDepartment} />{submitted && !department && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field><Field label="岗位" required><Input value={position} onChange={setPosition} />{submitted && !position && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"><Field label="岗位类型" hint="可填任意一个：教学岗 教辅岗 行政岗 工勤岗 技能岗 管理岗" required><Input value={positionType} onChange={setPositionType} />{submitted && !positionType && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field><Field label="党委/行政职务" required><Input value={partyJob} onChange={setPartyJob} />{submitted && !partyJob && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 bg-white"><Field label="联系方式" required><Input value={phone} onChange={setPhone} />{submitted && !phone && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field><Field label="担任学科" required><Input value={subject} onChange={setSubject} />{submitted && !subject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field></div>
          <div className="p-8 bg-white border-t border-gray-50"><p className="text-base font-semibold mb-5"><span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>工作履历</p>
            <div className="w-full border border-gray-100 rounded-xl overflow-hidden text-sm" style={{ display: "grid", gridTemplateColumns: "48px 1.4fr 1fr 1fr 1fr 1fr 52px" }}>
              {["", "任职单位", "开始日期", "结束日期", "任职岗位", "所教学科", ""].map((h, i) => (<div key={i} className="px-3 py-3 bg-gray-50 text-sm font-semibold text-gray-600 border-b border-r border-gray-100 last:border-r-0">{(i === 1 || i === 2 || i === 4 || i === 5) && <span style={{ color: "#ff4d4f", marginRight: 3 }}>*</span>}{h}</div>))}
              {rows.map((row, idx) => (<>
                <div key={`n-${row.id}`} className="px-3 py-2.5 bg-white border-b border-r border-gray-100 flex items-center justify-center text-sm font-bold text-gray-400">{idx + 1}</div>
                <div key={`un-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100"><input type="text" value={row.unit} onChange={(e) => updateRow(row.id, "unit", e.target.value)} className="table-input" style={submitted && !row.unit ? { borderColor: "#ff4d4f" } : undefined} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /></div>
                <div key={`sd-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100"><input type="date" value={row.startDate} onChange={(e) => updateRow(row.id, "startDate", e.target.value)} className="table-input w-full" style={{ color: row.startDate ? "#374151" : "#9ca3af", borderColor: submitted && !row.startDate ? "#ff4d4f" : undefined }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /></div>
                <div key={`ed-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100"><input type="date" value={row.endDate} onChange={(e) => updateRow(row.id, "endDate", e.target.value)} className="table-input w-full" style={{ color: row.endDate ? "#374151" : "#9ca3af" }} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /></div>
                <div key={`po-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100"><input type="text" value={row.position} onChange={(e) => updateRow(row.id, "position", e.target.value)} className="table-input" style={submitted && !row.position ? { borderColor: "#ff4d4f" } : undefined} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /></div>
                <div key={`su-${row.id}`} className="px-2 py-2 bg-white border-b border-r border-gray-100"><CellSelect value={row.subject} onChange={(v) => updateRow(row.id, "subject", v)} options={["数学", "语文", "英语", "物理", "化学", "生物", "历史", "地理", "政治"]} /></div>
                <div key={`del-${row.id}`} className="px-2 py-2 bg-white border-b border-gray-100 flex items-center justify-center"><button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" onClick={() => removeRow(row.id)}><Trash2 className="w-3.5 h-3.5" /></button></div>
              </>))}
            </div>
            {submitted && hasExp === "yes" && anyMissing && (<div className="mt-3 space-y-0.5">{rows.some((r) => !r.unit) && <p className="text-xs" style={{ color: "#ff4d4f" }}>任职单位为必填项</p>}{rows.some((r) => !r.startDate) && <p className="text-xs" style={{ color: "#ff4d4f" }}>开始日期为必填项</p>}{rows.some((r) => !r.position) && <p className="text-xs" style={{ color: "#ff4d4f" }}>任职岗位为必填项</p>}{rows.some((r) => !r.subject) && <p className="text-xs" style={{ color: "#ff4d4f" }}>所教学科为必填项</p>}</div>)}
            <div className="flex items-center gap-8 mt-5"><button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }} onClick={addRow}><Plus className="w-4 h-4" /> 添加</button><button type="button" className="flex items-center gap-1.5 text-base font-bold transition-colors" style={{ color: teal }}><ClipboardList className="w-4 h-4" /> 快速填报</button></div>
          </div>
        </>)}
      </div>
    </main></div>
    <div className="form-footer shrink-0 flex gap-3 px-10 py-4"><button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ backgroundColor: teal, boxShadow: "0 4px 12px rgba(0,176,149,0.15)" }} onClick={handleSubmit}>提交</button><button className="btn-secondary">保存草稿</button></div>
  </div>);
}
