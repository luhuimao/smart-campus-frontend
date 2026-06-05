"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { JDY_CONFIG, WIDGET_IDS, BEIKE_WIDGET_IDS, SCIENTCE_FEST_WIDGET_IDS, CLASS_RANK_WIDGET_IDS, DORM_ATTENDANCE_WIDGET_IDS, STUDENT_INFO_WIDGET_IDS, STUDENT_LEAVE_WIDGET_IDS, HEALTH_CHECK_WIDGET_IDS, STUDENT_RETURN_SCHOOL_WIDGET_IDS, STUDENT_SUPPORT_STATUS_WIDGET_IDS, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS, STUDENT_AWARD_WIDGET_IDS, GOOD_DEEDS_WIDGET_IDS, PHYSICAL_TEST_WIDGET_IDS, STUDENT_CADREE_WIDGET_IDS, STUDENT_WITHDRAWAL_TRANSFER_LEAVE_WIDGET_IDS, STAFF_DIRECTORY_WIDGET_IDS, COURSE_INFO_WIDGET_IDS, TERM_INFO_WIDGET_IDS, GRADE_INFO_WIDGET_IDS, TEACHING_RESEARCH_GROUP_WIDGET_IDS, LESSON_PREPARE_GROUP_WIDGET_IDS, TRANSACTIONS_RECORD_WIDGET_IDS, ACCESS_LOGS_WIDGET_IDS, jdyListAll, jdyListPage, jdyList, type JdyRecord, type JdyPageResult } from "@/lib/jdy-api";

export interface ResearchRecord {
  _id: string;
  学期: string;
  教研主题: string;
  教研学科: string;
  时间: string;
  周次: string;
  教研组: string;
  学科部门: string;
  教研组长: string;
  主持人: string;
  记录人: string;
  应到人数: number;
  实到人数: number;
  地点: string;
  参与人员: string;
  内容记录: string;
  备注: string;
  照片: { name: string; url: string; key?: string }[];
  附件: { name: string; url: string; key?: string }[];
  提交人: string;
  提交时间: string;
}

export interface DashboardData {
  total: number;
  trendByMonth: { month: string; value: number }[];
  subjectDistribution: { label: string; value: number; color: string }[];
  weekStats: { label: string; value: number }[];
  monthStats: { label: string; value: number }[];
  semesterStats: { label: string; value: number; color: string }[];
  teacherParticipation: { label: string; value: number }[];
  raw: ResearchRecord[];
}

export interface FilterOptions {
  semesters: string[];
  groups: string[];
  subjects: string[];
}

export interface ActiveFilters {
  semester: string;
  group: string;
  subject: string;
}

const SUBJECT_COLORS = ["#818cf8", "#60a5fa", "#34d399", "#f472b6", "#fb923c", "#a78bfa", "#f59e0b", "#22d3ee"];

function pickStr(record: JdyRecord, widgetId: string): string {
  const v = record[widgetId];
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map((x) => (typeof x === "string" ? x : (x as { name?: string })?.name ?? "")).filter(Boolean).join(",");
  if (typeof v === "object") return (v as { name?: string; value?: string }).name ?? (v as { value?: string }).value ?? "";
  return "";
}

function pickNum(record: JdyRecord, widgetId: string): number {
  const v = record[widgetId];
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function pickFiles(record: JdyRecord, widgetId: string): { name: string; url: string; key?: string }[] {
  const v = record[widgetId];
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({ name: (x as { name?: string }).name ?? "", url: (x as { url?: string }).url ?? "", key: (x as { key?: string }).key }))
    .filter((f) => f.url || f.key);
}

function pickStrArr(record: JdyRecord, widgetId: string): string[] {
  const v = record[widgetId];
  if (!Array.isArray(v)) return [];
  return v.map((x: unknown) => {
    if (typeof x === "string") return x;
    if (typeof x === "object" && x !== null) return (x as Record<string, unknown>).name as string ?? "";
    return "";
  }).filter(Boolean);
}

function normalize(records: JdyRecord[]): ResearchRecord[] {
  return records.map((r) => ({
    _id: r._id,
    学期: pickStr(r, WIDGET_IDS.学期),
    教研主题: pickStr(r, WIDGET_IDS.教研主题),
    教研学科: pickStr(r, WIDGET_IDS.教研学科),
    时间: pickStr(r, WIDGET_IDS.时间),
    周次: pickStr(r, WIDGET_IDS.周次),
    教研组: pickStr(r, WIDGET_IDS.教研组),
    学科部门: pickStr(r, WIDGET_IDS.学科部门),
    教研组长: pickStr(r, WIDGET_IDS.教研组长),
    主持人: pickStr(r, WIDGET_IDS.主持人),
	    记录人: pickStr(r, WIDGET_IDS.记录人),
    应到人数: pickNum(r, WIDGET_IDS.应到人数),
    实到人数: pickNum(r, WIDGET_IDS.实到人数),
    地点: pickStr(r, WIDGET_IDS.地点),
    参与人员: pickStr(r, WIDGET_IDS.参与人员),
    内容记录: pickStr(r, WIDGET_IDS.内容记录),
    备注: pickStr(r, WIDGET_IDS.备注),
    照片: pickFiles(r, WIDGET_IDS.照片),
    附件: pickFiles(r, WIDGET_IDS.附件),
	    提交人: pickStr(r, WIDGET_IDS.提交人),
	    提交时间: pickStr(r, WIDGET_IDS.提交时间),
  })).sort((a, b) => b.提交时间.localeCompare(a.提交时间));
}

function derive(records: ResearchRecord[]): DashboardData {
  const total = records.length;

  const monthMap = new Map<string, number>();
  for (const r of records) {
    if (!r.时间) continue;
    const d = new Date(r.时间);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }
  const trendByMonth = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ month: `${k.split("-")[0]}年${k.split("-")[1]}月`, value: v }));

  const subjectMap = new Map<string, number>();
  for (const r of records) {
    if (!r.教研学科) continue;
    subjectMap.set(r.教研学科, (subjectMap.get(r.教研学科) ?? 0) + 1);
  }
  const subjectEntries = Array.from(subjectMap.entries()).sort(([, a], [, b]) => b - a);
  const subjectDistribution = subjectEntries.map(([label, value], i) => ({
    label,
    value,
    color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));
  const semesterStats = subjectDistribution;

  const weekMap = new Map<string, number>();
  for (const r of records) {
    if (!r.周次) continue;
    weekMap.set(r.周次, (weekMap.get(r.周次) ?? 0) + 1);
  }
  const weekStats = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b, "zh"))
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  const monthStats = trendByMonth.slice(-6).map(({ month, value }) => ({
    label: month.replace(/^\d+年/, ""),
    value,
  }));

  const teacherMap = new Map<string, number>();
  for (const r of records) {
    const name = r.主持人 || r.教研组长;
    if (!name) continue;
    teacherMap.set(name, (teacherMap.get(name) ?? 0) + 1);
  }
  const teacherParticipation = Array.from(teacherMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  return {
    total,
    trendByMonth: trendByMonth.slice(-5),
    subjectDistribution,
    weekStats,
    monthStats,
    semesterStats,
    teacherParticipation,
    raw: records,
  };
}

function unique(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh"));
}

export function useResearchDashboard(filters?: ActiveFilters) {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["research-dashboard", "activity-list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.JIAOYAN_ACTIVITY.app_id,
        entry_id: JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id,
        pageSize: 100,
        maxPages: 20,
        fields: Object.values(WIDGET_IDS) as string[],
      });
      return normalize(records);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  const filterOptions = useMemo<FilterOptions>(() => {
    if (!allRecords) return { semesters: [], groups: [], subjects: [] };
    return {
      semesters: unique(allRecords.map(r => r.学期)),
      groups: unique(allRecords.map(r => r.教研组)),
      subjects: unique(allRecords.map(r => r.教研学科)),
    };
  }, [allRecords]);

  const filtered = useMemo<ResearchRecord[]>(() => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.semester && r.学期 !== filters.semester) return false;
      if (filters?.group && r.教研组 !== filters.group) return false;
      if (filters?.subject && r.教研学科 !== filters.subject) return false;
      return true;
    });
  }, [allRecords, filters?.semester, filters?.group, filters?.subject]);

  const derived = useMemo<DashboardData | undefined>(
    () => (allRecords ? derive(filtered) : undefined),
    [allRecords, filtered],
  );

  return { data: derived, filterOptions, raw: filtered, isPending, isError, error, refetch, isFetching };
}

// ── 备课活动 ──────────────────────────────────────────────

export interface BeikeRecord {
  _id: string;
  学期: string;
  主题: string;
  备课学科: string;
  时间: string;
  周次: string;
  地点: string;
  备课组: string;
  学科部门: string;
  备课组长: string;
  主持人: string;
  应到人数: number;
  实到人数: number;
  参与人员: string;
  内容记录: string;
  备注: string;
  照片: { name: string; url: string; key?: string }[];
  附件: { name: string; url: string; key?: string }[];
  提交人: string;
  提交时间: string;
  记录人: string;
}

export interface BeikeFilterOptions {
  semesters: string[];
  groups: string[];
  subjects: string[];
}

export interface BeikeActiveFilters {
  semester: string;
  group: string;
  subject: string;
}

function normalizeBeikeRecord(r: JdyRecord): BeikeRecord {
  return {
    _id: r._id,
    学期: pickStr(r, BEIKE_WIDGET_IDS.学期),
    主题: pickStr(r, BEIKE_WIDGET_IDS.主题),
    备课学科: pickStr(r, BEIKE_WIDGET_IDS.备课学科),
    时间: pickStr(r, BEIKE_WIDGET_IDS.时间),
    周次: pickStr(r, BEIKE_WIDGET_IDS.周次),
    地点: pickStr(r, BEIKE_WIDGET_IDS.地点),
    备课组: pickStr(r, BEIKE_WIDGET_IDS.备课组),
    学科部门: pickStr(r, BEIKE_WIDGET_IDS.学科部门),
    备课组长: pickStr(r, BEIKE_WIDGET_IDS.备课组长),
    主持人: pickStr(r, BEIKE_WIDGET_IDS.主持人),
    应到人数: pickNum(r, BEIKE_WIDGET_IDS.应到人数),
    实到人数: pickNum(r, BEIKE_WIDGET_IDS.实到人数),
    参与人员: pickStr(r, BEIKE_WIDGET_IDS.参与人员),
    内容记录: pickStr(r, BEIKE_WIDGET_IDS.内容记录),
    备注: pickStr(r, BEIKE_WIDGET_IDS.备注),
    照片: pickFiles(r, BEIKE_WIDGET_IDS.照片),
    附件: pickFiles(r, BEIKE_WIDGET_IDS.附件),
    提交人: pickStr(r, BEIKE_WIDGET_IDS.提交人),
    提交时间: pickStr(r, BEIKE_WIDGET_IDS.提交时间),
    记录人: pickStr(r, BEIKE_WIDGET_IDS.记录人),
  };
}

