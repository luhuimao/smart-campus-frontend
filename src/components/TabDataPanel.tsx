"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  {
    label: "基础档案",
    columns: ["教职工姓名", "人脸识别照", "形象照", "联系方式", "身份证号", "身份证图片", "性别", "出生日期"],
  },
  {
    label: "教资及职称",
    columns: ["教职工姓名", "职称类别", "职称级别", "获得时间", "证书编号"],
  },
  {
    label: "荣誉称号",
    columns: ["教职工姓名", "荣誉称号", "颁发单位", "获得时间"],
  },
  {
    label: "获奖记录",
    columns: ["教职工姓名", "奖项名称", "颁发单位", "获奖时间", "奖项级别"],
  },
  {
    label: "教育经历",
    columns: ["教职工姓名", "学校名称", "专业", "学历", "学位", "入学时间", "毕业时间"],
  },
  {
    label: "工作履历",
    columns: ["教职工姓名", "工作单位", "职务", "开始时间", "结束时间"],
  },
  {
    label: "教学兼职",
    columns: ["教职工姓名", "兼职单位", "兼职职务", "开始时间"],
  },
  {
    label: "论文",
    columns: ["教职工姓名", "论文题目", "发表期刊", "发表时间", "论文级别"],
  },
  {
    label: "教育课题",
    columns: ["教职工姓名", "课题名称", "立项级别", "立项时间"],
  },
  {
    label: "著作",
    columns: ["教职工姓名", "著作名称", "出版社", "出版时间", "本人排名"],
  },
];

export function TabDataPanel() {
  const [activeTab, setActiveTab] = useState<number>(0);

  const currentTab = tabs[activeTab];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        backgroundColor: "white",
        overflow: "hidden",
        borderRadius: "6px 6px 0 0",
        boxShadow: "0 0 2px 0 rgba(19,29,46,.02), 0 4px 8px 0 rgba(19,29,46,.06)",
      }}
    >
      {/* Tab header */}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-end",
          gap: "4px",
          paddingTop: "4px",
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingBottom: "0",
          borderBottom: "1px solid rgba(19,29,46,0.08)",
          backgroundColor: "white",
          flexShrink: 0,
        }}
      >
        {tabs.map((tab, index) => (
          <TabButton
            key={tab.label}
            label={tab.label}
            active={activeTab === index}
            onClick={() => setActiveTab(index)}
          />
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Section title */}
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "rgb(19, 29, 46)",
            padding: "12px 16px 8px",
          }}
        >
          {currentTab.label}
        </div>

        {/* Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              {currentTab.columns.map((col) => (
                <th
                  key={col}
                  style={{
                    backgroundColor: "rgb(151, 190, 245)",
                    color: "rgb(20, 30, 49)",
                    fontSize: "13px",
                    fontWeight: 400,
                    padding: "3px 20px 3px 10px",
                    height: "67px",
                    borderRight: "1px solid rgba(100, 150, 220, 0.4)",
                    textAlign: "left",
                    cursor: "pointer",
                    position: "sticky",
                    top: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2].map((rowIndex) => (
              <tr key={rowIndex}>
                {currentTab.columns.map((col) => (
                  <td
                    key={col}
                    style={{
                      padding: "8px 10px",
                      fontSize: "13px",
                      color: "rgb(19, 29, 46)",
                      borderBottom: "1px solid rgba(19,29,46,0.06)",
                      borderRight: "1px solid rgba(19,29,46,0.06)",
                      height: "40px",
                    }}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function TabButton({ label, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: active ? "rgb(17, 110, 255)" : "rgba(20, 30, 49, 0.04)",
        color: active ? "rgba(255, 255, 255, 0.92)" : "rgb(31, 45, 61)",
        fontWeight: active ? 600 : 400,
        fontSize: "14px",
        padding: "8px 16px",
        height: "36px",
        borderRadius: "6px 6px 0 0",
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        border: "none",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(20, 30, 49, 0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(20, 30, 49, 0.04)";
        }
      }}
    >
      {label}
    </button>
  );
}
