"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";

const DAYS   = ["日","一","二","三","四","五","六"];
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

function pad(n: number) { return String(n).padStart(2, "0"); }

function formatDateTime(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildCalendar(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ── Scroll column for hour / minute ──────────────────────────────────────────

function TimeColumn({ value, max, onChange }: { value: number; max: number; onChange: (v: number) => void }) {
  function inc() { onChange((value + 1) % (max + 1)); }
  function dec() { onChange((value - 1 + max + 1) % (max + 1)); }
  return (
    <div className="flex flex-col items-center" style={{ width: 36 }}>
      <button onClick={inc} className="p-0.5 rounded hover:bg-gray-100 transition-colors">
        <ChevronLeft size={12} style={{ transform: "rotate(90deg)" }} />
      </button>
      <input
        type="text"
        value={pad(value)}
        onChange={e => {
          const n = parseInt(e.target.value);
          if (!isNaN(n) && n >= 0 && n <= max) onChange(n);
        }}
        className="text-center outline-none rounded"
        style={{ width: 32, fontSize: 13, fontWeight: 600, color: "#111827", border: "1px solid #e5e7eb", padding: "2px 0" }}
      />
      <button onClick={dec} className="p-0.5 rounded hover:bg-gray-100 transition-colors">
        <ChevronLeft size={12} style={{ transform: "rotate(270deg)" }} />
      </button>
    </div>
  );
}

// ── Calendar + Time panel ─────────────────────────────────────────────────────

interface CalendarPanelProps {
  value: Date | null;
  onChange: (d: Date) => void;
  onClose: () => void;
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
}

function CalendarPanel({ value, onChange, onClose, rangeStart, rangeEnd }: CalendarPanelProps) {
  const today = new Date();
  const init  = value ?? today;
  const [view,    setView]    = useState({ year: init.getFullYear(), month: init.getMonth() });
  const [pending, setPending] = useState<Date | null>(value);
  const [hour,    setHour]    = useState(init.getHours());
  const [minute,  setMinute]  = useState(init.getMinutes());

  const cells = buildCalendar(view.year, view.month);

  function selectDay(day: number) {
    const d = new Date(view.year, view.month, day, hour, minute);
    setPending(d);
  }

  function confirm() {
    const base = pending ?? new Date(view.year, view.month, today.getDate());
    onChange(new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, minute));
    onClose();
  }

  function isSelected(day: number) {
    if (!pending) return false;
    return pending.getFullYear() === view.year && pending.getMonth() === view.month && pending.getDate() === day;
  }

  function inRange(day: number) {
    if (!rangeStart || !rangeEnd) return false;
    const d = new Date(view.year, view.month, day);
    return d > rangeStart && d < rangeEnd;
  }

  function isRangeEdge(day: number) {
    const d = new Date(view.year, view.month, day);
    return (rangeStart && d.toDateString() === rangeStart.toDateString()) ||
           (rangeEnd   && d.toDateString() === rangeEnd.toDateString());
  }

  function isToday(day: number) {
    return today.getFullYear() === view.year && today.getMonth() === view.month && today.getDate() === day;
  }

  return (
    <div style={{ width: 256, background: "white", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", border: "1px solid rgba(0,0,0,0.06)", padding: "12px" }}>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setView(v => v.month === 0 ? { year: v.year-1, month: 11 } : { ...v, month: v.month-1 })}
          className="p-1 rounded hover:bg-gray-100 transition-colors"><ChevronLeft size={14} /></button>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{view.year}年 {MONTHS[view.month]}</span>
        <button onClick={() => setView(v => v.month === 11 ? { year: v.year+1, month: 0 } : { ...v, month: v.month+1 })}
          className="p-1 rounded hover:bg-gray-100 transition-colors"><ChevronRight size={14} /></button>
      </div>

      {/* Week header */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center" style={{ fontSize: 11, color: "#9ca3af", paddingBottom: 4 }}>{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const selected  = isSelected(day);
          const edge      = !!isRangeEdge(day);
          const range     = inRange(day);
          const todayMark = isToday(day);
          return (
            <button key={i} onClick={() => selectDay(day)}
              className="flex items-center justify-center rounded-lg transition-colors"
              style={{
                height: 28, fontSize: 12,
                background: selected || edge ? "#13c2c2" : range ? "rgba(19,194,194,0.1)" : "transparent",
                color: selected || edge ? "white" : todayMark ? "#13c2c2" : "#374151",
                fontWeight: todayMark && !(selected || edge) ? 600 : 400,
              }}
              onMouseEnter={e => { if (!selected && !edge) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { if (!selected && !edge) (e.currentTarget as HTMLButtonElement).style.background = range ? "rgba(19,194,194,0.1)" : "transparent"; }}
            >{day}</button>
          );
        })}
      </div>

      {/* Time picker */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-center gap-2">
          <Clock size={13} style={{ color: "#9ca3af" }} />
          <TimeColumn value={hour}   max={23} onChange={setHour} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 2 }}>:</span>
          <TimeColumn value={minute} max={59} onChange={setMinute} />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex justify-between items-center">
        <button onClick={() => { const n = new Date(); setPending(n); setHour(n.getHours()); setMinute(n.getMinutes()); }}
          style={{ fontSize: 12, color: "#13c2c2" }} className="hover:underline">此刻</button>
        <button onClick={confirm}
          className="px-4 py-1 rounded-lg text-white transition-colors"
          style={{ fontSize: 12, background: "#13c2c2" }}>确定</button>
      </div>
    </div>
  );
}

// ── useClickOutside ───────────────────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement | null>, active: boolean, cb: () => void) {
  useEffect(() => {
    if (!active) return;
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) cb(); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [active, cb, ref]);
}

