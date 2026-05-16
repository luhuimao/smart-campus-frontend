import { scheduler } from "./request-scheduler";

export const JDY_CONFIG = {
  JIAOYAN_ACTIVITY: {//一师一案教研活动记录 app ID，entry ID
    app_id: "68008ff60d080d59b8b67223",
    entry_id: "6746c6bed047a20b2b7731eb",
  },
  BEIKE_ACTIVITY: {//一师一案备课活动记录 app ID，entry ID
    app_id: "68008ff60d080d59b8b67223",
    entry_id: "6746d89388ae82153bd2093a",
  },
  SCIENCE_FEST_ACTIVITY: {//一师一案科技节活动记录 app ID，entry ID
    app_id: "68008ff60d080d59b8b67223",
    entry_id: "69b7cbc947f0df05ec5cc7dc",
  },
  CLASS_RANK: {//一师一案-教师评价-教师所带班级排名 app ID，entry ID
    app_id: "67fe190a3b9b96ddf443c3a2",
    entry_id: "695e2a0c03a46f3064d18fbb",
  },
  DORM_ATTENDANCE: {//一生一案-宿舍考勤记录 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "684f88164dbd646e7a31b2eb",
  },
  STUDENT_INFO: {//一生一案-学生花名册 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "67fd24ce564e9ac9ae9f783b",
  },
  STUDENT_SCORE: {//一生一案-学生成绩表 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "6a05ddad85572d6705a80365",
  },
  STUDENT_CHEN_WU_WAN_JIAN: {//一生一案-学生晨午晚检表 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "68d4c6d8e3ca6fff0a617ef4",
  },
  STUDENT_RETURN_SCHOOL: {//一生一案-学生返校登记表 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "6875fe315fb45f180a16f256",
  },
  STUDENT_LEAVE_APPLICATION: {//一生一案-学生请假表 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "6875fe5bb54b9736c2987d4c",
  },
  STUDENT_SUPPORT_STATUS: {//一生一案 - 学生资助情况表 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "687778ddcdb84f994f572b54",
  },
  STUDENT_HEART_TO_HEART_TALK: {//一生一案 - 谈心谈话记录表 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "6923cb96f98d70231e7dfe0c",
  },
    STUDENT_LEARNING_ANALYSIS: {//一生一案 - 学情分析记录表 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "69ce20897c81a340631c6825",
  },
} as const;
//教研活动记录
export const WIDGET_IDS = {
  学期: "_widget_1732691646451",
  教研主题: "_widget_1732691646452",
  教研学科: "_widget_1732691646458",
  时间: "_widget_1732691646453",
  周次: "_widget_1765435056130",
  地点: "_widget_1765444447933",
  教研组: "_widget_1765444447936",
  教研组长: "_widget_1765446318144",
  主持人: "_widget_1732691646460",
  记录人: "_widget_1733213305523",
  参与人员: "_widget_1732691646459",
  应到人数: "_widget_1773652483451",
  实到人数: "_widget_1773652483452",
  备注: "_widget_1773652483454",
  内容记录: "_widget_1732691646461",
  照片: "_widget_1733213305518",
  附件: "_widget_1733213305520",
  学科部门: "_widget_1732691646464",
  教研参加次数: "_widget_1732691646465",
} as const;
//备课活动记录
export const BEIKE_WIDGET_IDS = {
  学期: "_widget_1732696211408",
  主题: "_widget_1732696211409",
  备课学科: "_widget_1765444555656",
  时间: "_widget_1732696211410",
  周次: "_widget_1765441909812",
  地点: "_widget_1732696211411",
  备课组: "_widget_1732696211412",
  备课组长: "_widget_1732696211419",
  主持人: "_widget_1732696211421",
  记录人: "_widget_1732696211425",
  参与人员: "_widget_1732696211420",
  应到人数: "_widget_1773653435868",
  实到人数: "_widget_1773653435869",
  内容记录: "_widget_1732696211423",
  备注: "_widget_1773653435872",
  照片: "_widget_1733300024349",
  附件: "_widget_1733300024357",
  学科部门: "_widget_1732696211426",
  备课参加次数: "_widget_1732696211427",
} as const;
//科技节活动记录
export const SCIENTCE_FEST_WIDGET_IDS = {
  活动名称: "_widget_1773731753579",
  教研组: "_widget_1773652937032",
  教研组长: "_widget_1773801845644",
  活动负责教师: "_widget_1773652937031",
  活动时间: "_widget_1773652937025",
  活动地点: "_widget_1773652937026",
  参与人员: "_widget_1773800483910",
  活动描述: "_widget_1773652937028",
  活动图片: "_widget_1773652937029",
  活动视频: "_widget_1773652937030",
  更多图片: "_widget_1778718276085",
  备注: "_widget_1773800483911",
} as const;
//教师所带班级排名
export const CLASS_RANK_WIDGET_IDS = {
  学期: "_widget_1767778829291",
  考试名称: "_widget_1767778829292",
  年级: "_widget_1767778829293",
  班级: "_widget_1767778829294",
  教师姓名: "_widget_1767779019989",
  学科: "_widget_1767778829296",
  班级排名: "_widget_1767778829297",
} as const;
//宿舍考勤记录
export const DORM_ATTENDANCE_WIDGET_IDS = {
  学期: "_widget_1770018643740",
  宿舍号: "dorm",
  宿舍楼栋: "dorm_floor",
  场景: "scene",
  学生编号: "stu_num",
  学生姓名: "stu_name",
  年级: "_widget_1769744008717",
  级部: "_widget_1769744008719",
  年班级名称级: "_widget_1769744008718",
  班主任: "_widget_1769744008720",
  级部主任: "_widget_1769744008721",
  检查项: "type",
  扣分项: "disciplinary_type",
  扣分: "points",
  违纪情况说明: "illustrate",
  违纪图片: "images",
  提交人手机号: "phone",
  事务id: "transaction_id",
  file_keys: "file_keys",
  提交时间: "createTime",
} as const;
//学生请假表
export const STUDENT_LEAVE_WIDGET_IDS = {
  工作流id: "id",
  学期: "term",
  请假学生姓名: "name",
  宏德学号: "code",
  请假类型: "type",
  请假原因说明: "reason",
  请假开始时间: "start_time",
  请假结束时间: "end_time",
  请假时长_文本: "days",
  请假时长_数字: "days_num",
  请假学生年级: "grade_name",
  请假学生级部: "grade_level",
  请假学生班级: "class_name",
  班主任: "class_teacher",
  班主任_企微: "class_teacher_info",
  级部主任_企微: "grade_level_director_info",
  状态: "status",
  申请时间: "created_at",
} as const;
//学生成绩表
export const STUDENT_SCORE_WIDGET_IDS = {
  学期: "_widget_1776782095344",
  考试名称: "_widget_1776782095351",
  班级: "_widget_1776782095362",
  学生姓名: "_widget_1776782095356",
  总分: "_widget_1778769330337",
  总分排名: "_widget_1778769330338",
  语文成绩: "_widget_1778769330339",
  数学成绩: "_widget_1778769330340",
  英语成绩: "_widget_1778769330341",
  物理成绩: "_widget_1778769330342",
  历史成绩: "_widget_1778769330343",
  化学成绩: "_widget_1778769330344",
  生物成绩: "_widget_1778769330345",
  政治成绩: "_widget_1778769330346",
  地理成绩: "_widget_1778769330347",
  日语成绩: "_widget_1778769330348",
} as const;
//学生晨午晚检表
export const HEALTH_CHECK_WIDGET_IDS = {
  学期: "_widget_1660617096884",
  班主任: "_widget_1653982759289",
  填报日期_日期: "_widget_1653982759443",
  填报日期_文本: "_widget_1663566068162",
  重复判断: "_widget_1663322224984",
  上报类型: "_widget_1663229600455",
  检查情况: "_widget_1764225292538",
  班级: "_widget_1764315801999",
  级部: "_widget_1764315802009",
  年级: "_widget_1653982759560",
  年级别名: "_widget_1756350359511",
  班级名称: "_widget_1653982759579",
  年级主任: "_widget_1735896331220",
  应到学生人数: "_widget_1653982759598",
  实到学生人数: "_widget_1653982759651",
  因病缺课学生人数: "_widget_1764229745749",
  发热姓名: "_widget_1685853408791",
  发热学生人数: "_widget_1653982759695",
  发热具体情况说明: "_widget_1653982759714",
  流感确诊学生姓名: "_widget_1685853408800",
  流感确诊学生人数: "_widget_1653982759780",
  流感确诊具体情况说明: "_widget_1653982759901",
  是否有咽痛流涕咳嗽学生姓名: "_widget_1685853408802",
  是否有咽痛流涕咳嗽学生数: "_widget_1653982759962",
  是否有咽痛流涕咳嗽情况说明: "_widget_1653982759981",
  乏力学生姓名: "_widget_1756785450701",
  乏力学生数: "_widget_1756785450703",
  乏力情况说明: "_widget_1653982760025",
  腹泻学生姓名: "_widget_1764229745719",
  腹泻学生数: "_widget_1764229745721",
  腹泻情况说明: "_widget_1764229745722",
  呼吸困难学生姓名: "_widget_1764229745731",
  呼吸困难学生数: "_widget_1764229745733",
  呼吸困难情况说明: "_widget_1764229745734",
  其他症状学生姓名: "_widget_1764229745736",
  其他症状学生数: "_widget_1764229745738",
  其他症状情况说明: "_widget_1764229745739",
} as const;
//学生返校登记表
export const STUDENT_RETURN_SCHOOL_WIDGET_IDS = {
  填报日期:                 "_widget_1736929837045",
  学期:                     "_widget_1752654559799",
  是否当前学期:             "_widget_1752654559800",
  提交人:                   "_widget_1736930971161",
  班主任编号:               "_widget_1752654559786",
  班级名称:                 "_widget_1736927246680",
  年级:                     "_widget_1752654559814",
  级部:                     "_widget_1767086981553",
  年级别名:                 "_widget_1767086981554",
  年级总人数:               "_widget_1752656478041",
  应到学生人数:             "_widget_1736929837049",
  返校学生人数:             "_widget_1736929837089",
  未返校学生人数:           "_widget_1736929837051",
  转入学生人数:             "_widget_1736929837090",
  班主任:                   "_widget_1767086981552",
  级部主任:                 "_widget_1767086981560",
  病假学生姓名:             "_widget_1736929837055",
  病假学生人数:             "_widget_1736929837061",
  病假具体情况说明:         "_widget_1736929837068",
  事假学生姓名:             "_widget_1736929837065",
  事假学生人数:             "_widget_1736929837067",
  事假具体情况说明:         "_widget_1736929837069",
  在外学习培训学生姓名:     "_widget_1736929837074",
  在外学习培训学生人数:     "_widget_1736929837076",
  在外学习培训具体情况说明: "_widget_1736929837077",
  休学学生姓名:             "_widget_1736929837079",
  休学学生人数:             "_widget_1736929837081",
  休学具体情况说明:         "_widget_1736929837082",
  流失学生姓名:             "_widget_1736929837084",
  流失学生人数:             "_widget_1736929837086",
  流失学生具体情况说明:     "_widget_1736929837087",
} as const;
//学生资助情况表
export const STUDENT_SUPPORT_STATUS_WIDGET_IDS = {
  年级:         "_widget_1752721677360",
  班级名称:     "_widget_1752721677363",
  学生姓名:     "_widget_1752723308848",
  学生学号:     "_widget_1554887983375",
  性别:         "_widget_1752721677362",
  家长姓名:     "_widget_1554887983507",
  手机号码:     "_widget_1554887983554",
  当前学期:     "_widget_1554887983250",
  发放学期:     "_widget_1554887983265",
  资助项目名称: "_widget_1752721677359",
  资助单位:     "_widget_1554887983826",
  资助金额:     "_widget_1554887983871",
  备注:         "_widget_1554887983992",
} as const;
//谈心谈话记录表
export const STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS = {
  谈心教师:         "_widget_1763971800147",
  班级名称:         "_widget_1770193644178",
  学生姓名:         "_widget_1763971800133",
  学生身份证:       "_widget_1763971800175",
  学生学号:         "_widget_1763971800176",
  谈心教师学科:     "_widget_1763971800152",
  谈心谈话时间:     "_widget_1763971800155",
  谈话内容:         "_widget_1763971800158",
  谈心谈话内容记录: "_widget_1763971800160",
  教师指导建议:     "_widget_1763971800164",
  沟通照片:         "_widget_1763971800168",
} as const;
//学情分析记录表
export const STUDENT_LEARNING_ANALYSIS_WIDGET_IDS = {
  班级:           "_widget_1775116425061",
  学生姓名:       "_widget_1775116425063",
  学科:           "_widget_1775117349258",
  学情分析开始时间: "_widget_1775117349247",
  学情分析结束时间: "_widget_1775117349248",
  掌握较好的知识点: "_widget_1775117349249",
  掌握不足的知识点: "_widget_1775117349250",
  教师指导措施:   "_widget_1775117349251",
  提交人: "creator",
  提交时间:"createTime",
} as const;
//学生花名册
export const STUDENT_INFO_WIDGET_IDS = {
  学籍状态_教务: "student_status",
  学籍状态_运营: "student_status_two",
  证件照: "id_photo",
  生活照: "life_phone",
  姓名: "name",
  曾用名: "former_name",
  身份证号: "id_card",
  宏德学号: "code",
  全国学籍号: "country_card",
  民族: "nationality",
  性别: "sex",
  出生日期: "birth_date",
  年龄: "age",
  政治面貌: "political",
  户籍地址_备注: "_widget_1737427680777",
  现居地址_备注: "_widget_1737427680806",
  户籍地: "_widget_1737086434571",
  现居地址_具体到门牌号: "_widget_1737086434572",
  户籍地址: "_widget_1752634932869",
  现居地址: "_widget_1752634932870",
  学生本人电话: "_widget_1750661660100",
  监护人1姓名: "_widget_1685607891791",
  监护人1角色: "_widget_1685607891792",
  监护人1电话: "_widget_1750738819987",
  监护人1联系: "_widget_1750738452874",
  监护人1工作单位: "_widget_1685628423400",
  监护人2姓名: "_widget_1685607891794",
  监护人2角色: "_widget_1685607891795",
  监护人2电话: "_widget_1750738820002",
  监护人2联系: "_widget_1750738452875",
  监护人2工作单位: "_widget_1685628423401",
  就读学校: "_widget_1685607891797",
  校区: "_widget_1757907681438",
  年级别名: "grade_name",
  年级名称: "grade_alias",
  校区年级编号: "_widget_1750663017517",
  班级名称: "class_name",
  班级号: "_widget_1756380561714",
  班级: "class",
  班主任: "class_teacher",
  班主任_企微: "class_teacher_info",
  级部: "grade_level",
  级部主任_企微: "grade_level_director_info",
  学籍状态开始时间: "_widget_1685799678640",
  学籍状态结束时间: "_widget_1685799678641",
  学生类型: "_widget_1685607891808",
  毕业学校: "_widget_1685607891809",
  毕业学校识别码: "_widget_1685607891811",
  既往病史: "_widget_1685607891812",
  是否残疾: "_widget_1685607891813",
  享受寄宿生生活补助金额: "_widget_1685607891814",
  享受营养改善计划补助金额: "_widget_1685607891815",
  是建档立卡贫困户: "_widget_1685607891816",
  建档立卡脱贫户子女: "_widget_1723637371700",
  随迁子女入: "_widget_1685607891817",
  在校农村留守儿童: "_widget_1685607891818",
  备注: "_widget_1685607891819",
  宿舍入住状态: "_widget_1685607891804",
  宿舍楼号: "_widget_1750663017603",
  宿舍楼栋: "_widget_1756380561743",
  宿舍号: "_widget_1750663017604",
  床位: "_widget_1756380561758",
  选科科目: "_widget_1685607891820",
  选科方向: "_widget_1685607891821",
  选科1: "_widget_1685607891822",
  选科2: "_widget_1685607891823",
  外语选科: "_widget_1685607891824",
  是否流失: "_widget_1755144210366",
  流失日期_教务处系统回填: "_widget_1755148193479",
  班级2025秋季学期人数: "_widget_1755148193430",
  班级2025秋季学期_9月人数: "_widget_1755148193446",
  班级2025秋季学期_10月人数: "_widget_1755148193447",
  班级2025秋季学期_11月人数: "_widget_1755148193448",
  班级2025秋季学期_12月人数: "_widget_1755148193449",
  班级2025秋季学期_2026年1月人数: "_widget_1755148193450",
  考号: "_widget_1766052179114",
  更新标识: "_widget_1766064060389",
  微信OpenID: "wx_open_id",
  提交人: "creator",
  提交时间: "createTime",
} as const;


