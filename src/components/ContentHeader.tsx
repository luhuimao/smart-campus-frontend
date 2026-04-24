import { Bell, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContentHeader() {
  return (
    <div
      className={cn("flex items-center justify-between")}
      style={{
        height: 50,
        padding: "0 16px",
        borderBottom: "1px solid rgba(19,29,46,0.08)",
        backgroundColor: "white",
        flexShrink: 0,
      }}
    >
      <div className="flex items-center" style={{ gap: 8 }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "rgb(19, 29, 46)",
            lineHeight: "28px",
          }}
        >
          个人档案看板
        </span>
        <div
          style={{
            width: 1,
            height: 16,
            backgroundColor: "rgba(19,29,46,0.15)",
            margin: "0 4px",
          }}
        />
        <button
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 0,
          }}
        >
          <Maximize2 size={16} color="rgba(19,29,46,0.47)" />
        </button>
      </div>

      <div className="flex items-center" style={{ gap: 12 }}>
        <button
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 0,
          }}
        >
          <Bell size={20} color="rgba(19,29,46,0.47)" />
        </button>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            backgroundColor: "rgb(229, 81, 74)",
            color: "white",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          卢
        </div>
      </div>
    </div>
  );
}
