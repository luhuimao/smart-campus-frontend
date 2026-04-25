"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus, Trash2, Clock, Search,
} from "lucide-react";
import { PageHeader } from "./PageHeader";
import { CivilizedDormFormModal } from "./CivilizedDormFormModal";
import { DataTable, ColDef } from "./DataTable";

const teal = "#00b095";

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

function IconDropdown({ icon, tooltip, options }: {
  icon: React.ReactNode;
  tooltip: string;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
          {options.map(opt => (
            <button
              key={opt}
              onClick={() => setOpen(false)}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04]"
              style={{ color: "#374151" }}
            >
              {opt}
            </button>
          ))}
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
      className="flex items-center rounded-lg border transition-all duration-200 overflow-hidden"
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

type Row = {
  id: number;
  year: string;
  week: string;
  building: string;
  floor: string;
  dormNo: string;
  className: string;
  grade: string;
  headTeacher: string;
  gradeDirector: string;
  submitter: string;
  submitTime: string;
  updateTime: string;
};

const rows: Row[] = [
  { id: 1, year: "2026", week: "第3周", building: "A栋", floor: "3楼", dormNo: "301", className: "高一(1)班", grade: "高一", headTeacher: "张晓燕", gradeDirector: "王建国", submitter: "张晓燕", submitTime: "2026-04-15 08:40", updateTime: "2026-04-15 08:40" },
  { id: 2, year: "2026", week: "第3周", building: "B栋", floor: "2楼", dormNo: "205", className: "高二(3)班", grade: "高二", headTeacher: "刘明辉", gradeDirector: "陈淑芳", submitter: "刘明辉", submitTime: "2026-04-15 09:22", updateTime: "2026-04-15 09:22" },
  { id: 3, year: "2026", week: "第3周", building: "C栋", floor: "4楼", dormNo: "412", className: "高三(2)班", grade: "高三", headTeacher: "黄志远", gradeDirector: "林佳琪", submitter: "黄志远", submitTime: "2026-04-15 10:15", updateTime: "2026-04-16 08:30" },
  { id: 4, year: "2026", week: "第2周", building: "A栋", floor: "5楼", dormNo: "508", className: "高一(4)班", grade: "高一", headTeacher: "李秀英", gradeDirector: "王建国", submitter: "李秀英", submitTime: "2026-04-08 09:05", updateTime: "2026-04-08 09:05" },
  { id: 5, year: "2026", week: "第2周", building: "B栋", floor: "1楼", dormNo: "103", className: "高二(1)班", grade: "高二", headTeacher: "吴凤莲", gradeDirector: "陈淑芳", submitter: "吴凤莲", submitTime: "2026-04-08 14:50", updateTime: "2026-04-09 10:20" },
  { id: 6, year: "2025", week: "第18周", building: "C栋", floor: "2楼", dormNo: "218", className: "高三(5)班", grade: "高三", headTeacher: "赵鹏飞", gradeDirector: "林佳琪", submitter: "赵鹏飞", submitTime: "2025-12-20 15:30", updateTime: "2025-12-20 15:30" },
];

const COLUMNS: ColDef<Row>[] = [
  { key: "year",          label: "年份" },
  { key: "week",          label: "周次" },
  { key: "building",      label: "楼栋" },
  { key: "floor",         label: "楼层" },
  { key: "dormNo",        label: "宿舍号",  cellColor: "#1e40af" },
  { key: "className",     label: "班级",    cellColor: "#1e40af" },
  { key: "grade",         label: "级部" },
  { key: "headTeacher",   label: "班主任" },
  { key: "gradeDirector", label: "级部主任" },
  { key: "submitter",     label: "提交人" },
  { key: "submitTime",    label: "提交时间", cellColor: "#6b7280", textSize: "text-sm" },
  { key: "updateTime",    label: "更新时间", cellColor: "#6b7280", textSize: "text-sm" },
];

export function CivilizedDormPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = rows.filter(r =>
    r.dormNo.includes(search) || r.className.includes(search) || r.headTeacher.includes(search)
  );

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#111827" }}>
      <PageHeader
        breadcrumbs={[{ label: "教师评价" }, { label: "班主任所带文明宿舍", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      {modalOpen && <CivilizedDormFormModal onClose={() => setModalOpen(false)} />}

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-4 md:p-6">
        <div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-sm" style={{ minHeight: 500 }}>

          {/* 操作栏 */}
          <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">

            {/* 左：主操作 */}
            <button
              className="flex items-center gap-1.5 text-white text-[15px] font-medium px-3 h-8 rounded-lg transition-all hover:opacity-90 active:translate-y-px shrink-0"
              style={{ background: teal }}
              onClick={() => setModalOpen(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              添加
            </button>

            {/* 次要操作：icon-only，带 tooltip */}
            <div className="flex items-center gap-0.5 pl-1 border-l border-gray-200 ml-1">
              <IconDropdown
                tooltip="导出"
                icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>}
                options={["筛选后的数据", "全部数据"]}
              />
              <IconDropdown
                tooltip="删除"
                icon={<Trash2 className="w-5 h-5" />}
                options={["筛选后的数据", "全部数据"]}
              />
              <IconDropdown
                tooltip="操作记录"
                icon={<Clock className="w-5 h-5" />}
                options={["批量修改记录", "批量打印模板记录"]}
              />
            </div>

            {/* 弹性间距 */}
            <div className="flex-1" />

            {/* 右：搜索 + 筛选 + 视图 */}
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
              <Tooltip text="表格视图">
                <button className="flex items-center justify-center w-8 h-8 rounded-lg transition-all" style={{ background: "rgba(0,176,149,0.08)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="12" cy="12" r="3" /><path d="M3 12h18" />
                  </svg>
                </button>
              </Tooltip>
              <Tooltip text="列表视图">
                <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                </button>
              </Tooltip>
              <Tooltip text="刷新">
                <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
              </Tooltip>
              <Tooltip text="更多操作">
                <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                  </svg>
                </button>
              </Tooltip>
            </div>
          </div>

          <DataTable columns={COLUMNS} rows={filtered} minWidth={1100} />

        </div>
      </div>
    </div>
  );
}
