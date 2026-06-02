import { JDY_CONFIG } from "./jdy-api";

// ── 角色别名 — role_no from JDY /corp/role/list ──
const R = {
  招生核心领导: 5,
  教务处招办: 6,
  插班复读审核组: 7,
  人事科: 8,
  招生审批过程通知: 10,
  财务: 11,
  招生信息审核和修改: 16,
  招生添加班级组: 18,
  技术: 19,
  党员管理: 21,
  师资管理: 22,
  教研组长: 24,
  学生发展处核心领导: 25,
  安全办核心领导: 26,
  后勤核心领导: 27,
  课程核心领导: 28,
  学校核心领导: 29,
  干部考核组: 30,
  支部委员干事备课组长考核组: 31,
  部门分管领导: 32,
  双周工作计划负责人: 33,
  学生发展处副主任: 34,
  课程处领导: 35,
  校长: 36,
  学校办公室中层领导: 38,
  学校办公室负责人: 39,
  学校办公室分管校领导: 40,
  学生发展处分管校领导: 42,
  学生发展处负责人: 43,
  学生发展处中层领导: 44,
  课程教学处分管校领导: 46,
  课程教学处负责人: 47,
  课程教学处中层领导: 48,
  师资培养处分管校领导: 50,
  师资培养处负责人: 51,
  师资培养处中层领导: 52,
  全体教师: 53,
  高一级部主任: 54,
  高二级部主任: 55,
  高三级部主任: 56,
  后勤服务处负责人: 58,
  后勤服务处中层领导: 59,
  后勤服务处分管校领导: 60,
  安全办负责人: 62,
  安全办中层领导: 63,
  安全办分管校领导: 64,
  学校办公室干事: 65,
  教官队负责人: 67,
  教官队副队长: 68,
  教官队: 69,
  宣传科负责人: 71,
  宣传科分管校领导: 72,
  宣传科分管党总支领导: 73,
  师资培养处干事: 74,
} as const;

type RoleName = keyof typeof R;

export interface PermSpec {
  roles?: number[];
  depts?: number[];
  members?: string[];
}

/** 纯角色权限 — 最常用，向后兼容 */
const roles = (...names: RoleName[]): PermSpec => ({
  roles: names.map(n => R[n]),
});

/** 混合权限：角色 + 部门 + 具体成员，三者 OR 关系 */
export const perm = (s: PermSpec): PermSpec => s;

// ── 部门别名 — dept_no from config/department_list.json ──
export const D = {
  后勤服务处: 5,
  餐厅: 8,
  财务室: 12,
  小卖部: 13,
  宏德教师群: 282162361,
  课程教学处: 282162363,
  学生发展处: 282162365,
  安全办: 282162367,
  艺体办: 282162368,
  招宣部: 282162373,
  招生办公室: 282162374,
  党总支办公室: 282162372,
  学校办公室: 282162376,
  核心委: 282162377,
  宣传科: 282162375,
  班主任: 282162378,
  信息部: 282162379,
  保健室: 282162380,
  门卫室: 282162381,
  保洁室: 282162382,
  文印室: 282162383,
  科任教师: 282162384,
  教官队部门: 282162401,
  校园智慧办: 282162430,
  师资培养处: 282162435,
  外联人员: 282162436,
} as const;

export type PermAction = "create" | "update" | "delete" | "import" | "export" | "view" | "batch_print" | "batch_update" | "copy";

// Maps entry_id → required permissions per action.
// An entry_id NOT in this map is public (all actions allowed).
// An omitted action or empty PermSpec = public.
export const FORM_PERMISSIONS: Record<
  string,
  Partial<Record<PermAction, PermSpec>>