function deriveBeike(records: BeikeRecord[]): DashboardData {
  const total = records.length;

  const monthMap = new Map<string, number>();
  for (const r of records) {
    if (!r.时间) continue;
    const d = new Date(r.时间);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }
  const trendByMonth = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ month: `${k.split("-")[0]}年${k.split("-")[1]}月`, value: v }));

  const subjectMap = new Map<string, number>();
  for (const r of records) {
    if (!r.备课学科) continue;
    subjectMap.set(r.备课学科, (subjectMap.get(r.备课学科) ?? 0) + 1);
  }
  const subjectEntries = Array.from(subjectMap.entries()).sort(([, a], [, b]) => b - a);
  const subjectDistribution = subjectEntries.map(([label, value], i) => ({
    label, value, color: SUBJECT_COLORS[i % SUBJECT_COLORS.length],
  }));

  const weekMap = new Map<string, number>();
  for (const r of records) {
    if (!r.周次) continue;
    weekMap.set(r.周次, (weekMap.get(r.周次) ?? 0) + 1);
  }
  const weekStats = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b, "zh"))
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  const monthStats = trendByMonth.slice(-6).map(({ month, value }) => ({
    label: month.replace(/^\d+年/, ""),
    value,
  }));

  const teacherMap = new Map<string, number>();
  for (const r of records) {
    const name = r.主持人 || r.备课组长;
    if (!name) continue;
    teacherMap.set(name, (teacherMap.get(name) ?? 0) + 1);
  }
  const teacherParticipation = Array.from(teacherMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));

  return {
    total,
    trendByMonth: trendByMonth.slice(-5),
    subjectDistribution,
    weekStats,
    monthStats,
    semesterStats: subjectDistribution,
    teacherParticipation,
    raw: records as unknown as ResearchRecord[],
  };
}

export function useBeikeDashboard(filters?: BeikeActiveFilters) {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["beike-dashboard", "activity-list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.BEIKE_ACTIVITY.app_id,
        entry_id: JDY_CONFIG.BEIKE_ACTIVITY.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      const normalized = records.map(normalizeBeikeRecord);
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  const filterOptions = useMemo<BeikeFilterOptions>(() => {
    if (!allRecords) return { semesters: [], groups: [], subjects: [] };
    return {
      semesters: unique(allRecords.map(r => r.学期)),
      groups: unique(allRecords.map(r => r.备课组)),
      subjects: unique(allRecords.map(r => r.备课学科)),
    };
  }, [allRecords]);

  const filtered = useMemo<BeikeRecord[]>(() => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.semester && r.学期 !== filters.semester) return false;
      if (filters?.group && r.备课组 !== filters.group) return false;
      if (filters?.subject && r.备课学科 !== filters.subject) return false;
      return true;
    });
  }, [allRecords, filters?.semester, filters?.group, filters?.subject]);

  const derived = useMemo<DashboardData | undefined>(
    () => (allRecords ? deriveBeike(filtered) : undefined),
    [allRecords, filtered],
  );

  return { data: derived, filterOptions, raw: filtered, isPending, isError, error, refetch, isFetching };
}

// ── 科技节活动 ──────────────────────────────────────────────

export interface ScienceFestRecord {
  _id: string;
  活动名称: string;
  教研组: string;
  教研组长: string;
  活动负责教师: string;
  活动时间: string;
  活动地点: string;
  参与人员: string;
  活动描述: string;
  活动图片: { name: string; url: string }[];
  活动视频: { name: string; url: string }[];
  更多图片: { name: string; url: string }[];
  备注: string;
  提交人: string;
  提交时间: string;
}

function normalizeScienceFestRecord(r: JdyRecord): ScienceFestRecord {
  return {
    _id: r._id,
    活动名称: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.活动名称),
    教研组: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.教研组),
    教研组长: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.教研组长),
    活动负责教师: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.活动负责教师),
    活动时间: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.活动时间),
    活动地点: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.活动地点),
    参与人员: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.参与人员),
    活动描述: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.活动描述),
    活动图片: pickFiles(r, SCIENTCE_FEST_WIDGET_IDS.活动图片),
    活动视频: pickFiles(r, SCIENTCE_FEST_WIDGET_IDS.活动视频),
    更多图片: pickFiles(r, SCIENTCE_FEST_WIDGET_IDS.更多图片),
    备注: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.备注),
    提交人: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.提交人),
    提交时间: pickStr(r, SCIENTCE_FEST_WIDGET_IDS.提交时间),
  };
}

export interface ScienceFestFilters {
  group: string;
  teacher: string;
}

export function useScienceFestDashboard(filters?: ScienceFestFilters) {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["science-fest", "activity-list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.app_id,
        entry_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      const normalized = records.map(normalizeScienceFestRecord);
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { groups: [] as string[], teachers: [] as string[] };
    return {
      groups:   unique(allRecords.map(r => r.教研组)),
      teachers: unique(allRecords.map(r => r.活动负责教师)),
    };
  }, [allRecords]);

  const raw = useMemo((): ScienceFestRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.group   && r.教研组       !== filters.group)   return false;
      if (filters?.teacher && r.活动负责教师 !== filters.teacher) return false;
      return true;
    });
  }, [allRecords, filters?.group, filters?.teacher]);

  return { raw, filterOptions, isPending, isError, error, refetch, isFetching };
}

// ── 班级排名 ──────────────────────────────────────────────

export interface ClassRankRecord {
  id: number;
  _id: string;
  学期: string;
  考试名称: string;
  年级: string;
  班级: string;
  教师姓名: string;
  学科: string;
  班级排名: string;
  提交人: string;
  提交时间: string;
  更新时间: string;
}

function normalizeClassRankRecord(r: JdyRecord, index: number): ClassRankRecord {
  return {
    id: index + 1,
    _id: r._id,
    学期: pickStr(r, CLASS_RANK_WIDGET_IDS.学期),
    考试名称: pickStr(r, CLASS_RANK_WIDGET_IDS.考试名称),
    年级: pickStr(r, CLASS_RANK_WIDGET_IDS.年级),
    班级: pickStr(r, CLASS_RANK_WIDGET_IDS.班级),
    教师姓名: pickStr(r, CLASS_RANK_WIDGET_IDS.教师姓名),
    学科: pickStr(r, CLASS_RANK_WIDGET_IDS.学科),
    班级排名: pickStr(r, CLASS_RANK_WIDGET_IDS.班级排名),
    提交人: pickStr(r, CLASS_RANK_WIDGET_IDS.提交人),
    提交时间: pickStr(r, CLASS_RANK_WIDGET_IDS.提交时间),
    更新时间: pickStr(r, CLASS_RANK_WIDGET_IDS.更新时间),
  };
}

export function useClassRank() {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["class-rank", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.CLASS_RANK.app_id,
        entry_id: JDY_CONFIG.CLASS_RANK.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      const normalized = records.map((r, i) => normalizeClassRankRecord(r, i));
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch, isFetching };
}

// ── 宿舍考勤 ──────────────────────────────────────────────

export interface DormAttendanceRecord {
  _id: string;
  学期: string;
  宿舍号: string;
  宿舍楼栋: string;
  场景: string;
  学生编号: string;
  学生姓名: string;
  年级: string;
  级部: string;
  班级名称: string;
  班主任: string;
  级部主任: string;
  检查项: string;
  扣分项: string;
  扣分: number;
  违纪情况说明: string;
  违纪图片: { name: string; url: string }[];
  提交人手机号: string;
  提交时间: string;
}

export interface DormAttendanceFilters {
  semester: string;
  building: string;
  checkItem: string;
  dormNo: string;
  deductItem: string;
}

function normalizeDormAttendanceRecord(r: JdyRecord): DormAttendanceRecord {
  return {
    _id: r._id,
    学期: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.学期),
    宿舍号: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.宿舍号),
    宿舍楼栋: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.宿舍楼栋),
    场景: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.场景),
    学生编号: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.学生编号),
    学生姓名: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.学生姓名),
    年级: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.年级),
    级部: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.级部),
    班级名称: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.年班级名称级),
    班主任: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.班主任),
    级部主任: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.级部主任),
    检查项: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.检查项),
    扣分项: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.扣分项),
    扣分: pickNum(r, DORM_ATTENDANCE_WIDGET_IDS.扣分),
    违纪情况说明: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.违纪情况说明),
    违纪图片: pickFiles(r, DORM_ATTENDANCE_WIDGET_IDS.违纪图片),
    提交人手机号: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.提交人手机号),
    提交时间: pickStr(r, DORM_ATTENDANCE_WIDGET_IDS.提交时间),
  };
}

export function useDormAttendance(filters?: DormAttendanceFilters) {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["dorm-attendance", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.DORM_ATTENDANCE.app_id,
        entry_id: JDY_CONFIG.DORM_ATTENDANCE.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map(normalizeDormAttendanceRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { semesters: [] as string[], buildings: [] as string[], checkItems: [] as string[], dormNos: [] as string[], deductItems: [] as string[] };
    return {
      semesters:   unique(allRecords.map(r => r.学期)),
      buildings:   unique(allRecords.map(r => r.宿舍楼栋)),
      checkItems:  unique(allRecords.map(r => r.检查项)),
      dormNos:     unique(allRecords.map(r => r.宿舍号)),
      deductItems: unique(allRecords.map(r => r.扣分项)),
    };
  }, [allRecords]);

  const raw = useMemo((): DormAttendanceRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.semester   && r.学期     !== filters.semester)   return false;
      if (filters?.building   && r.宿舍楼栋 !== filters.building)   return false;
      if (filters?.checkItem  && r.检查项   !== filters.checkItem)  return false;
      if (filters?.dormNo     && r.宿舍号   !== filters.dormNo)     return false;
      if (filters?.deductItem && r.扣分项   !== filters.deductItem) return false;
      return true;
    });
  }, [allRecords, filters?.semester, filters?.building, filters?.checkItem, filters?.dormNo, filters?.deductItem]);

  return { raw, allRecords: allRecords ?? [], filterOptions, isPending, isError, error, refetch };
}

