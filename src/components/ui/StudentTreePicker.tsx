"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useStudentInfo, type StudentInfoRecord } from "@/hooks/use-research-dashboard";

export function StudentTreePicker({
  value,
  onChange,
  onSelectRecord,
  multi,
  title = "选择学生",
}: {
  value: string | string[];
  onChange: (v: string | string[]) => void;
  onSelectRecord?: (record: StudentInfoRecord | null) => void;
  multi?: boolean;
  title?: string;
}) {
  const singleValue = typeof value === "string" ? value : "";
  const multiValue = Array.isArray(value) ? value : [];
  const selectedSet = useMemo(() => new Set(multiValue), [multiValue]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { allRecords } = useStudentInfo(undefined, true);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  // Build grade → class → students tree
  const { grades, classTree, studentMap } = useMemo(() => {
    const gradeMap = new Map<string, Map<string, StudentInfoRecord[]>>();
    const sMap = new Map<string, StudentInfoRecord>();
    for (const s of allRecords) {
      const grade = s.年级名称 || "未分类";
      const cls = s.班级名称 || "未分类";
      if (!gradeMap.has(grade)) gradeMap.set(grade, new Map());
      const classMap = gradeMap.get(grade)!;
      if (!classMap.has(cls)) classMap.set(cls, []);
      classMap.get(cls)!.push(s);
      sMap.set(s.姓名, s);
    }
    // Sort grades
    const sortedGrades = [...gradeMap.keys()].sort((a, b) => a.localeCompare(b, "zh"));
    // Build tree: each grade has sorted classes with sorted students
    const tree = sortedGrades.map(grade => {
      const classMap = gradeMap.get(grade)!;
      const sortedClasses = [...classMap.keys()].sort((a, b) => a.localeCompare(b, "zh"));
      return {
        grade,
        classes: sortedClasses.map(cls => ({
          name: cls,
          students: [...classMap.get(cls)!].sort((a, b) => a.姓名.localeCompare(b.姓名, "zh")),
        })),
      };
    });
    return { grades: sortedGrades, classTree: tree, studentMap: sMap };
  }, [allRecords]);

  const q = query.trim().toLowerCase();

  // Accordion state: expanded grades and expanded classes
  const [expandedGrades, setExpandedGrades] = useState<Set<string>>(new Set());
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());

  // Auto-expand when searching
  useEffect(() => {
    if (!q) return;
    const newGrades = new Set<string>();
    const newClasses = new Set<string>();
    for (const g of classTree) {
      for (const c of g.classes) {
        const match = c.students.some(s => s.姓名.toLowerCase().includes(q) || s.班级名称?.toLowerCase().includes(q));
        if (match) { newGrades.add(g.grade); newClasses.add(`${g.grade}|${c.name}`); }
      }
    }
    setExpandedGrades(newGrades);
    setExpandedClasses(newClasses);
  }, [q, classTree]);

  const toggleGrade = (grade: string) => {
    setExpandedGrades(prev => {
      const next = new Set(prev);
      if (next.has(grade)) { next.delete(grade); } else {
        for (const g of grades) { if (g !== grade) next.delete(g); }
        next.add(grade);
      }
      return next;
    });
  };

  const toggleClass = (key: string) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); } else {
        // Collapse siblings (same grade)
        const gradeKey = key.split("|")[0];
        for (const k of prev) { if (k.startsWith(gradeKey + "|")) next.delete(k); }
        next.add(key);
      }
      return next;
    });
  };

  const handleSelect = (record: StudentInfoRecord) => {
    if (multi) {
      onChange(selectedSet.has(record.姓名) ? multiValue.filter(n => n !== record.姓名) : [...multiValue, record.姓名]);
      onSelectRecord?.(record);
    } else {
      onChange(record.姓名);
      onSelectRecord?.(record);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      {multi ? (
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
            <span className="text-sm">选择学生</span>
          </button>
        )
      ) : singleValue ? (
        <div className="border border-dashed border-gray-300 bg-white rounded-[10px] px-3 py-2 min-h-[44px] flex items-center flex-wrap gap-2">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs border" style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}>
            <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">{singleValue.slice(0, 1)}</span>
            {singleValue}
            <button className="ml-1 opacity-60 hover:opacity-100" onClick={() => { onChange(""); onSelectRecord?.(null); }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </span>
        </div>
      ) : (
        <button type="button" onClick={() => setOpen(true)}
          className="w-full border border-dashed border-gray-300 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-2 text-base text-gray-500 transition-all hover:border-[#00b095] hover:text-[#00b095]"
          style={{ minHeight: 44 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          选择学生
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
              <input ref={inputRef} type="text" placeholder="搜索学生姓名或班级..." value={query} onChange={e => setQuery(e.target.value)}
                className="flex-1 outline-none text-base bg-transparent text-gray-700 placeholder-gray-400" />
              {query && (
                <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              )}
            </div>
            <div className="overflow-y-auto px-2 pb-3" style={{ maxHeight: "55vh" }}>
              {classTree.length === 0 ? (
                <p className="text-base text-gray-400 text-center py-8">加载中...</p>
              ) : (
                (() => {
                  // In search mode, flatten all matching students
                  if (q) {
                    const results = allRecords.filter(s =>
                      s.姓名.toLowerCase().includes(q) || s.班级名称?.toLowerCase().includes(q)
                    );
                    if (results.length === 0) return <p className="text-base text-gray-400 text-center py-8">无匹配结果</p>;
                    return results.map(s => {
                      const isSelected = multi ? selectedSet.has(s.姓名) : singleValue === s.姓名;
                      return (
                        <button key={s._id} type="button" onClick={() => handleSelect(s)}
                          className="w-full text-left px-4 py-2.5 text-base hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2"
                          style={{ color: isSelected ? "#059669" : "#374151", background: isSelected ? "rgba(16,185,129,0.05)" : "transparent" }}>
                          <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{s.姓名.slice(0, 1)}</span>
                          <div className="flex-1 min-w-0">
                            <span>{s.姓名}</span>
                            <span className="text-xs text-gray-400 ml-2">{[s.年级名称, s.班级名称].filter(Boolean).join(" · ")}</span>
                          </div>
                        </button>
                      );
                    });
                  }
                  // Tree mode
                  return classTree.map(g => {
                    const isGradeExpanded = expandedGrades.has(g.grade);
                    const gradeMatchCount = g.classes.reduce((sum, c) => sum + c.students.length, 0);
                    return (
                      <div key={g.grade}>
                        <button type="button" onClick={() => toggleGrade(g.grade)}
                          className="w-full flex items-center gap-1.5 pr-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                          style={{ paddingLeft: 12 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isGradeExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                          {g.grade}
                          <span className="text-xs text-gray-400 ml-auto">{gradeMatchCount}人</span>
                        </button>
                        {isGradeExpanded && g.classes.map(c => {
                          const clsKey = `${g.grade}|${c.name}`;
                          const isClsExpanded = expandedClasses.has(clsKey);
                          return (
                            <div key={clsKey}>
                              <button type="button" onClick={() => toggleClass(clsKey)}
                                className="w-full flex items-center gap-1.5 pr-3 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                                style={{ paddingLeft: 28 }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isClsExpanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.15s", flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                                {c.name}
                                <span className="text-xs text-gray-400 ml-auto">{c.students.length}人</span>
                              </button>
                              {isClsExpanded && c.students.map(s => {
                                const isSelected = multi ? selectedSet.has(s.姓名) : singleValue === s.姓名;
                                return (
                                  <button key={s._id} type="button" onClick={() => handleSelect(s)}
                                    className="w-full text-left pr-4 py-2.5 text-base hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2"
                                    style={{ paddingLeft: 44, color: isSelected ? "#059669" : "#374151", background: isSelected ? "rgba(16,185,129,0.05)" : "transparent" }}>
                                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{s.姓名.slice(0, 1)}</span>
                                    <span>{s.姓名}</span>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  });
                })()
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
