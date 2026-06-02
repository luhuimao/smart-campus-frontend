"use client";

import { Plus, X, Search } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useDepartmentMembers, useStaffDirectory, type StaffDirectoryRecord } from "@/hooks/use-research-dashboard";
import type { DeptMemberRecord } from "@/hooks/use-research-dashboard";

interface StaffPickerProps {
  value: string;
  onChange: (name: string) => void;
  onSelectRecord?: (record: StaffDirectoryRecord | null) => void;
  onSelectMember?: (record: DeptMemberRecord | null) => void;
}

export function StaffPicker({ value, onChange, onSelectRecord, onSelectMember }: StaffPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { raw: staffList } = useDepartmentMembers();
  const { raw: fullStaffList } = useStaffDirectory();

  const filtered = useMemo(() => {
    if (!staffList.length) return [];
    if (!query.trim()) return staffList.slice(0, 30);
    const q = query.trim();
    return staffList.filter((s) => s.name.includes(q)).slice(0, 30);
  }, [staffList, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      document.addEventListener("mousedown", onClick);
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const handleSelect = (record: DeptMemberRecord) => {
    onChange(record.name);
    const full = onSelectRecord ? (fullStaffList.find(s => s.教职工姓名 === record.name) ?? null) : null;
    onSelectRecord?.(full);
    onSelectMember?.(record);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
    onSelectRecord?.(null);
    onSelectMember?.(null);
  };

  const initial = value ? value.slice(0, 1) : "?";

  return (
    <div ref={containerRef} className="relative">
      {value ? (
        <div className="border border-dashed border-gray-300 bg-white rounded-[10px] px-3 py-2 min-h-[44px] flex items-center flex-wrap gap-2">
          <div className="flex items-center bg-red-50 text-red-600 px-2 py-1 rounded-lg text-sm border border-red-100 gap-1.5">
            <div className="w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">
              {initial}
            </div>
            {value}
            <X
              className="w-3.5 h-3.5 opacity-50 hover:opacity-100 cursor-pointer transition-opacity"
              onClick={handleClear}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="w-full border border-dashed border-gray-300 bg-white rounded-[10px] px-3.5 py-2.5 flex items-center justify-center gap-2 text-base text-gray-500 transition-all hover:border-[#00b095] hover:text-[#00b095]"
          style={{ minHeight: 44 }}
          onClick={() => setOpen(true)}
        >
          <Plus className="w-4 h-4" /> 选择成员
        </button>
      )}

      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
          style={{ width: 340, maxHeight: 360 }}
        >
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索教职工姓名..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 outline-none text-base text-gray-700 placeholder-gray-400"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: 288 }}>
            {filtered.length === 0 ? (
              <p className="text-base text-gray-400 text-center py-8">无匹配结果</p>
            ) : (
              filtered.map((s) => (
                <button
                  key={s.username}
                  type="button"
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
                  onClick={() => handleSelect(s)}
                >
                  <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {s.name.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-gray-800 truncate">{s.name}</p>
                  </div>
                </button>
              )))
            }
          </div>

          {filtered.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 text-xs text-gray-400">
              共 {staffList.length} 条
            </div>
          )}
        </div>
      )}
    </div>
  );
}