// ── 学生花名册 ──────────────────────────────────────────────

export interface StudentInfoRecord {
  id: number;
  _id: string;
  学籍状态: string;
  学籍状态_运营: string;
  学籍状态开始时间: string;
  姓名: string;
  曾用名: string;
  身份证号: string;
  宏德学号: string;
  民族: string;
  性别: string;
  出生日期: string;
  年龄: number;
  政治面貌: string;
  学生本人电话: string;
  户籍地址: string;
  现居地址: string;
  监护人1姓名: string;
  监护人1联系: string;
  监护人1角色: string;
  监护人1工作单位: string;
  监护人2姓名: string;
  监护人2联系: string;
  监护人2角色: string;
  监护人2工作单位: string;
  年级名称: string;
  年级别名: string;
  班级名称: string;
  班主任: string;
  级部: string;
  学生类型: string;
  毕业学校: string;
  既往病史: string;
  是否残疾: string;
  享受寄宿生生活补助金额: string;
  享受营养改善计划补助金额: string;
  是建档立卡贫困户: string;
  建档立卡脱贫户子女: string;
  随迁子女入: string;
  在校农村留守儿童: string;
  备注: string;
  宿舍入住状态: string;
  宿舍楼栋: string;
  宿舍号: string;
  选科科目: string;
  选科方向: string;
  选科1: string;
  选科2: string;
  外语选科: string;
  证件照: { name: string; url: string; key?: string }[];
  生活照: { name: string; url: string; key?: string }[];
  提交人: string;
  提交时间:string;
}

export interface StudentInfoFilters {
  grade: string;
  className: string;
  name: string;
  status: string;
}

function normalizeStudentInfoRecord(r: JdyRecord, index: number): StudentInfoRecord {
  return {
    id: index + 1,
    _id: r._id,
    学籍状态:              pickStr(r, STUDENT_INFO_WIDGET_IDS.学籍状态_教务) || pickStr(r, STUDENT_INFO_WIDGET_IDS.学籍状态_运营),
    学籍状态_运营:         pickStr(r, STUDENT_INFO_WIDGET_IDS.学籍状态_运营),
    学籍状态开始时间:      pickStr(r, STUDENT_INFO_WIDGET_IDS.学籍状态开始时间),
    姓名:                  pickStr(r, STUDENT_INFO_WIDGET_IDS.姓名),
    曾用名:                pickStr(r, STUDENT_INFO_WIDGET_IDS.曾用名),
    身份证号:              pickStr(r, STUDENT_INFO_WIDGET_IDS.身份证号),
    宏德学号:              pickStr(r, STUDENT_INFO_WIDGET_IDS.宏德学号),
    民族:                  pickStr(r, STUDENT_INFO_WIDGET_IDS.民族),
    性别:                  pickStr(r, STUDENT_INFO_WIDGET_IDS.性别),
    出生日期:              pickStr(r, STUDENT_INFO_WIDGET_IDS.出生日期),
    年龄:                  pickNum(r, STUDENT_INFO_WIDGET_IDS.年龄),
    政治面貌:              pickStr(r, STUDENT_INFO_WIDGET_IDS.政治面貌),
    学生本人电话:          pickStr(r, STUDENT_INFO_WIDGET_IDS.学生本人电话),
    户籍地址:              pickStr(r, STUDENT_INFO_WIDGET_IDS.户籍地址) || pickStr(r, STUDENT_INFO_WIDGET_IDS.户籍地址_备注),
    现居地址:              pickStr(r, STUDENT_INFO_WIDGET_IDS.现居地址) || pickStr(r, STUDENT_INFO_WIDGET_IDS.现居地址_备注),
    监护人1姓名:           pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人1姓名),
    监护人1联系:           pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人1电话) || pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人1联系),
    监护人1角色:           pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人1角色),
    监护人1工作单位:       pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人1工作单位),
    监护人2姓名:           pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人2姓名),
    监护人2联系:           pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人2电话) || pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人2联系),
    监护人2角色:           pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人2角色),
    监护人2工作单位:       pickStr(r, STUDENT_INFO_WIDGET_IDS.监护人2工作单位),
    年级名称:              pickStr(r, STUDENT_INFO_WIDGET_IDS.年级名称),
    年级别名:              pickStr(r, STUDENT_INFO_WIDGET_IDS.年级别名),
    班级名称:              pickStr(r, STUDENT_INFO_WIDGET_IDS.班级名称),
    班主任:                pickStr(r, STUDENT_INFO_WIDGET_IDS.班主任),
    级部:                  pickStr(r, STUDENT_INFO_WIDGET_IDS.级部),
    学生类型:              pickStr(r, STUDENT_INFO_WIDGET_IDS.学生类型),
    毕业学校:              pickStr(r, STUDENT_INFO_WIDGET_IDS.毕业学校),
    既往病史:              pickStr(r, STUDENT_INFO_WIDGET_IDS.既往病史),
    是否残疾:              pickStr(r, STUDENT_INFO_WIDGET_IDS.是否残疾),
    享受寄宿生生活补助金额:    pickStr(r, STUDENT_INFO_WIDGET_IDS.享受寄宿生生活补助金额),
    享受营养改善计划补助金额:  pickStr(r, STUDENT_INFO_WIDGET_IDS.享受营养改善计划补助金额),
    是建档立卡贫困户:      pickStr(r, STUDENT_INFO_WIDGET_IDS.是建档立卡贫困户),
    建档立卡脱贫户子女:    pickStr(r, STUDENT_INFO_WIDGET_IDS.建档立卡脱贫户子女),
    随迁子女入:            pickStr(r, STUDENT_INFO_WIDGET_IDS.随迁子女入),
    在校农村留守儿童:      pickStr(r, STUDENT_INFO_WIDGET_IDS.在校农村留守儿童),
    备注:                  pickStr(r, STUDENT_INFO_WIDGET_IDS.备注),
    宿舍入住状态:          pickStr(r, STUDENT_INFO_WIDGET_IDS.宿舍入住状态),
    宿舍楼栋:              pickStr(r, STUDENT_INFO_WIDGET_IDS.宿舍楼栋),
    宿舍号:                pickStr(r, STUDENT_INFO_WIDGET_IDS.宿舍号),
    选科科目:              pickStr(r, STUDENT_INFO_WIDGET_IDS.选科科目),
    选科方向:              pickStr(r, STUDENT_INFO_WIDGET_IDS.选科方向),
    选科1:                 pickStr(r, STUDENT_INFO_WIDGET_IDS.选科1),
    选科2:                 pickStr(r, STUDENT_INFO_WIDGET_IDS.选科2),
    外语选科:              pickStr(r, STUDENT_INFO_WIDGET_IDS.外语选科),
    证件照:                pickFiles(r, STUDENT_INFO_WIDGET_IDS.证件照),
    生活照:                pickFiles(r, STUDENT_INFO_WIDGET_IDS.生活照),
    提交人:                pickStr(r, STUDENT_INFO_WIDGET_IDS.提交人),
    提交时间:              pickStr(r, STUDENT_INFO_WIDGET_IDS.提交时间),
  };
}

export function useStudentInfo(filters?: StudentInfoFilters, enabled = true) {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["student-info", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_INFO.app_id,
        entry_id: JDY_CONFIG.STUDENT_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map((r, i) => normalizeStudentInfoRecord(r, i));
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { grades: [] as string[], classNames: [] as string[], statuses: [] as string[] };
    return {
      grades:     unique(allRecords.map(r => r.年级名称)),
      classNames: unique(allRecords.map(r => r.班级名称)),
      statuses:   unique(allRecords.map(r => r.学籍状态)),
    };
  }, [allRecords]);

  const raw = useMemo((): StudentInfoRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.status    && r.学籍状态 !== filters.status)    return false;
      if (filters?.grade     && r.年级名称 !== filters.grade)     return false;
      if (filters?.className && r.班级名称 !== filters.className) return false;
      if (filters?.name      && !r.姓名.includes(filters.name))   return false;
      return true;
    });
  }, [allRecords, filters?.status, filters?.grade, filters?.className, filters?.name]);

  return { raw, allRecords: allRecords ?? [], filterOptions, isPending, isError, error, refetch, isFetching };
}

// ── 学生请假 ─────────────────────────────────────────────────────

export interface StudentLeaveRecord {
  _id: string;
  学期: string;
  请假学生姓名: string;
  宏德学号: string;
  请假类型: string;
  请假原因说明: string;
  请假开始时间: string;
  请假结束时间: string;
  请假时长_文本: string;
  请假时长_数字: number;
  请假学生年级: string;
  请假学生级部: string;
  请假学生班级: string;
  班主任: string;
  状态: string;
  申请时间: string;
}

export interface StudentLeaveFilters {
  name: string;
  type: string;
  status: string;
  grade: string;
}

function normalizeStudentLeaveRecord(r: JdyRecord): StudentLeaveRecord {
  return {
    _id:            r._id,
    学期:           pickStr(r, STUDENT_LEAVE_WIDGET_IDS.学期),
    请假学生姓名:   pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假学生姓名),
    宏德学号:       pickStr(r, STUDENT_LEAVE_WIDGET_IDS.宏德学号),
    请假类型:       pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假类型),
    请假原因说明:   pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假原因说明),
    请假开始时间:   pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假开始时间),
    请假结束时间:   pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假结束时间),
    请假时长_文本:  pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假时长_文本),
    请假时长_数字:  pickNum(r, STUDENT_LEAVE_WIDGET_IDS.请假时长_数字),
    请假学生年级:   pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假学生年级),
    请假学生级部:   pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假学生级部),
    请假学生班级:   pickStr(r, STUDENT_LEAVE_WIDGET_IDS.请假学生班级),
    班主任:         pickStr(r, STUDENT_LEAVE_WIDGET_IDS.班主任),
    状态:           pickStr(r, STUDENT_LEAVE_WIDGET_IDS.状态),
    申请时间:       pickStr(r, STUDENT_LEAVE_WIDGET_IDS.申请时间),
  };
}

