"use client";

import { useState, useEffect, useMemo } from "react";
import { D } from "@/lib/jdy-permissions";

export type DeptStaffMember = {
  name: string;
  username: string;
  departments: number[];
};

export function DeptStaffPicker({ staffList, value, onChange, title = "选择教师" }: {
  staffList: DeptStaffMember[];
  value: string;
  onChange: (v: string) => void;
  title?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const [deptNameMap, setDeptNameMap] = useState<Record<number, string>>({});
  const [deptTreeOrder, setDeptTreeOrder] = useState<{ name: string; depth: number }[]>([]);

  useEffect(() => {
    if (!open) return;
    fetch("/api/jdy/department/list")
      .then(r => r.json())
      .then((data: { dept_no: number; name: string; parent_no: number }[] | { error: string }) => {
        if (Array.isArray(data)) {
          const map: Record<number, string> = {};
          const allDepts: { no: number; name: string; parent: number }[] = [];
          for (const d of data) {
            const name = d.dept_no === 1 ? "全部成员" : d.name;
            map[d.dept_no] = name;
            allDepts.push({ no: d.dept_no, name, parent: d.parent_no });
          }
          for (const [name, no] of Object.entries(D)) {
            if (!map[no]) { map[no] = name; allDepts.push({ no, name, parent: 0 }); }
          }
          const children = new Map<number, typeof allDepts>();
          for (const d of allDepts) {
            if (d.parent !== 0 && map[d.parent]) {
              if (!children.has(d.parent)) children.set(d.parent, []);
              children.get(d.parent)!.push(d);
            }
          }
          const sorted: { name: string; depth: number }[] = [];
          const top = allDepts.filter(d => d.parent === 0 || !map[d.parent]);
          function walk(depts: typeof allDepts, depth: number) {
            for (const d of depts.sort((a, b) => a.name.localeCompare(b.name, "zh"))) {
              sorted.push({ name: d.name, depth });
              const kids = children.get(d.no);
              if (kids) walk(kids, depth + 1);
            }
          }
          walk(top, 0);
          setDeptNameMap(map);
          setDeptTreeOrder(sorted);
        }
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const deptDepth = useMemo(() => {
    const m: Record<string, number> = {};
    for (const d of deptTreeOrder) m[d.name] = d.depth;
    return m;
  }, [deptTreeOrder]);

  const deptGroups = useMemo(() => {
    const staffByDept = new Map<string, typeof staffList>();
    for (const s of staffList) {
      for (const deptNo of (s.departments ?? [])) {
        const deptName = deptNameMap[deptNo] ?? `部门${deptNo}`;
        if (!staffByDept.has(deptName)) staffByDept.set(deptName, []);
        const arr = staffByDept.get(deptName)!;
        if (!arr.find(x => x.username === s.username)) arr.push(s);
      }
    }
    const deptOrderNames = deptTreeOrder.map(d => d.name);
    const deptSet = new Set([...deptOrderNames, ...staffByDept.keys()]);
    const q = query.trim().toLowerCase();
    if (!q) {
      const ordered: (readonly [string, typeof staffList])[] = [];
      for (const d of deptTreeOrder) {
        if (deptSet.has(d.name)) { deptSet.delete(d.name); ordered.push([d.name, staffByDept.get(d.name) ?? []] as const); }
      }
      for (const d of Array.from(deptSet).sort((a, b) => a.localeCompare(b, "zh"))) { ordered.push([d, staffByDept.get(d) ?? []] as const); }
      return ordered;
    }
    const allDeptNames = [...deptOrderNames, ...Array.from(deptSet)].filter((v, i, a) => a.indexOf(v) === i);
    return allDeptNames
      .map(d => {
        const members = (staffByDept.get(d) ?? []).filter(s => s.name.toLowerCase().includes(q));
        return [d, members] as const;
      })
      .filter(([, m]) => m.length > 0);
  }, [staffList, deptNameMap, deptTreeOrder, query]);

  return (
    <div className="relative">
      {value ? (
        <div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center min-h-[44px]">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}>
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">{value.slice(0, 1)}</span>
            {value}
            <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => onChange("")}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1 hover:border-emerald-400 transition-colors bg-white"
          style={{ color: "#9ca3af", minHeight: 44 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          <span className="text-sm">选择教师</span>
        </button>
      )}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.3)" }} onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-4" style={{ width: 400, maxHeight: "75vh" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-base font-bold text-gray-800">{title}</h3>
              <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mx-5 mb-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input autoFocus type="text" placeholder="搜索教师姓名..." value={query} onChange={e => setQuery(e.target.value)}
                className="flex-1 outline-none text-base bg-transparent text-gray-700 placeholder-gray-400" />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            <div className="overflow-y-auto px-2 pb-3" style={{ maxHeight: "55vh" }}>
              {deptGroups.length === 0 ? (
                <p className="text-base text-gray-400 text-center py-8">无匹配结果</p>
              ) : deptGroups.map(([dept, members]) => {
                const isExpanded = expandedDept === dept || (query.trim().length > 0);
                return (
                  <div key={dept}>
                    <button type="button" onClick={() => setExpandedDept(e => e === dept ? null : dept)}
                      className="w-full flex items-center gap-1.5 pr-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                      style={{ paddingLeft: 12 + (deptDepth[dept] ?? 0) * 16 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                      {dept}
                      <span className="text-xs text-gray-400 ml-auto">{members.length}人</span>
                    </button>
                    {isExpanded && members.map(s => (
                      <button key={s.name} type="button" onClick={() => { onChange(s.name); setOpen(false); }}
                        className="w-full text-left pr-4 py-2.5 text-base hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2"
                        style={{ paddingLeft: 40 + (deptDepth[dept] ?? 0) * 16, color: value === s.name ? "#059669" : "#374151", background: value === s.name ? "rgba(16,185,129,0.05)" : "transparent" }}>
                        <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{s.name.slice(0, 1)}</span>
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
