"use client";

import { useState, useEffect, useMemo } from "react";
import { D } from "@/lib/jdy-permissions";

export type DeptStaffMember = {
  name: string;
  username: string;
  departments: number[];
};

interface DeptNode {
  no: number;
  name: string;
  depth: number;
  children: number[]; // dept_nos of direct children
}

export function DeptStaffPicker({ staffList, value, onChange, title = "选择教师", multi }: {
  staffList: DeptStaffMember[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  title?: string;
  multi?: boolean;
}) {
  const singleValue = typeof value === "string" ? value : "";
  const multiValue = Array.isArray(value) ? value : [];
  const selectedSet = useMemo(() => new Set(multiValue), [multiValue]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [expandedNos, setExpandedNos] = useState<Set<number>>(new Set());
  const [deptNameMap, setDeptNameMap] = useState<Record<number, string>>({});
  const [deptTree, setDeptTree] = useState<DeptNode[]>([]); // all nodes in tree order

  useEffect(() => {
    if (!open) return;
    fetch("/api/jdy/department/list")
      .then(r => r.json())
      .then((data: { dept_no: number; name: string; parent_no: number }[] | { error: string }) => {
        if (Array.isArray(data)) {
          const map: Record<number, string> = {};
          const parent: Record<number, number> = {};
          // Add root: dept_no=1
          map[1] = "全部成员";
          parent[1] = 0;
          for (const d of data) {
            const name = d.dept_no === 1 ? "全部成员" : d.name;
            map[d.dept_no] = name;
            parent[d.dept_no] = d.parent_no;
          }
          for (const [name, no] of Object.entries(D)) {
            if (!map[no]) { map[no] = name; parent[no] = 0; }
          }
          // Compute depths (recursive from root=1)
          const depthMap: Record<number, number> = {};
          function calcDepth(no: number): number {
            if (depthMap[no] !== undefined) return depthMap[no];
            const p = parent[no];
            depthMap[no] = p && p !== 0 ? calcDepth(p) + 1 : 0;
            return depthMap[no];
          }
          // Build children map
          const childMap: Record<number, number[]> = {};
          const allNos = Object.keys(map).map(Number);
          for (const no of allNos) {
            childMap[no] = [];
            calcDepth(no); // ensure depth computed
          }
          for (const no of allNos) {
            const p = parent[no];
            if (p && p !== 0 && childMap[p]) childMap[p].push(no);
          }
          // Build flat tree array sorted
          const nodes: DeptNode[] = [];
          function walk(no: number) {
            const kids = (childMap[no] ?? []).sort((a, b) => map[a].localeCompare(map[b], "zh"));
            for (const childNo of kids) {
              nodes.push({ no: childNo, name: map[childNo], depth: depthMap[childNo], children: childMap[childNo] ?? [] });
              walk(childNo);
            }
          }
          walk(1);
          setDeptNameMap(map);
          setDeptTree(nodes);
        }
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Which nodes are visible (ancestor expanded)
  const visibleNos = useMemo(() => {
    const set = new Set<number>();
    const pMap: Record<number, number> = {};
    for (const d of deptTree) {
      for (const c of d.children) pMap[c] = d.no;
    }
    function isAncestorExpanded(no: number): boolean {
      const p = pMap[no];
      if (!p || p === 1) return true;
      if (!expandedNos.has(p)) return false;
      return isAncestorExpanded(p);
    }
    for (const d of deptTree) {
      if (d.depth === 1 || isAncestorExpanded(d.no)) set.add(d.no);
    }
    return set;
  }, [deptTree, expandedNos]);

  const toggleDept = (no: number) => {
    setExpandedNos(prev => {
      const next = new Set(prev);
      if (next.has(no)) {
        next.delete(no);
      } else {
        // Collapse siblings at same depth
        const node = deptTree.find(d => d.no === no);
        if (node) {
          for (const d of deptTree) {
            if (d.depth === node.depth && d.no !== no) next.delete(d.no);
          }
        }
        next.add(no);
      }
      return next;
    });
  };

  // Build parent lookup (reusable)
  const parentMap = useMemo(() => {
    const m: Record<number, number> = {};
    for (const d of deptTree) {
      for (const c of d.children) m[c] = d.no;
    }
    return m;
  }, [deptTree]);

  // Group staff by department name (memoized)
  const staffByDept = useMemo(() => {
    const map = new Map<string, typeof staffList>();
    for (const s of staffList) {
      for (const deptNo of (s.departments ?? [])) {
        const deptName = deptNameMap[deptNo] ?? `部门${deptNo}`;
        if (!map.has(deptName)) map.set(deptName, []);
        const arr = map.get(deptName)!;
        if (!arr.find(x => x.username === s.username)) arr.push(s);
      }
    }
    return map;
  }, [staffList, deptNameMap]);

  // Auto-expand ancestors when searching
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) return;
    const nos = new Set<number>();
    for (const d of deptTree) {
      const members = (staffByDept.get(d.name) ?? []).filter(s => s.name.toLowerCase().includes(q));
      if (members.length > 0) {
        let cur: number | undefined = d.no;
        while (cur !== undefined) { nos.add(cur); cur = parentMap[cur]; }
      }
    }
    setExpandedNos(nos);
  }, [query, deptTree, staffByDept, parentMap]);

  const deptGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const nodes = q ? deptTree : deptTree.filter(d => visibleNos.has(d.no));
    return nodes.map(d => {
      const allMembers = staffByDept.get(d.name) ?? [];
      const members = q ? allMembers.filter(s => s.name.toLowerCase().includes(q)) : allMembers;
      return { no: d.no, name: d.name, depth: d.depth, hasChildren: d.children.length > 0, members };
    }).filter(d => !q || d.members.length > 0);
  }, [staffByDept, deptTree, visibleNos, query]);

  return (
    <div className="relative">
      {multi ? (
        // Multi-select display
        multiValue.length > 0 ? (
          <div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center flex-wrap gap-1 min-h-[44px]" onClick={() => setOpen(true)}>
            {multiValue.map(name => (
              <span key={name} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}>
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">{name.slice(0, 1)}</span>
                {name}
                <button className="ml-1 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); onChange(multiValue.filter(n => n !== name)); }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <button type="button" onClick={() => setOpen(true)}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg py-2 flex items-center justify-center gap-1 hover:border-emerald-400 transition-colors bg-white"
            style={{ color: "#9ca3af", minHeight: 44 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span className="text-sm">选择参训人员</span>
          </button>
        )
      ) : singleValue ? (
        <div className="w-full bg-white border border-gray-200 rounded-[10px] px-2.5 py-1.5 flex items-center min-h-[44px]">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}>
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">{singleValue.slice(0, 1)}</span>
            {singleValue}
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
              ) : deptGroups.map(({ no, name, depth, hasChildren, members }) => {
                const canExpand = hasChildren || members.length > 0;
                const isExpanded = canExpand && expandedNos.has(no);
                return (
                  <div key={no}>
                    <button type="button" onClick={() => canExpand && toggleDept(no)}
                      className="w-full flex items-center gap-1.5 pr-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                      style={{ paddingLeft: 12 + depth * 16 }}>
                      {canExpand && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                      )}
                      {name}
                      <span className="text-xs text-gray-400 ml-auto">{members.length}人</span>
                    </button>
                    {isExpanded && members.map(s => (
                      <button key={s.name} type="button" onClick={() => {
                        if (multi) { onChange(selectedSet.has(s.name) ? multiValue.filter(n => n !== s.name) : [...multiValue, s.name]); }
                        else { onChange(s.name); setOpen(false); }
                      }}
                        className="w-full text-left pr-4 py-2.5 text-base hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2"
                        style={{ paddingLeft: 40 + depth * 16, color: (selectedSet.has(s.name) || singleValue === s.name) ? "#059669" : "#374151", background: (selectedSet.has(s.name) || singleValue === s.name) ? "rgba(16,185,129,0.05)" : "transparent" }}>
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