export function useStudentLeave(filters?: StudentLeaveFilters, enabled = true) {
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 5);
    const end = new Date(now);
    end.setDate(end.getDate() + 1);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { rangeStart: fmt(start), rangeEnd: fmt(end) };
  }, []);

  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["student-leave", "list", rangeStart, rangeEnd],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_LEAVE_APPLICATION.app_id,
        entry_id: JDY_CONFIG.STUDENT_LEAVE_APPLICATION.entry_id,
        pageSize: 100,
        maxPages: 50,
        filter: {
          rel: "and",
          cond: [{ field: "createTime", method: "range", value: [rangeStart, rangeEnd] }],
        },
      });
      return records.map(normalizeStudentLeaveRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
    enabled,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { types: [] as string[], statuses: [] as string[], grades: [] as string[] };
    return {
      types:    unique(allRecords.map(r => r.请假类型).filter(Boolean)),
      statuses: unique(allRecords.map(r => r.状态).filter(Boolean)),
      grades:   unique(allRecords.map(r => r.请假学生年级).filter(Boolean)),
    };
  }, [allRecords]);

  const raw = useMemo((): StudentLeaveRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.name   && !r.请假学生姓名.includes(filters.name)) return false;
      if (filters?.type   && r.请假类型 !== filters.type)            return false;
      if (filters?.status && r.状态 !== filters.status)              return false;
      if (filters?.grade  && r.请假学生年级 !== filters.grade)       return false;
      return true;
    });
  }, [allRecords, filters?.name, filters?.type, filters?.status, filters?.grade]);

  return { raw, allRecords: allRecords ?? [], filterOptions, isPending, isError, error, refetch };
}

export function useStudentLeaveCount(activeTime: number) {
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (activeTime === 0) { start.setHours(0, 0, 0, 0); }
    else if (activeTime === 1) { start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); }
    else if (activeTime === 2) { start.setDate(1); start.setHours(0, 0, 0, 0); }
    else { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
    const end = new Date(now);
    end.setDate(end.getDate() + 1);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { rangeStart: fmt(start), rangeEnd: fmt(end) };
  }, [activeTime]);

  const { data, isPending } = useQuery({
    queryKey: ["student-leave-count", rangeStart, rangeEnd],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_LEAVE_APPLICATION.app_id,
        entry_id: JDY_CONFIG.STUDENT_LEAVE_APPLICATION.entry_id,
        pageSize: 100,
        maxPages: 100,
        filter: {
          rel: "and",
          cond: [{ field: "createTime", method: "range", value: [rangeStart, rangeEnd] }],
        },
      });
      return records.length;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { count: data ?? null, isPending };
}

export function useStudentLeavePage(
  filters: StudentLeaveFilters | undefined,
  cursor: string | null,
  pageSize = 100,
) {
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - 5);
    const end = new Date(now);
    end.setDate(end.getDate() + 1);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { rangeStart: fmt(start), rangeEnd: fmt(end) };
  }, []);

  const { data, isPending, isError, error, refetch } = useQuery<JdyPageResult>({
    queryKey: ["student-leave-page", cursor, pageSize, rangeStart, rangeEnd, filters?.name, filters?.type, filters?.status, filters?.grade],
    queryFn: () =>
      jdyListPage({
        app_id: JDY_CONFIG.STUDENT_LEAVE_APPLICATION.app_id,
        entry_id: JDY_CONFIG.STUDENT_LEAVE_APPLICATION.entry_id,
        pageSize,
        cursor,
        filter: {
          rel: "and",
          cond: [{ field: "createTime", method: "range", value: [rangeStart, rangeEnd] }],
        },
      }),
    staleTime: 5 * 60 * 1000,
  });

  const records = useMemo((): StudentLeaveRecord[] => {
    if (!data) return [];
    const normalized = data.records.map(normalizeStudentLeaveRecord);
    return normalized.filter(r => {
      if (filters?.name   && !r.请假学生姓名.includes(filters.name)) return false;
      if (filters?.type   && r.请假类型 !== filters.type)            return false;
      if (filters?.status && r.状态 !== filters.status)              return false;
      if (filters?.grade  && r.请假学生年级 !== filters.grade)       return false;
      return true;
    });
  }, [data, filters?.name, filters?.type, filters?.status, filters?.grade]);

  return {
    records,
    nextCursor: data?.nextCursor ?? null,
    isPending,
    isError,
    error,
    refetch,
  };
}

// ── 学生晨午晚检 ──────────────────────────────────────────────────

export interface HealthCheckRecord {
  _id: string;
  学期: string;
  班主任: string;
  填报日期_日期: string;
  填报日期_文本: string;
  上报类型: string;
  检查情况: string;
  班级: string;
  级部: string;
  年级: string;
  年级别名: string;
  班级名称: string;
  应到学生人数: number;
  实到学生人数: number;
  因病缺课学生人数: number;
  发热姓名: string;
  发热学生人数: number;
  发热具体情况说明: string;
  流感确诊学生姓名: string;
  流感确诊学生人数: number;
  流感确诊具体情况说明: string;
  是否有咽痛流涕咳嗽学生姓名: string;
  是否有咽痛流涕咳嗽学生数: number;
  是否有咽痛流涕咳嗽情况说明: string;
  乏力学生姓名: string;
  乏力学生数: number;
  乏力情况说明: string;
  腹泻学生姓名: string;
  腹泻学生数: number;
  腹泻情况说明: string;
  呼吸困难学生姓名: string;
  呼吸困难学生数: number;
  呼吸困难情况说明: string;
  其他症状学生姓名: string;
  其他症状学生数: number;
  其他症状情况说明: string;
}

export interface HealthCheckFilters {
  grade: string;
  className: string;
  session: string;
}

function normalizeHealthCheckRecord(r: JdyRecord): HealthCheckRecord {
  return {
    _id:                        r._id,
    学期:                       pickStr(r, HEALTH_CHECK_WIDGET_IDS.学期),
    班主任:                     pickStr(r, HEALTH_CHECK_WIDGET_IDS.班主任),
    填报日期_日期:              pickStr(r, HEALTH_CHECK_WIDGET_IDS.填报日期_日期),
    填报日期_文本:              pickStr(r, HEALTH_CHECK_WIDGET_IDS.填报日期_文本),
    上报类型:                   pickStr(r, HEALTH_CHECK_WIDGET_IDS.上报类型),
    检查情况:                   pickStr(r, HEALTH_CHECK_WIDGET_IDS.检查情况),
    班级:                       pickStr(r, HEALTH_CHECK_WIDGET_IDS.班级),
    级部:                       pickStr(r, HEALTH_CHECK_WIDGET_IDS.级部),
    年级:                       pickStr(r, HEALTH_CHECK_WIDGET_IDS.年级),
    年级别名:                   pickStr(r, HEALTH_CHECK_WIDGET_IDS.年级别名),
    班级名称:                   pickStr(r, HEALTH_CHECK_WIDGET_IDS.班级名称),
    应到学生人数:               pickNum(r, HEALTH_CHECK_WIDGET_IDS.应到学生人数),
    实到学生人数:               pickNum(r, HEALTH_CHECK_WIDGET_IDS.实到学生人数),
    因病缺课学生人数:           pickNum(r, HEALTH_CHECK_WIDGET_IDS.因病缺课学生人数),
    发热姓名:                   pickStr(r, HEALTH_CHECK_WIDGET_IDS.发热姓名),
    发热学生人数:               pickNum(r, HEALTH_CHECK_WIDGET_IDS.发热学生人数),
    发热具体情况说明:           pickStr(r, HEALTH_CHECK_WIDGET_IDS.发热具体情况说明),
    流感确诊学生姓名:           pickStr(r, HEALTH_CHECK_WIDGET_IDS.流感确诊学生姓名),
    流感确诊学生人数:           pickNum(r, HEALTH_CHECK_WIDGET_IDS.流感确诊学生人数),
    流感确诊具体情况说明:       pickStr(r, HEALTH_CHECK_WIDGET_IDS.流感确诊具体情况说明),
    是否有咽痛流涕咳嗽学生姓名: pickStr(r, HEALTH_CHECK_WIDGET_IDS.是否有咽痛流涕咳嗽学生姓名),
    是否有咽痛流涕咳嗽学生数:   pickNum(r, HEALTH_CHECK_WIDGET_IDS.是否有咽痛流涕咳嗽学生数),
    是否有咽痛流涕咳嗽情况说明: pickStr(r, HEALTH_CHECK_WIDGET_IDS.是否有咽痛流涕咳嗽情况说明),
    乏力学生姓名:               pickStr(r, HEALTH_CHECK_WIDGET_IDS.乏力学生姓名),
    乏力学生数:                 pickNum(r, HEALTH_CHECK_WIDGET_IDS.乏力学生数),
    乏力情况说明:               pickStr(r, HEALTH_CHECK_WIDGET_IDS.乏力情况说明),
    腹泻学生姓名:               pickStr(r, HEALTH_CHECK_WIDGET_IDS.腹泻学生姓名),
    腹泻学生数:                 pickNum(r, HEALTH_CHECK_WIDGET_IDS.腹泻学生数),
    腹泻情况说明:               pickStr(r, HEALTH_CHECK_WIDGET_IDS.腹泻情况说明),
    呼吸困难学生姓名:           pickStr(r, HEALTH_CHECK_WIDGET_IDS.呼吸困难学生姓名),
    呼吸困难学生数:             pickNum(r, HEALTH_CHECK_WIDGET_IDS.呼吸困难学生数),
    呼吸困难情况说明:           pickStr(r, HEALTH_CHECK_WIDGET_IDS.呼吸困难情况说明),
    其他症状学生姓名:           pickStr(r, HEALTH_CHECK_WIDGET_IDS.其他症状学生姓名),
    其他症状学生数:             pickNum(r, HEALTH_CHECK_WIDGET_IDS.其他症状学生数),
    其他症状情况说明:           pickStr(r, HEALTH_CHECK_WIDGET_IDS.其他症状情况说明),
  };
}

