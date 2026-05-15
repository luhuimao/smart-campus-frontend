"use client";

import { useState } from "react";

export interface TrendPoint {
  month: string;
  value: number;
}

interface Props {
  data: TrendPoint[];
  isPending?: boolean;
  isError?: boolean;
  color?: string;
  gradientColor?: string;
  height?: number;
  legendLabel?: string;
}

export function TrendLineChart({
  data,
  isPending = false,
  isError = false,
  color = "#60a5fa",
  gradientColor = "#93c5fd",
  height = 160,
  legendLabel,
}: Props) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (isPending) {
    return (
      <div className="flex flex-col gap-2 h-full">
        <div className="flex-1 w-full bg-gray-100 animate-pulse rounded-xl" />
        {legendLabel && (
          <div className="flex justify-center gap-1 items-center mt-2">
            <div className="w-3 h-3 rounded-sm bg-gray-100 animate-pulse" />
            <div className="w-16 h-3 rounded bg-gray-100 animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
        {isError ? "加载失败" : "暂无数据"}
      </div>
    );
  }

  const padL = 32, padR = 16, padT = 20, padB = 32;
  const W = 600, H = height;
  const maxVal = Math.max(1, ...data.map(d => d.value));
  const toX = (i: number) => data.length === 1 ? W / 2 : padL + (i / (data.length - 1)) * (W - padL - padR);
  const toY = (v: number) => padT + (1 - v / maxVal) * (H - padT - padB);
  const coords = data.map((d, i) => ({ x: toX(i), y: toY(d.value), v: d.value, label: d.month }));
  const pts = coords.map(c => `${c.x},${c.y}`).join(" ");
  const area = `M ${coords[0].x},${coords[0].y} `
    + coords.slice(1).map(c => `L ${c.x},${c.y}`).join(" ")
    + ` L ${coords[coords.length - 1].x},${H - padB} L ${coords[0].x},${H - padB} Z`;

  const gradId = `trendGrad-${color.replace("#", "")}`;

  return (
    <div className="flex flex-col h-full">
      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientColor} stopOpacity="0.5" />
              <stop offset="100%" stopColor={gradientColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 网格线 */}
          {[0, 1, 2, 3, 4].map(i => (
            <line key={i} x1={padL} x2={W - padR} y1={padT + i * ((H - padT - padB) / 4)} y2={padT + i * ((H - padT - padB) / 4)}
              stroke="#f3f4f6" strokeWidth="1" strokeDasharray="3 3" />
          ))}

          {/* hover 竖线 */}
          {hovered !== null && (
            <line x1={coords[hovered].x} x2={coords[hovered].x} y1={padT} y2={H - padB}
              stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          )}

          {/* 面积 */}
          <path d={area} fill={`url(#${gradId})`} />

          {/* 折线 */}
          <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
            strokeLinejoin="round" strokeLinecap="round" />

          {/* 数据点 + 标签 + 热区 */}
          {coords.map((c, i) => (
            <g key={i}>
              <circle cx={c.x} cy={c.y} r={hovered === i ? 6 : 4}
                fill={hovered === i ? color : "white"}
                stroke={color} strokeWidth="2.5"
                style={{ transition: "r 0.1s, fill 0.1s" }} />

              {hovered === i ? (
                <g>
                  <rect x={c.x - 22} y={c.y - 26} width={44} height={18} rx="4" fill="#1e293b" />
                  <text x={c.x} y={c.y - 13} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{c.v}</text>
                </g>
              ) : (
                <text x={c.x} y={c.y - 9} textAnchor="middle" fill="#94a3b8" fontSize="10">{c.v}</text>
              )}

              <text x={c.x} y={H - padB + 16} textAnchor="middle" fill="#64748b" fontSize="11" fontWeight="500">{c.label}</text>

              {/* 透明热区 */}
              <rect x={c.x - 30} y={padT} width={60} height={H - padT - padB + 20}
                fill="transparent" style={{ cursor: "crosshair" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)} />
            </g>
          ))}
        </svg>
      </div>

      {legendLabel && (
        <div className="flex justify-center mt-2 gap-1 items-center shrink-0">
          <div className="w-3 h-3 rounded-sm" style={{ background: gradientColor }} />
          <span style={{ fontSize: 15, color: "#9ca3af" }}>{legendLabel}</span>
        </div>
      )}
    </div>
  );
}
