"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Clock, Search } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { ClassRankFormModal } from "./ClassRankFormModal";
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



const rows = [
  { id: 1, semester: "2025-2026学年第二学期", exam: "期中考试", grade: "高一", class: "高一(1)班", teacher: "黄景民", subject: "高中数学", classRank: 1, submitter: "黄景民", submitTime: "2026-04-22 09:14", updateTime: "2026-04-22 09:14" },
  { id: 2, semester: "2025-2026学年第二学期", exam: "期中考试", grade: "高一", class: "高一(3)班", teacher: "黄景民", subject: "高中数学", classRank: 3, submitter: "黄景民", submitTime: "2026-04-22 09:18", updateTime: "2026-04-22 09:18" },
  { id: 3, semester: "2025-2026学年第二学期", exam: "期中考试", grade: "高二", class: "高二(2)班", teacher: "莫燕",  subject: "高中数学", classRank: 2, submitter: "莫燕",  submitTime: "2026-04-21 14:30", updateTime: "2026-04-21 15:02" },
  { id: 4, semester: "2025-2026学年第二学期", exam: "月考",    grade: "高一", class: "高一(1)班", teacher: "黄景民", subject: "高中数学", classRank: 1, submitter: "黄景民", submitTime: "2026-04-10 08:50", updateTime: "2026-04-10 08:50" },
  { id: 5, semester: "2025-2026学年第一学期", exam: "期末考试", grade: "高一", class: "高一(1)班", teacher: "黄景民", subject: "高中数学", classRank: 2, submitter: "黄景民", submitTime: "2026-01-18 10:05", updateTime: "2026-01-18 10:05" },
  { id: 6, semester: "2025-2026学年第一学期", exam: "期末考试", grade: "高一", class: "高一(3)班", teacher: "黄景民", subject: "高中数学", classRank: 4, submitter: "黄景民", submitTime: "2026-01-18 10:22", updateTime: "2026-01-19 09:10" },
];

function RankBadge({ rank }: { rank: number }) {
  const color =
    rank === 1 ? { bg: "#fef3c7", text: "#d97706" } :
    rank === 2 ? { bg: "#f3f4f6", text: "#6b7280" } :
    rank === 3 ? { bg: "#fef3e8", text: "#c05621" } :
    { bg: "#eff6ff", text: "#3b82f6" };
  return (
    <span
      className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold"
      style={{ background: color.bg, color: color.text }}
    >
      {rank}
    </span>
  );
}


type Row = typeof rows[number];

const COLUMNS: ColDef<Row>[] = [
  { key: "semester",  label: "学期",   textSize: "text-sm" },
  { key: "exam",      label: "考试名称" },
  { key: "grade",     label: "年级" },
  { key: "class",     label: "班级",   cellColor: "#1e40af" },
  { key: "teacher",   label: "教师姓名" },
  { key: "subject",   label: "学科" },
  { key: "classRank", label: "班级排名", headerColor: "#3b82f6", render: r => <RankBadge rank={r.classRank} /> },
  { key: "submitter", label: "提交人" },
  { key: "submitTime", label: "提交时间", cellColor: "#6b7280", textSize: "text-sm" },
  { key: "updateTime", label: "更新时间", cellColor: "#6b7280", textSize: "text-sm" },
];

export function ClassRankPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = rows.filter(r =>
    r.class.includes(search) || r.exam.includes(search) || r.subject.includes(search)
  );

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#111827" }}>
      {modalOpen && <ClassRankFormModal onClose={() => setModalOpen(false)} />}
      <PageHeader
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教师所带班级排名", active: true }]}
        onMenuOpen={onMenuOpen}
      />

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

          <DataTable columns={COLUMNS} rows={filtered} minWidth={1000} />

        </div>
      </div>
    </div>
  );
}