export function useHealthCheck(filters?: HealthCheckFilters, enabled = true) {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["health-check", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_CHEN_WU_WAN_JIAN.app_id,
        entry_id: JDY_CONFIG.STUDENT_CHEN_WU_WAN_JIAN.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map(normalizeHealthCheckRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
    enabled,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { grades: [] as string[], classNames: [] as string[], sessions: [] as string[] };
    return {
      grades:     unique(allRecords.map(r => r.年级).filter(Boolean)),
      classNames: unique(allRecords.map(r => r.班级名称).filter(Boolean)),
      sessions:   unique(allRecords.map(r => r.检查情况).filter(Boolean)),
    };
  }, [allRecords]);

  const raw = useMemo((): HealthCheckRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.grade     && r.年级 !== filters.grade)         return false;
      if (filters?.className && r.班级名称 !== filters.className) return false;
      if (filters?.session   && r.检查情况 !== filters.session)   return false;
      return true;
    });
  }, [allRecords, filters?.grade, filters?.className, filters?.session]);

  return { raw, allRecords: allRecords ?? [], filterOptions, isPending, isError, error, refetch };
}

// ── 学生返校登记 ──────────────────────────────────────────────────

export interface StudentReturnSchoolRecord {
  id: number;
  _id: string;
  填报日期: string;
  学期: string;
  是否当前学期: string;
  班级名称: string;
  年级: string;
  级部: string;
  年级别名: string;
  年级总人数: number;
  应到学生人数: number;
  返校学生人数: number;
  未返校学生人数: number;
  转入学生人数: number;
  班主任: string;
  级部主任: string;
  提交人: string;
  提交时间: string;
  病假学生姓名: string[];
  病假学生人数: number;
  病假具体情况说明: string;
  事假学生姓名: string[];
  事假学生人数: number;
  事假具体情况说明: string;
  在外学习培训学生姓名: string[];
  在外学习培训学生人数: number;
  在外学习培训具体情况说明: string;
  休学学生姓名: string[];
  休学学生人数: number;
  休学具体情况说明: string;
  流失学生姓名: string[];
  流失学生人数: number;
  流失学生具体情况说明: string;
}

export interface StudentReturnSchoolFilters {
  grade: string;
  className: string;
  semester: string;
}

function normalizeStudentReturnSchoolRecord(r: JdyRecord, index: number): StudentReturnSchoolRecord {
  return {
    id:                       index + 1,
    _id:                      r._id,
    填报日期:                 pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.填报日期),
    学期:                     pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.学期),
    是否当前学期:             pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.是否当前学期),
    班级名称:                 pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.班级名称),
    年级:                     pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.年级),
    级部:                     pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.级部),
    年级别名:                 pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.年级别名),
    年级总人数:               pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.年级总人数),
    应到学生人数:             pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.应到学生人数),
    返校学生人数:             pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.返校学生人数),
    未返校学生人数:           pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.未返校学生人数),
    转入学生人数:             pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.转入学生人数),
    班主任:                   pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.班主任),
    级部主任:                 pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.级部主任),
    提交人:                   pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.提交人),
    提交时间:                 pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.提交时间),
    病假学生姓名:             pickStrArr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.病假学生姓名),
    病假学生人数:             pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.病假学生人数),
    病假具体情况说明:         pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.病假具体情况说明),
    事假学生姓名:             pickStrArr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.事假学生姓名),
    事假学生人数:             pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.事假学生人数),
    事假具体情况说明:         pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.事假具体情况说明),
    在外学习培训学生姓名:     pickStrArr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.在外学习培训学生姓名),
    在外学习培训学生人数:     pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.在外学习培训学生人数),
    在外学习培训具体情况说明: pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.在外学习培训具体情况说明),
    休学学生姓名:             pickStrArr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.休学学生姓名),
    休学学生人数:             pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.休学学生人数),
    休学具体情况说明:         pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.休学具体情况说明),
    流失学生姓名:             pickStrArr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.流失学生姓名),
    流失学生人数:             pickNum(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.流失学生人数),
    流失学生具体情况说明:     pickStr(r, STUDENT_RETURN_SCHOOL_WIDGET_IDS.流失学生具体情况说明),
  };
}

export function useStudentReturnSchool(filters?: StudentReturnSchoolFilters, enabled = true) {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["student-return-school", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_RETURN_SCHOOL.app_id,
        entry_id: JDY_CONFIG.STUDENT_RETURN_SCHOOL.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      const normalized = records.map((r, i) => normalizeStudentReturnSchoolRecord(r, i));
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
    enabled,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { grades: [] as string[], classNames: [] as string[], semesters: [] as string[] };
    return {
      grades:     unique(allRecords.map(r => r.年级).filter(Boolean)),
      classNames: unique(allRecords.map(r => r.班级名称).filter(Boolean)),
      semesters:  unique(allRecords.map(r => r.学期).filter(Boolean)),
    };
  }, [allRecords]);

  const raw = useMemo((): StudentReturnSchoolRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.grade     && r.年级 !== filters.grade)         return false;
      if (filters?.className && r.班级名称 !== filters.className) return false;
      if (filters?.semester  && r.学期 !== filters.semester)      return false;
      return true;
    });
  }, [allRecords, filters?.grade, filters?.className, filters?.semester]);

  return { raw, allRecords: allRecords ?? [], filterOptions, isPending, isError, error, refetch, isFetching };
}

// ── 学生资助情况 ──────────────────────────────────────────────────

export interface StudentSupportRecord {
  _id: string;
  年级: string;
  班级名称: string;
  学生姓名: string;
  学生学号: string;
  性别: string;
  家长姓名: string;
  手机号码: string;
  当前学期: string;
  发放学期: string;
  资助项目名称: string;
  资助单位: string;
  资助金额: string;
  备注: string;
}

export interface StudentSupportFilters {
  grade: string;
  className: string;
  semester: string;
}

function normalizeStudentSupportRecord(r: JdyRecord): StudentSupportRecord {
  return {
    _id:          r._id,
    年级:         pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.年级),
    班级名称:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.班级名称),
    学生姓名:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.学生姓名),
    学生学号:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.学生学号),
    性别:         pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.性别),
    家长姓名:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.家长姓名),
    手机号码:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.手机号码),
    当前学期:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.当前学期),
    发放学期:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.发放学期),
    资助项目名称: pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.资助项目名称),
    资助单位:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.资助单位),
    资助金额:     pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.资助金额),
    备注:         pickStr(r, STUDENT_SUPPORT_STATUS_WIDGET_IDS.备注),
  };
}

export function useStudentSupport(filters?: StudentSupportFilters, enabled = true) {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["student-support", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_SUPPORT_STATUS.app_id,
        entry_id: JDY_CONFIG.STUDENT_SUPPORT_STATUS.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map(normalizeStudentSupportRecord);
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { grades: [] as string[], classNames: [] as string[], semesters: [] as string[] };
    return {
      grades:     unique(allRecords.map(r => r.年级).filter(Boolean)),
      classNames: unique(allRecords.map(r => r.班级名称).filter(Boolean)),
      semesters:  unique(allRecords.map(r => r.发放学期).filter(Boolean)),
    };
  }, [allRecords]);

  const raw = useMemo((): StudentSupportRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.grade     && r.年级 !== filters.grade)         return false;
      if (filters?.className && r.班级名称 !== filters.className) return false;
      if (filters?.semester  && r.发放学期 !== filters.semester)  return false;
      return true;
    });
  }, [allRecords, filters?.grade, filters?.className, filters?.semester]);

  return { raw, allRecords: allRecords ?? [], filterOptions, isPending, isError, error, refetch };
}

// ── 谈心谈话记录 ──────────────────────────────────────────────────

export interface HeartToHeartTalkRecord {
  id: number;
  _id: string;
  谈心教师: string;
  班级名称: string;
  学生姓名: string;
  学生身份证: string;
  学生学号: string;
  谈心教师学科: string;
  谈心谈话时间: string;
  谈话内容: string;
  谈心谈话内容记录: string;
  教师指导建议: string;
  沟通照片: { name: string; url: string; key?: string }[];
  提交人: string;
  提交时间: string;
}

export interface HeartToHeartTalkFilters {
  className: string;
  teacher: string;
}

function normalizeHeartToHeartTalkRecord(r: JdyRecord, index: number): HeartToHeartTalkRecord {
  function pickUser(rec: JdyRecord, id: string): string {
    const v = rec[id];
    if (!v) return "";
    if (Array.isArray(v)) return v.map((u: Record<string, unknown>) => u?.name ?? "").filter(Boolean).join("、");
    if (typeof v === "object" && v !== null) return (v as Record<string, unknown>).name as string ?? "";
    return String(v);
  }
  return {
    id: index + 1,
    _id:              r._id,
    谈心教师:         pickUser(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.谈心教师),
    班级名称:         pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.班级名称),
    学生姓名:         pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.学生姓名),
    学生身份证:       pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.学生身份证),
    学生学号:         pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.学生学号),
    谈心教师学科:     pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.谈心教师学科),
    谈心谈话时间:     pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.谈心谈话时间),
    谈话内容:         pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.谈话内容),
    谈心谈话内容记录: pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.谈心谈话内容记录),
    教师指导建议:     pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.教师指导建议),
    沟通照片:         pickFiles(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.沟通照片),
    提交人:           pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.提交人),
    提交时间:         pickStr(r, STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS.提交时间),
  };
}

export function useHeartToHeartTalk(filters?: HeartToHeartTalkFilters, enabled = true) {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["heart-to-heart-talk", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_HEART_TO_HEART_TALK.app_id,
        entry_id: JDY_CONFIG.STUDENT_HEART_TO_HEART_TALK.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      const normalized = records.map((r, i) => normalizeHeartToHeartTalkRecord(r, i));
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
    enabled,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { classNames: [] as string[], teachers: [] as string[] };
    return {
      classNames: unique(allRecords.map(r => r.班级名称).filter(Boolean)),
      teachers:   unique(allRecords.map(r => r.谈心教师).filter(Boolean)),
    };
  }, [allRecords]);

  const raw = useMemo((): HeartToHeartTalkRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.className && r.班级名称 !== filters.className) return false;
      if (filters?.teacher   && r.谈心教师 !== filters.teacher)   return false;
      return true;
    });
  }, [allRecords, filters?.className, filters?.teacher]);

  return { raw, allRecords: allRecords ?? [], filterOptions, isPending, isError, error, refetch, isFetching };
}

// ── 教职工花名册 ──────────────────────────────────────────────────