> = {
  // 一师一案 教研活动
  [JDY_CONFIG.JIAOYAN_ACTIVITY.entry_id]: {
    create: roles("技术", "师资管理", "学校核心领导"),
    // delete: perm({
    //   roles:   roles("技术", "师资管理"),
    //   depts:   [D.教官队部门],
    //   members: ["韦晓明", "关胜军"],
    // }),
    update: roles("技术", "师资管理"),
    delete: roles("技术", "师资管理"),
    export: roles("技术", "师资管理"),
    view: roles("技术", "师资管理"),
    batch_print: roles("技术", "师资管理", "学校核心领导"),
    batch_update: roles("技术", "师资管理"),
    copy: roles("技术", "师资管理"),
  },

  // 一师一案 备课活动
  [JDY_CONFIG.BEIKE_ACTIVITY.entry_id]: {
    create: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
    update: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
    delete: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
    export: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长"),
    view: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长"),
    batch_print: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长"),
    batch_update: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
    copy: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
  },

  // 一师一案 科技节活动记录
  [JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id]: {
    create: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
    update: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
    delete: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
    export: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长", "师资培养处干事"),
    view: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长", "师资培养处干事"),
    batch_print: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长", "师资培养处干事"),
    batch_update: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
    copy: roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"),
  },

  // 一师一案 教师所带班级排名
  [JDY_CONFIG.CLASS_RANK.entry_id]: {
    create: roles("技术", "师资管理"),
    update: roles("技术", "师资管理"),
    delete: roles("技术", "师资管理"),
    import: roles("技术", "师资管理"),
    export: roles("技术", "师资管理"),
    view: roles("技术", "师资管理", "学校核心领导"),
    batch_print: roles("技术", "师资管理", "学校核心领导"),
  },

  // 宿舍考勤
  [JDY_CONFIG.DORM_ATTENDANCE.entry_id]: {
    create: roles("教官队"),
    update: roles("教官队"),
    delete: roles("教官队负责人", "教官队副队长", "教官队"),
  },

  // 一生一案 学生成绩表
  [JDY_CONFIG.STUDENT_SCORE.entry_id]: {
    view: roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导", "学生发展处分管校领导", "学生发展处负责人", "学生发展处中层领导", "校长"),
    create: roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导"),
    delete: roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导"),
    import: roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导"),
    export: roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导", "学生发展处分管校领导", "学生发展处负责人", "学生发展处中层领导", "校长"),
    batch_print: roles("校长"),
  },

  // 一生一案 谈心谈话记录表
  [JDY_CONFIG.STUDENT_HEART_TO_HEART_TALK.entry_id]: {
    view: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    create: roles("技术", "学生发展处核心领导"),
    update: roles("技术", "学生发展处核心领导"),
    delete: roles("技术", "学生发展处核心领导"),
    export: roles("技术", "学生发展处核心领导", "校长"),
    batch_print: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    batch_update: roles("技术", "学生发展处核心领导"),
    copy: roles("技术", "学生发展处核心领导"),
  },

  // 一生一案 学情分析记录表
  [JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.entry_id]: {
    view: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    create: roles("技术", "学生发展处核心领导"),
    delete: roles("技术", "学生发展处核心领导"),
    export: roles("技术", "学生发展处核心领导", "校长"),
    batch_print: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
  },

  // 一生一案 学生获奖记录表
  [JDY_CONFIG.STUDENT_AWARD_INFO.entry_id]: {
    view: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    create: roles("技术", "学生发展处核心领导"),
    update: roles("技术", "学生发展处核心领导"),
    delete: roles("技术", "学生发展处核心领导"),
    export: roles("技术", "学生发展处核心领导", "校长"),
    batch_print: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    batch_update: roles("技术", "学生发展处核心领导"),
    copy: roles("技术", "学生发展处核心领导"),
  },

  // 一生一案 好人好事记录
  [JDY_CONFIG.GOOD_DEEDS_INFO.entry_id]: {
    view: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    create: roles("技术", "学生发展处核心领导"),
    update: roles("技术", "学生发展处核心领导"),
    delete: roles("技术", "学生发展处核心领导"),
    export: roles("技术", "学生发展处核心领导", "校长"),
    batch_print: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    batch_update: roles("技术", "学生发展处核心领导"),
    copy: roles("技术", "学生发展处核心领导"),
  },

  // 一生一案 体质检测录入
  [JDY_CONFIG.PHYSICAL_TEST_INFO.entry_id]: {
    view: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    create: roles("技术", "学生发展处核心领导"),
    update: roles("技术", "学生发展处核心领导"),
    delete: roles("技术", "学生发展处核心领导"),
    export: roles("技术", "学生发展处核心领导"),
    batch_print: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    batch_update: roles("技术", "学生发展处核心领导"),
    copy: roles("技术", "学生发展处核心领导"),
  },

  // 一生一案 学生干部
  [JDY_CONFIG.STUDENT_CADREE_INFO.entry_id]: {
    view: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    create: roles("技术", "学生发展处核心领导"),
    update: roles("技术", "学生发展处核心领导"),
    delete: roles("技术", "学生发展处核心领导"),
    export: roles("技术", "学生发展处核心领导"),
    batch_print: roles("技术", "学生发展处核心领导", "学校核心领导", "校长"),
    batch_update: roles("技术", "学生发展处核心领导"),
    copy: roles("技术", "学生发展处核心领导"),
  },

  // 一生一案 学生花名册
  [JDY_CONFIG.STUDENT_INFO.entry_id]: {
    view: roles("人事科", "招生核心领导", "财务", "学校核心领导", "校长"),
    update: roles("人事科", "招生核心领导"),
    create: roles("人事科", "招生核心领导"),
    export: roles("技术", "学生发展处核心领导", "财务", "校长"),
    batch_print: roles("人事科", "招生核心领导", "学校核心领导", "校长"),
  },

  // 一生一案 学生返校登记表
  [JDY_CONFIG.STUDENT_RETURN_SCHOOL.entry_id]: {
    view: roles("学校核心领导", "技术"),
    export: roles("校长"),
    batch_print: roles("学校核心领导", "校长", "技术"),
  },
};