export interface JdyFilterCond {
  field: string;
  type?: string;
  method: string;
  value?: unknown[];
}

export interface JdyFilter {
  rel: "and" | "or";
  cond: JdyFilterCond[];
}

export interface JdyListParams {
  app_id: string;
  entry_id: string;
  data_id?: string;
  fields?: string[];
  filter?: JdyFilter;
  limit?: number;
}

export interface JdyRecord {
  _id: string;
  [key: string]: unknown;
}

export interface JdyListResponse {
  data: JdyRecord[];
  total?: number;
}

async function rawListRequest(params: JdyListParams): Promise<JdyListResponse> {
  const res = await fetch("/api/jdy/data/list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JDY list failed (${res.status}): ${text}`);
  }
  return res.json();
}

export function jdyList(params: JdyListParams): Promise<JdyListResponse> {
  return scheduler.schedule(() => rawListRequest(params));
}

export interface JdyPageResult {
  records: JdyRecord[];
  nextCursor: string | null;
}

export async function jdyListPage(
  params: Omit<JdyListParams, "data_id"> & { pageSize?: number; cursor?: string | null },
): Promise<JdyPageResult> {
  const pageSize = params.pageSize ?? 100;
  const { data } = await jdyList({
    ...params,
    limit: pageSize,
    data_id: params.cursor ?? undefined,
  });
  const records = data ?? [];
  return {
    records,
    nextCursor: records.length === pageSize ? records[records.length - 1]._id : null,
  };
}

export async function jdyListAll(
  params: Omit<JdyListParams, "data_id"> & { pageSize?: number; maxPages?: number },
): Promise<JdyRecord[]> {
  const pageSize = params.pageSize ?? 100;
  const maxPages = params.maxPages ?? 50;
  const all: JdyRecord[] = [];
  let lastId: string | undefined;

  for (let i = 0; i < maxPages; i++) {
    const { data } = await jdyList({
      ...params,
      limit: pageSize,
      data_id: lastId,
    });
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < pageSize) break;
    lastId = data[data.length - 1]._id;
  }

  return all;
}