export interface StaffDirectoryRecord {
  _id: string;
  教职工姓名: string;
  教职工编号: string;
  员工状态: string;
  部门: string;
  岗位: string;
  岗位类型: string;
  担任学科: string;
  身份证号: string;
  手机号码: string;
  性别: string;
  年龄: number;
  最高学历: string;
  学位: string;
  毕业院校: string;
  所学专业: string;
  教师职称级别: string;
  教师资格种类: string;
}

function normalizeStaffDirectoryRecord(r: JdyRecord): StaffDirectoryRecord {
  return {
    _id: r._id,
    教职工姓名: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.教职工姓名),
    教职工编号: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.教职工编号),
    员工状态: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.员工状态),
    部门: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.部门),
    岗位: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.岗位),
    岗位类型: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.岗位类型),
    担任学科: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.担任学科),
    身份证号: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.身份证号),
    手机号码: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.手机号码),
    性别: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.性别),
    年龄: pickNum(r, STAFF_DIRECTORY_WIDGET_IDS.年龄),
    最高学历: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.最高学历),
    学位: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.学位),
    毕业院校: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.毕业院校),
    所学专业: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.所学专业),
    教师职称级别: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.教师职称级别),
    教师资格种类: pickStr(r, STAFF_DIRECTORY_WIDGET_IDS.教师资格种类),
  };
}

export function useStaffDirectory() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["staff-directory", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STAFF_DIRECTORY_INFO.app_id,
        entry_id: JDY_CONFIG.STAFF_DIRECTORY_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map(normalizeStaffDirectoryRecord);
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

export function useStaffDirectoryByName(name: string, enabled = true) {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["staff-directory", "by-name", name],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STAFF_DIRECTORY_INFO.app_id,
        entry_id: JDY_CONFIG.STAFF_DIRECTORY_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map(normalizeStaffDirectoryRecord);
    },
    staleTime: 10 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    enabled: enabled && name.length > 0,
  });

  const raw = useMemo((): StaffDirectoryRecord[] => {
    if (!allRecords || !name) return [];
    return allRecords.filter(r => r.教职工姓名.includes(name));
  }, [allRecords, name]);

  return { raw, isPending, isError, error, refetch };
}

// ── 科目信息 ──────────────────────────────────────────────────

export interface CourseInfoRecord {
  _id: string;
  科目: string;
  学科_国标: string;
  分组_国标: string;
  学段: string;
  学段科目名: string;
  教研学科名: string;
}

function normalizeCourseInfoRecord(r: JdyRecord): CourseInfoRecord {
  return {
    _id: r._id,
    科目: pickStr(r, COURSE_INFO_WIDGET_IDS.科目),
    学科_国标: pickStr(r, COURSE_INFO_WIDGET_IDS.学科_国标),
    分组_国标: pickStr(r, COURSE_INFO_WIDGET_IDS.分组_国标),
    学段: pickStr(r, COURSE_INFO_WIDGET_IDS.学段),
    学段科目名: pickStr(r, COURSE_INFO_WIDGET_IDS.学段科目名),
    教研学科名: pickStr(r, COURSE_INFO_WIDGET_IDS.教研学科名),
  };
}

export function useCourses() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["course-info", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.COURSE_INFO.app_id,
        entry_id: JDY_CONFIG.COURSE_INFO.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      return records.map(normalizeCourseInfoRecord);
    },
    staleTime: 30 * 60 * 1000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

// ── 教研组组长 ──────────────────────────────────────────────────

export interface TeachingResearchGroupRecord {
  _id: string;
  科目: string;
  教研组: string;
  科组类别: string;
  教研组长: string;
  教研组长职工编号: string;
  教研组长电话: string;
}

function normalizeTeachingResearchGroupRecord(r: JdyRecord): TeachingResearchGroupRecord {
  return {
    _id: r._id,
    科目: pickStr(r, TEACHING_RESEARCH_GROUP_WIDGET_IDS.科目),
    教研组: pickStr(r, TEACHING_RESEARCH_GROUP_WIDGET_IDS.教研组),
    科组类别: pickStr(r, TEACHING_RESEARCH_GROUP_WIDGET_IDS.科组类别),
    教研组长: pickStr(r, TEACHING_RESEARCH_GROUP_WIDGET_IDS.教研组长),
    教研组长职工编号: pickStr(r, TEACHING_RESEARCH_GROUP_WIDGET_IDS.教研组长职工编号),
    教研组长电话: pickStr(r, TEACHING_RESEARCH_GROUP_WIDGET_IDS.教研组长电话),
  };
}

export function useTeachingResearchGroups() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["teaching-research-groups", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.TEACHING_RESEARCH_GROUP_INFO.app_id,
        entry_id: JDY_CONFIG.TEACHING_RESEARCH_GROUP_INFO.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      return records.map(normalizeTeachingResearchGroupRecord);
    },
    staleTime: 30 * 60 * 1000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

// ── 备课组长 ──────────────────────────────────────────────────

export interface LessonPrepareGroupRecord {
  _id: string;
  年级: string;
  年级别名: string;
  科目: string;
  备课组: string;
  科组类别: string;
  备课组长: string;
  备课组长职工编号: string;
  备课组长电话: string;
}

function normalizeLessonPrepareGroupRecord(r: JdyRecord): LessonPrepareGroupRecord {
  return {
    _id: r._id,
    年级: pickStr(r, LESSON_PREPARE_GROUP_WIDGET_IDS.年级),
    年级别名: pickStr(r, LESSON_PREPARE_GROUP_WIDGET_IDS.年级别名),
    科目: pickStr(r, LESSON_PREPARE_GROUP_WIDGET_IDS.科目),
    备课组: pickStr(r, LESSON_PREPARE_GROUP_WIDGET_IDS.备课组),
    科组类别: pickStr(r, LESSON_PREPARE_GROUP_WIDGET_IDS.科组类别),
    备课组长: pickStr(r, LESSON_PREPARE_GROUP_WIDGET_IDS.备课组长),
    备课组长职工编号: pickStr(r, LESSON_PREPARE_GROUP_WIDGET_IDS.备课组长职工编号),
    备课组长电话: pickStr(r, LESSON_PREPARE_GROUP_WIDGET_IDS.备课组长电话),
  };
}

export function useLessonPrepareGroups() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["lesson-prepare-groups", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.LESSON_PREPARE_GROUP_INFO.app_id,
        entry_id: JDY_CONFIG.LESSON_PREPARE_GROUP_INFO.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      return records.map(normalizeLessonPrepareGroupRecord);
    },
    staleTime: 30 * 60 * 1000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

// ── 消费记录 ──────────────────────────────────────────────────

export interface TransactionsRecord {
  _id: string;
  学期: string;
  身份: string;
  姓名: string;
  宏德学_工号: string;
  班级: string;
  年级: string;
  级部: string;
  订单号: string;
  订单类型: string;
  支付方式: string;
  交易金额: number;
  实付金额: number;
  消费机时间: string;
  交易时间: string;
  支付时间: string;
  订单状态: string;
  消费方式: string;
  门店: string;
  交易号: string;
  消费机SN: string;
  退款时间: string;
  退款金额: number;
  退款状态: string;
  班主任: string;
  级部主任: string;
  设备状态: string;
}

function normalizeTransactionsRecord(r: JdyRecord): TransactionsRecord {
  return {
    _id: r._id,
    学期: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.学期),
    身份: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.身份),
    姓名: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.姓名),
    宏德学_工号: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS["宏德学/工号"]),
    班级: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.班级),
    年级: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.年级),
    级部: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.级部),
    订单号: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.订单号),
    订单类型: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.订单类型),
    支付方式: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.支付方式),
    交易金额: pickNum(r, TRANSACTIONS_RECORD_WIDGET_IDS.交易金额),
    实付金额: pickNum(r, TRANSACTIONS_RECORD_WIDGET_IDS.实付金额),
    消费机时间: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.消费机时间),
    交易时间: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.交易时间),
    支付时间: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.支付时间),
    订单状态: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.订单状态),
    消费方式: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.消费方式),
    门店: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.门店),
    交易号: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.交易号),
    消费机SN: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.消费机SN),
    退款时间: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.退款时间),
    退款金额: pickNum(r, TRANSACTIONS_RECORD_WIDGET_IDS.退款金额),
    退款状态: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.退款状态),
    班主任: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.班主任),
    级部主任: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.级部主任),
    设备状态: pickStr(r, TRANSACTIONS_RECORD_WIDGET_IDS.设备状态),
  };
}