// ── 菜单可见性 — PageKey → PermSpec, 未配置的默认所有人可见 ──
import type { PageKey } from "@/app/page";

export const MENU_PERMISSIONS: Partial<Record<PageKey, PermSpec>> = {
  // 一生一案
  "student-dashboard":       roles("学生发展处核心领导", "学校核心领导", "校长", "技术"),
  "student-home":            roles("教官队", "学生发展处核心领导", "学校核心领导", "技术"),
  "student-roster":          roles("人事科", "招生核心领导", "学生发展处核心领导", "学校核心领导", "技术"),
  "talk-record":             roles("学生发展处核心领导", "学校核心领导", "技术"),
  "student-award":           roles("学生发展处核心领导", "学校核心领导", "技术"),
  "good-deeds":              roles("学生发展处核心领导", "学校核心领导", "技术"),
  "physical-test":           roles("学生发展处核心领导", "学校核心领导", "技术"),
  "student-cadree":          roles("学生发展处核心领导", "学校核心领导", "技术"),
  "return-register":         roles("学生发展处核心领导", "学校核心领导", "技术"),
  "withdrawal-form":         roles("学生发展处核心领导", "学校核心领导", "技术"),
  "class-transfer":          roles("学生发展处核心领导", "学校核心领导", "技术"),
  "dorm-attendance":         roles("教官队", "学生发展处核心领导", "学校核心领导", "技术"),
  "learning-analysis-stats": roles("学生发展处核心领导", "学校核心领导", "校长", "技术"),
  "learning-analysis-table": roles("学生发展处核心领导", "学校核心领导", "校长", "技术"),
  "student-score":           roles("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导", "学生发展处核心领导", "学校核心领导", "技术"),

  // 一师一案
  "research-dashboard":      roles("教研组长", "师资管理", "学校核心领导", "技术"),
  "teacher-cert":            roles("人事科", "师资管理", "技术"),
  "title-info":              roles("人事科", "师资管理", "技术"),
  "honor-title":             roles("人事科", "师资管理", "技术"),
  "award-record":            roles("人事科", "师资管理", "技术"),
  "paper":                   roles("人事科", "师资管理", "技术"),
  "project":                 roles("人事科", "师资管理", "技术"),
  "works":                   roles("人事科", "师资管理", "技术"),
  "teacher-training":        roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "技术"),
  "work-history":            roles("人事科", "师资管理", "技术"),
  "education":               roles("人事科", "师资管理", "技术"),
  "part-time":               roles("人事科", "师资管理", "技术"),
  "class-rank":              roles("师资管理", "学校核心领导", "技术"),
  "civilized-class":         roles("学生发展处核心领导", "学校核心领导", "技术"),
  "civilized-dorm":          roles("学生发展处核心领导", "学校核心领导", "技术"),
  "science-fest-dashboard":  roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "技术"),
  "science-fest-form":       roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "技术"),
  "lesson-prep-record":      roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "技术"),
  "lesson-prep-analysis":    roles("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "技术"),
  "research-activity-analysis": roles("教研组长", "师资管理", "学校核心领导", "技术"),
  "research-activity-record":   roles("教研组长", "师资管理", "技术"),

  // 基础数据
  "subject-config":   roles("师资管理", "技术"),
  "elective-subject": roles("师资管理", "技术"),
  "semester-config":  roles("师资管理", "技术"),
  "grade-config":     roles("师资管理", "技术"),
};
