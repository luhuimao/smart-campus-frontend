"use client";

import { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { Trash2, Clock, Search, ChevronDown } from "lucide-react";
import { PageHeader } from "./PageHeader";
import { ClassRankFormDrawer } from "./ClassRankFormModal";
import { DataTable, ColDef } from "./DataTable";
import { useClassRank, type ClassRankRecord } from "@/hooks/use-research-dashboard";
import { useFormPermissions } from "@/hooks/use-form-permissions";
import { JDY_CONFIG } from "@/lib/jdy-api";
import { useCurrentUser } from "@/lib/user-context";

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

function IconDropdown({ icon, tooltip, options, onSelect, disabledOptions }: {
  icon: React.ReactNode;
  tooltip: string;
  options: string[];
  onSelect?: (option: string) => void;
  disabledOptions?: string[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const disabledSet = new Set(disabledOptions ?? []);

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
          {options.map(opt => {
            const isDisabled = disabledSet.has(opt);
            return (
              <button
                key={opt}
                onClick={() => { if (!isDisabled) { setOpen(false); onSelect?.(opt); } }}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "#374151" }}
                disabled={isDisabled}
              >
                {opt}
              </button>
            );
          })}
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



type Row = ClassRankRecord;

const COLUMNS: ColDef<Row>[] = [
  { key: "学期",     label: "学期",   textSize: "text-sm" },
  { key: "考试名称", label: "考试名称" },
  { key: "年级",     label: "年级" },
  { key: "班级",     label: "班级",   cellColor: "#1e40af" },
  { key: "教师姓名", label: "教师姓名" },
  { key: "学科",     label: "学科" },
  { key: "班级排名", label: "班级排名", headerColor: "#3b82f6" },
  { key: "提交人",   label: "提交人",   minWidth: 80 },
  { key: "提交时间",  label: "提交时间",  minWidth: 160 },
  { key: "更新时间",  label: "更新时间",  minWidth: 160 },
];

export function ClassRankPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerRecord, setDrawerRecord] = useState<ClassRankRecord | null>(null);
  const [dataMode, setDataMode] = useState<"all" | "mine">("mine");
  const [sortField, setSortField] = useState<keyof ClassRankRecord>("提交时间");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selectedLabel, setSelectedLabel] = useState("管理本人创建数据");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentUser = useCurrentUser();
  const { raw, isPending, isError, refetch, isFetching } = useClassRank();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const perms = useFormPermissions(JDY_CONFIG.CLASS_RANK.entry_id);

  const doExport = (data: ClassRankRecord[]) => {
    const headers = COLUMNS.map(c => c.label);
    const rows = data.map(r => COLUMNS.map(c => String(r[c.key as keyof ClassRankRecord] ?? "")));
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "班级排名");
    XLSX.writeFile(wb, `教师所带班级排名_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    function h(e: MouseEvent) { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!sortOpen) return;
    function h(e: MouseEvent) { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [sortOpen]);

  const dataFiltered = dataMode === "mine" && currentUser
    ? raw.filter(r => r.提交人 === currentUser.name)
    : raw;

  const filtered = dataFiltered.filter(r =>
    r.班级.includes(search) || r.考试名称.includes(search) || r.学科.includes(search)
  );

  const sorted = [...filtered].sort((a, b) => {
    const va = String(a[sortField] ?? "");
    const vb = String(b[sortField] ?? "");
    const cmp = va.localeCompare(vb, "zh");
    return sortDir === "desc" ? -cmp : cmp;
  });

  const SORT_OPTIONS: { label: string; field: keyof ClassRankRecord }[] = [
    { label: "提交时间", field: "提交时间" },
    { label: "更新时间", field: "更新时间" },
    { label: "学期", field: "学期" },
    { label: "考试名称", field: "考试名称" },
    { label: "班级排名", field: "班级排名" },
  ];

  const dropdownOptions = [
    { label: "添加数据", disabled: !perms.canCreate, action: () => { setDrawerRecord(null); setDrawerOpen(true); setSelectedLabel("添加数据"); setDropdownOpen(false); } },
    { label: "管理本人创建数据", action: () => { setDataMode("mine"); setSelectedLabel("管理本人创建数据"); setDropdownOpen(false); } },
    { label: "全部有权限数据", action: () => { setDataMode("all"); setSelectedLabel("全部有权限数据"); setDropdownOpen(false); } },
  ] as const;

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#111827" }}>
      {<ClassRankFormDrawer record={drawerRecord} open={drawerOpen} onClose={() => setDrawerOpen(false)} canDelete={perms.canDelete} />}
      <PageHeader
        breadcrumbs={[{ label: "教师基础档案" }, { label: "教师所带班级排名", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] p-4 md:p-6">
        <div className="glass rounded-[32px] overflow-hidden flex flex-col shadow-sm" style={{ minHeight: 500 }}>

          {/* 操作栏 */}
          <div className="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">

            {/* 左：主操作 — 下拉框 */}
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 h-9 px-4 text-[15px] font-semibold rounded-xl transition-all duration-150 shrink-0"
                style={{
                  minWidth: 200,
                  background: "white",
                  color: "#374151",
                  border: "1px solid rgba(0,0,0,0.1)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <span className="flex-1 text-left">{selectedLabel}</span>
                <ChevronDown
                  className="w-4 h-4 shrink-0 transition-transform duration-200"
                  style={{ color: "#9ca3af", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </button>
              {dropdownOpen && (
                <div
                  className="absolute left-0 top-full mt-2 rounded-2xl overflow-hidden z-50"
                  style={{
                    minWidth: 200,
                    background: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    boxShadow: "0 12px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
                    animation: "classRankDropdownIn 0.15s ease-out",
                  }}
                >
                  {dropdownOptions.map((opt, i) => {
                    const isSelected = opt.label === selectedLabel;
                    return (
                      <button
                        key={opt.label}
                        onClick={"disabled" in opt && opt.disabled ? undefined : opt.action}
                        className="w-full flex items-center gap-3 text-left px-4 h-11 text-[15px] font-medium transition-colors duration-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={"disabled" in opt && opt.disabled}
                        style={{
                          color: isSelected ? teal : "#374151",
                          background: isSelected ? "rgba(0,176,149,0.06)" : "transparent",
                          borderTop: i > 0 ? "1px solid rgba(0,0,0,0.04)" : "none",
                        }}
                        onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.03)"; }}
                        onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <span className="w-4 h-4 flex items-center justify-center shrink-0">
                          {isSelected && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span className="flex-1">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <style>{`@keyframes classRankDropdownIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>

            {/* 次要操作：icon-only，带 tooltip */}
            <div className="flex items-center gap-0.5 pl-1 border-l border-gray-200 ml-1">
              {perms.canExport && (
                <IconDropdown
                  tooltip="导出"
                  icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 14 12 9 17 14" /><line x1="12" y1="9" x2="12" y2="21" /></svg>}
                  options={["勾选的数据", "全部数据"]}
                  disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                  onSelect={opt => {
                    if (opt === "勾选的数据") {
                      const idSet = new Set(selectedIds);
                      doExport(raw.filter(r => idSet.has(r.id)));
                    } else {
                      doExport(raw);
                    }
                  }}
                />
              )}
              {perms.canDelete && (
                <IconDropdown
                  tooltip="删除"
                  icon={<Trash2 className="w-5 h-5" />}
                  options={["勾选的数据", "全部数据"]}
                  disabledOptions={selectedIds.length === 0 ? ["勾选的数据"] : undefined}
                />
              )}
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
              <div className="relative" ref={sortRef}>
                <Tooltip text="排序">
                  <button
                    onClick={() => setSortOpen(v => !v)}
                    className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all"
                    style={{ color: sortField !== "提交时间" || sortDir !== "desc" ? teal : "#9ca3af" }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" /><path d="M6 12h12" /><path d="M9 18h6" />
                    </svg>
                  </button>
                </Tooltip>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50" style={{ minWidth: 160, background: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)" }}>
                    <div className="px-3 py-2 border-b border-gray-100 flex items-center gap-2">
                      <span className="text-xs font-medium" style={{ color: "#9ca3af" }}>排序字段</span>
                      <div className="flex-1" />
                      <button
                        onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
                        className="text-xs px-2 py-0.5 rounded-md transition-colors hover:bg-black/[0.04]"
                        style={{ color: teal }}
                      >
                        {sortDir === "desc" ? "降序" : "升序"}
                      </button>
                    </div>
                    {SORT_OPTIONS.map(opt => {
                      const active = sortField === opt.field;
                      return (
                        <button
                          key={opt.field}
                          onClick={() => { setSortField(opt.field); setSortOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-black/[0.04] flex items-center gap-2"
                          style={{ color: active ? teal : "#374151", fontWeight: active ? 600 : 400 }}
                        >
                          {opt.label}
                          {active && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={teal} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="ml-auto">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <Tooltip text="刷新">
                <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-black/[0.05] transition-all" onClick={() => refetch()} disabled={isFetching}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isFetching ? "animate-spin" : ""}>
                    <path d="M23 4v6h-6" /><path d="M1 20v-6h6" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                </button>
              </Tooltip>
            </div>
          </div>

          {isPending ? (
            <div className="flex items-center justify-center py-20 text-sm text-gray-400">加载中...</div>
          ) : isError ? (
            <div className="flex items-center justify-center py-20 text-sm text-red-400">加载失败，请稍后重试</div>
          ) : (
            <DataTable
              columns={COLUMNS}
              rows={sorted}
              minWidth={1200}
              onSelectionChange={setSelectedIds}
              onRowClick={r => { setDrawerRecord(r); setDrawerOpen(true); }}
            />
          )}

        </div>
      </div>
    </div>
  );
}
