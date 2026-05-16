"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, RefreshCw, ArrowUpDown, Maximize2 } from "lucide-react";

// ── ActionBar ─────────────────────────────────────────────────────────────────

export type ActionItem = {
  Icon: React.ElementType;
  tip: string;
  onClick?: () => void;
  tipAlign?: "center" | "right";
  spinning?: boolean;
};

export function ActionBar({ show, actions }: { show: boolean; actions: ActionItem[] }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {actions.map(({ Icon, tip, onClick, tipAlign = "center", spinning }) => (
        <div key={tip} className="relative group/tip">
          <button
            onClick={onClick}
            className="w-6 h-6 flex items-center justify-center rounded-md text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors"
          >
            <span className={spinning ? "animate-spin" : undefined}><Icon size={12} /></span>
          </button>
          <div className={`pointer-events-none absolute top-full mt-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50 ${tipAlign === "right" ? "right-0" : "left-1/2 -translate-x-1/2"}`}>
            {tipAlign !== "right" && <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800/90" />}
            <div className="px-2 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md whitespace-nowrap">{tip}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TableWithTopScrollbar ─────────────────────────────────────────────────────

export function TableWithTopScrollbar({ children }: { children: React.ReactNode }) {
  const topRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = botRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => { setWidth(el.scrollWidth); });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function onTopScroll() { if (botRef.current && topRef.current) botRef.current.scrollLeft = topRef.current.scrollLeft; }
  function onBotScroll() { if (topRef.current && botRef.current) topRef.current.scrollLeft = botRef.current.scrollLeft; }

  return (
    <div>
      <div ref={topRef} onScroll={onTopScroll} style={{ overflowX: "auto", overflowY: "hidden", height: 12 }}>
        <div style={{ width, height: 1 }} />
      </div>
      <div ref={botRef} onScroll={onBotScroll} className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}

// ── PhotoPreview ──────────────────────────────────────────────────────────────

export function PhotoPreview({ src, alt }: { src: string; alt: string }) {
  const [visible, setVisible] = useState(false);
  const [floatPos, setFloatPos] = useState({ x: 0, y: 0 });
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  function clearHide() { if (hideTimer.current) { clearTimeout(hideTimer.current); hideTimer.current = null; } }
  function scheduleHide() { clearHide(); hideTimer.current = setTimeout(() => setVisible(false), 400); }
  function onThumbEnter() {
    clearHide();
    const el = thumbRef.current;
    if (el) { const rect = el.getBoundingClientRect(); setFloatPos({ x: rect.left, y: rect.top }); }
    setVisible(true);
  }

  const FLOAT_H = 244;
  const left = Math.min(floatPos.x, window.innerWidth - 260);
  const top  = floatPos.y - FLOAT_H - 4;

  return (
    <div ref={thumbRef} className="shrink-0 inline-block" onMouseEnter={onThumbEnter} onMouseLeave={scheduleHide}>
      <img src={src} alt={alt} className="rounded object-cover cursor-pointer" style={{ width: 32, height: 32 }} />
      {visible && (
        <div className="z-[9999] rounded-xl shadow-2xl flex flex-col"
          style={{ position: "fixed", left, top, width: 240, background: "#fff", border: "1px solid #e5e7eb", overflow: "hidden" }}
          onMouseEnter={clearHide} onMouseLeave={scheduleHide}>
          <img src={src} alt={alt} className="object-contain w-full" style={{ maxHeight: 200 }} />
          <a href={src} download={alt || "photo"} target="_blank" rel="noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 text-xs font-medium hover:bg-blue-50 transition-colors"
            style={{ color: "#3b82f6", borderTop: "1px solid #f3f4f6" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            下载图片
          </a>
        </div>
      )}
    </div>
  );
}

// ── ImageLightbox ─────────────────────────────────────────────────────────────

export function ImageLightbox({ images, index, onClose }: {
  images: { name: string; url: string }[];
  index: number;
  onClose: () => void;
}) {
  const [cur, setCur] = useState(index);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")  setCur(i => Math.max(0, i - 1));
      if (e.key === "ArrowRight") setCur(i => Math.min(images.length - 1, i + 1));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }} onClick={onClose}>
      <button className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10" onClick={onClose}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <a href={images[cur].url} download={images[cur].name} target="_blank" rel="noreferrer"
        className="absolute top-4 right-16 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
        onClick={e => e.stopPropagation()}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      </a>
      {cur > 0 && (
        <button className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          onClick={e => { e.stopPropagation(); setCur(i => i - 1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
      )}
      {cur < images.length - 1 && (
        <button className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white z-10"
          onClick={e => { e.stopPropagation(); setCur(i => i + 1); }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      )}
      <img src={images[cur].url} alt={images[cur].name}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl mx-auto block"
        onClick={e => e.stopPropagation()} />
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 text-white text-xs font-medium">
          {cur + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// ── FileTypeBadge ─────────────────────────────────────────────────────────────

export function FileTypeBadge({ file, type = "file" }: {
  file: { name: string; url: string };
  type?: "file" | "video";
}) {
  const ext = (file.name.split(".").pop() ?? "").toUpperCase().slice(0, 5);

  let color: string;
  let bg: string;
  let icon: React.ReactNode;

  if (type === "video") {
    color = ext === "MP4" ? "#8b5cf6" : ext === "MOV" ? "#ec4899" : ext === "AVI" ? "#f97316" : "#6366f1";
    bg    = ext === "MP4" ? "#f5f3ff" : ext === "MOV" ? "#fdf2f8" : ext === "AVI" ? "#fff7ed" : "#eef2ff";
    icon  = <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>;
  } else {
    color = ext === "PDF" ? "#ef4444" : ext.startsWith("PPT") ? "#f97316" : ext.startsWith("DOC") ? "#3b82f6" : ext.startsWith("XLS") ? "#10b981" : "#6366f1";
    bg    = ext === "PDF" ? "#fef2f2" : ext.startsWith("PPT") ? "#fff7ed" : ext.startsWith("DOC") ? "#eff6ff" : ext.startsWith("XLS") ? "#f0fdf4" : "#eef2ff";
    icon  = (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      </svg>
    );
  }

  return (
    <a href={file.url} target="_blank" rel="noreferrer" download={file.name}
      className="hover:opacity-80 transition-opacity" title={file.name}
      onClick={e => e.stopPropagation()}>
      <div className="rounded flex flex-col items-center justify-center gap-0.5" style={{ width: 32, height: 32, background: bg }}>
        {icon}
        <span style={{ fontSize: 7, fontWeight: 700, color, lineHeight: 1 }}>{ext || (type === "video" ? "MP4" : "FILE")}</span>
      </div>
    </a>
  );
}

// ── FileBadgeList ─────────────────────────────────────────────────────────────

export function FileBadgeList({ files, type = "file" }: {
  files: { name: string; url: string }[];
  type?: "file" | "video";
}) {
  if (files.length === 0) return <span style={{ fontSize: 15, color: "#9ca3af" }}>—</span>;
  return (
    <div className="flex items-center gap-1">
      {files.slice(0, 2).map((f, i) => <FileTypeBadge key={i} file={f} type={type} />)}
      {files.length > 2 && <span style={{ fontSize: 12, color: "#9ca3af" }}>+{files.length - 2}</span>}
    </div>
  );
}

// ── PhotoList ─────────────────────────────────────────────────────────────────

export function PhotoList({ photos }: { photos: { name: string; url: string }[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  if (photos.length === 0) return <span style={{ fontSize: 15, color: "#9ca3af" }}>—</span>;
  return (
    <>
      <div className="flex items-center gap-1">
        {photos.slice(0, 2).map((f, i) => (
          <div key={i} className="shrink-0 inline-block relative group/photo">
            <img src={f.url} alt={f.name}
              className="rounded object-cover cursor-zoom-in"
              style={{ width: 32, height: 32 }}
              onClick={e => { e.stopPropagation(); setLightboxIndex(i); }}
            />
          </div>
        ))}
        {photos.length > 2 && <span style={{ fontSize: 12, color: "#9ca3af" }}>+{photos.length - 2}</span>}
      </div>
      {lightboxIndex !== null && (
        <ImageLightbox images={photos} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

// ── DashboardTable ────────────────────────────────────────────────────────────

export type ColumnDef<T> = {
  key: string;
  header: string;
  minWidth?: number;
  render: (row: T) => React.ReactNode;
};

interface DashboardTableProps<T extends { _id: string }> {
  title: string;
  columns: ColumnDef<T>[];
  rows: T[];
  isPending: boolean;
  isError: boolean;
  sortAsc: boolean;
  onSortToggle: () => void;
  pageSize: number;
  onPageSizeChange: (s: number) => void;
  onRowClick?: (row: T) => void;
  onRefresh?: () => Promise<unknown> | void;
  // offset-pagination mode
  page?: number;
  totalRows?: number;
  onPageChange?: (p: number) => void;
  // cursor-pagination mode
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onFirst?: () => void;
  onLast?: () => void;
  pageIndex?: number;
}

export function DashboardTable<T extends { _id: string }>({
  title,
  columns,
  rows,
  isPending,
  isError,
  sortAsc,
  onSortToggle,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  onRefresh,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onFirst,
  onLast,
  pageIndex,
}: DashboardTableProps<T>) {
  const [hovered, setHovered] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  async function handleRefresh() {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try { await onRefresh(); } finally { setIsRefreshing(false); }
  }
  const cursorMode = onPrev !== undefined || onNext !== undefined;
  const totalPages = cursorMode ? undefined : Math.max(1, Math.ceil((totalRows ?? 0) / pageSize));

  return (
    <div className="glass rounded-[40px] overflow-hidden"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="flex items-center justify-between" style={{ padding: "10px 16px", borderBottom: "1px solid #f3f4f6" }}>
        <h3 className="flex-1 min-w-0 truncate" style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{title}</h3>
        <ActionBar show={hovered} actions={[
          { Icon: Upload, tip: "导出" },
          { Icon: RefreshCw, tip: "刷新", onClick: handleRefresh, spinning: isRefreshing },
          { Icon: ArrowUpDown, tip: sortAsc ? "时间升序（点击切换降序）" : "时间降序（点击切换升序）", onClick: onSortToggle, tipAlign: "right" },
          { Icon: Maximize2, tip: "放大", tipAlign: "right" },
        ]} />
      </div>

      <TableWithTopScrollbar>
        <table className="w-full text-left">
          <thead>
            <tr style={{ background: "#eff6ff" }}>
              {columns.map(col => (
                <th key={col.key} className="px-4 py-3 font-medium whitespace-nowrap"
                  style={{ fontSize: 15, color: "#374151", minWidth: col.minWidth }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isPending ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-gray-50">
                  {columns.map((col, j) => (
                    <td key={col.key} className="px-4 py-3">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? 160 : 80 }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center" style={{ fontSize: 15, color: "#9ca3af" }}>
                  {isError ? "加载失败，请刷新重试" : "暂无数据"}
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <tr key={row._id}
                  className={`border-t border-gray-50 transition-colors ${onRowClick ? "cursor-pointer hover:bg-gray-100" : ""}`}
                  onClick={() => onRowClick?.(row)}>
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWithTopScrollbar>

      <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-gray-100" style={{ fontSize: 14, color: "#374151" }}>
        <div className="flex items-center gap-1">
          <select className="border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none"
            style={{ color: "#374151" }} value={pageSize}
            onChange={e => { onPageSizeChange(Number(e.target.value)); if (onPageChange) onPageChange(1); }}>
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n} 条/页</option>)}
          </select>
          <span style={{ color: "#6b7280" }}>共 {totalRows ?? rows.length} 条</span>
        </div>
        <div className="flex items-center gap-1">
          {cursorMode ? (
            <>
              <button onClick={onFirst} disabled={!hasPrev}
                className="px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40">«</button>
              <button onClick={onPrev} disabled={!hasPrev}
                className="px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40">‹</button>
              <span className="px-2" style={{ color: "#374151" }}>
                第 {(pageIndex ?? 0) + 1} 页
                {totalRows != null && <> / 共 {Math.max(1, Math.ceil(totalRows / pageSize))} 页</>}
              </span>
              <button onClick={onNext} disabled={!hasNext}
                className="px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                style={{ color: "#374151" }}>›</button>
              <button onClick={onLast} disabled={!hasNext}
                className="px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                style={{ color: "#374151" }}>»</button>
            </>
          ) : (
            <>
              <button onClick={() => onPageChange!(1)} disabled={(page ?? 1) === 1}
                className="px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40">«</button>
              <button onClick={() => onPageChange!(Math.max(1, (page ?? 1) - 1))} disabled={(page ?? 1) === 1}
                className="px-2 py-1 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-40">‹</button>
              <span className="px-2" style={{ color: "#374151" }}>{page ?? 1} / {totalPages}</span>
              <button onClick={() => onPageChange!(Math.min(totalPages!, (page ?? 1) + 1))} disabled={(page ?? 1) === totalPages}
                className="px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                style={{ color: "#374151" }}>›</button>
              <button onClick={() => onPageChange!(totalPages!)} disabled={(page ?? 1) === totalPages}
                className="px-2 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                style={{ color: "#374151" }}>»</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
