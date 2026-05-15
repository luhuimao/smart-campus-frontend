"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { JDY_CONFIG, WIDGET_IDS, BEIKE_WIDGET_IDS, SCIENTCE_FEST_WIDGET_IDS, CLASS_RANK_WIDGET_IDS, DORM_ATTENDANCE_WIDGET_IDS, jdyListAll, type JdyRecord } from "@/lib/jdy-api";

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
  应到人数: number;
  实到人数: number;
  地点: string;
  参与人员: string;
  内容记录: string;
  备注: string;
  照片: { name: string; url: string }[];
  附件: { name: string; url: string }[];
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

function pickFiles(record: JdyRecord, widgetId: string): { name: string; url: string }[] {
  const v = record[widgetId];
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => ({ name: (x as { name?: string }).name ?? "", url: (x as { url?: string }).url ?? "" }))
    .filter((f) => f.url);
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
    应到人数: pickNum(r, WIDGET_IDS.应到人数),
    实到人数: pickNum(r, WIDGET_IDS.实到人数),
    地点: pickStr(r, WIDGET_IDS.地点),
    参与人员: pickStr(r, WIDGET_IDS.参与人员),
    内容记录: pickStr(r, WIDGET_IDS.内容记录),
    备注: pickStr(r, WIDGET_IDS.备注),
    照片: pickFiles(r, WIDGET_IDS.照片),
    附件: pickFiles(r, WIDGET_IDS.附件),
  }));
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
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
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

  return { data: derived, filterOptions, raw: filtered, isPending, isError, error, refetch };
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
  照片: { name: string; url: string }[];
  附件: { name: string; url: string }[];
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
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["beike-dashboard", "activity-list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.BEIKE_ACTIVITY.app_id,
        entry_id: JDY_CONFIG.BEIKE_ACTIVITY.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      return records.map(normalizeBeikeRecord);
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

  return { data: derived, filterOptions, raw: filtered, isPending, isError, error, refetch };
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
  };
}

export interface ScienceFestFilters {
  group: string;
  teacher: string;
}

export function useScienceFestDashboard(filters?: ScienceFestFilters) {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["science-fest", "activity-list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.app_id,
        entry_id: JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      return records.map(normalizeScienceFestRecord);
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

  return { raw, filterOptions, isPending, isError, error, refetch };
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
  };
}

export function useClassRank() {
  const { data: allRecords, isPending, isError, error, refetch } = useQuery({
    queryKey: ["class-rank", "list"],
    queryFn: async () => {
      const records = await jdyListAll({
        app_id: JDY_CONFIG.CLASS_RANK.app_id,
        entry_id: JDY_CONFIG.CLASS_RANK.entry_id,
        pageSize: 100,
        maxPages: 20,
      });
      return records.map((r, i) => normalizeClassRankRecord(r, i));
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60_000,
  });

  return { raw: allRecords ?? [], isPending, isError, error, refetch };
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
        maxPages: 20,
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
