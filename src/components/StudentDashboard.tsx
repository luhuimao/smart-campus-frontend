"use client";

import * as XLSX from "xlsx";
import { Users, PlusCircle, User, Menu, RefreshCw, ArrowUpDown, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useMemo, useEffect } from "react";
import React from "react";
import { useStudentInfo, useStudentLeave, useStudentLeaveCount, useHealthCheck, useStudentReturnSchool, useStudentSupport, useHeartToHeartTalk, useTransactionsToday, useAccessLogsToday, useTransactionStats, useAccessStats, useStudentCadree, usePhysicalTest, useStudentAward, useGoodDeeds, type StudentInfoFilters, type StudentLeaveFilters, type HealthCheckFilters, type StudentReturnSchoolFilters, type StudentSupportFilters, type HeartToHeartTalkFilters } from "@/hooks/use-research-dashboard";
import { DashboardTable, PhotoList, ImageLightbox } from "@/components/ui/DashboardTable";
import type { ColumnDef } from "@/components/ui/DashboardTable";
import type { StudentInfoRecord, StudentLeaveRecord, HealthCheckRecord, StudentReturnSchoolRecord, StudentSupportRecord, HeartToHeartTalkRecord, TransactionsRecord, AccessLogRecord, StudentCadreeRecord, PhysicalTestRecord, StudentAwardRecord, GoodDeedsRecord } from "@/hooks/use-research-dashboard";
import { UserAvatarMenu } from "@/components/ui/UserAvatarMenu";

function formatCount(n: number | null | undefined): string {
  if (n == null) return "…";
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  return n.toLocaleString();
}