export function useTransactions() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["transactions", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.TRANSACTIONS_RECORD_INFO.app_id,
        entry_id: JDY_CONFIG.TRANSACTIONS_RECORD_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map(normalizeTransactionsRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

// ── 门禁记录 ──────────────────────────────────────────────────

export interface AccessLogRecord {
  _id: string;
  学期: string;
  姓名: string;
  年级: string;
  级部: string;
  班级: string;
  宏德学_工号: string;
  身份: string;
  打卡设备: string;
  通行方向: string;
  通行时间: string;
  出入场所: string;
  班主任: string;
  级部主任: string;
  设备状态: string;
}

function normalizeAccessLogRecord(r: JdyRecord): AccessLogRecord {
  return {
    _id: r._id,
    学期: pickStr(r, ACCESS_LOGS_WIDGET_IDS.学期),
    姓名: pickStr(r, ACCESS_LOGS_WIDGET_IDS.姓名),
    年级: pickStr(r, ACCESS_LOGS_WIDGET_IDS.年级),
    级部: pickStr(r, ACCESS_LOGS_WIDGET_IDS.级部),
    班级: pickStr(r, ACCESS_LOGS_WIDGET_IDS.班级),
    宏德学_工号: pickStr(r, ACCESS_LOGS_WIDGET_IDS["宏德学/工号"]),
    身份: pickStr(r, ACCESS_LOGS_WIDGET_IDS.身份),
    打卡设备: pickStr(r, ACCESS_LOGS_WIDGET_IDS.打卡设备),
    通行方向: pickStr(r, ACCESS_LOGS_WIDGET_IDS.通行方向),
    通行时间: pickStr(r, ACCESS_LOGS_WIDGET_IDS.通行时间),
    出入场所: pickStr(r, ACCESS_LOGS_WIDGET_IDS.出入场所),
    班主任: pickStr(r, ACCESS_LOGS_WIDGET_IDS.班主任),
    级部主任: pickStr(r, ACCESS_LOGS_WIDGET_IDS.级部主任),
    设备状态: pickStr(r, ACCESS_LOGS_WIDGET_IDS.设备状态),
  };
}

export function useAccessLogs() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["access-logs", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.ACCESS_LOGS_INFO.app_id,
        entry_id: JDY_CONFIG.ACCESS_LOGS_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map(normalizeAccessLogRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

export function useTransactionsToday() {
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() };
  }, []);

  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["transactions", "today", rangeStart.slice(0, 10)],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.TRANSACTIONS_RECORD_INFO.app_id,
        entry_id: JDY_CONFIG.TRANSACTIONS_RECORD_INFO.entry_id,
        pageSize: 100,
        maxPages: 100,
        filter: {
          rel: "and",
          cond: [{ field: "created_at", method: "range", value: [rangeStart, rangeEnd] }],
        },
      });
      return records.map(normalizeTransactionsRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

export function useAccessLogsToday() {
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { rangeStart: start.toISOString(), rangeEnd: end.toISOString() };
  }, []);

  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["access-logs", "today", rangeStart.slice(0, 10)],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.ACCESS_LOGS_INFO.app_id,
        entry_id: JDY_CONFIG.ACCESS_LOGS_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
        filter: {
          rel: "and",
          cond: [{ field: "pass_time", method: "range", value: [rangeStart, rangeEnd] }],
        },
      });
      return records.map(normalizeAccessLogRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

export function useTransactionStats(activeTime: number) {
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (activeTime === 0) { start.setHours(0, 0, 0, 0); }
    else if (activeTime === 1) { start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); }
    else if (activeTime === 2) { start.setDate(1); start.setHours(0, 0, 0, 0); }
    else { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
    const end = new Date(now);
    end.setDate(end.getDate() + 1);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { rangeStart: fmt(start), rangeEnd: fmt(end) };
  }, [activeTime]);

  const { data, isPending } = useQuery({
    queryKey: ["transaction-stats", rangeStart, rangeEnd],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.TRANSACTIONS_RECORD_INFO.app_id,
        entry_id: JDY_CONFIG.TRANSACTIONS_RECORD_INFO.entry_id,
        pageSize: 100,
        maxPages: 200,
        filter: {
          rel: "and",
          cond: [{ field: "created_at", method: "range", value: [rangeStart, rangeEnd] }],
        },
      });
      return records.reduce((sum, r) => sum + pickNum(r, TRANSACTIONS_RECORD_WIDGET_IDS.实付金额), 0);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { amount: data ?? null, isPending };
}

export function useAccessStats(activeTime: number) {
  const { rangeStart, rangeEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (activeTime === 0) { start.setHours(0, 0, 0, 0); }
    else if (activeTime === 1) { start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0); }
    else if (activeTime === 2) { start.setDate(1); start.setHours(0, 0, 0, 0); }
    else { start.setMonth(0, 1); start.setHours(0, 0, 0, 0); }
    const end = new Date(now);
    end.setDate(end.getDate() + 1);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    return { rangeStart: fmt(start), rangeEnd: fmt(end) };
  }, [activeTime]);

  const { data, isPending } = useQuery({
    queryKey: ["access-stats", rangeStart, rangeEnd],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.ACCESS_LOGS_INFO.app_id,
        entry_id: JDY_CONFIG.ACCESS_LOGS_INFO.entry_id,
        pageSize: 100,
        maxPages: 200,
        filter: {
          rel: "and",
          cond: [{ field: "pass_time", method: "range", value: [rangeStart, rangeEnd] }],
        },
      });
      let exitCount = 0;
      let enterCount = 0;
      for (const r of records) {
        const dir = pickStr(r, ACCESS_LOGS_WIDGET_IDS.通行方向);
        if (dir === "出") exitCount++;
        else if (dir === "进") enterCount++;
      }
      return { exitCount, enterCount };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { exitCount: data?.exitCount ?? null, enterCount: data?.enterCount ?? null, isPending };
}

// ── 学情分析记录 ──────────────────────────────────────────────────

export interface LearningAnalysisRecord {
  id: number;
  _id: string;
  班级: string;
  学生姓名: string;
  学科: string;
  学情分析开始时间: string;
  学情分析结束时间: string;
  掌握较好的知识点: { name: string; url: string }[];
  掌握不足的知识点: { name: string; url: string }[];
  教师指导措施: string;
  提交人: string;
  提交时间: string;
}

export interface LearningAnalysisFilters {
  className: string;
  subject: string;
}

function normalizeLearningAnalysisRecord(r: JdyRecord, index: number): LearningAnalysisRecord {
  return {
    id: index + 1,
    _id:              r._id,
    班级:             pickStr(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.班级),
    学生姓名:         pickStr(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.学生姓名),
    学科:             pickStr(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.学科),
    学情分析开始时间: pickStr(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.学情分析开始时间),
    学情分析结束时间: pickStr(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.学情分析结束时间),
    掌握较好的知识点: pickFiles(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.掌握较好的知识点),
    掌握不足的知识点: pickFiles(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.掌握不足的知识点),
    教师指导措施:     pickStr(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.教师指导措施),
    提交人:           pickStr(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.提交人),
    提交时间:         pickStr(r, STUDENT_LEARNING_ANALYSIS_WIDGET_IDS.提交时间),
  };
}

export function useLearningAnalysis(filters?: LearningAnalysisFilters, enabled = true) {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["learning-analysis", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.app_id,
        entry_id: JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      return records.map((r, i) => normalizeLearningAnalysisRecord(r, i));
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
    enabled,
  });

  const filterOptions = useMemo(() => {
    if (!allRecords) return { classNames: [] as string[], subjects: [] as string[] };
    return {
      classNames: unique(allRecords.map(r => r.班级).filter(Boolean)),
      subjects:   unique(allRecords.map(r => r.学科).filter(Boolean)),
    };
  }, [allRecords]);

  const raw = useMemo((): LearningAnalysisRecord[] => {
    if (!allRecords) return [];
    return allRecords.filter(r => {
      if (filters?.className && r.班级 !== filters.className) return false;
      if (filters?.subject   && r.学科 !== filters.subject)   return false;
      return true;
    });
  }, [allRecords, filters?.className, filters?.subject]);

  return { raw, allRecords: allRecords ?? [], filterOptions, isPending, isError, error, refetch, isFetching };
}

// ── 学生获奖记录 ──────────────────────────────────────────────────

export interface StudentAwardRecord {
  id: number;
  _id: string;
  学期: string;
  年级: string;
  级部: string;
  班级名称: string;
  学生姓名: string;
  学生学号: string;
  获奖级别: string;
  获奖等级: string;
  参与比赛名称: string;
  获奖时间: string;
  颁发单位: string;
  个人团体获奖: string;
  指导老师: string;
  提交人: string;
  提交时间: string;
}

function normalizeStudentAwardRecord(r: JdyRecord, index: number): StudentAwardRecord {
  const teacherRaw = r[STUDENT_AWARD_WIDGET_IDS.指导老师];
  const teacherArr: Array<{ name?: string }> = Array.isArray(teacherRaw) ? teacherRaw : [];
  const teacherNames = teacherArr.map(t => t.name ?? "").join("、");
  return {
    id: index + 1,
    _id: r._id,
    学期: pickStr(r, STUDENT_AWARD_WIDGET_IDS.学期),
    年级: pickStr(r, STUDENT_AWARD_WIDGET_IDS.年级),
    级部: pickStr(r, STUDENT_AWARD_WIDGET_IDS.级部),
    班级名称: pickStr(r, STUDENT_AWARD_WIDGET_IDS.班级名称),
    学生姓名: pickStr(r, STUDENT_AWARD_WIDGET_IDS.学生姓名),
    学生学号: pickStr(r, STUDENT_AWARD_WIDGET_IDS.学生学号),
    获奖级别: pickStr(r, STUDENT_AWARD_WIDGET_IDS.获奖级别),
    获奖等级: pickStr(r, STUDENT_AWARD_WIDGET_IDS.获奖等级),
    参与比赛名称: pickStr(r, STUDENT_AWARD_WIDGET_IDS.参与比赛名称),
    获奖时间: pickStr(r, STUDENT_AWARD_WIDGET_IDS.获奖时间),
    颁发单位: pickStr(r, STUDENT_AWARD_WIDGET_IDS.颁发单位),
    个人团体获奖: pickStr(r, STUDENT_AWARD_WIDGET_IDS.个人团体获奖),
    指导老师: teacherNames,
    提交人: pickStr(r, STUDENT_AWARD_WIDGET_IDS.提交人),
    提交时间: pickStr(r, STUDENT_AWARD_WIDGET_IDS.提交时间),
  };
}

export function useStudentAward() {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["student-award", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_AWARD_INFO.app_id,
        entry_id: JDY_CONFIG.STUDENT_AWARD_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      const normalized = records.map((r, i) => normalizeStudentAwardRecord(r, i));
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch, isFetching };
}

// ── 好人好事记录 ──────────────────────────────────────────────────

export interface GoodDeedsRecord {
  id: number;
  _id: string;
  学期: string;
  填报时间: string;
  填报人: string;
  年级: string;
  班级名称: string;
  级部: string;
  学生姓名: string;
  学生学号: string;
  事件发生时间: string;
  事件地点: string;
  事件描述: string;
  班主任: string;
  级部主任: string;
  提交人: string;
  提交时间: string;
}

function normalizeGoodDeedsRecord(r: JdyRecord, index: number): GoodDeedsRecord {
  return {
    id: index + 1,
    _id: r._id,
    学期: pickStr(r, GOOD_DEEDS_WIDGET_IDS.学期),
    填报时间: pickStr(r, GOOD_DEEDS_WIDGET_IDS.填报时间),
    填报人: pickStr(r, GOOD_DEEDS_WIDGET_IDS.填报人),
    年级: pickStr(r, GOOD_DEEDS_WIDGET_IDS.年级),
    班级名称: pickStr(r, GOOD_DEEDS_WIDGET_IDS.班级名称),
    级部: pickStr(r, GOOD_DEEDS_WIDGET_IDS.级部),
    学生姓名: pickStr(r, GOOD_DEEDS_WIDGET_IDS.学生姓名),
    学生学号: pickStr(r, GOOD_DEEDS_WIDGET_IDS.学生学号),
    事件发生时间: pickStr(r, GOOD_DEEDS_WIDGET_IDS.事件发生时间),
    事件地点: pickStr(r, GOOD_DEEDS_WIDGET_IDS.事件地点),
    事件描述: pickStr(r, GOOD_DEEDS_WIDGET_IDS.事件描述),
    班主任: pickStr(r, GOOD_DEEDS_WIDGET_IDS.班主任),
    级部主任: pickStr(r, GOOD_DEEDS_WIDGET_IDS.级部主任),
    提交人: pickStr(r, GOOD_DEEDS_WIDGET_IDS.提交人),
    提交时间: pickStr(r, GOOD_DEEDS_WIDGET_IDS.提交时间),
  };
}

