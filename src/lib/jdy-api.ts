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
} as const;

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

export const CLASS_RANK_WIDGET_IDS = {
  学期: "_widget_1767778829291",
  考试名称: "_widget_1767778829292",
  年级: "_widget_1767778829293",
  班级: "_widget_1767778829294",
  教师姓名: "_widget_1767779019989",
  学科: "_widget_1767778829296",
  班级排名: "_widget_1767778829297",
} as const;

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