function exportToExcel(filename: string, headers: string[], rows: (string | number)[][]) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// ── StudentInfoDrawer ────────────────────────────────────────────
function StudentInfoDrawer({ record, onClose }: { record: StudentInfoRecord | null; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 520, maxWidth: "100vw", background: "#fff",
          boxShadow: record ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}>
        {record && (
          <>
            {/* header */}
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-500">{record.年级名称 || "—"}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs font-semibold text-gray-500">{record.班级名称 || "—"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900 leading-snug">{record.姓名 || "—"}</h2>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                    style={{ background: record.学籍状态==="在读"?"rgba(16,185,129,0.08)":record.学籍状态==="休学"?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.08)", color: record.学籍状态==="在读"?"#059669":record.学籍状态==="休学"?"#d97706":"#dc2626" }}>
                    {record.学籍状态 || "—"}
                  </span>
                  {record.学生类型 && record.学生类型 !== "普通学生" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold"
                      style={{ background: record.学生类型==="低保学生"?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.08)", color: record.学生类型==="低保学生"?"#d97706":"#dc2626" }}>
                      {record.学生类型}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {/* body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "姓名",     value: record.姓名 },
                    { label: "性别",     value: record.性别 },
                    { label: "民族",     value: record.民族 },
                    { label: "出生日期", value: record.出生日期 ? record.出生日期.slice(0, 10) : "" },
                    { label: "年龄",     value: record.年龄 ? String(record.年龄) : "" },
                    { label: "政治面貌", value: record.政治面貌 },
                    { label: "学生电话", value: record.学生本人电话 },
                    { label: "既往病史", value: record.既往病史 || "无" },
                    { label: "是否残疾", value: record.是否残疾 || "否" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">学籍信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "年级",     value: record.年级名称 },
                    { label: "班级",     value: record.班级名称 },
                    { label: "班主任",   value: record.班主任 },
                    { label: "级部",     value: record.级部 },
                    { label: "毕业学校", value: record.毕业学校 },
                    { label: "选科方向", value: record.选科方向 },
                    { label: "选科科目", value: record.选科科目 },
                    { label: "选科1",    value: record.选科1 },
                    { label: "选科2",    value: record.选科2 },
                    { label: "外语选科", value: record.外语选科 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">宿舍信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "入住状态", value: record.宿舍入住状态 },
                    { label: "宿舍楼栋", value: record.宿舍楼栋 },
                    { label: "宿舍号",   value: record.宿舍号 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">监护人信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "监护人1姓名",   value: record.监护人1姓名 },
                    { label: "监护人1联系",   value: record.监护人1联系 },
                    { label: "监护人1关系",   value: record.监护人1角色 },
                    { label: "监护人1工作单位", value: record.监护人1工作单位 },
                    { label: "监护人2姓名",   value: record.监护人2姓名 },
                    { label: "监护人2联系",   value: record.监护人2联系 },
                    { label: "监护人2关系",   value: record.监护人2角色 },
                    { label: "监护人2工作单位", value: record.监护人2工作单位 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">资助与特殊情况</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "寄宿生补助（元）",       value: record.享受寄宿生生活补助金额 },
                    { label: "营养改善计划补助（元）", value: record.享受营养改善计划补助金额 },
                    { label: "建档立卡贫困户",         value: record.是建档立卡贫困户 || "否" },
                    { label: "建档立卡脱贫户子女",     value: record.建档立卡脱贫户子女 || "否" },
                    { label: "随迁子女",               value: record.随迁子女入 || "否" },
                    { label: "农村留守儿童",           value: record.在校农村留守儿童 || "否" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              {(record.户籍地址 || record.现居地址) && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">地址信息</p>
                  <div className="space-y-4">
                    {record.户籍地址 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-0.5">户籍地址</p>
                        <p className="text-base font-medium text-gray-800">{record.户籍地址}</p>
                      </div>
                    )}
                    {record.现居地址 && (
                      <div>
                        <p className="text-sm text-gray-400 mb-0.5">现居地址</p>
                        <p className="text-base font-medium text-gray-800">{record.现居地址}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
              {record.备注 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">备注</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.备注}</p>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── StudentLeaveDrawer ───────────────────────────────────────────
function StudentLeaveDrawer({ record, onClose }: { record: StudentLeaveRecord | null; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 480, maxWidth: "100vw", background: "#fff",
          boxShadow: record ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}>
        {record && (
          <>
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-500">{record.学期 || "—"}</span>
                  {record.请假类型 && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: record.请假类型==="病假"?"rgba(239,68,68,0.1)":record.请假类型==="事假"?"rgba(245,158,11,0.1)":"rgba(99,102,241,0.1)", color: record.请假类型==="病假"?"#dc2626":record.请假类型==="事假"?"#d97706":"#4f46e5" }}>
                        {record.请假类型}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{record.请假学生姓名 || "—"}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">学生信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "姓名",     value: record.请假学生姓名 },
                    { label: "宏德学号", value: record.宏德学号 },
                    { label: "年级",     value: record.请假学生年级 },
                    { label: "级部",     value: record.请假学生级部 },
                    { label: "班级",     value: record.请假学生班级 },
                    { label: "班主任",   value: record.班主任 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">请假信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "请假类型",     value: record.请假类型 },
                    { label: "请假时长（天）", value: record.请假时长_数字 ? String(record.请假时长_数字) : record.请假时长_文本 },
                    { label: "开始时间",     value: record.请假开始时间 ? record.请假开始时间.slice(0, 16) : "" },
                    { label: "结束时间",     value: record.请假结束时间 ? record.请假结束时间.slice(0, 16) : "" },
                    { label: "申请时间",     value: record.申请时间 ? record.申请时间.slice(0, 16) : "" },
                    { label: "状态",         value: record.状态 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              {record.请假原因说明 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">请假原因说明</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.请假原因说明}</p>
                </section>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── HealthCheckDrawer ────────────────────────────────────────────
function HealthCheckDrawer({ record, onClose }: { record: HealthCheckRecord | null; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  function numCell(v: number) { return v > 0 ? String(v) : "0"; }

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 520, maxWidth: "100vw", background: "#fff",
          boxShadow: record ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}>
        {record && (
          <>
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-500">{record.学期 || "—"}</span>
                  {record.检查情况 && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: record.检查情况==="晨检"?"rgba(59,130,246,0.1)":record.检查情况==="午检"?"rgba(245,158,11,0.1)":"rgba(139,92,246,0.1)", color: record.检查情况==="晨检"?"#2563eb":record.检查情况==="午检"?"#d97706":"#7c3aed" }}>
                        {record.检查情况}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{record.班级名称 || record.班级 || "—"}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">班级信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "年级",     value: record.年级 },
                    { label: "级部",     value: record.级部 },
                    { label: "班级名称", value: record.班级名称 },
                    { label: "班主任",   value: record.班主任 },
                    { label: "填报日期", value: record.填报日期_文本 || record.填报日期_日期?.slice(0, 10) },
                    { label: "上报类型", value: record.上报类型 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">出勤情况</p>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  {[
                    { label: "应到人数",     value: String(record.应到学生人数 ?? 0) },
                    { label: "实到人数",     value: String(record.实到学生人数 ?? 0) },
                    { label: "因病缺课人数", value: numCell(record.因病缺课学生人数) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value}</p>
                    </div>
                  ))}
                </div>
              </section>
              {[
                { title: "发热",         count: record.发热学生人数,               names: record.发热姓名,                   desc: record.发热具体情况说明 },
                { title: "流感确诊",     count: record.流感确诊学生人数,           names: record.流感确诊学生姓名,           desc: record.流感确诊具体情况说明 },
                { title: "咽痛流涕咳嗽", count: record.是否有咽痛流涕咳嗽学生数,   names: record.是否有咽痛流涕咳嗽学生姓名, desc: record.是否有咽痛流涕咳嗽情况说明 },
                { title: "乏力",         count: record.乏力学生数,                 names: record.乏力学生姓名,               desc: record.乏力情况说明 },
                { title: "腹泻",         count: record.腹泻学生数,                 names: record.腹泻学生姓名,               desc: record.腹泻情况说明 },
                { title: "呼吸困难",     count: record.呼吸困难学生数,             names: record.呼吸困难学生姓名,           desc: record.呼吸困难情况说明 },
                { title: "其他症状",     count: record.其他症状学生数,             names: record.其他症状学生姓名,           desc: record.其他症状情况说明 },
              ].filter(s => s.count > 0 || s.names || s.desc).map(({ title, count, names, desc }) => (
                <section key={title}>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-0.5">人数</p>
                      <p className="text-base font-medium" style={{ color: count > 0 ? "#dc2626" : "#374151" }}>{count}</p>
                    </div>
                    {names && (
                      <div>
                        <p className="text-sm text-gray-400 mb-0.5">学生姓名</p>
                        <p className="text-base font-medium text-gray-800">{names}</p>
                      </div>
                    )}
                    {desc && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400 mb-0.5">情况说明</p>
                        <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{desc}</p>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── StudentReturnSchoolDrawer ─────────────────────────────────────
function StudentReturnSchoolDrawer({ record, onClose }: { record: StudentReturnSchoolRecord | null; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 520, maxWidth: "100vw", background: "#fff",
          boxShadow: record ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}>
        {record && (
          <>
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-500">{record.学期 || "—"}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs font-semibold text-gray-500">{record.填报日期?.slice(0, 10) || "—"}</span>
                </div>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{record.班级名称 || "—"}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">班级信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "年级",     value: record.年级 },
                    { label: "级部",     value: record.级部 },
                    { label: "班级名称", value: record.班级名称 },
                    { label: "班主任",   value: record.班主任 },
                    { label: "级部主任", value: record.级部主任 },
                    { label: "填报日期", value: record.填报日期?.slice(0, 10) },
                    { label: "学期",     value: record.学期 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">出勤人数</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "应到学生人数",   value: String(record.应到学生人数 ?? 0),   color: "#374151" },
                    { label: "返校学生人数",   value: String(record.返校学生人数 ?? 0),   color: "#059669" },
                    { label: "未返校学生人数", value: String(record.未返校学生人数 ?? 0), color: record.未返校学生人数 > 0 ? "#d97706" : "#374151" },
                    { label: "转入学生人数",   value: String(record.转入学生人数 ?? 0),   color: "#374151" },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium" style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </section>
              {[
                { title: "病假",         count: record.病假学生人数,         names: record.病假学生姓名?.join("、"),         desc: record.病假具体情况说明,         color: "#dc2626" },
                { title: "事假",         count: record.事假学生人数,         names: record.事假学生姓名?.join("、"),         desc: record.事假具体情况说明,         color: "#d97706" },
                { title: "在外学习培训", count: record.在外学习培训学生人数, names: record.在外学习培训学生姓名?.join("、"), desc: record.在外学习培训具体情况说明, color: "#6366f1" },
                { title: "休学",         count: record.休学学生人数,         names: record.休学学生姓名?.join("、"),         desc: record.休学具体情况说明,         color: "#f43f5e" },
                { title: "流失",         count: record.流失学生人数,         names: record.流失学生姓名?.join("、"),         desc: record.流失学生具体情况说明,     color: "#f43f5e" },
              ].filter(s => s.count > 0 || s.names || s.desc).map(({ title, count, names, desc, color }) => (
                <section key={title}>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-0.5">人数</p>
                      <p className="text-base font-medium" style={{ color: count > 0 ? color : "#374151" }}>{count}</p>
                    </div>
                    {names && (
                      <div>
                        <p className="text-sm text-gray-400 mb-0.5">学生姓名</p>
                        <p className="text-base font-medium text-gray-800">{names}</p>
                      </div>
                    )}
                    {desc && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-400 mb-0.5">情况说明</p>
                        <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{desc}</p>
                      </div>
                    )}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── StudentSupportDrawer ──────────────────────────────────────────
function StudentSupportDrawer({ record, onClose }: { record: StudentSupportRecord | null; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 480, maxWidth: "100vw", background: "#fff",
          boxShadow: record ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}>
        {record && (
          <>
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-500">{record.年级 || "—"}</span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs font-semibold text-gray-500">{record.班级名称 || "—"}</span>
                </div>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{record.学生姓名 || "—"}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">学生信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "姓名",   value: record.学生姓名 },
                    { label: "性别",   value: record.性别 },
                    { label: "学号",   value: record.学生学号 },
                    { label: "年级",   value: record.年级 },
                    { label: "班级",   value: record.班级名称 },
                    { label: "家长姓名", value: record.家长姓名 },
                    { label: "手机号码", value: record.手机号码 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">资助信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-0.5">资助项目名称</p>
                    <p className="text-base font-medium text-gray-800">{record.资助项目名称 || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-0.5">资助单位</p>
                    <p className="text-base font-medium text-gray-800">{record.资助单位 || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-0.5">资助金额</p>
                    <p className="text-base font-bold" style={{ color: "#059669" }}>{record.资助金额 ? `¥${record.资助金额}` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-0.5">发放学期</p>
                    <p className="text-base font-medium text-gray-800">{record.发放学期 || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-0.5">当前学期</p>
                    <p className="text-base font-medium text-gray-800">{record.当前学期 || "—"}</p>
                  </div>
                  {record.备注 && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400 mb-0.5">备注</p>
                      <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.备注}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}

// ── HeartToHeartTalkDrawer ────────────────────────────────────────
function HeartToHeartTalkDrawer({ record, onClose }: { record: HeartToHeartTalkRecord | null; onClose: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
        onClick={onClose} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: 520, maxWidth: "100vw", background: "#fff",
          boxShadow: record ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none",
          transform: record ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)",
        }}>
        {record && (
          <>
            <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-blue-500">{record.班级名称 || "—"}</span>
                  {record.谈话内容 && (
                    <>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ background: "rgba(99,102,241,0.08)", color: "#4f46e5" }}>
                        {record.谈话内容}
                      </span>
                    </>
                  )}
                </div>
                <h2 className="text-base font-bold text-gray-900 leading-snug">{record.学生姓名 || "—"}</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">学生信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "学生姓名", value: record.学生姓名 },
                    { label: "班级名称", value: record.班级名称 },
                    { label: "学生学号", value: record.学生学号 },
                    { label: "学生身份证", value: record.学生身份证 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">谈话信息</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {[
                    { label: "谈心教师",   value: record.谈心教师 },
                    { label: "谈心教师学科", value: record.谈心教师学科 },
                    { label: "谈心谈话时间", value: record.谈心谈话时间 ? record.谈心谈话时间.slice(0, 16) : "" },
                    { label: "谈话内容",   value: record.谈话内容 },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-sm text-gray-400 mb-0.5">{label}</p>
                      <p className="text-base font-medium text-gray-800">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              </section>
              {record.谈心谈话内容记录 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">谈心谈话内容记录</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.谈心谈话内容记录}</p>
                </section>
              )}
              {record.教师指导建议 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">教师指导建议</p>
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">{record.教师指导建议}</p>
                </section>
              )}
              {record.沟通照片.length > 0 && (
                <section>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">沟通照片（{record.沟通照片.length} 张）</p>
                  <div className="grid grid-cols-3 gap-2">
                    {record.沟通照片.map((f, i) => (
                      <button key={i} onClick={() => setLightboxIndex(i)}
                        className="block rounded-lg overflow-hidden aspect-square bg-gray-100 hover:opacity-80 transition-opacity cursor-zoom-in">
                        <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </>
        )}
      </div>
      {lightboxIndex !== null && record && (
        <ImageLightbox images={record.沟通照片} index={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}

// ── ConsumeDrawer ────────────────────────────────────────────────
function ConsumeDrawer({ record, onClose }: { record: TransactionsRecord | null; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  return (<>
    <div className="fixed inset-0 z-40 transition-opacity duration-300"
      style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
      onClick={onClose} />
    <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
      style={{ width: 480, maxWidth: "100vw", background: "#fff", boxShadow: record ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none", transform: record ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
      {record && (<>
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-semibold text-blue-500 mb-1">{record.交易时间?.slice(0, 16) || "—"}</p>
            <h2 className="text-base font-bold text-gray-900 leading-snug">{record.订单类型 || "消费记录"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[{ label: "姓名", value: record.姓名 }, { label: "班级", value: record.班级 }, { label: "学/工号", value: record.宏德学_工号 }, { label: "年级", value: record.年级 }, { label: "级部", value: record.级部 }].map(({ label, value }) => (<div key={label}><p className="text-sm text-gray-400 mb-0.5">{label}</p><p className="text-base font-medium text-gray-800">{value || "—"}</p></div>))}
            </div>
          </section>
          <section>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">订单信息</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[{ label: "订单类型", value: record.订单类型 }, { label: "订单号", value: record.订单号 }, { label: "支付方式", value: record.支付方式 }, { label: "交易金额", value: `¥${(record.交易金额 ?? 0).toFixed(2)}` }, { label: "实付金额", value: `¥${(record.实付金额 ?? 0).toFixed(2)}` }, { label: "消费方式", value: record.消费方式 }, { label: "门店", value: record.门店 }, { label: "订单状态", value: record.订单状态 }].map(({ label, value }) => (<div key={label}><p className="text-sm text-gray-400 mb-0.5">{label}</p><p className="text-base font-medium text-gray-800">{value || "—"}</p></div>))}
            </div>
          </section>
          <section>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">时间信息</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[{ label: "消费机时间", value: record.消费机时间 }, { label: "交易时间", value: record.交易时间 }, { label: "支付时间", value: record.支付时间 }].map(({ label, value }) => (<div key={label}><p className="text-sm text-gray-400 mb-0.5">{label}</p><p className="text-base font-medium text-gray-800">{value ? value.slice(0, 16) : "—"}</p></div>))}
            </div>
          </section>
          {(record.退款金额 > 0) && (<section>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">退款信息</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[{ label: "退款金额", value: `¥${record.退款金额.toFixed(2)}` }, { label: "退款时间", value: record.退款时间 }, { label: "退款状态", value: record.退款状态 }].map(({ label, value }) => (<div key={label}><p className="text-sm text-gray-400 mb-0.5">{label}</p><p className="text-base font-medium text-gray-800">{value || "—"}</p></div>))}
            </div>
          </section>)}
        </div>
      </>)}
    </div>
  </>);
}

// ── AccessDrawer ──────────────────────────────────────────────────
function AccessDrawer({ record, onClose }: { record: AccessLogRecord | null; onClose: () => void }) {
  useEffect(() => {
    if (!record) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [record, onClose]);

  return (<>
    <div className="fixed inset-0 z-40 transition-opacity duration-300"
      style={{ background: record ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: record ? "auto" : "none" }}
      onClick={onClose} />
    <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
      style={{ width: 480, maxWidth: "100vw", background: "#fff", boxShadow: record ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none", transform: record ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
      {record && (<>
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-semibold text-blue-500 mb-1">{record.通行时间?.slice(0, 16) || "—"}</p>
            <h2 className="text-base font-bold text-gray-900 leading-snug">{record.姓名 || "门禁记录"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <section>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">基本信息</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[{ label: "姓名", value: record.姓名 }, { label: "身份", value: record.身份 }, { label: "学/工号", value: record.宏德学_工号 }, { label: "年级", value: record.年级 }, { label: "级部", value: record.级部 }, { label: "班级", value: record.班级 }, { label: "班主任", value: record.班主任 }, { label: "级部主任", value: record.级部主任 }].map(({ label, value }) => (<div key={label}><p className="text-sm text-gray-400 mb-0.5">{label}</p><p className="text-base font-medium text-gray-800">{value || "—"}</p></div>))}
            </div>
          </section>
          <section>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">通行信息</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {[{ label: "通行时间", value: record.通行时间 }, { label: "出入场所", value: record.出入场所 }, { label: "通行方向", value: `${record.通行方向 || "—"}入` }, { label: "打卡设备", value: record.打卡设备 }, { label: "设备状态", value: record.设备状态 }].map(({ label, value }) => (<div key={label}><p className="text-sm text-gray-400 mb-0.5">{label}</p><p className="text-base font-medium text-gray-800">{value || "—"}</p></div>))}
            </div>
          </section>
        </div>
      </>)}
    </div>
  </>);
}

const glass = {
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  border: "1px solid rgba(255,255,255,0.4)",
  borderRadius: 24,
} as const;

const smallStats = [
  { label: "休学总数",  value: "0",      color: "#f97316", textColor: "text-orange-500" },
  { label: "转学总数",  value: "0",      color: "#3b82f6", textColor: "text-blue-500" },
  { label: "退学总数",  value: "0",      color: "#f43f5e", textColor: "text-rose-500" },
  { label: "请假人数",  value: "11,154", color: "#10b981", textColor: "text-emerald-500" },
  { label: "消费金额",  value: "242K",   color: "#8b5cf6", textColor: "text-purple-600" },
  { label: "出校人数",  value: "9,706",  color: "#f59e0b", textColor: "text-amber-600" },
  { label: "入校人数",  value: "3,031",  color: "#06b6d4", textColor: "text-cyan-600" },
];

const gradeClasses = [
  { grade: "高2025级", count: 16, active: true },
  { grade: "高2023级", count: 28, active: false },
  { grade: "高2024级", count: 18, active: false },
];

const CONSUME_CATEGORY_COLORS = ["bg-orange-400", "bg-blue-400", "bg-emerald-400", "bg-purple-400", "bg-gray-300"];

const tabs = ["学生基础信息", "学生晨午检", "学生返校情况", "学生请假数据", "学生消费进出数据", "学生资助情况","学生成长","一生一案谈心谈话记录表"];

const healthCheckRows = [
  { grade: "高2025级", cls: "高一(1)班",  wechat: "13800001001", session: "晨检", total: 48, arrived: 47, sick: 1, fever: 0, flu: 0, throat: 1, fatigue: 0, diarrhea: 0, breath: 0, other: 0 },
  { grade: "高2025级", cls: "高一(2)班",  wechat: "13800001002", session: "晨检", total: 50, arrived: 50, sick: 0, fever: 0, flu: 0, throat: 0, fatigue: 0, diarrhea: 0, breath: 0, other: 0 },
  { grade: "高2025级", cls: "高一(3)班",  wechat: "13800001003", session: "午检", total: 46, arrived: 44, sick: 2, fever: 1, flu: 0, throat: 1, fatigue: 1, diarrhea: 0, breath: 0, other: 0 },
  { grade: "高2025级", cls: "高一(4)班",  wechat: "13800001004", session: "晨检", total: 49, arrived: 49, sick: 0, fever: 0, flu: 0, throat: 0, fatigue: 0, diarrhea: 0, breath: 0, other: 0 },
  { grade: "高2024级", cls: "高二(1)班",  wechat: "13800001005", session: "晨检", total: 52, arrived: 51, sick: 1, fever: 0, flu: 1, throat: 0, fatigue: 0, diarrhea: 1, breath: 0, other: 0 },
  { grade: "高2024级", cls: "高二(2)班",  wechat: "13800001006", session: "午检", total: 50, arrived: 48, sick: 2, fever: 1, flu: 0, throat: 2, fatigue: 0, diarrhea: 0, breath: 0, other: 1 },
  { grade: "高2024级", cls: "高二(3)班",  wechat: "13800001007", session: "晨检", total: 47, arrived: 47, sick: 0, fever: 0, flu: 0, throat: 0, fatigue: 0, diarrhea: 0, breath: 0, other: 0 },
  { grade: "高2024级", cls: "高二(4)班",  wechat: "13800001008", session: "晚检", total: 48, arrived: 46, sick: 2, fever: 0, flu: 0, throat: 1, fatigue: 2, diarrhea: 0, breath: 0, other: 0 },
  { grade: "高2023级", cls: "高三(1)班",  wechat: "13800001009", session: "晨检", total: 55, arrived: 53, sick: 2, fever: 1, flu: 1, throat: 0, fatigue: 0, diarrhea: 0, breath: 1, other: 0 },
  { grade: "高2023级", cls: "高三(2)班",  wechat: "13800001010", session: "午检", total: 53, arrived: 53, sick: 0, fever: 0, flu: 0, throat: 0, fatigue: 0, diarrhea: 0, breath: 0, other: 0 },
];

const HEALTH_COLS = ["级部名称","班级","班主任企微","晨午晚检情况","应到学生人数","实到学生人数","因病缺课学生人数","发热学生人数","流感确诊学生人数","是否有咽痛流涕咳嗽学生数","乏力学生数","腹泻学生数","呼吸困难学生数","其他症状学生数"];

const LEAVE_COLS = ["请假人","请假类型","请假开始时间","请假结束时间","请假时长（天）","请假原因说明","发起时间","状态"];

const AID_COLS = ["学生姓名","资助项目名称","资助单位","资助金额","学生学号","性别","年级","班级名称","家长姓名","手机号码","备注","提交人","提交时间","发放学期"];

const aidRows = [
  { name: "莫佳龙", project: "国家助学金",       unit: "教育部",         amount: 3000, stuId: "20240101", gender: "男", grade: "高2025级", cls: "高一(1)班", parent: "莫国强", phone: "13800101001", remark: "家庭困难",   submitter: "李老师", time: "2026-03-10 09:00", term: "2025-2026第二学期" },
  { name: "陆彦希", project: "地方政府助学金",   unit: "市教育局",       amount: 2000, stuId: "20240215", gender: "男", grade: "高2025级", cls: "高一(2)班", parent: "陆建华", phone: "13800101002", remark: "",          submitter: "王老师", time: "2026-03-11 10:15", term: "2025-2026第二学期" },
  { name: "张欣蕾", project: "学校奖学金",       unit: "本校",           amount: 1500, stuId: "20240322", gender: "女", grade: "高2025级", cls: "高一(3)班", parent: "张明辉", phone: "13800101003", remark: "成绩优秀",   submitter: "张老师", time: "2026-03-12 14:30", term: "2025-2026第二学期" },
  { name: "刘静",   project: "国家助学金",       unit: "教育部",         amount: 3000, stuId: "20240533", gender: "女", grade: "高2024级", cls: "高二(1)班", parent: "刘德志", phone: "13800101004", remark: "单亲家庭",   submitter: "李老师", time: "2026-03-13 09:40", term: "2025-2026第二学期" },
  { name: "赵磊",   project: "企业爱心助学金",   unit: "广西某科技公司", amount: 5000, stuId: "20240619", gender: "男", grade: "高2024级", cls: "高二(2)班", parent: "赵志远", phone: "13800101005", remark: "孤儿",       submitter: "王老师", time: "2026-03-14 11:00", term: "2025-2026第二学期" },
  { name: "孙丽",   project: "地方政府助学金",   unit: "县教育局",       amount: 2000, stuId: "20240724", gender: "女", grade: "高2024级", cls: "高二(3)班", parent: "孙建国", phone: "13800101006", remark: "",          submitter: "张老师", time: "2026-03-15 15:20", term: "2025-2026第二学期" },
  { name: "周建国", project: "国家助学金",       unit: "教育部",         amount: 3000, stuId: "20240831", gender: "男", grade: "高2023级", cls: "高三(1)班", parent: "周伟",   phone: "13800101007", remark: "父母务农",   submitter: "李老师", time: "2026-03-16 08:50", term: "2025-2026第二学期" },
  { name: "吴雪",   project: "学校奖学金",       unit: "本校",           amount: 2000, stuId: "20240912", gender: "女", grade: "高2023级", cls: "高三(2)班", parent: "吴大明", phone: "13800101008", remark: "竞赛获奖",   submitter: "王老师", time: "2026-03-17 10:30", term: "2025-2026第二学期" },
  { name: "郑浩然", project: "社会爱心人士捐助", unit: "爱心基金会",     amount: 4000, stuId: "20241005", gender: "男", grade: "高2023级", cls: "高三(1)班", parent: "郑国栋", phone: "13800101009", remark: "低保家庭",   submitter: "张老师", time: "2026-03-18 14:00", term: "2025-2026第二学期" },
  { name: "何婷",   project: "国家助学金",       unit: "教育部",         amount: 3000, stuId: "20241118", gender: "女", grade: "高2023级", cls: "高三(2)班", parent: "何志勇", phone: "13800101010", remark: "残疾家庭",   submitter: "李老师", time: "2026-03-19 09:15", term: "2025-2026第二学期" },
];

const leaveRows = [
  { name: "莫佳龙", type: "病假",   start: "2026-04-21 08:00", end: "2026-04-22 18:00", days: 2, reason: "发烧就医",           created: "2026-04-21 07:30", status: "已审批" },
  { name: "陆彦希", type: "事假",   start: "2026-04-23 08:00", end: "2026-04-23 18:00", days: 1, reason: "家中急事",           created: "2026-04-22 20:15", status: "已审批" },
  { name: "张欣蕾", type: "病假",   start: "2026-04-24 08:00", end: "2026-04-25 18:00", days: 2, reason: "肠胃炎输液",         created: "2026-04-24 07:45", status: "审批中" },
  { name: "刘静",   type: "请假",   start: "2026-04-25 14:00", end: "2026-04-25 18:00", days: 0.5, reason: "牙科复诊",         created: "2026-04-25 09:00", status: "已审批" },
  { name: "赵磊",   type: "事假",   start: "2026-04-26 08:00", end: "2026-04-28 18:00", days: 3, reason: "参加省级竞赛",       created: "2026-04-25 16:30", status: "审批中" },
  { name: "孙丽",   type: "病假",   start: "2026-04-22 08:00", end: "2026-04-22 18:00", days: 1, reason: "感冒发烧",           created: "2026-04-22 06:50", status: "已审批" },
  { name: "周建国", type: "事假",   start: "2026-04-20 08:00", end: "2026-04-20 18:00", days: 1, reason: "户籍办理",           created: "2026-04-19 21:00", status: "已审批" },
  { name: "吴雪",   type: "病假",   start: "2026-04-27 08:00", end: "2026-04-29 18:00", days: 3, reason: "骨折复查",           created: "2026-04-26 18:20", status: "待提交" },
  { name: "郑浩然", type: "请假",   start: "2026-04-25 08:00", end: "2026-04-25 12:00", days: 0.5, reason: "眼科检查",         created: "2026-04-24 22:00", status: "已审批" },
  { name: "何婷",   type: "事假",   start: "2026-04-18 08:00", end: "2026-04-19 18:00", days: 2, reason: "随父母外出处理事务", created: "2026-04-17 19:45", status: "已审批" },
];

const TALK_COLS = ["谈心教师","班级名称","学生姓名","学生身份证","学生学号","谈心教师学科","谈心谈话时间","谈话内容","谈心谈话内容记录","教师指导建议","沟通照片","提交人","提交时间"];

const talkRows = [
  { teacher: "李晓燕", cls: "高一(1)班", stuName: "莫佳龙", idCard: "450102200902180011", stuId: "20240101", subject: "语文", talkTime: "2026-04-10 14:00", topic: "学习态度",      record: "学生近期上课注意力不集中，与同学沟通后了解到家庭压力较大", advice: "建议家长多关注学生心理状态，提供必要支持", photo: "有", submitter: "李晓燕", submitTime: "2026-04-10 15:30" },
  { teacher: "王志强", cls: "高一(2)班", stuName: "陆彦希", idCard: "450102200904140022", stuId: "20240215", subject: "数学", talkTime: "2026-04-11 10:00", topic: "成绩下滑",      record: "数学成绩较上学期下滑明显，学生表示对函数部分掌握不扎实", advice: "安排课后一对一辅导，强化函数专项练习", photo: "无", submitter: "王志强", submitTime: "2026-04-11 11:20" },
  { teacher: "张美玲", cls: "高一(3)班", stuName: "张欣蕾", idCard: "450102201006050033", stuId: "20240322", subject: "英语", talkTime: "2026-04-12 15:30", topic: "人际关系",      record: "与同宿舍同学发生摩擦，情绪低落，影响正常学习", advice: "引导学生学会换位思考，主动与宿舍同学沟通和解", photo: "无", submitter: "张美玲", submitTime: "2026-04-12 16:45" },
  { teacher: "陈建国", cls: "高二(1)班", stuName: "刘静",   idCard: "450102200907220044", stuId: "20240533", subject: "物理", talkTime: "2026-04-13 09:00", topic: "职业规划",      record: "对未来专业方向感到迷茫，希望得到老师指导", advice: "建议参加职业兴趣测评，多了解各专业就业前景", photo: "有", submitter: "陈建国", submitTime: "2026-04-13 10:10" },
  { teacher: "李晓燕", cls: "高二(2)班", stuName: "赵磊",   idCard: "450102200908150055", stuId: "20240619", subject: "语文", talkTime: "2026-04-14 14:00", topic: "行为习惯",      record: "多次迟到早退，经谈话了解到学生存在睡眠问题", advice: "建议调整作息规律，严格执行熄灯时间", photo: "无", submitter: "李晓燕", submitTime: "2026-04-14 15:00" },
  { teacher: "王志强", cls: "高二(3)班", stuName: "孙丽",   idCard: "450102200811120066", stuId: "20240724", subject: "数学", talkTime: "2026-04-15 10:30", topic: "心理压力",      record: "高考压力较大，出现焦虑情绪，影响正常发挥", advice: "引导学生正确看待考试，推荐参加学校心理健康讲座", photo: "有", submitter: "王志强", submitTime: "2026-04-15 11:40" },
  { teacher: "张美玲", cls: "高三(1)班", stuName: "周建国", idCard: "450102200805280077", stuId: "20240831", subject: "英语", talkTime: "2026-04-16 16:00", topic: "志愿填报",      record: "对志愿填报政策不了解，担心填报失误影响未来", advice: "组织学生参加志愿填报专题讲座，提前模拟填报流程", photo: "无", submitter: "张美玲", submitTime: "2026-04-16 17:00" },
  { teacher: "陈建国", cls: "高三(2)班", stuName: "吴雪",   idCard: "450102200909090088", stuId: "20240912", subject: "物理", talkTime: "2026-04-17 09:30", topic: "学习方法",      record: "复习效率低，题目做了很多但成绩提升不明显", advice: "建议采用错题本方法，针对薄弱知识点专项突破", photo: "有", submitter: "陈建国", submitTime: "2026-04-17 10:45" },
  { teacher: "李晓燕", cls: "高三(1)班", stuName: "郑浩然", idCard: "450102200710050099", stuId: "20241005", subject: "语文", talkTime: "2026-04-18 14:30", topic: "情感问题",      record: "出现早恋苗头，影响学习状态和课堂注意力", advice: "正面引导学生树立正确价值观，将精力聚焦学业", photo: "无", submitter: "李晓燕", submitTime: "2026-04-18 15:50" },
  { teacher: "王志强", cls: "高三(2)班", stuName: "何婷",   idCard: "450102200811180110", stuId: "20241118", subject: "数学", talkTime: "2026-04-19 11:00", topic: "家庭困难",      record: "家庭经济困难，学生情绪不稳定，有辍学想法", advice: "立即联系家长，协助学生申请困难补助，稳定其学习意愿", photo: "有", submitter: "王志强", submitTime: "2026-04-19 12:00" },
];


const BASE_COLS = ["学籍状态","姓名","民族","性别","出生日期","年龄","政治面貌","学生本人电话","户籍地址","现居地址","监护人1姓名","监护人1联系方式","监护人1关系","监护人1工作单位","监护人2姓名","监护人2联系方式","监护人2关系","监护人2工作单位","年级","年级别名","班主任","学生类型","毕业院校","既往病史","是否残疾","享受寄宿生生活补助金额（元）","享受营养改善计划补助金额（元）","是建档立卡贫苦户","建档立卡贫困户子女","随迁子女入","在校（园）农村留守儿童","备注","宿舍入住状态","宿舍楼栋","宿舍号","选科科目","选科方向","选科1","选科2","外语选科"];

const tableRows = [
  { status:"在读", name:"莫佳龙", ethnicity:"壮",   gender:"男", birth:"2009-02-18", age:17, politics:"共青团员", phone:"13900001001", domicile:"广西南宁市武鸣区某村1号",   residence:"广西南宁市武鸣区学生宿舍",  g1name:"莫国强", g1phone:"13800101001", g1rel:"父亲", g1work:"务农",           g2name:"黄梅",   g2phone:"13800101002", g2rel:"母亲", g2work:"务农",           grade:"高2025级", gradeAlias:"高一", teacher:"李晓燕", stuType:"普通学生", school:"武鸣区某初中", history:"无",   disabled:"否", boardingAid:500,  nutritionAid:160, poverty:"是", povertyChild:"是", migrant:"否", leftBehind:"否", remark:"", dormStatus:"已入住", dormBuilding:"佳慧楼", dormNo:"A101", subjects:"物化生", direction:"理科", sub1:"物理", sub2:"化学", foreignLang:"英语" },
  { status:"在读", name:"陆彦希", ethnicity:"汉",   gender:"男", birth:"2009-04-14", age:17, politics:"共青团员", phone:"13900001002", domicile:"广西南宁市江南区某街道2号", residence:"广西南宁市江南区学生宿舍",  g1name:"陆建华", g1phone:"13800101003", g1rel:"父亲", g1work:"建筑工人",       g2name:"林秀",   g2phone:"13800101004", g2rel:"母亲", g2work:"个体经营",       grade:"高2025级", gradeAlias:"高一", teacher:"李晓燕", stuType:"普通学生", school:"江南区某初中", history:"无",   disabled:"否", boardingAid:500,  nutritionAid:160, poverty:"否", povertyChild:"否", migrant:"否", leftBehind:"否", remark:"", dormStatus:"已入住", dormBuilding:"佳慧楼", dormNo:"A102", subjects:"史地政", direction:"文科", sub1:"历史", sub2:"地理", foreignLang:"英语" },
  { status:"在读", name:"张欣蕾", ethnicity:"汉",   gender:"女", birth:"2010-06-05", age:16, politics:"群众",     phone:"13900001003", domicile:"广西柳州市鱼峰区某路3号",   residence:"广西柳州市鱼峰区学生宿舍",  g1name:"张明辉", g1phone:"13800101005", g1rel:"父亲", g1work:"教师",           g2name:"周艳",   g2phone:"13800101006", g2rel:"母亲", g2work:"护士",           grade:"高2025级", gradeAlias:"高一", teacher:"王志强", stuType:"普通学生", school:"鱼峰区某初中", history:"鼻炎", disabled:"否", boardingAid:0,    nutritionAid:160, poverty:"否", povertyChild:"否", migrant:"否", leftBehind:"否", remark:"", dormStatus:"已入住", dormBuilding:"自强楼", dormNo:"B201", subjects:"物化生", direction:"理科", sub1:"物理", sub2:"生物", foreignLang:"英语" },
  { status:"在读", name:"刘静",   ethnicity:"壮",   gender:"女", birth:"2009-07-22", age:17, politics:"共青团员", phone:"13900001004", domicile:"广西百色市右江区某镇4号",   residence:"广西百色市右江区学生宿舍",  g1name:"刘德志", g1phone:"13800101007", g1rel:"父亲", g1work:"务农",           g2name:"黄秀兰", g2phone:"13800101008", g2rel:"母亲", g2work:"务农",           grade:"高2024级", gradeAlias:"高二", teacher:"张美玲", stuType:"普通学生", school:"右江区某初中", history:"无",   disabled:"否", boardingAid:500,  nutritionAid:160, poverty:"是", povertyChild:"是", migrant:"否", leftBehind:"是",  remark:"", dormStatus:"已入住", dormBuilding:"自强楼", dormNo:"B202", subjects:"史地政", direction:"文科", sub1:"政治", sub2:"地理", foreignLang:"英语" },
  { status:"在读", name:"赵磊",   ethnicity:"汉",   gender:"男", birth:"2009-08-15", age:17, politics:"共青团员", phone:"13900001005", domicile:"广西桂林市秀峰区某路5号",   residence:"广西桂林市秀峰区学生宿舍",  g1name:"赵志远", g1phone:"13800101009", g1rel:"父亲", g1work:"企业职工",       g2name:"唐丽",   g2phone:"13800101010", g2rel:"母亲", g2work:"个体经营",       grade:"高2024级", gradeAlias:"高二", teacher:"张美玲", stuType:"普通学生", school:"秀峰区某初中", history:"无",   disabled:"否", boardingAid:0,    nutritionAid:0,   poverty:"否", povertyChild:"否", migrant:"否", leftBehind:"否", remark:"竞赛生", dormStatus:"已入住", dormBuilding:"自立楼", dormNo:"C301", subjects:"物化生", direction:"理科", sub1:"物理", sub2:"化学", foreignLang:"英语" },
  { status:"在读", name:"孙丽",   ethnicity:"瑶",   gender:"女", birth:"2009-11-12", age:17, politics:"群众",     phone:"13900001006", domicile:"广西河池市金城江区某村6号", residence:"广西河池市金城江区学生宿舍", g1name:"孙建国", g1phone:"13800101011", g1rel:"父亲", g1work:"务农",           g2name:"韦春梅", g2phone:"13800101012", g2rel:"母亲", g2work:"务农",           grade:"高2024级", gradeAlias:"高二", teacher:"陈建国", stuType:"普通学生", school:"金城江区某初中", history:"无",   disabled:"否", boardingAid:500,  nutritionAid:160, poverty:"是", povertyChild:"是", migrant:"否", leftBehind:"是",  remark:"", dormStatus:"已入住", dormBuilding:"自立楼", dormNo:"C302", subjects:"史地政", direction:"文科", sub1:"历史", sub2:"政治", foreignLang:"英语" },
  { status:"在读", name:"周建国", ethnicity:"汉",   gender:"男", birth:"2008-05-28", age:18, politics:"中共党员", phone:"13900001007", domicile:"广西南宁市兴宁区某路7号",   residence:"广西南宁市兴宁区学生宿舍",  g1name:"周伟",   g1phone:"13800101013", g1rel:"父亲", g1work:"公务员",         g2name:"陈燕",   g2phone:"13800101014", g2rel:"母亲", g2work:"教师",           grade:"高2023级", gradeAlias:"高三", teacher:"李晓燕", stuType:"普通学生", school:"兴宁区某初中", history:"无",   disabled:"否", boardingAid:0,    nutritionAid:0,   poverty:"否", povertyChild:"否", migrant:"否", leftBehind:"否", remark:"班长",   dormStatus:"已入住", dormBuilding:"佳慧楼", dormNo:"A103", subjects:"物化生", direction:"理科", sub1:"物理", sub2:"化学", foreignLang:"英语" },
  { status:"在读", name:"吴雪",   ethnicity:"汉",   gender:"女", birth:"2009-09-09", age:17, politics:"共青团员", phone:"13900001008", domicile:"广西玉林市玉州区某街8号",   residence:"广西玉林市玉州区学生宿舍",  g1name:"吴大明", g1phone:"13800101015", g1rel:"父亲", g1work:"个体经营",       g2name:"梁红",   g2phone:"13800101016", g2rel:"母亲", g2work:"个体经营",       grade:"高2023级", gradeAlias:"高三", teacher:"王志强", stuType:"普通学生", school:"玉州区某初中", history:"无",   disabled:"否", boardingAid:0,    nutritionAid:0,   poverty:"否", povertyChild:"否", migrant:"否", leftBehind:"否", remark:"", dormStatus:"已入住", dormBuilding:"自强楼", dormNo:"B203", subjects:"史地政", direction:"文科", sub1:"历史", sub2:"地理", foreignLang:"英语" },
  { status:"休学", name:"郑浩然", ethnicity:"汉",   gender:"男", birth:"2007-10-05", age:19, politics:"群众",     phone:"13900001009", domicile:"广西贺州市八步区某村9号",   residence:"广西贺州市八步区学生宿舍",  g1name:"郑国栋", g1phone:"13800101017", g1rel:"父亲", g1work:"务农",           g2name:"李秋云", g2phone:"13800101018", g2rel:"母亲", g2work:"务农",           grade:"高2023级", gradeAlias:"高三", teacher:"张美玲", stuType:"低保学生", school:"八步区某初中", history:"无",   disabled:"否", boardingAid:500,  nutritionAid:160, poverty:"是", povertyChild:"是", migrant:"否", leftBehind:"是",  remark:"", dormStatus:"未入住", dormBuilding:"—",    dormNo:"—",    subjects:"物化生", direction:"理科", sub1:"化学", sub2:"生物", foreignLang:"英语" },
  { status:"在读", name:"何婷",   ethnicity:"壮",   gender:"女", birth:"2008-11-18", age:18, politics:"共青团员", phone:"13900001010", domicile:"广西崇左市江州区某镇10号", residence:"广西崇左市江州区学生宿舍",  g1name:"何志勇", g1phone:"13800101019", g1rel:"父亲", g1work:"务农",           g2name:"罗彩霞", g2phone:"13800101020", g2rel:"母亲", g2work:"务农",           grade:"高2023级", gradeAlias:"高三", teacher:"陈建国", stuType:"残疾学生", school:"江州区某初中", history:"听力障碍", disabled:"是", boardingAid:500,  nutritionAid:160, poverty:"是", povertyChild:"是", migrant:"否", leftBehind:"是",  remark:"需关注", dormStatus:"已入住", dormBuilding:"自立楼", dormNo:"C303", subjects:"史地政", direction:"文科", sub1:"政治", sub2:"历史", foreignLang:"英语" },
];

const RETURN_COLS = ["填报日期","年级","班级名称","应到学生人数","返校学生人数","未返校学生人数","转入学生人数","病假学生姓名","病假学生人数","病假具体情况说明","事假学生姓名","事假学生人数","事假具体情况说明","在外学习培训学生姓名","在外学习培训具体情况说明","休学学生姓名","休学学生人数","休学具体情况说明","流失学生姓名","流失学生人数","流失学生具体情况说明"];
const UNREPORT_COLS = ["班级名称","班主任企微","今日填报情况","填报日期"];

const returnRows = [
  { date:"2026-04-27", grade:"高2025级", cls:"高一(1)班", total:48, returned:46, absent:2, transfer:0, sickNames:"莫佳龙、张欣蕾", sickCount:2, sickDesc:"莫佳龙发烧就医，张欣蕾肠胃炎输液", leaveNames:"",     leaveCount:0, leaveDesc:"", trainNames:"",     trainDesc:"", suspendNames:"", suspendCount:0, suspendDesc:"", lostNames:"", lostCount:0, lostDesc:"" },
  { date:"2026-04-27", grade:"高2025级", cls:"高一(2)班", total:50, returned:49, absent:1, transfer:0, sickNames:"陆彦希",        sickCount:1, sickDesc:"感冒发烧",                                      leaveNames:"",     leaveCount:0, leaveDesc:"", trainNames:"",     trainDesc:"", suspendNames:"", suspendCount:0, suspendDesc:"", lostNames:"", lostCount:0, lostDesc:"" },
  { date:"2026-04-27", grade:"高2025级", cls:"高一(3)班", total:46, returned:45, absent:1, transfer:0, sickNames:"",             sickCount:0, sickDesc:"",                                               leaveNames:"刘静", leaveCount:1, leaveDesc:"牙科复诊", trainNames:"赵磊", trainDesc:"参加省级数学竞赛", suspendNames:"", suspendCount:0, suspendDesc:"", lostNames:"", lostCount:0, lostDesc:"" },
  { date:"2026-04-27", grade:"高2024级", cls:"高二(1)班", total:52, returned:51, absent:1, transfer:1, sickNames:"孙丽",         sickCount:1, sickDesc:"骨折复查",                                       leaveNames:"",     leaveCount:0, leaveDesc:"", trainNames:"",     trainDesc:"", suspendNames:"", suspendCount:0, suspendDesc:"", lostNames:"", lostCount:0, lostDesc:"" },
  { date:"2026-04-27", grade:"高2024级", cls:"高二(2)班", total:50, returned:50, absent:0, transfer:0, sickNames:"",             sickCount:0, sickDesc:"",                                               leaveNames:"",     leaveCount:0, leaveDesc:"", trainNames:"",     trainDesc:"", suspendNames:"", suspendCount:0, suspendDesc:"", lostNames:"", lostCount:0, lostDesc:"" },
  { date:"2026-04-27", grade:"高2024级", cls:"高二(3)班", total:47, returned:44, absent:3, transfer:0, sickNames:"何婷",         sickCount:1, sickDesc:"听力复查",                                       leaveNames:"郑浩然、吴雪", leaveCount:2, leaveDesc:"郑浩然眼科检查，吴雪户籍办理", trainNames:"", trainDesc:"", suspendNames:"", suspendCount:0, suspendDesc:"", lostNames:"", lostCount:0, lostDesc:"" },
  { date:"2026-04-27", grade:"高2023级", cls:"高三(1)班", total:55, returned:53, absent:2, transfer:0, sickNames:"",             sickCount:0, sickDesc:"",                                               leaveNames:"周建国", leaveCount:1, leaveDesc:"家中急事", trainNames:"", trainDesc:"", suspendNames:"郑浩然", suspendCount:1, suspendDesc:"因病休学，预计5月复学", lostNames:"", lostCount:0, lostDesc:"" },
  { date:"2026-04-27", grade:"高2023级", cls:"高三(2)班", total:53, returned:52, absent:1, transfer:0, sickNames:"",             sickCount:0, sickDesc:"",                                               leaveNames:"",     leaveCount:0, leaveDesc:"", trainNames:"",     trainDesc:"", suspendNames:"", suspendCount:0, suspendDesc:"", lostNames:"", lostCount:0, lostDesc:"" },
];

const unreportRows = [
  { cls:"高一(4)班",  wechat:"13800002001", status:"未填报", date:"2026-04-27" },
  { cls:"高二(4)班",  wechat:"13800002002", status:"未填报", date:"2026-04-27" },
  { cls:"高三(3)班",  wechat:"13800002003", status:"未填报", date:"2026-04-27" },
  { cls:"高三(4)班",  wechat:"13800002004", status:"未填报", date:"2026-04-27" },
  { cls:"高一(5)班",  wechat:"13800002005", status:"未填报", date:"2026-04-27" },
];

const timeFilters = ["今日", "本周", "本月", "今年"];

function GenericDrawer({ record, onClose, title }: { record: object | null; onClose: () => void; title: string }) {
  const r = record as Record<string, unknown> | null;
  useEffect(() => { if (!r) return; function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); } document.addEventListener("keydown", onKey); return () => document.removeEventListener("keydown", onKey); }, [r, onClose]);
  const entries = r ? Object.entries(r).filter(([k]) => !k.startsWith("_") && k !== "id") : [];
  return (<>
    <div className="fixed inset-0 z-40 transition-opacity duration-300" style={{ background: r ? "rgba(0,0,0,0.3)" : "transparent", pointerEvents: r ? "auto" : "none" }} onClick={onClose} />
    <div className="fixed top-0 right-0 h-full z-50 flex flex-col" style={{ width: 480, maxWidth: "100vw", background: "#fff", boxShadow: r ? "0 25px 50px -12px rgba(0,0,0,0.25)" : "none", transform: r ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.23,1,0.32,1)" }}>
      {r && (<>
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {entries.map(([k, v]) => (
              <div key={k}><p className="text-sm text-gray-400 mb-0.5">{k}</p><p className="text-base font-medium text-gray-800">{typeof v === "string" ? v || "-" : typeof v === "number" ? String(v) : Array.isArray(v) ? (v as Array<{name?:string}>).map(x => x.name ?? "").filter(Boolean).join("、") || "-" : "-"}</p></div>
            ))}
          </div>
        </div>
      </>)}
    </div>
  </>);
}

export function StudentDashboard({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollTabs = (dir: "left" | "right") => {
    if (tabsRef.current) tabsRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };
  const [activeTime, setActiveTime] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [hvTable, setHvTable] = useState(false);
  const [hvReturn, setHvReturn] = useState(false);
  const [hvUnreport, setHvUnreport] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentInfoRecord | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<StudentLeaveRecord | null>(null);
  const [selectedHealthCheck, setSelectedHealthCheck] = useState<HealthCheckRecord | null>(null);
  const [selectedReturnSchool, setSelectedReturnSchool] = useState<StudentReturnSchoolRecord | null>(null);
  const [selectedSupport, setSelectedSupport] = useState<StudentSupportRecord | null>(null);
  const [selectedTalk, setSelectedTalk] = useState<HeartToHeartTalkRecord | null>(null);

  // ── 学生基础信息 filters & data ──
  const [pendingName, setPendingName] = useState("");
  const [pendingClass, setPendingClass] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [studentSortAsc, setStudentSortAsc] = useState(false);

  // ── 学生晨午检 pending filters ──
  const [pendingHealthGrade, setPendingHealthGrade] = useState("");
  const [pendingHealthClass, setPendingHealthClass] = useState("");
  const [pendingHealthSession, setPendingHealthSession] = useState("");
  const [healthGradeFilter, setHealthGradeFilter] = useState("");
  const [healthClassFilter, setHealthClassFilter] = useState("");
  const [healthSessionFilter, setHealthSessionFilter] = useState("");

  // ── 学生返校情况 pending filters ──
  const [pendingReturnGrade, setPendingReturnGrade] = useState("");
  const [pendingReturnClass, setPendingReturnClass] = useState("");
  const [pendingReturnSemester, setPendingReturnSemester] = useState("");
  const [returnGradeFilter, setReturnGradeFilter] = useState("");
  const [returnClassFilter, setReturnClassFilter] = useState("");
  const [returnSemesterFilter, setReturnSemesterFilter] = useState("");

  // ── 学生请假 pending filters ──
  const [pendingLeaveName, setPendingLeaveName] = useState("");
  const [pendingLeaveType, setPendingLeaveType] = useState("");
  const [pendingLeaveGrade, setPendingLeaveGrade] = useState("");
  const [leaveNameFilter, setLeaveNameFilter] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("");
  const [leaveGradeFilter, setLeaveGradeFilter] = useState("");

  // ── 学生资助 pending filters ──
  const [pendingSupportGrade, setPendingSupportGrade] = useState("");
  const [pendingSupportClass, setPendingSupportClass] = useState("");
  const [supportGradeFilter, setSupportGradeFilter] = useState("");
  const [supportClassFilter, setSupportClassFilter] = useState("");

  // ── 谈心谈话 pending filters ──
  const [pendingTalkClass, setPendingTalkClass] = useState("");
  const [pendingTalkTeacher, setPendingTalkTeacher] = useState("");
  const [talkClassFilter, setTalkClassFilter] = useState("");
  const [talkTeacherFilter, setTalkTeacherFilter] = useState("");

  const studentFilters = useMemo<StudentInfoFilters>(() => ({
    name: nameFilter, className: classFilter, grade: "", status: "",
  }), [nameFilter, classFilter]);
  const { raw: studentRows, allRecords: studentAllRecords, filterOptions: studentFilterOptions, isPending: studentPending, isError: studentError, refetch: studentRefetch } = useStudentInfo(studentFilters, true);
  const totalStudents = studentRows.length;
  const enrolledStats = useMemo(() => {
    const enrolled = studentAllRecords.filter(r => !r.学籍状态 || r.学籍状态 === "招生【增加】"||r.学籍状态 === "转入【增加】"||r.学籍状态 === "复读【增加】");
    return {
      total: enrolled.length,
      male: enrolled.filter(r => r.性别 === "男").length,
      female: enrolled.filter(r => r.性别 === "女").length,
      classes: new Set(enrolled.map(r => r.班级名称).filter(Boolean)).size,
    };
  }, [studentAllRecords]);
  const gradeStats = useMemo(() => {
    const map = new Map<string, { students: number; classes: Set<string> }>();
    studentAllRecords.forEach(r => {
      if (!r.年级名称) return;
      if (!map.has(r.年级名称)) map.set(r.年级名称, { students: 0, classes: new Set() });
      const g = map.get(r.年级名称)!;
      g.students++;
      if (r.班级名称) g.classes.add(r.班级名称);
    });
    return Array.from(map.entries())
      .map(([grade, { students, classes }]) => ({ grade, students, classes: classes.size }))
      .sort((a, b) => a.grade.localeCompare(b.grade));
  }, [studentAllRecords]);
  const statusStats = useMemo(() => {
    if (studentPending) return { transfer: null, suspend: null, dropout: null };
    const now = new Date();
    const start = new Date(now);
    if (activeTime === 0) { start.setHours(0, 0, 0, 0); }
    else if (activeTime === 1) { start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); }
    else if (activeTime === 2) { start.setDate(1); start.setHours(0, 0, 0, 0); }
    else { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
    const inPeriod = (r: { 提交时间: string }) =>
      r.提交时间 ? new Date(r.提交时间) >= start : false;
    return {
      transfer: studentAllRecords.filter(r =>
        (r.学籍状态 === "转出【减少】" || r.学籍状态 === "转入【增加】") && inPeriod(r)
      ).length,
      suspend: studentAllRecords.filter(r => r.学籍状态 === "休学【减少】" && inPeriod(r)).length,
      dropout: studentAllRecords.filter(r => r.学籍状态 === "退学【减少】" && inPeriod(r)).length,
    };
  }, [studentAllRecords, studentPending, activeTime]);
  const sortedStudents = [...studentRows].sort((a, b) => studentSortAsc ? a._id.localeCompare(b._id) : b._id.localeCompare(a._id));
  const pagedStudents = sortedStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // ── 学生请假 filters & data ──
  const [leavePage, setLeavePage] = useState(1);
  const [leavePageSize, setLeavePageSize] = useState(20);
  const [leaveSortAsc, setLeaveSortAsc] = useState(false);
  const leaveFilters = useMemo<StudentLeaveFilters>(() => ({
    name: leaveNameFilter, type: leaveTypeFilter, status: "", grade: leaveGradeFilter,
  }), [leaveNameFilter, leaveTypeFilter, leaveGradeFilter]);
  // full pull for filterOptions + table data
  const { allRecords: leaveAllRecords, filterOptions: leaveFilterOptions, isPending: leaveStatsPending, refetch: leaveRefetch } = useStudentLeave(undefined, true);
  // lightweight count query for 动态数据 stat — accurate for all time periods
  const { count: filteredLeaveCount, isPending: leaveCountPending } = useStudentLeaveCount(activeTime);
  const filteredLeaveRows = useMemo(() => {
    return leaveAllRecords.filter(r => {
      if (leaveFilters.name   && !r.请假学生姓名.includes(leaveFilters.name)) return false;
      if (leaveFilters.type   && r.请假类型 !== leaveFilters.type)            return false;
      if (leaveFilters.grade  && r.请假学生年级 !== leaveFilters.grade)       return false;
      return true;
    });
  }, [leaveAllRecords, leaveFilters.name, leaveFilters.type, leaveFilters.grade]);
  const sortedLeave = useMemo(() => [...filteredLeaveRows].sort((a, b) => {
    const av = a.申请时间 ?? ""; const bv = b.申请时间 ?? "";
    return leaveSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  }), [filteredLeaveRows, leaveSortAsc]);
  const totalLeave = sortedLeave.length;
  const pagedLeave = sortedLeave.slice((leavePage - 1) * leavePageSize, leavePage * leavePageSize);
  const leavePending = leaveStatsPending;
  const leaveError = false;

  // ── 学生晨午检 filters & data ──
  const [healthPage, setHealthPage] = useState(1);
  const [healthPageSize, setHealthPageSize] = useState(20);
  const [healthSortAsc, setHealthSortAsc] = useState(false);
  const healthFilters = useMemo<HealthCheckFilters>(() => ({
    grade: healthGradeFilter, className: healthClassFilter, session: healthSessionFilter,
  }), [healthGradeFilter, healthClassFilter, healthSessionFilter]);
  const { raw: healthRows, filterOptions: healthFilterOptions, isPending: healthPending, isError: healthError, refetch: healthRefetch } = useHealthCheck(healthFilters, activeTab === 1);
  const totalHealth = healthRows.length;
  const sortedHealth = [...healthRows].sort((a, b) => {
    const av = a.填报日期_日期 ?? ""; const bv = b.填报日期_日期 ?? "";
    return healthSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const pagedHealth = sortedHealth.slice((healthPage - 1) * healthPageSize, healthPage * healthPageSize);

  // ── 学生返校情况 filters & data ──
  const [returnPage, setReturnPage] = useState(1);
  const [returnPageSize, setReturnPageSize] = useState(20);
  const [returnSortAsc, setReturnSortAsc] = useState(false);
  const returnFilters = useMemo<StudentReturnSchoolFilters>(() => ({
    grade: returnGradeFilter, className: returnClassFilter, semester: returnSemesterFilter,
  }), [returnGradeFilter, returnClassFilter, returnSemesterFilter]);
  const { raw: returnRows, filterOptions: returnFilterOptions, isPending: returnPending, isError: returnError, refetch: returnRefetch } = useStudentReturnSchool(returnFilters, activeTab === 2);
  const totalReturn = returnRows.length;
  const sortedReturn = [...returnRows].sort((a, b) => {
    const av = a.填报日期 ?? ""; const bv = b.填报日期 ?? "";
    return returnSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const pagedReturn = sortedReturn.slice((returnPage - 1) * returnPageSize, returnPage * returnPageSize);

  // ── 学生资助情况 filters & data ──
  const [supportPage, setSupportPage] = useState(1);
  const [supportPageSize, setSupportPageSize] = useState(20);
  const [supportSortAsc, setSupportSortAsc] = useState(false);
  const supportFilters = useMemo<StudentSupportFilters>(() => ({
    grade: supportGradeFilter, className: supportClassFilter, semester: "",
  }), [supportGradeFilter, supportClassFilter]);
  const { raw: supportRows, filterOptions: supportFilterOptions, isPending: supportPending, isError: supportError, refetch: supportRefetch } = useStudentSupport(supportFilters, activeTab === 5);
  const totalSupport = supportRows.length;
  const sortedSupport = [...supportRows].sort((a, b) => supportSortAsc ? a._id.localeCompare(b._id) : b._id.localeCompare(a._id));
  const pagedSupport = sortedSupport.slice((supportPage - 1) * supportPageSize, supportPage * supportPageSize);

  // ── 谈心谈话记录 filters & data ──
  const [talkPage, setTalkPage] = useState(1);
  const [talkPageSize, setTalkPageSize] = useState(20);
  const [talkSortAsc, setTalkSortAsc] = useState(false);
  const talkFilters = useMemo<HeartToHeartTalkFilters>(() => ({
    className: talkClassFilter, teacher: talkTeacherFilter,
  }), [talkClassFilter, talkTeacherFilter]);
  const { raw: talkApiRows, filterOptions: talkFilterOptions, isPending: talkPending, isError: talkError, refetch: talkRefetch } = useHeartToHeartTalk(talkFilters, activeTab === 7);
  const totalTalk = talkApiRows.length;
  const sortedTalk = [...talkApiRows].sort((a, b) => {
    const av = a.谈心谈话时间 ?? ""; const bv = b.谈心谈话时间 ?? "";
    return talkSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const pagedTalk = sortedTalk.slice((talkPage - 1) * talkPageSize, talkPage * talkPageSize);

  const { raw: txApiRows, isPending: txPending, isError: txError, refetch: txRefetch } = useTransactionsToday();
  const { raw: accessApiRows, isPending: accessPending, isError: accessError, refetch: accessRefetch } = useAccessLogsToday();
  const [consumeSortAsc, setConsumeSortAsc] = useState(false);
  const [consumePage, setConsumePage] = useState(1);
  const [consumePageSize, setConsumePageSize] = useState(20);
  const [accessSortAsc, setAccessSortAsc] = useState(false);
  const [accessPage, setAccessPage] = useState(1);
  const [accessPageSize, setAccessPageSize] = useState(20);
  const [selectedConsume, setSelectedConsume] = useState<TransactionsRecord | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<AccessLogRecord | null>(null);
  const [pendingConsumeName, setPendingConsumeName] = useState("");
  const [pendingAccessName, setPendingAccessName] = useState("");
  const [consumeNameFilter, setConsumeNameFilter] = useState("");
  const [accessNameFilter, setAccessNameFilter] = useState("");
  const sortedConsume = useMemo(() => {
    let list = txApiRows;
    if (consumeNameFilter) list = list.filter(r => r.姓名?.includes(consumeNameFilter));
    return [...list].sort((a, b) => {
      const av = a.交易时间 || ""; const bv = b.交易时间 || "";
      return consumeSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [txApiRows, consumeSortAsc, consumeNameFilter]);
  const sortedAccess = useMemo(() => {
    let list = accessApiRows;
    if (accessNameFilter) list = list.filter(r => r.姓名?.includes(accessNameFilter));
    return [...list].sort((a, b) => {
      const av = a.通行时间 || ""; const bv = b.通行时间 || "";
      return accessSortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [accessApiRows, accessSortAsc, accessNameFilter]);
  const pagedConsume = sortedConsume.slice((consumePage - 1) * consumePageSize, consumePage * consumePageSize);
  const pagedAccess = sortedAccess.slice((accessPage - 1) * accessPageSize, accessPage * accessPageSize);

  const { amount: consumeAmount, isPending: consumeStatsPending } = useTransactionStats(activeTime);
  const { exitCount, enterCount, isPending: accessStatsPending } = useAccessStats(activeTime);

  // ── 学生成长 hooks ──────────────────────────────────────────
  const { raw: cadreeRows, isPending: cadreePending, isError: cadreeError, refetch: cadreeRefetch } = useStudentCadree();
  const { raw: physicalRows, isPending: physicalPending, isError: physicalError, refetch: physicalRefetch } = usePhysicalTest();
  const { raw: awardRows, isPending: awardPending, isError: awardError, refetch: awardRefetch } = useStudentAward();
  const { raw: deedsRows, isPending: deedsPending, isError: deedsError, refetch: deedsRefetch } = useGoodDeeds();

  // State for 学生成长 tables
  const [cadreeSortAsc, setCadreeSortAsc] = useState(false); const [cadreePage, setCadreePage] = useState(1); const [cadreePageSize, setCadreePageSize] = useState(20);
  const [physicalSortAsc, setPhysicalSortAsc] = useState(false); const [physicalPage, setPhysicalPage] = useState(1); const [physicalPageSize, setPhysicalPageSize] = useState(20);
  const [awardSortAsc, setAwardSortAsc] = useState(false); const [awardPage, setAwardPage] = useState(1); const [awardPageSize, setAwardPageSize] = useState(20);
  const [deedsSortAsc, setDeedsSortAsc] = useState(false); const [deedsPage, setDeedsPage] = useState(1); const [deedsPageSize, setDeedsPageSize] = useState(20);

  const sortedCadree = useMemo(() => [...cadreeRows].sort((a, b) => cadreeSortAsc ? a.提交时间.localeCompare(b.提交时间) : b.提交时间.localeCompare(a.提交时间)), [cadreeRows, cadreeSortAsc]);
  const sortedPhysical = useMemo(() => [...physicalRows].sort((a, b) => physicalSortAsc ? a.提交时间.localeCompare(b.提交时间) : b.提交时间.localeCompare(a.提交时间)), [physicalRows, physicalSortAsc]);
  const sortedAward = useMemo(() => [...awardRows].sort((a, b) => awardSortAsc ? a.提交时间.localeCompare(b.提交时间) : b.提交时间.localeCompare(a.提交时间)), [awardRows, awardSortAsc]);
  const sortedDeeds = useMemo(() => [...deedsRows].sort((a, b) => deedsSortAsc ? a.提交时间.localeCompare(b.提交时间) : b.提交时间.localeCompare(a.提交时间)), [deedsRows, deedsSortAsc]);

  const [selectedCadree, setSelectedCadree] = useState<StudentCadreeRecord | null>(null);
  const [selectedPhysical, setSelectedPhysical] = useState<PhysicalTestRecord | null>(null);
  const [selectedAward, setSelectedAward] = useState<StudentAwardRecord | null>(null);
  const [selectedDeeds, setSelectedDeeds] = useState<GoodDeedsRecord | null>(null);

  const pagedCadree = sortedCadree.slice((cadreePage - 1) * cadreePageSize, cadreePage * cadreePageSize);
  const pagedPhysical = sortedPhysical.slice((physicalPage - 1) * physicalPageSize, physicalPage * physicalPageSize);
  const pagedAward = sortedAward.slice((awardPage - 1) * awardPageSize, awardPage * awardPageSize);
  const pagedDeeds = sortedDeeds.slice((deedsPage - 1) * deedsPageSize, deedsPage * deedsPageSize);

  function formatAmount(n: number | null): string {
    if (n == null) return "…";
    if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return `¥${n.toFixed(0)}`;
  }

  const consumeItems = useMemo(() => {
    const total = txApiRows.length;
    if (total === 0) return [] as { label: string; pct: number; color: string }[];
    const map = new Map<string, number>();
    for (const r of txApiRows) {
      const cat = r.订单类型 || "其他";
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    const entries = [...map.entries()].sort(([, a], [, b]) => b - a).slice(0, 5);
    return entries.map(([label, count], i) => ({
      label: label || "其他",
      pct: Math.round((count / total) * 100),
      color: CONSUME_CATEGORY_COLORS[i % CONSUME_CATEGORY_COLORS.length],
    }));
  }, [txApiRows]);

  const consumeCols = useMemo((): ColumnDef<TransactionsRecord>[] => [
    { key: "姓名", header: "姓名", render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.姓名 || "—"}</span> },
    { key: "班级", header: "班级", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班级 || "—"}</span> },
    { key: "宏德学_工号", header: "学/工号", render: r => <span style={{ fontSize: 15, color: "#6b7280" }}>{r.宏德学_工号 || "—"}</span> },
    { key: "订单类型", header: "订单类型", render: r => r.订单类型 ? <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap" style={{ background:"rgba(99,102,241,0.08)", color:"#4f46e5" }}>{r.订单类型}</span> : <span className="text-gray-300">—</span> },
    { key: "支付方式", header: "支付方式", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.支付方式 || "—"}</span> },
    { key: "交易金额", header: "交易金额", render: r => <span className="font-medium" style={{ fontSize: 15, color: "#374151" }}>¥{(r.交易金额 ?? 0).toFixed(2)}</span> },
    { key: "实付金额", header: "实付金额", render: r => <span className="font-bold" style={{ fontSize: 15, color: "#059669" }}>¥{(r.实付金额 ?? 0).toFixed(2)}</span> },
    { key: "交易时间", header: "交易时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.交易时间 ? r.交易时间.slice(0, 16) : "—"}</span> },
    { key: "订单状态", header: "订单状态", render: r => r.订单状态 ? <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap" style={{ background: r.订单状态==="已完成"?"rgba(16,185,129,0.08)":"rgba(245,158,11,0.1)", color: r.订单状态==="已完成"?"#059669":"#d97706" }}>{r.订单状态}</span> : <span className="text-gray-300">—</span> },
    { key: "消费方式", header: "消费方式", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.消费方式 || "—"}</span> },
    { key: "门店", header: "门店", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.门店 || "—"}</span> },
    { key: "退款金额", header: "退款金额", render: r => <span style={{ fontSize: 15, color: r.退款金额 > 0 ? "#d97706" : "#9ca3af" }}>{r.退款金额 > 0 ? `¥${r.退款金额.toFixed(2)}` : "—"}</span> },
  ], []);

  const accessCols = useMemo((): ColumnDef<AccessLogRecord>[] => [
    { key: "姓名", header: "姓名", render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.姓名 || "—"}</span> },
    { key: "年级", header: "年级", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.年级 || "—"}</span> },
    { key: "班级", header: "班级", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班级 || "—"}</span> },
    { key: "身份", header: "身份", render: r => <span style={{ fontSize: 15, color: "#6b7280" }}>{r.身份 || "学生"}</span> },
    { key: "宏德学_工号", header: "学号", render: r => <span style={{ fontSize: 15, color: "#6b7280" }}>{r.宏德学_工号 || "—"}</span> },
    { key: "通行时间", header: "通行时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.通行时间 ? r.通行时间.slice(0, 16) : "—"}</span> },
    { key: "出入场所", header: "出入场所", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.出入场所 || "—"}</span> },
    { key: "通行方向", header: "进出状态", render: r => r.通行方向 ? <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap" style={{ background: r.通行方向==="进"?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)", color: r.通行方向==="进"?"#059669":"#dc2626" }}>{r.通行方向}校</span> : <span className="text-gray-300">—</span> },
    { key: "打卡设备", header: "打卡设备", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.打卡设备 || "—"}</span> },
  ], []);

  const cadreeCols = useMemo((): ColumnDef<StudentCadreeRecord>[] => [
    { key: "录入学期", header: "学期", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.录入学期 || "—"}</span> },
    { key: "姓名", header: "姓名", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.姓名 || "—"}</span> },
    { key: "班级名称", header: "班级", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.班级名称 || "—"}</span> },
    { key: "职务", header: "职务", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.职务 || "—"}</span> },
    { key: "任职开始时间", header: "开始时间", render: r => <span style={{ fontSize: 15, color: "#6b7280" }}>{r.任职开始时间?.slice(0, 10) || "—"}</span> },
    { key: "任职结束时间", header: "结束时间", render: r => <span style={{ fontSize: 15, color: "#6b7280" }}>{r.任职结束时间?.slice(0, 10) || "—"}</span> },
    { key: "班主任", header: "班主任", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.班主任 || "—"}</span> },
    { key: "提交时间", header: "提交时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.提交时间?.slice(0, 16) || "—"}</span> },
  ], []);

  const physicalCols = useMemo((): ColumnDef<PhysicalTestRecord>[] => [
    { key: "录入学期", header: "学期", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.录入学期 || "—"}</span> },
    { key: "姓名", header: "姓名", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.姓名 || "—"}</span> },
    { key: "班级名称", header: "班级", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.班级名称 || "—"}</span> },
    { key: "身高", header: "身高", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.身高 || "—"}</span> },
    { key: "体重", header: "体重", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.体重 || "—"}</span> },
    { key: "肺活量", header: "肺活量", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.肺活量 || "—"}</span> },
    { key: "50米跑", header: "50米跑", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r["50米跑"] || "—"}</span> },
    { key: "提交时间", header: "提交时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.提交时间?.slice(0, 16) || "—"}</span> },
  ], []);

  const awardCols = useMemo((): ColumnDef<StudentAwardRecord>[] => [
    { key: "学期", header: "学期", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.学期 || "—"}</span> },
    { key: "学生姓名", header: "姓名", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学生姓名 || "—"}</span> },
    { key: "班级名称", header: "班级", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.班级名称 || "—"}</span> },
    { key: "参与比赛名称", header: "比赛名称", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.参与比赛名称}>{r.参与比赛名称 || "—"}</span> },
    { key: "获奖级别", header: "级别", render: r => r.获奖级别 ? <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: "rgba(16,185,129,0.08)", color: "#059669" }}>{r.获奖级别}</span> : <span className="text-gray-300">—</span> },
    { key: "获奖等级", header: "等级", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.获奖等级 || "—"}</span> },
    { key: "获奖时间", header: "获奖时间", render: r => <span style={{ fontSize: 15, color: "#6b7280" }}>{r.获奖时间?.slice(0, 10) || "—"}</span> },
    { key: "提交时间", header: "提交时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.提交时间?.slice(0, 16) || "—"}</span> },
  ], []);

  const deedsCols = useMemo((): ColumnDef<GoodDeedsRecord>[] => [
    { key: "学期", header: "学期", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.学期 || "—"}</span> },
    { key: "学生姓名", header: "姓名", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学生姓名 || "—"}</span> },
    { key: "班级名称", header: "班级", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.班级名称 || "—"}</span> },
    { key: "事件发生时间", header: "事件时间", render: r => <span style={{ fontSize: 15, color: "#6b7280" }}>{r.事件发生时间?.slice(0, 10) || "—"}</span> },
    { key: "事件地点", header: "地点", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.事件地点 || "—"}</span> },
    { key: "事件描述", header: "事件描述", minWidth: 160, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 160 }} title={r.事件描述}>{r.事件描述 || "—"}</span> },
    { key: "班主任", header: "班主任", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.班主任 || "—"}</span> },
    { key: "提交时间", header: "提交时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#6b7280" }}>{r.提交时间?.slice(0, 16) || "—"}</span> },
  ], []);

  function exportCadree() { const h = cadreeCols.map(c => c.header); const rows = cadreeRows.map(r => cadreeCols.map(c => { const v = r[c.key as keyof StudentCadreeRecord]; return typeof v === "string" ? v : ""; })); const ws = XLSX.utils.aoa_to_sheet([h, ...rows]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "学生干部风采"); XLSX.writeFile(wb, `学生干部风采_${new Date().toISOString().slice(0, 10)}.xlsx`); }
  function exportPhysical() { const h = physicalCols.map(c => c.header); const rows = physicalRows.map(r => physicalCols.map(c => { const v = r[c.key as keyof PhysicalTestRecord]; return typeof v === "string" ? v : ""; })); const ws = XLSX.utils.aoa_to_sheet([h, ...rows]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "体质检测"); XLSX.writeFile(wb, `体质检测_${new Date().toISOString().slice(0, 10)}.xlsx`); }
  function exportAward() { const h = awardCols.map(c => c.header); const rows = awardRows.map(r => awardCols.map(c => { const v = r[c.key as keyof StudentAwardRecord]; return typeof v === "string" ? v : ""; })); const ws = XLSX.utils.aoa_to_sheet([h, ...rows]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "学生获奖记录"); XLSX.writeFile(wb, `学生获奖记录_${new Date().toISOString().slice(0, 10)}.xlsx`); }
  function exportDeeds() { const h = deedsCols.map(c => c.header); const rows = deedsRows.map(r => deedsCols.map(c => { const v = r[c.key as keyof GoodDeedsRecord]; return typeof v === "string" ? v : ""; })); const ws = XLSX.utils.aoa_to_sheet([h, ...rows]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "好人好事记录"); XLSX.writeFile(wb, `好人好事记录_${new Date().toISOString().slice(0, 10)}.xlsx`); }

  const tableActions: { Icon: React.ElementType; tip: string }[] = [];

  function exportConsume() {
    const headers = consumeCols.map(c => c.header);
    const rows = sortedConsume.map(r => [
      r.姓名||"", r.班级||"", r.宏德学_工号||"", r.订单类型||"", r.支付方式||"",
      `¥${(r.交易金额??0).toFixed(2)}`, `¥${(r.实付金额??0).toFixed(2)}`,
      r.交易时间?.slice(0,16)||"", r.订单状态||"", r.消费方式||"", r.门店||"",
      r.退款金额>0 ? `¥${r.退款金额.toFixed(2)}` : "—",
    ]);
    exportToExcel("学生消费明细", headers, rows);
  }
  function exportAccess() {
    const headers = accessCols.map(c => c.header);
    const rows = sortedAccess.map(r => [
      r.姓名||"", r.年级||"", r.班级||"", r.身份||"", r.宏德学_工号||"",
      r.通行时间?.slice(0,16)||"", r.出入场所||"", `${r.通行方向||""}校`, r.打卡设备||"",
    ]);
    exportToExcel("学生进出数据", headers, rows);
  }

  const leaveCols = useMemo((): ColumnDef<StudentLeaveRecord>[] => [
    { key: "请假学生姓名", header: "请假人", render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.请假学生姓名 || "—"}</span> },
    { key: "请假类型", header: "请假类型", render: r => r.请假类型 ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: r.请假类型==="病假"?"rgba(239,68,68,0.1)":r.请假类型==="事假"?"rgba(245,158,11,0.1)":"rgba(99,102,241,0.1)", color: r.请假类型==="病假"?"#dc2626":r.请假类型==="事假"?"#d97706":"#4f46e5" }}>
        {r.请假类型}
      </span>
    ) : <span className="text-gray-300">—</span> },
    { key: "请假开始时间", header: "请假开始时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.请假开始时间 ? r.请假开始时间.slice(0, 16) : "—"}</span> },
    { key: "请假结束时间", header: "请假结束时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.请假结束时间 ? r.请假结束时间.slice(0, 16) : "—"}</span> },
    { key: "请假时长_数字", header: "请假时长（天）", render: r => <span className="font-medium" style={{ fontSize: 15, color: "#374151" }}>{r.请假时长_数字 || r.请假时长_文本 || "—"}</span> },
    { key: "请假原因说明", header: "请假原因说明", minWidth: 160, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 160 }} title={r.请假原因说明}>{r.请假原因说明 || "—"}</span> },
    { key: "申请时间", header: "发起时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#9ca3af" }}>{r.申请时间 ? r.申请时间.slice(0, 16) : "—"}</span> },
    { key: "状态", header: "状态", render: r => r.状态 ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: r.状态==="审批通过"?"rgba(16,185,129,0.1)":r.状态==="正在审批"?"rgba(59,130,246,0.1)":"rgba(107,114,128,0.08)", color: r.状态==="审批通过"?"#059669":r.状态==="正在审批"?"#2563eb":"#6b7280" }}>
        {r.状态}
      </span>
    ) : <span className="text-gray-300">—</span> },
    { key: "请假学生年级", header: "年级", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.请假学生年级 || "—"}</span> },
    { key: "请假学生班级", header: "班级", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.请假学生班级 || "—"}</span> },
    { key: "班主任", header: "班主任", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班主任 || "—"}</span> },
    { key: "学期", header: "学期", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学期 || "—"}</span> },
  ], []);

  const healthCheckCols = useMemo((): ColumnDef<HealthCheckRecord>[] => [
    { key: "班级名称", header: "班级名称", render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班级名称 || r.班级 || "—"}</span> },
    { key: "年级", header: "年级", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.年级 || "—"}</span> },
    { key: "级部", header: "级部", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.级部 || "—"}</span> },
    { key: "班主任", header: "班主任", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班主任 || "—"}</span> },
     { key: "上报类型", header: "上报类型", render: r => r.上报类型 ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: r.上报类型==="晨检"?"rgba(59,130,246,0.1)":r.上报类型==="午检"?"rgba(245,158,11,0.1)":"rgba(139,92,246,0.1)", color: r.上报类型==="晨检"?"#2563eb":r.上报类型==="午检"?"#d97706":"#7c3aed" }}>
        {r.上报类型}
      </span>
    ) : <span className="text-gray-300">—</span> },
    { key: "检查情况", header: "检查情况", render: r => r.检查情况 ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: r.检查情况==="正常"?"rgba(16,185,129,0.1)":"rgba(239,68,68,0.1)", color: r.检查情况==="正常"?"#059669":"#dc2626" }}>
        {r.检查情况}
      </span>
    ) : <span className="text-gray-300">—</span> },
    { key: "填报日期_文本", header: "填报日期", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.填报日期_文本 || r.填报日期_日期?.slice(0, 10) || "—"}</span> },
    { key: "应到学生人数", header: "应到人数", render: r => <span className="text-center block font-medium" style={{ fontSize: 15, color: "#374151" }}>{r.应到学生人数 ?? "—"}</span> },
    { key: "实到学生人数", header: "实到人数", render: r => <span className="text-center block font-medium" style={{ fontSize: 15, color: "#059669" }}>{r.实到学生人数 ?? "—"}</span> },
    { key: "因病缺课学生人数", header: "因病缺课", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.因病缺课学生人数 > 0 ? "#d97706" : "#9ca3af", fontWeight: r.因病缺课学生人数 > 0 ? 600 : 400 }}>{r.因病缺课学生人数}</span> },
    { key: "发热学生人数", header: "发热", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.发热学生人数 > 0 ? "#dc2626" : "#9ca3af", fontWeight: r.发热学生人数 > 0 ? 700 : 400 }}>{r.发热学生人数}</span> },
    { key: "流感确诊学生人数", header: "流感确诊", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.流感确诊学生人数 > 0 ? "#dc2626" : "#9ca3af", fontWeight: r.流感确诊学生人数 > 0 ? 700 : 400 }}>{r.流感确诊学生人数}</span> },
    { key: "是否有咽痛流涕咳嗽学生数", header: "咽痛流涕咳嗽", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.是否有咽痛流涕咳嗽学生数 > 0 ? "#d97706" : "#9ca3af", fontWeight: r.是否有咽痛流涕咳嗽学生数 > 0 ? 600 : 400 }}>{r.是否有咽痛流涕咳嗽学生数}</span> },
    { key: "乏力学生数", header: "乏力", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.乏力学生数 > 0 ? "#d97706" : "#9ca3af", fontWeight: r.乏力学生数 > 0 ? 600 : 400 }}>{r.乏力学生数}</span> },
    { key: "腹泻学生数", header: "腹泻", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.腹泻学生数 > 0 ? "#f97316" : "#9ca3af", fontWeight: r.腹泻学生数 > 0 ? 600 : 400 }}>{r.腹泻学生数}</span> },
    { key: "呼吸困难学生数", header: "呼吸困难", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.呼吸困难学生数 > 0 ? "#dc2626" : "#9ca3af", fontWeight: r.呼吸困难学生数 > 0 ? 700 : 400 }}>{r.呼吸困难学生数}</span> },
    { key: "其他症状学生数", header: "其他症状", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.其他症状学生数 > 0 ? "#6b7280" : "#9ca3af", fontWeight: r.其他症状学生数 > 0 ? 600 : 400 }}>{r.其他症状学生数}</span> },
    { key: "学期", header: "学期", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学期 || "—"}</span> },
  ], []);

  const returnSchoolCols = useMemo((): ColumnDef<StudentReturnSchoolRecord>[] => [
    { key: "填报日期",     header: "填报日期",     render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.填报日期?.slice(0, 10) || "—"}</span> },
    { key: "年级",         header: "年级",         render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.年级 || "—"}</span> },
    { key: "班级名称",     header: "班级名称",     render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班级名称 || "—"}</span> },
    { key: "班主任",       header: "班主任",       render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班主任 || "—"}</span> },
    { key: "应到学生人数", header: "应到人数",     render: r => <span className="text-center block font-medium" style={{ fontSize: 15, color: "#374151" }}>{r.应到学生人数 ?? "—"}</span> },
    { key: "返校学生人数", header: "返校人数",     render: r => <span className="text-center block font-medium" style={{ fontSize: 15, color: "#059669" }}>{r.返校学生人数 ?? "—"}</span> },
    { key: "未返校学生人数", header: "未返校人数", render: r => <span className="text-center block" style={{ fontSize: 15, color: r.未返校学生人数 > 0 ? "#d97706" : "#9ca3af", fontWeight: r.未返校学生人数 > 0 ? 600 : 400 }}>{r.未返校学生人数}</span> },
    { key: "转入学生人数", header: "转入人数",     render: r => <span className="text-center block" style={{ fontSize: 15, color: "#374151" }}>{r.转入学生人数}</span> },
    { key: "病假学生姓名", header: "病假学生姓名", minWidth: 120, render: r => { const v = r.病假学生姓名?.join("、") || ""; return <span className="block truncate" style={{ fontSize: 15, color: v ? "#dc2626" : "#9ca3af", maxWidth: 120 }} title={v}>{v || "—"}</span>; } },
    { key: "病假学生人数", header: "病假人数",     render: r => <span className="text-center block" style={{ fontSize: 15, color: r.病假学生人数 > 0 ? "#dc2626" : "#9ca3af", fontWeight: r.病假学生人数 > 0 ? 600 : 400 }}>{r.病假学生人数}</span> },
    { key: "病假具体情况说明", header: "病假说明", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.病假具体情况说明}>{r.病假具体情况说明 || "—"}</span> },
    { key: "事假学生姓名", header: "事假学生姓名", minWidth: 120, render: r => { const v = r.事假学生姓名?.join("、") || ""; return <span className="block truncate" style={{ fontSize: 15, color: v ? "#d97706" : "#9ca3af", maxWidth: 120 }} title={v}>{v || "—"}</span>; } },
    { key: "事假学生人数", header: "事假人数",     render: r => <span className="text-center block" style={{ fontSize: 15, color: r.事假学生人数 > 0 ? "#d97706" : "#9ca3af", fontWeight: r.事假学生人数 > 0 ? 600 : 400 }}>{r.事假学生人数}</span> },
    { key: "事假具体情况说明", header: "事假说明", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.事假具体情况说明}>{r.事假具体情况说明 || "—"}</span> },
    { key: "在外学习培训学生姓名", header: "在外培训学生", minWidth: 120, render: r => { const v = r.在外学习培训学生姓名?.join("、") || ""; return <span className="block truncate" style={{ fontSize: 15, color: v ? "#6366f1" : "#9ca3af", maxWidth: 120 }} title={v}>{v || "—"}</span>; } },
    { key: "在外学习培训具体情况说明", header: "在外培训说明", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.在外学习培训具体情况说明}>{r.在外学习培训具体情况说明 || "—"}</span> },
    { key: "休学学生姓名", header: "休学学生姓名", minWidth: 120, render: r => { const v = r.休学学生姓名?.join("、") || ""; return <span className="block truncate" style={{ fontSize: 15, color: v ? "#f43f5e" : "#9ca3af", maxWidth: 120 }} title={v}>{v || "—"}</span>; } },
    { key: "休学学生人数", header: "休学人数",     render: r => <span className="text-center block" style={{ fontSize: 15, color: r.休学学生人数 > 0 ? "#f43f5e" : "#9ca3af", fontWeight: r.休学学生人数 > 0 ? 600 : 400 }}>{r.休学学生人数}</span> },
    { key: "休学具体情况说明", header: "休学说明", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.休学具体情况说明}>{r.休学具体情况说明 || "—"}</span> },
    { key: "流失学生姓名", header: "流失学生姓名", minWidth: 120, render: r => { const v = r.流失学生姓名?.join("、") || ""; return <span className="block truncate" style={{ fontSize: 15, color: v ? "#f43f5e" : "#9ca3af", maxWidth: 120 }} title={v}>{v || "—"}</span>; } },
    { key: "流失学生人数", header: "流失人数",     render: r => <span className="text-center block" style={{ fontSize: 15, color: r.流失学生人数 > 0 ? "#f43f5e" : "#9ca3af", fontWeight: r.流失学生人数 > 0 ? 600 : 400 }}>{r.流失学生人数}</span> },
    { key: "流失学生具体情况说明", header: "流失说明", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.流失学生具体情况说明}>{r.流失学生具体情况说明 || "—"}</span> },
    { key: "学期", header: "学期", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学期 || "—"}</span> },
  ], []);

  const supportCols = useMemo((): ColumnDef<StudentSupportRecord>[] => [
    { key: "学生姓名",   header: "学生姓名",   render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学生姓名 || "—"}</span> },
    { key: "年级",       header: "年级",       render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.年级 || "—"}</span> },
    { key: "班级名称",   header: "班级名称",   render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班级名称 || "—"}</span> },
    { key: "资助项目名称", header: "资助项目名称", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.资助项目名称}>{r.资助项目名称 || "—"}</span> },
    { key: "资助单位",   header: "资助单位",   minWidth: 120, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 120 }} title={r.资助单位}>{r.资助单位 || "—"}</span> },
    { key: "资助金额",   header: "资助金额",   render: r => <span className="font-bold whitespace-nowrap" style={{ fontSize: 15, color: "#059669" }}>{r.资助金额 ? `¥${r.资助金额}` : "—"}</span> },
    { key: "发放学期",   header: "发放学期",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.发放学期 || "—"}</span> },
    { key: "学生学号",   header: "学号",       render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#9ca3af" }}>{r.学生学号 || "—"}</span> },
    { key: "性别",       header: "性别",       render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.性别 || "—"}</span> },
    { key: "家长姓名",   header: "家长姓名",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.家长姓名 || "—"}</span> },
    { key: "手机号码",   header: "手机号码",   render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.手机号码 || "—"}</span> },
    { key: "备注",       header: "备注",       minWidth: 120, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#9ca3af", maxWidth: 120 }} title={r.备注}>{r.备注 || "—"}</span> },
  ], []);

  const talkCols = useMemo((): ColumnDef<HeartToHeartTalkRecord>[] => [
    { key: "谈心教师",   header: "谈心教师",   render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.谈心教师 || "—"}</span> },
    { key: "班级名称",   header: "班级名称",   render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班级名称 || "—"}</span> },
    { key: "学生姓名",   header: "学生姓名",   render: r => <span className="font-medium whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.学生姓名 || "—"}</span> },
    { key: "学生身份证", header: "学生身份证", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#9ca3af" }}>{r.学生身份证 || "—"}</span> },
    { key: "学生学号",   header: "学生学号",   render: r => <span style={{ fontSize: 15, color: "#9ca3af" }}>{r.学生学号 || "—"}</span> },
    { key: "谈心教师学科", header: "谈心教师学科", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.谈心教师学科 || "—"}</span> },
    { key: "谈心谈话时间", header: "谈心谈话时间", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.谈心谈话时间 ? r.谈心谈话时间.slice(0, 16) : "—"}</span> },
    { key: "谈话内容",   header: "谈话内容",   minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.谈话内容 || undefined}>{r.谈话内容 || "—"}</span> },
    { key: "谈心谈话内容记录", header: "谈心谈话内容记录", minWidth: 180, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 180 }} title={r.谈心谈话内容记录}>{r.谈心谈话内容记录 || "—"}</span> },
    { key: "教师指导建议", header: "教师指导建议", minWidth: 160, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 160 }} title={r.教师指导建议}>{r.教师指导建议 || "—"}</span> },
    { key: "沟通照片",   header: "沟通照片",   minWidth: 80, render: r => <PhotoList photos={r.沟通照片} /> },
  ], []);

  const studentCols = useMemo((): ColumnDef<StudentInfoRecord>[] => [
    { key: "学籍状态", header: "学籍状态", render: r => (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: r.学籍状态==="招生【增加】"?"rgba(16,185,129,0.08)":r.学籍状态==="转出【减少】"?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.08)", color: r.学籍状态==="招生【增加】"?"#059669":r.学籍状态==="转出【减少】"?"#d97706":"#dc2626" }}>
        {r.学籍状态 || "—"}
      </span>
    )},
    { key: "姓名",     header: "姓名",     render: r => <span className="font-semibold whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.姓名}</span> },
    { key: "民族",     header: "民族",     render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.民族 || "—"}</span> },
    { key: "性别",     header: "性别",     render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.性别 || "—"}</span> },
    { key: "出生日期", header: "出生日期", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.出生日期 ? r.出生日期.slice(0, 10) : "—"}</span> },
    { key: "年龄",     header: "年龄",     render: r => <span className="font-medium" style={{ fontSize: 15, color: "#374151" }}>{r.年龄 || "—"}</span> },
    { key: "政治面貌", header: "政治面貌", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.政治面貌 || "—"}</span> },
    { key: "学生本人电话", header: "学生本人电话", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.学生本人电话 || "—"}</span> },
    { key: "户籍地址", header: "户籍地址", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.户籍地址}>{r.户籍地址 || "—"}</span> },
    { key: "现居地址", header: "现居地址", minWidth: 140, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 140 }} title={r.现居地址}>{r.现居地址 || "—"}</span> },
    { key: "监护人1姓名", header: "监护人1姓名", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.监护人1姓名 || "—"}</span> },
    { key: "监护人1联系", header: "监护人1联系方式", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.监护人1联系 || "—"}</span> },
    { key: "监护人1角色", header: "监护人1关系", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.监护人1角色 || "—"}</span> },
    { key: "监护人1工作单位", header: "监护人1工作单位", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.监护人1工作单位 || "—"}</span> },
    { key: "监护人2姓名", header: "监护人2姓名", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.监护人2姓名 || "—"}</span> },
    { key: "监护人2联系", header: "监护人2联系方式", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.监护人2联系 || "—"}</span> },
    { key: "监护人2角色", header: "监护人2关系", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.监护人2角色 || "—"}</span> },
    { key: "监护人2工作单位", header: "监护人2工作单位", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.监护人2工作单位 || "—"}</span> },
    { key: "年级名称", header: "年级", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.年级名称 || "—"}</span> },
    { key: "年级别名", header: "年级别名", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.年级别名 || "—"}</span> },
    { key: "班主任",   header: "班主任", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.班主任 || "—"}</span> },
    { key: "学生类型", header: "学生类型", render: r => (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: !r.学生类型||r.学生类型==="文化生"?"rgba(107,114,128,0.07)":r.学生类型==="低保学生"?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.08)", color: !r.学生类型||r.学生类型==="文化生"?"#6b7280":r.学生类型==="低保学生"?"#d97706":"#dc2626" }}>
        {r.学生类型 || "文化生"}
      </span>
    )},
    { key: "毕业学校", header: "毕业院校", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.毕业学校 || "—"}</span> },
    { key: "既往病史", header: "既往病史", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.既往病史 || "无"}</span> },
    { key: "是否残疾", header: "是否残疾", render: r => <span className="font-semibold" style={{ color: r.是否残疾==="是"?"#dc2626":"#9ca3af" }}>{r.是否残疾 || "否"}</span> },
    { key: "享受寄宿生生活补助金额", header: "享受寄宿生生活补助金额（元）", render: r => <span className="text-right block" style={{ fontSize: 15, color: "#374151" }}>{r.享受寄宿生生活补助金额 || "—"}</span> },
    { key: "享受营养改善计划补助金额", header: "享受营养改善计划补助金额（元）", render: r => <span className="text-right block" style={{ fontSize: 15, color: "#374151" }}>{r.享受营养改善计划补助金额 || "—"}</span> },
    { key: "是建档立卡贫困户", header: "是建档立卡贫苦户", render: r => <span className="font-semibold" style={{ color: r.是建档立卡贫困户==="是"?"#d97706":"#9ca3af" }}>{r.是建档立卡贫困户 || "否"}</span> },
    { key: "建档立卡脱贫户子女", header: "建档立卡贫困户子女", render: r => <span className="font-semibold" style={{ color: r.建档立卡脱贫户子女==="是"?"#d97706":"#9ca3af" }}>{r.建档立卡脱贫户子女 || "否"}</span> },
    { key: "随迁子女入", header: "随迁子女入", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.随迁子女入 || "否"}</span> },
    { key: "在校农村留守儿童", header: "在校（园）农村留守儿童", render: r => <span className="font-semibold" style={{ color: r.在校农村留守儿童==="是"?"#6366f1":"#9ca3af" }}>{r.在校农村留守儿童 || "否"}</span> },
    { key: "备注", header: "备注", minWidth: 80, render: r => <span className="block truncate" style={{ fontSize: 15, color: "#374151", maxWidth: 80 }}>{r.备注 || "—"}</span> },
    { key: "宿舍入住状态", header: "宿舍入住状态", render: r => (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: r.宿舍入住状态==="寄宿"?"rgba(16,185,129,0.08)":"rgba(107,114,128,0.07)", color: r.宿舍入住状态==="寄宿"?"#059669":"#6b7280" }}>
        {r.宿舍入住状态 || "—"}
      </span>
    )},
    { key: "宿舍楼栋", header: "宿舍楼栋", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.宿舍楼栋 || "—"}</span> },
    { key: "宿舍号",   header: "宿舍号",   render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.宿舍号 || "—"}</span> },
    { key: "选科科目", header: "选科科目", render: r => <span className="whitespace-nowrap" style={{ fontSize: 15, color: "#374151" }}>{r.选科科目 || "—"}</span> },
    { key: "选科方向", header: "选科方向", render: r => r.选科方向 ? (
      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap"
        style={{ background: r.选科方向==="物理"?"rgba(59,130,246,0.08)":"rgba(168,85,247,0.08)", color: r.选科方向==="物理"?"#2563eb":"#9333ea" }}>
        {r.选科方向}
      </span>
    ) : <span className="text-gray-300">—</span> },
    { key: "选科1",    header: "选科1",    render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.选科1 || "—"}</span> },
    { key: "选科2",    header: "选科2",    render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.选科2 || "—"}</span> },
    { key: "外语选科", header: "外语选科", render: r => <span style={{ fontSize: 15, color: "#374151" }}>{r.外语选科 || "—"}</span> },
  ], []);


  function exportStudents() {
    const headers = ["学籍状态","姓名","民族","性别","出生日期","年龄","政治面貌","学生本人电话","年级","班级","班主任","学生类型","宿舍入住状态","宿舍楼栋","宿舍号","选科方向","备注"];
    const rows = sortedStudents.map(r => [
      r.学籍状态||"", r.姓名||"", r.民族||"", r.性别||"", r.出生日期?.slice(0,10)||"", r.年龄??"",
      r.政治面貌||"", r.学生本人电话||"", r.年级名称||"", r.班级名称||"", r.班主任||"",
      r.学生类型||"", r.宿舍入住状态||"", r.宿舍楼栋||"", r.宿舍号||"", r.选科方向||"", r.备注||"",
    ]);
    exportToExcel("学生基础信息", headers, rows);
  }

  function exportHealth() {
    const headers = ["班级名称","年级","级部","班主任","上报类型","检查情况","填报日期","应到人数","实到人数","因病缺课","发热","流感确诊","咽痛流涕咳嗽","乏力","腹泻","呼吸困难","其他症状","学期"];
    const rows = sortedHealth.map(r => [
      r.班级名称||r.班级||"", r.年级||"", r.级部||"", r.班主任||"", r.上报类型||"", r.检查情况||"",
      r.填报日期_文本||r.填报日期_日期?.slice(0,10)||"",
      r.应到学生人数??"", r.实到学生人数??"", r.因病缺课学生人数??"",
      r.发热学生人数??"", r.流感确诊学生人数??"", r.是否有咽痛流涕咳嗽学生数??"",
      r.乏力学生数??"", r.腹泻学生数??"", r.呼吸困难学生数??"", r.其他症状学生数??"", r.学期||"",
    ]);
    exportToExcel("学生晨午检", headers, rows);
  }

  function exportReturn() {
    const headers = ["填报日期","年级","班级名称","班主任","应到人数","返校人数","未返校人数","转入人数","病假学生姓名","病假人数","病假说明","事假学生姓名","事假人数","事假说明","在外培训学生","在外培训说明","休学学生姓名","休学人数","休学说明","流失学生姓名","流失人数","流失说明","学期"];
    const rows = sortedReturn.map(r => [
      r.填报日期?.slice(0,10)||"", r.年级||"", r.班级名称||"", r.班主任||"",
      r.应到学生人数??"", r.返校学生人数??"", r.未返校学生人数??"", r.转入学生人数??"",
      r.病假学生姓名?.join("、")||"", r.病假学生人数??"", r.病假具体情况说明||"",
      r.事假学生姓名?.join("、")||"", r.事假学生人数??"", r.事假具体情况说明||"",
      r.在外学习培训学生姓名?.join("、")||"", r.在外学习培训具体情况说明||"",
      r.休学学生姓名?.join("、")||"", r.休学学生人数??"", r.休学具体情况说明||"",
      r.流失学生姓名?.join("、")||"", r.流失学生人数??"", r.流失学生具体情况说明||"", r.学期||"",
    ]);
    exportToExcel("学生返校情况", headers, rows);
  }

  function exportLeave() {
    const headers = ["请假人","请假类型","请假开始时间","请假结束时间","请假时长（天）","请假原因说明","发起时间","状态","年级","班级","班主任","学期"];
    const rows = sortedLeave.map(r => [
      r.请假学生姓名||"", r.请假类型||"",
      r.请假开始时间?.slice(0,16)||"", r.请假结束时间?.slice(0,16)||"",
      r.请假时长_数字||r.请假时长_文本||"", r.请假原因说明||"",
      r.申请时间?.slice(0,16)||"", r.状态||"",
      r.请假学生年级||"", r.请假学生班级||"", r.班主任||"", r.学期||"",
    ]);
    exportToExcel("学生请假数据", headers, rows);
  }

  function exportSupport() {
    const headers = ["学生姓名","年级","班级名称","资助项目名称","资助单位","资助金额","发放学期","学号","性别","家长姓名","手机号码","备注"];
    const rows = sortedSupport.map(r => [
      r.学生姓名||"", r.年级||"", r.班级名称||"", r.资助项目名称||"", r.资助单位||"",
      r.资助金额??"", r.发放学期||"", r.学生学号||"", r.性别||"",
      r.家长姓名||"", r.手机号码||"", r.备注||"",
    ]);
    exportToExcel("学生资助情况", headers, rows);
  }

  function exportTalk() {
    const headers = ["谈心教师","班级名称","学生姓名","学生身份证","学生学号","谈心教师学科","谈心谈话时间","谈话内容","谈心谈话内容记录","教师指导建议","沟通照片"];
    const rows = sortedTalk.map(r => [
      r.谈心教师||"", r.班级名称||"", r.学生姓名||"", r.学生身份证||"", r.学生学号||"",
      r.谈心教师学科||"", r.谈心谈话时间?.slice(0,16)||"", r.谈话内容||"",
      r.谈心谈话内容记录||"", r.教师指导建议||"", r.沟通照片?.map(f => f.url).join("\n")||"",
    ]);
    exportToExcel("谈心谈话记录", headers, rows);
  }

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ color: "#1d1d1f" }}
    >
      {/* Top Nav */}
      <header
        className="flex items-center justify-between px-4 md:px-8 shrink-0 border-b border-gray-200/30"
        style={{ height: 64, background: "rgba(255,255,255,0.95)", zIndex: 10 }}
      >
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 -ml-1 rounded-xl hover:bg-gray-100 transition-colors" onClick={onMenuOpen}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">学生管理看板</h1>
            {/* <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Student Management Intelligence</p> */}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <UserAvatarMenu />
        </div>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-[#f5f5f7]">
        <main className="p-6 md:p-8 space-y-8">

          {/* Main Stats */}
          <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Banner */}
            <div
              className="lg:col-span-2 p-8 flex items-center justify-between shadow-xl relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #0071e3 0%, #40a9ff 100%)", borderRadius: 24 }}
            >
              <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)", backgroundSize: "24px 24px" }} />
              <div className="relative z-10 space-y-4">
                <p className="text-blue-100 text-sm font-medium">在读学生总数</p>
                <h2 className="text-6xl font-black text-white tracking-tighter">
                  {studentPending ? "…" : enrolledStats.total.toLocaleString()}
                </h2>
                <div className="flex gap-3">
                  <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-xs text-white border border-white/20">
                    男: {studentPending ? "…" : enrolledStats.male.toLocaleString()}
                  </div>
                  <div className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-xs text-white border border-white/20">
                    女: {studentPending ? "…" : enrolledStats.female.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="relative z-10 text-right">
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur border border-white/20">
                  <p className="text-blue-100 text-xs font-bold mb-1">班级总数</p>
                  <span className="text-4xl font-black text-white">
                    {studentPending ? "…" : enrolledStats.classes}
                  </span>
                </div>
              </div>
            </div>

            {/* Small stats grid */}
            <div className="lg:col-span-2 space-y-4">
              {/* 动态数据 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">动态数据</p>
                  <div className="flex bg-gray-200/50 p-0.5 rounded-lg text-[11px] font-bold text-gray-500">
                    {timeFilters.map((t, i) => (
                      <button
                        key={t}
                        className={`px-3 py-1 rounded-md transition-all ${activeTime === i ? "bg-white shadow-sm text-blue-600" : "hover:bg-white/60"}`}
                        onClick={() => setActiveTime(i)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "请假人数", color: "#10b981", textColor: "text-emerald-500",
                      value: leaveCountPending ? "…" : formatCount(filteredLeaveCount) },
                    { label: "消费金额", color: "#8b5cf6", textColor: "text-purple-600",
                      value: consumeStatsPending ? "…" : formatAmount(consumeAmount) },
                    { label: "出校人数", color: "#f59e0b", textColor: "text-amber-600",
                      value: accessStatsPending ? "…" : (exitCount != null ? exitCount.toLocaleString() : "…") },
                    { label: "入校人数", color: "#06b6d4", textColor: "text-cyan-600",
                      value: accessStatsPending ? "…" : (enterCount != null ? enterCount.toLocaleString() : "…") },
                  ].map(({ label, color, textColor, value }) => (
                    <div key={label} className="p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ ...glass, borderLeft: `4px solid ${color}` }}>
                      <p className="text-[13px] font-bold text-gray-800">{label}</p>
                      <span className={`text-2xl font-black ${textColor}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* 学籍状态 */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">学籍状态</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "休学总数", color: "#f97316", textColor: "text-orange-500",
                      value: studentPending ? "…" : (statusStats.suspend ?? 0).toLocaleString() },
                    { label: "转学总数", color: "#3b82f6", textColor: "text-blue-500",
                      value: studentPending ? "…" : (statusStats.transfer ?? 0).toLocaleString() },
                    { label: "退学总数", color: "#f43f5e", textColor: "text-rose-500",
                      value: studentPending ? "…" : (statusStats.dropout ?? 0).toLocaleString() },
                  ].map(({ label, color, textColor, value }) => (
                    <div key={label} className="p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={{ ...glass, borderLeft: `4px solid ${color}` }}>
                      <p className="text-[13px] font-bold text-gray-800">{label}</p>
                      <span className={`text-2xl font-black ${textColor}`}>{value}</span>
                    </div>
                  ))}
                  <div className="p-4 flex items-center justify-center cursor-pointer transition-all duration-300 hover:bg-gray-800" style={{ ...glass, background: "#111827" }}>
                    <PlusCircle className="w-7 h-7 text-white opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Charts Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pie chart */}
            <div className="p-6 flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={glass}>
              <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> 男女比例
              </h3>
              {(() => {
                const total = enrolledStats.male + enrolledStats.female;
                const malePct = total > 0 ? Math.round(enrolledStats.male / total * 1000) / 10 : 0;
                const maleDeg = total > 0 ? enrolledStats.male / total * 360 : 0;
                return (
                  <>
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="w-32 h-32 rounded-full shadow-inner" style={{ background: `conic-gradient(#3b82f6 ${maleDeg}deg, #34d399 ${maleDeg}deg)` }} />
                      <div className="absolute w-20 h-20 rounded-full bg-white/90" />
                      <div className="absolute text-center">
                        <p className="text-xs font-bold text-gray-800">男生</p>
                        <p className="text-sm font-black">{studentPending ? "…" : `${malePct}%`}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-center gap-6 text-[10px] font-bold text-gray-800">
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> 男 {studentPending ? "…" : enrolledStats.male}</span>
                      <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> 女 {studentPending ? "…" : enrolledStats.female}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Bar chart */}
            <div className="p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={glass}>
              <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" /> 各年级人数
              </h3>
              {studentPending ? (
                <div className="h-32 flex items-center justify-center text-xs text-gray-400">加载中…</div>
              ) : (() => {
                const max = Math.max(...gradeStats.map(g => g.students), 1);
                return (
                  <>
                    <div className="flex items-end justify-around h-32 px-2">
                      {gradeStats.map((g) => {
                        const ratio = g.students / max;
                        const bar = ratio >= 0.9 ? "bg-indigo-500" : ratio >= 0.6 ? "bg-blue-500" : ratio >= 0.3 ? "bg-cyan-500" : "bg-gray-400";
                        const label = ratio >= 0.9 ? "text-indigo-600" : ratio >= 0.6 ? "text-blue-600" : ratio >= 0.3 ? "text-cyan-600" : "text-gray-400";
                        return (
                          <div key={g.grade} className="flex flex-col items-center gap-1" style={{ height: "100%", justifyContent: "flex-end" }}>
                            <p className={`text-[8px] font-bold ${label}`}>{g.students}</p>
                            <div className={`w-8 ${bar} rounded-t-lg`} style={{ height: `${Math.round(g.students / max * 100)}%` }} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex justify-around text-[10px] font-bold text-gray-400 px-2">
                      {gradeStats.map(g => <span key={g.grade}>{g.grade}</span>)}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Class count table */}
            <div className="p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={glass}>
              <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" /> 各年级班级数
              </h3>
              <div className="space-y-2">
                {studentPending ? (
                  <div className="h-32 flex items-center justify-center text-xs text-gray-400">加载中…</div>
                ) : gradeStats.map((g) => {
                  const max = Math.max(...gradeStats.map(x => x.classes), 1);
                  const ratio = g.classes / max;
                  const bg = ratio >= 0.9 ? "bg-indigo-50" : ratio >= 0.6 ? "bg-blue-50" : ratio >= 0.3 ? "bg-cyan-50" : "bg-gray-50";
                  const text = ratio >= 0.9 ? "text-indigo-700" : ratio >= 0.6 ? "text-blue-700" : ratio >= 0.3 ? "text-cyan-700" : "text-gray-600";
                  const badge = ratio >= 0.9 ? "bg-indigo-600" : ratio >= 0.6 ? "bg-blue-500" : ratio >= 0.3 ? "bg-cyan-500" : "bg-gray-400";
                  return (
                    <div key={g.grade} className={`flex justify-between p-2 rounded-lg text-xs ${bg}`}>
                      <span className={`font-bold ${text}`}>{g.grade}</span>
                      <span className={`inline-flex items-center justify-center min-w-[28px] h-5 rounded-full text-[10px] font-black text-white ${badge}`}>{g.classes}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consume progress */}
            <div className="p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg" style={glass}>
              <h3 className="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /> 消费情况
              </h3>
              {txPending ? (
                <div className="h-32 flex items-center justify-center text-xs text-gray-400">加载中…</div>
              ) : consumeItems.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-gray-400">暂无数据</div>
              ) : (
                <div className="space-y-4">
                  {consumeItems.map(({ label, pct, color }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span>{label}</span><span>{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Search & Filters */}
          {activeTab !== 6 && (
          <section className="p-6 flex flex-wrap items-end gap-6" style={glass}>
            {activeTab === 0 && (<>
              <div className="flex-1 min-w-[200px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">学生姓名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" placeholder="输入姓名查询" value={pendingName}
                    onChange={e => setPendingName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { setNameFilter(pendingName); setClassFilter(pendingClass); setCurrentPage(1); } }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(0,0,0,0.04)", border: "none" }}
                    onFocus={e => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.1)"; }}
                    onBlur={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-[200px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">班级选择</label>
                <select value={pendingClass} onChange={e => setPendingClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部班级</option>
                  {studentFilterOptions.classNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                onClick={() => { setNameFilter(pendingName); setClassFilter(pendingClass); setCurrentPage(1); }}>查询</button>
            </>)}

            {activeTab === 1 && (<>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">年级</label>
                <select value={pendingHealthGrade} onChange={e => setPendingHealthGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部年级</option>
                  {healthFilterOptions.grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">班级</label>
                <select value={pendingHealthClass} onChange={e => setPendingHealthClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部班级</option>
                  {healthFilterOptions.classNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">检查情况</label>
                <select value={pendingHealthSession} onChange={e => setPendingHealthSession(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部</option>
                  {healthFilterOptions.sessions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                onClick={() => { setHealthGradeFilter(pendingHealthGrade); setHealthClassFilter(pendingHealthClass); setHealthSessionFilter(pendingHealthSession); setHealthPage(1); }}>查询</button>
            </>)}

            {activeTab === 2 && (<>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">年级</label>
                <select value={pendingReturnGrade} onChange={e => setPendingReturnGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部年级</option>
                  {returnFilterOptions.grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">班级</label>
                <select value={pendingReturnClass} onChange={e => setPendingReturnClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部班级</option>
                  {returnFilterOptions.classNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">学期</label>
                <select value={pendingReturnSemester} onChange={e => setPendingReturnSemester(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部学期</option>
                  {returnFilterOptions.semesters.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                onClick={() => { setReturnGradeFilter(pendingReturnGrade); setReturnClassFilter(pendingReturnClass); setReturnSemesterFilter(pendingReturnSemester); setReturnPage(1); }}>查询</button>
            </>)}

            {activeTab === 3 && (<>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">学生姓名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" placeholder="输入姓名查询" value={pendingLeaveName}
                    onChange={e => setPendingLeaveName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { setLeaveNameFilter(pendingLeaveName); setLeaveTypeFilter(pendingLeaveType); setLeaveGradeFilter(pendingLeaveGrade); setLeavePage(1); } }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(0,0,0,0.04)", border: "none" }}
                    onFocus={e => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.1)"; }}
                    onBlur={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">请假类型</label>
                <select value={pendingLeaveType} onChange={e => setPendingLeaveType(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部类型</option>
                  {leaveFilterOptions.types.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">年级</label>
                <select value={pendingLeaveGrade} onChange={e => setPendingLeaveGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部年级</option>
                  {leaveFilterOptions.grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                onClick={() => { setLeaveNameFilter(pendingLeaveName); setLeaveTypeFilter(pendingLeaveType); setLeaveGradeFilter(pendingLeaveGrade); setLeavePage(1); }}>查询</button>
            </>)}

            {activeTab === 4 && (<>
              <div className="flex-1 min-w-[200px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">姓名搜索</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input type="text" placeholder="搜索消费/进出姓名" value={pendingConsumeName}
                    onChange={e => setPendingConsumeName(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { setConsumeNameFilter(pendingConsumeName); setAccessNameFilter(pendingConsumeName); setConsumePage(1); setAccessPage(1); } }}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{ background: "rgba(0,0,0,0.04)", border: "none" }}
                    onFocus={e => { e.currentTarget.style.background = "rgba(0,0,0,0.06)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,113,227,0.1)"; }}
                    onBlur={e => { e.currentTarget.style.background = "rgba(0,0,0,0.04)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>
              <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                onClick={() => { setConsumeNameFilter(pendingConsumeName); setAccessNameFilter(pendingConsumeName); setConsumePage(1); setAccessPage(1); }}>查询</button>
            </>)}

            {activeTab === 5 && (<>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">年级</label>
                <select value={pendingSupportGrade} onChange={e => setPendingSupportGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部年级</option>
                  {supportFilterOptions.grades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">班级</label>
                <select value={pendingSupportClass} onChange={e => setPendingSupportClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部班级</option>
                  {supportFilterOptions.classNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                onClick={() => { setSupportGradeFilter(pendingSupportGrade); setSupportClassFilter(pendingSupportClass); setSupportPage(1); }}>查询</button>
            </>)}

            {activeTab === 7 && (<>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">班级</label>
                <select value={pendingTalkClass} onChange={e => setPendingTalkClass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部班级</option>
                  {talkFilterOptions.classNames.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1 min-w-[160px] space-y-2">
                <label className="text-[14px] font-black text-gray-800 uppercase tracking-widest">谈心教师</label>
                <select value={pendingTalkTeacher} onChange={e => setPendingTalkTeacher(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none appearance-none cursor-pointer"
                  style={{ background: "rgba(0,0,0,0.04)", border: "none" }}>
                  <option value="">全部教师</option>
                  {talkFilterOptions.teachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                onClick={() => { setTalkClassFilter(pendingTalkClass); setTalkTeacherFilter(pendingTalkTeacher); setTalkPage(1); }}>查询</button>
            </>)}
          </section>
          )}

          {/* Data Table */}
          <section className="overflow-hidden" style={glass}>
            {/* Tabs */}
            <div className="flex items-center border-b border-gray-100/50">
              <button onClick={() => scrollTabs("left")}
                className="shrink-0 px-2 py-4 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div ref={tabsRef} className="flex flex-1 overflow-x-auto items-center" style={{ scrollbarWidth: "none" }}>
                {tabs.map((tab, i) => (
                  <button key={tab} onClick={() => setActiveTab(i)}
                    className={`pb-4 px-4 pt-4 text-xl font-bold whitespace-nowrap shrink-0${activeTab === i ? " macos-tab-active" : " text-gray-400 hover:text-gray-600 transition-colors"}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <button onClick={() => scrollTabs("right")}
                className="shrink-0 px-2 py-4 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Toolbar — hidden for tabs with their own per-table toolbars, and for tab 0 which uses DashboardTable's built-in toolbar */}
            {activeTab !== 4 && activeTab !== 6 && activeTab !== 2 && activeTab !== 0 && activeTab !== 3 && activeTab !== 1 && activeTab !== 5 && activeTab !== 7 && (
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100"
              style={{ background: "rgba(249,250,251,0.6)" }}
              onMouseEnter={() => setHvTable(true)} onMouseLeave={() => setHvTable(false)}>
              <span className="text-sm font-semibold text-gray-700">{tabs[activeTab]}</span>
              <div className="flex items-center gap-0.5" style={{ minHeight: 28 }}>
                {hvTable && tableActions.map(({ Icon, tip }) => (
                  <div key={tip} className="relative group/tip">
                    <button className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-black/[0.06] transition-colors">
                      <Icon size={14} />
                    </button>
                    <div className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 z-50">
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-gray-800/90" />
                      <div className="px-2 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md whitespace-nowrap">{tip}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              {activeTab === 4 ? (
                <div className="space-y-4">
                  <DashboardTable
                    title="学生消费明细"
                    columns={consumeCols}
                    rows={pagedConsume}
                    isPending={txPending}
                    isError={txError}
                    sortAsc={consumeSortAsc}
                    onSortToggle={() => { setConsumeSortAsc(v => !v); setConsumePage(1); }}
                    page={consumePage}
                    pageSize={consumePageSize}
                    totalRows={sortedConsume.length}
                    onPageChange={setConsumePage}
                    onPageSizeChange={n => { setConsumePageSize(n); setConsumePage(1); }}
                    onRowClick={setSelectedConsume}
                    onRefresh={txRefetch}
                    onExport={exportConsume}
                  />
                  <DashboardTable
                    title="学生进出数据"
                    columns={accessCols}
                    rows={pagedAccess}
                    isPending={accessPending}
                    isError={accessError}
                    sortAsc={accessSortAsc}
                    onSortToggle={() => { setAccessSortAsc(v => !v); setAccessPage(1); }}
                    page={accessPage}
                    pageSize={accessPageSize}
                    totalRows={sortedAccess.length}
                    onPageChange={setAccessPage}
                    onPageSizeChange={n => { setAccessPageSize(n); setAccessPage(1); }}
                    onRowClick={setSelectedAccess}
                    onRefresh={accessRefetch}
                    onExport={exportAccess}
                  />
                </div>
              ) : activeTab === 2 ? (
                /* ── 学生返校情况 ── */
                <div>
                  <DashboardTable
                    title="各班级填报明细"
                    columns={returnSchoolCols}
                    rows={pagedReturn}
                    isPending={returnPending}
                    isError={returnError}
                    sortAsc={returnSortAsc}
                    onSortToggle={() => { setReturnSortAsc(v => !v); setReturnPage(1); }}
                    page={returnPage}
                    pageSize={returnPageSize}
                    totalRows={totalReturn}
                    onPageChange={setReturnPage}
                    onPageSizeChange={n => { setReturnPageSize(n); setReturnPage(1); }}
                    onRowClick={setSelectedReturnSchool}
                    onRefresh={returnRefetch}
                    onExport={exportReturn}
                  />
                </div>
              ) : activeTab === 1 ? (
                /* ── 学生晨午检 ── */
                <div className="-mx-0">
                  <DashboardTable
                    title="学生晨午检"
                    columns={healthCheckCols}
                    rows={pagedHealth}
                    isPending={healthPending}
                    isError={healthError}
                    sortAsc={healthSortAsc}
                    onSortToggle={() => { setHealthSortAsc(v => !v); setHealthPage(1); }}
                    page={healthPage}
                    pageSize={healthPageSize}
                    totalRows={totalHealth}
                    onPageChange={setHealthPage}
                    onPageSizeChange={n => { setHealthPageSize(n); setHealthPage(1); }}
                    onRowClick={setSelectedHealthCheck}
                    onRefresh={healthRefetch}
                    onExport={exportHealth}
                  />
                </div>
              ) : activeTab === 3 ? (
                /* ── 学生请假数据 ── */
                <div className="-mx-0">
                  <DashboardTable
                    title="学生请假数据"
                    columns={leaveCols}
                    rows={pagedLeave}
                    isPending={leavePending}
                    isError={leaveError}
                    sortAsc={leaveSortAsc}
                    onSortToggle={() => { setLeaveSortAsc(v => !v); setLeavePage(1); }}
                    page={leavePage}
                    pageSize={leavePageSize}
                    totalRows={totalLeave}
                    onPageChange={setLeavePage}
                    onPageSizeChange={n => { setLeavePageSize(n); setLeavePage(1); }}
                    onRowClick={setSelectedLeave}
                    onRefresh={leaveRefetch}
                    onExport={exportLeave}
                  />
                </div>
              ) : activeTab === 5 ? (
                /* ── 学生资助情况 ── */
                <div className="-mx-0">
                  <DashboardTable
                    title="学生资助情况"
                    columns={supportCols}
                    rows={pagedSupport}
                    isPending={supportPending}
                    isError={supportError}
                    sortAsc={supportSortAsc}
                    onSortToggle={() => { setSupportSortAsc(v => !v); setSupportPage(1); }}
                    page={supportPage}
                    pageSize={supportPageSize}
                    totalRows={totalSupport}
                    onPageChange={setSupportPage}
                    onPageSizeChange={n => { setSupportPageSize(n); setSupportPage(1); }}
                    onRowClick={setSelectedSupport}
                    onRefresh={supportRefetch}
                    onExport={exportSupport}
                  />
                </div>
              ) : activeTab === 6 ? (
                /* ── 学生成长 ── */
                <div className="space-y-4">
                  <DashboardTable title="学生干部风采" columns={cadreeCols} rows={pagedCadree} isPending={cadreePending} isError={cadreeError} sortAsc={cadreeSortAsc} onSortToggle={() => { setCadreeSortAsc(v => !v); setCadreePage(1); }}
                    page={cadreePage} pageSize={cadreePageSize} totalRows={sortedCadree.length} onPageChange={setCadreePage} onPageSizeChange={n => { setCadreePageSize(n); setCadreePage(1); }} onRefresh={cadreeRefetch} onExport={exportCadree} onRowClick={setSelectedCadree} />
                  <DashboardTable title="体质检测情况" columns={physicalCols} rows={pagedPhysical} isPending={physicalPending} isError={physicalError} sortAsc={physicalSortAsc} onSortToggle={() => { setPhysicalSortAsc(v => !v); setPhysicalPage(1); }}
                    page={physicalPage} pageSize={physicalPageSize} totalRows={sortedPhysical.length} onPageChange={setPhysicalPage} onPageSizeChange={n => { setPhysicalPageSize(n); setPhysicalPage(1); }} onRefresh={physicalRefetch} onExport={exportPhysical} onRowClick={setSelectedPhysical} />
                  <DashboardTable title="学生获奖记录" columns={awardCols} rows={pagedAward} isPending={awardPending} isError={awardError} sortAsc={awardSortAsc} onSortToggle={() => { setAwardSortAsc(v => !v); setAwardPage(1); }}
                    page={awardPage} pageSize={awardPageSize} totalRows={sortedAward.length} onPageChange={setAwardPage} onPageSizeChange={n => { setAwardPageSize(n); setAwardPage(1); }} onRefresh={awardRefetch} onExport={exportAward} onRowClick={setSelectedAward} />
                  <DashboardTable title="好人好事记录" columns={deedsCols} rows={pagedDeeds} isPending={deedsPending} isError={deedsError} sortAsc={deedsSortAsc} onSortToggle={() => { setDeedsSortAsc(v => !v); setDeedsPage(1); }}
                    page={deedsPage} pageSize={deedsPageSize} totalRows={sortedDeeds.length} onPageChange={setDeedsPage} onPageSizeChange={n => { setDeedsPageSize(n); setDeedsPage(1); }} onRefresh={deedsRefetch} onExport={exportDeeds} onRowClick={setSelectedDeeds} />
                </div>
              ) : activeTab === 7 ? (
                /* ── 一生一案谈心谈话记录表 ── */
                <div className="-mx-0">
                  <DashboardTable
                    title="一生一案谈心谈话记录表"
                    columns={talkCols}
                    rows={pagedTalk}
                    isPending={talkPending}
                    isError={talkError}
                    sortAsc={talkSortAsc}
                    onSortToggle={() => { setTalkSortAsc(v => !v); setTalkPage(1); }}
                    page={talkPage}
                    pageSize={talkPageSize}
                    totalRows={totalTalk}
                    onPageChange={setTalkPage}
                    onPageSizeChange={n => { setTalkPageSize(n); setTalkPage(1); }}
                    onRowClick={setSelectedTalk}
                    onRefresh={talkRefetch}
                    onExport={exportTalk}
                  />
                </div>
              ) : (
                /* ── 学生基础信息 ── */
                <div className="-mx-0">
                  <DashboardTable
                    title="学生基础信息"
                    columns={studentCols}
                    rows={pagedStudents}
                    isPending={studentPending}
                    isError={studentError}
                    sortAsc={studentSortAsc}
                    onSortToggle={() => { setStudentSortAsc(v => !v); setCurrentPage(1); }}
                    page={currentPage}
                    pageSize={pageSize}
                    totalRows={totalStudents}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={n => { setPageSize(n); setCurrentPage(1); }}
                    onRowClick={setSelectedStudent}
                    onRefresh={studentRefetch}
                    onExport={exportStudents}
                  />
                </div>
              )}
            </div>

          </section>

          {/* <footer className="text-center pb-6">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Apple Style Management Dashboard v2.0</p>
          </footer> */}

        </main>
      </div>

      <StudentInfoDrawer record={selectedStudent} onClose={() => setSelectedStudent(null)} />
      <StudentLeaveDrawer record={selectedLeave} onClose={() => setSelectedLeave(null)} />
      <HealthCheckDrawer record={selectedHealthCheck} onClose={() => setSelectedHealthCheck(null)} />
      <StudentReturnSchoolDrawer record={selectedReturnSchool} onClose={() => setSelectedReturnSchool(null)} />
      <StudentSupportDrawer record={selectedSupport} onClose={() => setSelectedSupport(null)} />
      <HeartToHeartTalkDrawer record={selectedTalk} onClose={() => setSelectedTalk(null)} />
      <ConsumeDrawer record={selectedConsume} onClose={() => setSelectedConsume(null)} />
      <AccessDrawer record={selectedAccess} onClose={() => setSelectedAccess(null)} />
      <GenericDrawer record={selectedCadree} onClose={() => setSelectedCadree(null)} title="学生干部风采" />
      <GenericDrawer record={selectedPhysical} onClose={() => setSelectedPhysical(null)} title="体质检测情况" />
      <GenericDrawer record={selectedAward} onClose={() => setSelectedAward(null)} title="学生获奖记录" />
      <GenericDrawer record={selectedDeeds} onClose={() => setSelectedDeeds(null)} title="好人好事记录" />
    </div>
  );
}
