"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const teal = "#00b095";

// ── 列定义 ────────────────────────────────────────────────────────────────────
export interface ColDef<T> {
  key: string;
  label: string;
  /** 自定义渲染；不传则渲染 row[key] 的字符串值 */
  render?: (row: T) => React.ReactNode;
  /** 表头文字颜色，默认 #262626 */
  headerColor?: string;
  /** 单元格文字颜色，默认 #374151 */
  cellColor?: string;
  /** 单元格文字大小，默认 text-sm */
  textSize?: "text-xs" | "text-sm" | "text-base";
  minWidth?: number;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface DataTableProps<T extends { id: number }> {
  columns: ColDef<T>[];
  rows: T[];
  /** 表格最小宽度，默认 800 */
  minWidth?: number;
  /** 每页条数，默认 20 */
  pageSize?: number;
  /** 行点击回调，传入后行可点击并 hover 显示编辑图标 */
  onRowClick?: (row: T) => void;
  /** 选中行变化回调，传入当前选中行的 id 数组 */
  onSelectionChange?: (ids: number[]) => void;
}

// ── 空状态插图 ────────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <svg viewBox="0 0 200 150" className="w-56 h-40 mb-4" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50 L0 80 L200 80 Z" fill="rgba(255,243,176,0.3)" />
        <ellipse cx="100" cy="130" rx="60" ry="15" fill="rgba(230,230,230,0.5)" />
        <path d="M90 125 L92 55 L108 55 L110 125 Z" fill="#d9e3f0" />
        <rect x="88" y="50" width="24" height="6" fill="#bfcedd" rx="1" />
        <circle cx="100" cy="42" r="8" fill="#d9e3f0" />
        <circle cx="65" cy="115" r="8" fill="#e1e8f0" />
        <rect x="64" y="122" width="2" height="10" fill="#e1e8f0" />
        <circle cx="145" cy="120" r="6" fill="#e1e8f0" />
        <rect x="144" y="125" width="2" height="8" fill="#e1e8f0" />
      </svg>
      <span className="text-sm" style={{ color: "#9ca3af" }}>暂无数据</span>
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────────────
export function DataTable<T extends { id: number }>({
  columns,
  rows,
  minWidth = 800,
  pageSize: defaultPageSize = 20,
  onRowClick,
  onSelectionChange,
}: DataTableProps<T>) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(defaultPageSize);

  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const syncingRef = useRef(false);
  const [topSpacerWidth, setTopSpacerWidth] = useState(minWidth);

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setTopSpacerWidth(el.scrollWidth);
    });
    ro.observe(el);
    setTopSpacerWidth(el.scrollWidth);
    return () => ro.disconnect();
  }, [rows, columns]);

  const syncScroll = useCallback((source: "top" | "bottom") => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    const topEl = topScrollRef.current;
    const tableEl = tableScrollRef.current;
    if (!topEl || !tableEl) { syncingRef.current = false; return; }
    if (source === "top") {
      tableEl.scrollLeft = topEl.scrollLeft;
    } else {
      topEl.scrollLeft = tableEl.scrollLeft;
    }
    requestAnimationFrame(() => { syncingRef.current = false; });
  }, []);

  useEffect(() => {
    onSelectionChange?.(Array.from(selected));
  }, [selected, onSelectionChange]);

  const totalPages = Math.max(1, Math.ceil(rows.length / size));
  const paginated = rows.slice((page - 1) * size, page * size);

  const allSelected = paginated.length > 0 && paginated.every(r => selected.has(r.id));

  function toggleAll() {
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) paginated.forEach(r => next.delete(r.id));
      else             paginated.forEach(r => next.add(r.id));
      return next;
    });
  }

  function toggleRow(id: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function getValue(row: T, key: string): React.ReactNode {
    return String((row as Record<string, unknown>)[key] ?? "");
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* 顶部横向滚动条 */}
      <div
        ref={topScrollRef}
        className="overflow-x-auto"
        style={{ overflowY: "hidden" }}
        onScroll={() => syncScroll("top")}
      >
        <div style={{ height: 1, width: topSpacerWidth }} />
      </div>

      {/* 表格主体 */}
      <div ref={tableScrollRef} className="overflow-x-auto flex-1" onScroll={() => syncScroll("bottom")}>
        <table ref={tableRef} className="w-full text-left" style={{ minWidth }}>
          <thead>
            <tr style={{ background: "#eff6ff" }}>
              <th className="w-10 px-3 py-3 border-b border-r border-gray-100">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded cursor-pointer"
                  style={{ accentColor: teal }}
                />
              </th>
              {columns.map(col => (
                <th
                  key={col.key}
                  className="px-4 py-3 font-medium border-b border-r border-gray-100 whitespace-nowrap"
                  style={{ fontSize: 15, color: col.headerColor ?? "#374151", minWidth: col.minWidth }}
                >
                  {col.label}
                </th>
              ))}
              {onRowClick && <th className="w-10 px-3 py-3 border-b border-r border-gray-100" />}
            </tr>
          </thead>
          <tbody>
            {paginated.map(row => (
              <tr
                key={row.id}
                className="border-t border-gray-50 hover:bg-gray-50 transition-colors group"
                style={{ background: selected.has(row.id) ? "rgba(0,176,149,0.04)" : undefined, cursor: onRowClick ? "pointer" : undefined }}
                onClick={() => onRowClick?.(row)}
              >
                <td className="px-3 py-3 border-r border-gray-50" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    className="w-4 h-4 rounded cursor-pointer"
                    style={{ accentColor: teal }}
                  />
                </td>
                {columns.map(col => (
                  <td
                    key={col.key}
                    className="px-4 py-3 whitespace-nowrap"
                    style={{ fontSize: 15, color: col.cellColor ?? "#374151" }}
                  >
                    {col.render ? col.render(row) : getValue(row, col.key)}
                  </td>
                ))}
                {onRowClick && (
                  <td className="px-3 py-3 border-r border-gray-50">
                    <div className="w-6 h-6 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: "#9ca3af" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 && <EmptyState />}
      </div>

      {/* 分页栏 */}
      <div
        className="px-4 py-2.5 border-t border-gray-100 flex flex-wrap justify-between items-center gap-2 text-sm shrink-0"
        style={{ color: "#6b7280" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4" style={{ color: "#9ca3af" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-gray-500 transition-colors">
              <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cursor-pointer hover:text-gray-500 transition-colors">
              <path d="M15 3h6v6" /><path d="M9 21H3v-6" /><path d="M21 3l-7 7" /><path d="M3 21l7-7" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <select
              value={size}
              onChange={e => { setSize(Number(e.target.value)); setPage(1); }}
              className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none appearance-none cursor-pointer"
              style={{ color: "#374151", paddingRight: 20 }}
            >
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} 条/页</option>)}
            </select>
            <span className="text-xs" style={{ color: "#6b7280" }}>共 {rows.length} 条</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "#9ca3af" }}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg bg-white text-xs font-medium" style={{ color: "#374151" }}>
            {page}
          </div>
          <span className="text-xs px-1" style={{ color: "#9ca3af" }}>/ {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: "#9ca3af" }}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