export function useGoodDeeds() {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["good-deeds", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.GOOD_DEEDS_INFO.app_id,
        entry_id: JDY_CONFIG.GOOD_DEEDS_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      const normalized = records.map((r, i) => normalizeGoodDeedsRecord(r, i));
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch, isFetching };
}

// ── 体质检测录入 ──────────────────────────────────────────────────

export interface PhysicalTestRecord {
  id: number;
  _id: string;
  录入学期: string;
  年级: string;
  班级名称: string;
  级部: string;
  姓名: string;
  学号: string;
  性别: string;
  班主任: string;
  级部主任: string;
  考试名称: string;
  考试时间: string;
  身高: string;
  体重: string;
  肺活量: string;
  "50米跑": string;
  坐位体前屈: string;
  立定跳远: string;
  "800米跑": string;
  "1000米跑": string;
  一分钟跳绳: string;
  一分钟仰卧起坐: string;
  引体向上: string;
  提交人: string;
  提交时间: string;
}

function normalizePhysicalTestRecord(r: JdyRecord, index: number): PhysicalTestRecord {
  return {
    id: index + 1,
    _id: r._id,
    录入学期: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.录入学期),
    年级: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.年级),
    班级名称: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.班级名称),
    级部: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.级部),
    姓名: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.姓名),
    学号: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.学号),
    性别: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.性别),
    班主任: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.班主任),
    级部主任: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.级部主任),
    考试名称: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.考试名称),
    考试时间: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.考试时间),
    身高: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.身高),
    体重: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.体重),
    肺活量: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.肺活量),
    "50米跑": pickStr(r, PHYSICAL_TEST_WIDGET_IDS["50米跑"]),
    坐位体前屈: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.坐位体前屈),
    立定跳远: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.立定跳远),
    "800米跑": pickStr(r, PHYSICAL_TEST_WIDGET_IDS["800米跑"]),
    "1000米跑": pickStr(r, PHYSICAL_TEST_WIDGET_IDS["1000米跑"]),
    一分钟跳绳: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.一分钟跳绳),
    一分钟仰卧起坐: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.一分钟仰卧起坐),
    引体向上: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.引体向上),
    提交人: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.提交人),
    提交时间: pickStr(r, PHYSICAL_TEST_WIDGET_IDS.提交时间),
  };
}

export function usePhysicalTest() {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["physical-test", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.PHYSICAL_TEST_INFO.app_id,
        entry_id: JDY_CONFIG.PHYSICAL_TEST_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      const normalized = records.map((r, i) => normalizePhysicalTestRecord(r, i));
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch, isFetching };
}

// ── 学生干部风采 ──────────────────────────────────────────────────

export interface StudentCadreeRecord {
  id: number;
  _id: string;
  录入学期: string;
  年级: string;
  班级名称: string;
  级部: string;
  姓名: string;
  学号: string;
  职务: string;
  自我介绍: string;
  任职宣言: string;
  家长寄语: string;
  德育处评价: string;
  学生照片: { name: string; url: string; key?: string }[];
  任职开始时间: string;
  任职结束时间: string;
  班主任: string;
  级部主任: string;
  提交人: string;
  提交时间: string;
}

function normalizeStudentCadreeRecord(r: JdyRecord, index: number): StudentCadreeRecord {
  return {
    id: index + 1,
    _id: r._id,
    录入学期: pickStr(r, STUDENT_CADREE_WIDGET_IDS.录入学期),
    年级: pickStr(r, STUDENT_CADREE_WIDGET_IDS.年级),
    班级名称: pickStr(r, STUDENT_CADREE_WIDGET_IDS.班级名称),
    级部: pickStr(r, STUDENT_CADREE_WIDGET_IDS.级部),
    姓名: pickStr(r, STUDENT_CADREE_WIDGET_IDS.姓名),
    学号: pickStr(r, STUDENT_CADREE_WIDGET_IDS.学号),
    职务: pickStr(r, STUDENT_CADREE_WIDGET_IDS.职务),
    自我介绍: pickStr(r, STUDENT_CADREE_WIDGET_IDS.自我介绍),
    任职宣言: pickStr(r, STUDENT_CADREE_WIDGET_IDS.任职宣言),
    家长寄语: pickStr(r, STUDENT_CADREE_WIDGET_IDS.家长寄语),
    德育处评价: pickStr(r, STUDENT_CADREE_WIDGET_IDS.德育处评价),
    学生照片: pickFiles(r, STUDENT_CADREE_WIDGET_IDS.学生照片),
    任职开始时间: pickStr(r, STUDENT_CADREE_WIDGET_IDS.任职开始时间),
    任职结束时间: pickStr(r, STUDENT_CADREE_WIDGET_IDS.任职结束时间),
    班主任: pickStr(r, STUDENT_CADREE_WIDGET_IDS.班主任),
    级部主任: pickStr(r, STUDENT_CADREE_WIDGET_IDS.级部主任),
    提交人: pickStr(r, STUDENT_CADREE_WIDGET_IDS.提交人),
    提交时间: pickStr(r, STUDENT_CADREE_WIDGET_IDS.提交时间),
  };
}

export function useStudentCadree() {
  const { data: allRecords, isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["student-cadree", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_CADREE_INFO.app_id,
        entry_id: JDY_CONFIG.STUDENT_CADREE_INFO.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
      const normalized = records.map((r, i) => normalizeStudentCadreeRecord(r, i));
      normalized.sort((a, b) => b.提交时间.localeCompare(a.提交时间));
      return normalized;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch, isFetching };
}

// ── 学生退/转/休学申请表 ──────────────────────────────────────────

export function useWithdrawal() {
  const { isPending, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["withdrawal", "list"],
    queryFn: async () => {
      return await jdyListAll({
        app_id: JDY_CONFIG.STUDENT_WITHDRAWAL_TRANSFER_LEAVE_APPLICATION.app_id,
        entry_id: JDY_CONFIG.STUDENT_WITHDRAWAL_TRANSFER_LEAVE_APPLICATION.entry_id,
        pageSize: 100,
        maxPages: 50,
      });
    },
    staleTime: 5 * 60 * 1000,
    enabled: false,
  });

  return { isPending, isError, error, refetch, isFetching };
}

// ── 学期信息 ──────────────────────────────────────────────────

export interface TermInfoRecord {
  _id: string;
  学期开始时间: string;
  学期结束时间: string;
  是否是当前学期: string;
  学年: string;
  学期季度: string;
  学期: string;
  学期名称: string;
  提交人: string;
  提交时间: string;
  更新时间: string;
}

function normalizeTermInfoRecord(r: JdyRecord): TermInfoRecord {
  return {
    _id: r._id,
    学期开始时间: pickStr(r, TERM_INFO_WIDGET_IDS.学期开始时间),
    学期结束时间: pickStr(r, TERM_INFO_WIDGET_IDS.学期结束时间),
    是否是当前学期: pickStr(r, TERM_INFO_WIDGET_IDS.是否是当前学期),
    学年: pickStr(r, TERM_INFO_WIDGET_IDS.学年),
    学期季度: pickStr(r, TERM_INFO_WIDGET_IDS.学期季度),
    学期: pickStr(r, TERM_INFO_WIDGET_IDS.学期),
    学期名称: pickStr(r, TERM_INFO_WIDGET_IDS.学期名称),
    提交人: pickStr(r, TERM_INFO_WIDGET_IDS.提交人),
    提交时间: pickStr(r, TERM_INFO_WIDGET_IDS.提交时间),
    更新时间: pickStr(r, TERM_INFO_WIDGET_IDS.更新时间),
  };
}

export function useTermInfo() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["term-info", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.TERM_INFO.app_id,
        entry_id: JDY_CONFIG.TERM_INFO.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      return records.map(normalizeTermInfoRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

// ── 年级信息 ──────────────────────────────────────────────────

export interface GradeInfoRecord {
  _id: string;
  年级: string;
  年级别名: string;
  年级固有名: string;
  入学年份: string;
  提交人: string;
  提交时间: string;
  更新时间: string;
}

function normalizeGradeInfoRecord(r: JdyRecord): GradeInfoRecord {
  return {
    _id: r._id,
    年级: pickStr(r, GRADE_INFO_WIDGET_IDS.年级),
    年级别名: pickStr(r, GRADE_INFO_WIDGET_IDS.年级别名),
    年级固有名: pickStr(r, GRADE_INFO_WIDGET_IDS.年级固有名),
    入学年份: pickStr(r, GRADE_INFO_WIDGET_IDS.入学年份),
    提交人: pickStr(r, GRADE_INFO_WIDGET_IDS.提交人),
    提交时间: pickStr(r, GRADE_INFO_WIDGET_IDS.提交时间),
    更新时间: pickStr(r, GRADE_INFO_WIDGET_IDS.更新时间),
  };
}

export function useGradeInfo() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["grade-info", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.GRADE_INFO.app_id,
        entry_id: JDY_CONFIG.GRADE_INFO.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      return records.map(normalizeGradeInfoRecord);
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
}

// ── 部门成员 ──────────────────────────────────────────────────

export interface DeptMemberRecord {
  username: string;
  name: string;
  departments: number[];
  integrate_id: string;
}

export function useDepartmentMembers(deptNo = 1, hasChild = true) {
  const { data: raw, isPending, isError, error, refetch } = useQuery({
    queryKey: ["department-members", deptNo, hasChild],
    queryFn: async () => {
      const res = await fetch("/api/jdy/department/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dept_no: deptNo, has_child: hasChild }),
      });
      if (!res.ok) throw new Error(`Failed to fetch department members (${res.status})`);
      const json = await res.json();
      return (json.users ?? []) as DeptMemberRecord[];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: raw ?? [], isPending, isError, error, refetch };
}