// ── Single DatePicker ─────────────────────────────────────────────────────────

interface DatePickerProps {
  value?: Date | null;
  onChange?: (d: Date | null) => void;
  placeholder?: string;
}

export function DatePicker({ value, onChange, placeholder = "请选择日期时间" }: DatePickerProps) {
  const [open,     setOpen]     = useState(false);
  const [internal, setInternal] = useState<Date | null>(value ?? null);
  const ref = useRef<HTMLDivElement>(null);
  const date = value !== undefined ? value : internal;

  useClickOutside(ref, open, () => setOpen(false));

  function handleChange(d: Date) { setInternal(d); onChange?.(d); setOpen(false); }

  return (
    <div ref={ref} style={{ position: "relative", width: "100%" }}>
      <div onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 rounded-lg cursor-pointer"
        style={{ border: "1px solid #e5e7eb", padding: "6px 10px", background: "white", fontSize: 13 }}>
        <Calendar size={13} style={{ color: "#9ca3af", flexShrink: 0 }} />
        <span style={{ color: date ? "#374151" : "#9ca3af", flex: 1 }}>
          {date ? formatDateTime(date) : placeholder}
        </span>
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 300 }}>
          <CalendarPanel value={date ?? null} onChange={handleChange} onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}

// ── DateRangePicker ───────────────────────────────────────────────────────────

interface DateRangePickerProps {
  startValue?: Date | null;
  endValue?: Date | null;
  onStartChange?: (d: Date | null) => void;
  onEndChange?: (d: Date | null) => void;
}

export function DateRangePicker({ startValue, endValue, onStartChange, onEndChange }: DateRangePickerProps) {
  const [openPanel, setOpenPanel] = useState<"start" | "end" | null>(null);
  const [start, setStart] = useState<Date | null>(startValue ?? null);
  const [end,   setEnd]   = useState<Date | null>(endValue   ?? null);
  const ref = useRef<HTMLDivElement>(null);

  const startDate = startValue !== undefined ? startValue : start;
  const endDate   = endValue   !== undefined ? endValue   : end;

  useClickOutside(ref, !!openPanel, () => setOpenPanel(null));

  function handleStart(d: Date) {
    setStart(d); onStartChange?.(d);
    if (endDate && d > endDate) { setEnd(null); onEndChange?.(null); }
    setOpenPanel("end");
  }
  function handleEnd(d: Date) { setEnd(d); onEndChange?.(d); setOpenPanel(null); }

  const triggerStyle = {
    border: "1px solid #e5e7eb", padding: "6px 8px",
    background: "white", fontSize: 12, borderRadius: 8,
    display: "flex", alignItems: "center", gap: 4, cursor: "pointer",
  } as const;

  return (
    <div ref={ref} className="flex items-center gap-1 min-w-0">
      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        <div onClick={() => setOpenPanel(v => v === "start" ? null : "start")} style={triggerStyle}>
          <Calendar size={12} style={{ color: "#9ca3af", flexShrink: 0 }} />
          <span className="truncate" style={{ color: startDate ? "#374151" : "#9ca3af" }}>
            {startDate ? formatDateTime(startDate) : "开始时间"}
          </span>
        </div>
        {openPanel === "start" && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 300 }}>
            <CalendarPanel value={startDate ?? null} onChange={handleStart} onClose={() => setOpenPanel(null)} rangeStart={startDate} rangeEnd={endDate} />
          </div>
        )}
      </div>

      <span style={{ color: "#9ca3af", fontSize: 11, flexShrink: 0 }}>~</span>

      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        <div onClick={() => setOpenPanel(v => v === "end" ? null : "end")} style={triggerStyle}>
          <Calendar size={12} style={{ color: "#9ca3af", flexShrink: 0 }} />
          <span className="truncate" style={{ color: endDate ? "#374151" : "#9ca3af" }}>
            {endDate ? formatDateTime(endDate) : "结束时间"}
          </span>
        </div>
        {openPanel === "end" && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 300 }}>
            <CalendarPanel value={endDate ?? null} onChange={handleEnd} onClose={() => setOpenPanel(null)} rangeStart={startDate} rangeEnd={endDate} />
          </div>
        )}
      </div>
    </div>
  );
}
