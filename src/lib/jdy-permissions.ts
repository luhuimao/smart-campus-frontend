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

/** 混合权限：角色 + 部门 + 具体成员，三者 OR 关系 */
export function perm(s: PermSpec): PermSpec { return s; }

/** 提取角色编号数组（用于 perm 内嵌） */
const roleIds = (...names: RoleName[]): number[] => names.map(n => R[n]);

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
    create: perm({ roles: roleIds("师资管理", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    update: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    delete: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    export: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    view: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    batch_print: perm({ roles: roleIds("师资管理", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    batch_update: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    copy: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
  },

  // 一师一案 备课活动
  [JDY_CONFIG.BEIKE_ACTIVITY.entry_id]: {
    create: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    update: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    delete: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    export: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    view: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    batch_print: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    batch_update: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    copy: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
  },

  // 一师一案 科技节活动记录
  [JDY_CONFIG.SCIENCE_FEST_ACTIVITY.entry_id]: {
    create: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    update: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    delete: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    export: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长", "师资培养处干事"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    view: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长", "师资培养处干事"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    batch_print: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导", "校长", "师资培养处干事"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    batch_update: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    copy: perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
  },

  // 一师一案 教师所带班级排名
  [JDY_CONFIG.CLASS_RANK.entry_id]: {
    create: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    update: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    delete: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    import: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    export: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    view: perm({ roles: roleIds("师资管理", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    batch_print: perm({ roles: roleIds("师资管理", "学校核心领导"), depts: [], members: ["张嘉男"] }),
  },

  // 宿舍考勤
  [JDY_CONFIG.DORM_ATTENDANCE.entry_id]: {
    create: perm({ roles: roleIds("教官队"), depts: [], members: ["张嘉男"] }),
    update: perm({ roles: roleIds("教官队"), depts: [], members: ["张嘉男"] }),
    delete: perm({ roles: roleIds("教官队负责人", "教官队副队长", "教官队"), depts: [], members: ["张嘉男"] }),
  },

  // 一生一案 学生成绩表
  [JDY_CONFIG.STUDENT_SCORE.entry_id]: {
    view: perm({ roles: roleIds("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导", "学生发展处分管校领导", "学生发展处负责人", "学生发展处中层领导", "校长"), depts: [], members: ["张嘉男"] }),
    create: perm({ roles: roleIds("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导"), depts: [], members: ["张嘉男"] }),
    delete: perm({ roles: roleIds("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导"), depts: [], members: ["张嘉男"] }),
    import: perm({ roles: roleIds("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导"), depts: [], members: ["张嘉男"] }),
    export: perm({ roles: roleIds("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导", "学生发展处分管校领导", "学生发展处负责人", "学生发展处中层领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_print: perm({ roles: roleIds("校长"), depts: [], members: [] }),
  },

  // 一生一案 谈心谈话记录表
  [JDY_CONFIG.STUDENT_HEART_TO_HEART_TALK.entry_id]: {
    view: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    create: perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    delete: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    export: perm({ roles: roleIds("学生发展处核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_print: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    copy: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
  },

  // 一生一案 学情分析记录表
  [JDY_CONFIG.STUDENT_LEARNING_ANALYSIS.entry_id]: {
    view: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    create: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    delete: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    export: perm({ roles: roleIds("学生发展处核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_print: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
  },

  // 一生一案 学生获奖记录表
  [JDY_CONFIG.STUDENT_AWARD_INFO.entry_id]: {
    view: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    create: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    delete: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    export: perm({ roles: roleIds("学生发展处核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_print: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    copy: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
  },

  // 一生一案 好人好事记录
  [JDY_CONFIG.GOOD_DEEDS_INFO.entry_id]: {
    view: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    create: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    delete: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    export: perm({ roles: roleIds("学生发展处核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_print: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    copy: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
  },

  // 一生一案 体质检测录入
  [JDY_CONFIG.PHYSICAL_TEST_INFO.entry_id]: {
    view: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    create: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    delete: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    export: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    batch_print: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    copy: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
  },

  // 一生一案 学生干部
  [JDY_CONFIG.STUDENT_CADREE_INFO.entry_id]: {
    view: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    create: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    delete: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    export: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    batch_print: perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    batch_update: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
    copy: perm({ roles: roleIds("学生发展处核心领导"), depts: [], members: ["张嘉男"] }),
  },

  // 一生一案 学生花名册
  [JDY_CONFIG.STUDENT_INFO.entry_id]: {
    view: perm({ roles: roleIds("人事科", "招生核心领导", "财务", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
    update: perm({ roles: roleIds("人事科", "招生核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    create: perm({ roles: roleIds("人事科", "招生核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    delete: perm({ roles: roleIds("人事科"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    export: perm({ roles: roleIds("学生发展处核心领导", "财务", "校长"), depts: [], members: ["张嘉男"] }),
    batch_print: perm({ roles: roleIds("人事科", "招生核心领导", "学校核心领导", "校长"), depts: [], members: ["张嘉男"] }),
  },

  // 一生一案 学生返校登记表
  [JDY_CONFIG.STUDENT_RETURN_SCHOOL.entry_id]: {
    view: perm({ roles: roleIds("学校核心领导"), depts: [], members: [] }),
    update: perm({ roles: roleIds("人事科", "招生核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    create: perm({ roles: roleIds("人事科", "招生核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    delete: perm({ roles: roleIds("人事科"), depts: [], members: ["卢辉茂", "张嘉男"] }),
    export: perm({ roles: roleIds("校长"), depts: [], members: [] }),
    batch_print: perm({ roles: roleIds("学校核心领导", "校长"), depts: [], members: [] }),
  },
};

// ── 菜单可见性 — PageKey → PermSpec, 未配置的默认所有人可见 ──

export const MENU_PERMISSIONS = {
  // ═══ 一生一案 ═══
  "student-dashboard": perm(
    {
      roles: roleIds(
        "学生发展处核心领导",
        "学校核心领导",
        "校长"
      ),
      depts: [],
      members: ["卢辉茂", "张嘉男"]
    }), // 学生管理看板
  "student-home": perm({
    roles: roleIds(
      "教官队",
      "学生发展处核心领导",
      "学校核心领导"),
    depts: [],
    members: ["卢辉茂", "张嘉男"]
  }), // 宿舍考勤看板
  "student-roster": perm({
    roles: roleIds(
      "人事科",
      "招生核心领导",
      "学生发展处核心领导",
      "学校核心领导"),
    depts: [],
    members: ["卢辉茂", "张嘉男"]
  }), // 学生花名册
  "talk-record": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 一生一案谈心谈话记录表
  "student-award": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 学生获奖记录
  "good-deeds": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 好人好事记录
  "physical-test": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 体质检测录入
  "student-cadree": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 学生干部风采
  "return-register": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 返校登记表
  "withdrawal-form": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 学生退/转/休学申请表
  "class-transfer": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 转科（班）申请表
  "dorm-attendance": perm({ roles: roleIds("教官队", "学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 宿舍考勤记录
  "learning-analysis-stats": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 学情分析统计表
  "learning-analysis-table": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导", "校长"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 学情分析表
  "student-score": perm({ roles: roleIds("课程教学处分管校领导", "课程教学处负责人", "课程教学处中层领导", "学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 学生成绩表

  // ═══ 一师一案 ═══
  "research-dashboard": perm({ roles: roleIds("教研组长", "师资管理", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 教师看板
  "teacher-cert": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 教师资格证
  "title-info": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 职称信息
  "honor-title": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 荣誉称号
  "award-record": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 获奖记录
  "paper": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 论文
  "project": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 课题
  "works": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 著作
  "teacher-training": perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 教师培训
  "work-history": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 工作履历
  "education": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 教育经历
  "part-time": perm({ roles: roleIds("人事科", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 教学兼职
  "class-rank": perm({ roles: roleIds("师资管理", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 教师所带班级排名
  "civilized-class": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 班主任所带文明班级
  "civilized-dorm": perm({ roles: roleIds("学生发展处核心领导", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 班主任所带文明宿舍
  "science-fest-dashboard": perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 科技节活动看板
  "science-fest-form": perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 科技节活动登记
  "lesson-prep-record": perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 备课组活动记录
  "lesson-prep-analysis": perm({ roles: roleIds("师资培养处分管校领导", "师资培养处负责人", "师资培养处中层领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 备课活动数据分析
  "research-activity-analysis": perm({ roles: roleIds("教研组长", "师资管理", "学校核心领导"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 教研活动数据分析
  "research-activity-record": perm({ roles: roleIds("教研组长", "师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 教研活动记录

  // ═══ 基础数据 ═══
  "subject-config": perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 科目
  "elective-subject": perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 选考科目
  "semester-config": perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 学期
  "grade-config": perm({ roles: roleIds("师资管理"), depts: [], members: ["卢辉茂", "张嘉男"] }), // 年级
};
