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
  STUDENT_AWARD_INFO: {//一生一案-学生获奖记录表 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "6879bd941cddc9db489e68e8",
  },
  GOOD_DEEDS_INFO: {//一生一案-好人好事记录 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "6879be7f66cb2a535cc5511c",
  },
  PHYSICAL_TEST_INFO: {//一生一案-体质检测录入 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "687778f90651ee78eefccde1",
  },
  STUDENT_CADREE_INFO: {//一生一案-学生干部 app ID，entry ID
    app_id: "6788d444d1eefa169cf74ddc",
    entry_id: "687779061935a6b02253f81f",
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
  TERM_INFO: {//学期信息表 app ID，entry ID
    "app_id": "6788d444d1eefa169cf74ddc",
    "entry_id": "67f4b600551195b307a6c1f1",
  },
  COURSE_INFO: {//科目信息表 app ID，entry ID
    "app_id": "6788d444d1eefa169cf74ddc",
    "entry_id": "67fc7023e39959570977a644",
  },
  ELECTIVE_COURSE_INFO: {//选考科目信息表 app ID，entry ID
    "app_id": "6788d444d1eefa169cf74ddc",
    "entry_id": "67fd1f6bee233cc29be1a1b8",
  },
  GRADE_INFO: {//年级 信息表 app ID，entry ID
    "app_id": "6788d444d1eefa169cf74ddc",
    "entry_id": "678a00ead09396216a4600ff",
  },
  TEACHER_REWARD_RECORD_INFO: {//教师获奖记录 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "6538b73db4136e9fdfe0acdc",
  },
  TEACHER_HONORARY_TITLE_INFO: {//教师荣誉称号 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "6548835c82d1fbd2507ffe1b",
  },
  FACULTY_POSITION_TITLES_INFO: {//教师职称信息 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "65488712e57ef8162b1d9780",
  },
  TEACHER_TEACHING_EXPERIENCE_INFO: {//教师工作履历 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "654889ea2c71be5897a3a45c",
  },
  TEACHER_EDUCATIONAL_BACKGROUND_INFO: {//教师教育经历 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "65488b4178fad47a27836b2b",
  },
  TEACHER_PART_TIME_TEACHING_INFO: {//教师教学兼职 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "654b25a95465e36b4df66760",
  },
  TEACHER_PAPER_INFO: {//教师论文 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "675a851a8977ae1dbbba5738",
  },
  TEACHER_AWARD_WINNING_PAPER_INFO: {//教师论文获奖 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "675a8921b407859038992a2b",
  },
  TEACHER_RESEARCH_TOPIC_INFO: {//教师课题 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "67cabaca3f6152dbd76d2365",
  },
  TEACHER_MONOGRAPHS_INFO: {//教师著作 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "67cac1d40ea6ede8c265e94f",
  },
  TEACHER_TRAINING_EXPERIENCE_INFO: {//教师培训 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "69ba13f776292a27ecd4589a",
  },
  TEACHER_QUALIFICATION_CERTIFICATE_INFO: {//教师资格证 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "69170fcecc8364621f0ab554",
  },
  TEACHER_RANKING_OF_CLASSES_TAUGHT_INFO: {//教师带班级排名 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "695e2a0c03a46f3064d18fbb",
  },
  CIVILIZED_CLASS_INFO: {//文明班级 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "69840b44b4de7fef7b8a5133",
  },
  CIVILIZED_DORMITORY_INFO: {//文明宿舍 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "69840cf9480551f0476d16a9",
  },
  STAFF_DIRECTORY_INFO: {//教职工花名册 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "686cd2ca576365d6d985eb76",
  },
  TEACHING_RESEARCH_GROUP_INFO: {//教研组组长 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "6911c07aecfe82d04a058464",
  },
  LESSON_PREPARE_GROUP_INFO: {//备课组长 信息表 app ID，entry ID
    "app_id": "67fe190a3b9b96ddf443c3a2",
    "entry_id": "686cd86dec5ab8cd30e91012",
  },
  TRANSACTIONS_RECORD_INFO: {//消费记录 信息表 app ID，entry ID
    "app_id": "685f6dfd71049484edcce4a7",
    "entry_id": "6878bda53960b0f5d1ae946a",
  },
  ACCESS_LOGS_INFO: {//门禁记录 信息表 app ID，entry ID
    "app_id": "685f6dfd71049484edcce4a7",
    "entry_id": "6878bdb657cbef093b3b8fcc",
  },
  STUDENT_WITHDRAWAL_TRANSFER_LEAVE_APPLICATION: {//学生退/转/休学申请表
    "app_id": "6788d444d1eefa169cf74ddc",
    "entry_id": "6913fc551ec5e84757fff10f",
  },
  STUDENT_CHANGING_MAJORS_CLASSES_APPLICATION: {//转科（班）申请表
    "app_id": "6788d444d1eefa169cf74ddc",
    "entry_id": "68d4c6664470669a53bb6bbc",
  }
} as const;
//学生转科（班）申请表
export const STUDENT_CHANGING_MAJORS_CLASSES_WIDGET_IDS = {
  学生班级: "_widget_1686819650832",
  学生姓名: "_widget_1686821931650",
  变更类型: "_widget_1687679232319",
  转科原因: "_widget_1694143447344",
  原选科科目: "_widget_1692504088982",
  原外语选科: "_widget_1692504088983",
  新选科科目: "_widget_1692504089008",
  新外语选科: "_widget_1692504089010",
  新班级: "_widget_1686820508030",
  家长签名: "_widget_1765337916939",
  提交人: "creator",
  提交时间: "createTime",
} as const;
//学生退/转/休学申请表
export const STUDENT_WITHDRAWAL_TRANSFER_LEAVE_WIDGET_IDS = {
  班级: "_widget_1762917490578",
  学生姓名: "_widget_1762917490575",
  联系电话: "_widget_1762917969986",
  办理时间: "_widget_1762917969989",
  办理事项: "_widget_1762917969994",
  学生离校时间: "_widget_1762917970011",
  退转休学原因: "_widget_1762917970003",
  是否插班生: "_widget_1762917970155",
  意见建议: "_widget_1762917970046",
  银行账号: "_widget_1763434572448",
  户名: "_widget_1763434572450",
  开户行: "_widget_1763434572451",
  学生签字: "_widget_1762917970009",
  签字时间: "_widget_1762917970012",
  家长签字: "_widget_1762917970010",
  与学生关系: "_widget_1762917970013",
  提交人: "creator",
  提交时间: "createTime",
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
  提交人: "creator",
  提交时间: "createTime",
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
  提交人: "creator",
  提交时间: "createTime",
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
  提交人: "creator",
  提交时间: "createTime",
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
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
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
  填报日期: "_widget_1736929837045",
  学期: "_widget_1752654559799",
  是否当前学期: "_widget_1752654559800",
  提交人: "_widget_1736930971161",
  班主任编号: "_widget_1752654559786",
  班级名称: "_widget_1736927246680",
  年级: "_widget_1752654559814",
  级部: "_widget_1767086981553",
  年级别名: "_widget_1767086981554",
  年级总人数: "_widget_1752656478041",
  应到学生人数: "_widget_1736929837049",
  返校学生人数: "_widget_1736929837089",
  未返校学生人数: "_widget_1736929837051",
  转入学生人数: "_widget_1736929837090",
  班主任: "_widget_1767086981552",
  级部主任: "_widget_1767086981560",
  病假学生姓名: "_widget_1736929837055",
  病假学生人数: "_widget_1736929837061",
  病假具体情况说明: "_widget_1736929837068",
  事假学生姓名: "_widget_1736929837065",
  事假学生人数: "_widget_1736929837067",
  事假具体情况说明: "_widget_1736929837069",
  在外学习培训学生姓名: "_widget_1736929837074",
  在外学习培训学生人数: "_widget_1736929837076",
  在外学习培训具体情况说明: "_widget_1736929837077",
  休学学生姓名: "_widget_1736929837079",
  休学学生人数: "_widget_1736929837081",
  休学具体情况说明: "_widget_1736929837082",
  流失学生姓名: "_widget_1736929837084",
  流失学生人数: "_widget_1736929837086",
  流失学生具体情况说明: "_widget_1736929837087",
  提交时间: "createTime",
} as const;
//学生资助情况表
export const STUDENT_SUPPORT_STATUS_WIDGET_IDS = {
  年级: "_widget_1752721677360",
  班级名称: "_widget_1752721677363",
  学生姓名: "_widget_1752723308848",
  学生学号: "_widget_1554887983375",
  性别: "_widget_1752721677362",
  家长姓名: "_widget_1554887983507",
  手机号码: "_widget_1554887983554",
  当前学期: "_widget_1554887983250",
  发放学期: "_widget_1554887983265",
  资助项目名称: "_widget_1752721677359",
  资助单位: "_widget_1554887983826",
  资助金额: "_widget_1554887983871",
  备注: "_widget_1554887983992",
} as const;
//谈心谈话记录表
export const STUDENT_HEART_TO_HEART_TALK_WIDGET_IDS = {
  谈心教师: "_widget_1763971800147",
  班级名称: "_widget_1770193644178",
  学生姓名: "_widget_1763971800133",
  学生身份证: "_widget_1763971800175",
  学生学号: "_widget_1763971800176",
  谈心教师学科: "_widget_1763971800152",
  谈心谈话时间: "_widget_1763971800155",
  谈话内容: "_widget_1763971800158",
  谈心谈话内容记录: "_widget_1763971800160",
  教师指导建议: "_widget_1763971800164",
  沟通照片: "_widget_1763971800168",
  提交人: "creator",
  提交时间: "createTime",
} as const;
//学情分析记录表
export const STUDENT_LEARNING_ANALYSIS_WIDGET_IDS = {
  班级: "_widget_1775116425061",
  学生姓名: "_widget_1775116425063",
  学科: "_widget_1775117349258",
  学情分析开始时间: "_widget_1775117349247",
  学情分析结束时间: "_widget_1775117349248",
  掌握较好的知识点: "_widget_1775117349249",
  掌握不足的知识点: "_widget_1775117349250",
  教师指导措施: "_widget_1775117349251",
  提交人: "creator",
  提交时间: "createTime",
} as const;
//学生获奖记录表
export const STUDENT_AWARD_WIDGET_IDS = {
  流水号: "_widget_1752809656794",
  是否当前学期: "_widget_1752809656795",
  学期: "_widget_1752808852540",
  填报时间: "_widget_1752808852541",
  填写人: "_widget_1752809656799",
  年级: "_widget_1752808852567",
  级部: "_widget_1777445151532",
  班级名称: "_widget_1753065358227",
  学生学号: "_widget_1753065358229",
  学生姓名: "_widget_1752808852566",
  获奖级别: "_widget_1752808852568",
  获奖等级: "_widget_1752808852569",
  参与比赛名称: "_widget_1752808852543",
  获奖时间: "_widget_1752808852545",
  颁发单位: "_widget_1752808852546",
  个人团体获奖: "_widget_1752808852548",
  指导老师: "_widget_1777298878320",
  提交人: "creator",
  提交时间: "createTime",
} as const;
//好人好事记录表
export const GOOD_DEEDS_WIDGET_IDS = {
  流水号: "_widget_1753066535867",
  是否当前学期: "_widget_1753066535868",
  学期: "_widget_1752809087925",
  填报时间: "_widget_1752809087926",
  填报人: "_widget_1753066535873",
  年级: "_widget_1752809087932",
  班级名称: "_widget_1752809087933",
  级部: "_widget_1769152216555",
  学生姓名: "_widget_1752809087934",
  学生学号: "_widget_1753070039699",
  事件发生时间: "_widget_1753070180304",
  事件地点: "_widget_1753066535888",
  事件描述: "_widget_1752809087940",
  班主任: "_widget_1769152216562",
  级部主任: "_widget_1769152216564",
  提交人: "creator",
  提交时间: "createTime",
} as const;
//体质检测录入表
export const PHYSICAL_TEST_WIDGET_IDS = {
  当前学期: "_widget_1554883898254",
  录入学期: "_widget_1554883898294",
  年级: "_widget_1752738769395",
  班级名称: "_widget_1752738769396",
  级部: "_widget_1769152370613",
  姓名: "_widget_1752723058990",
  学号: "_widget_1752723451619",
  性别: "_widget_1752723451620",
  班主任: "_widget_1769152370614",
  级部主任: "_widget_1769152370615",
  考试名称: "_widget_1753070219343",
  考试时间: "_widget_1753070271573",
  身高: "_widget_1554883711894",
  体重: "_widget_1554883711909",
  肺活量: "_widget_1553655706653",
  "50米跑": "_widget_1553655706668",
  坐位体前屈: "_widget_1553655706683",
  立定跳远: "_widget_1553655706728",
  "800米跑": "_widget_1553658229111",
  "1000米跑": "_widget_1553658229126",
  一分钟跳绳: "_widget_1553655706698",
  一分钟仰卧起坐: "_widget_1553655706713",
  引体向上: "_widget_1553655706773",
  提交人: "creator",
  提交时间: "createTime",
} as const;
//学生干部风采表
export const STUDENT_CADREE_WIDGET_IDS = {
  当前学期: "_widget_1554886545886",
  录入学期: "_widget_1554886545922",
  年级: "_widget_1753067742280",
  班级名称: "_widget_1753067742283",
  级部: "_widget_1769153103518",
  姓名: "_widget_1553656302237",
  学号: "_widget_1753069588655",
  职务: "_widget_1553656302556",
  自我介绍: "_widget_1553656302571",
  任职宣言: "_widget_1553656302586",
  家长寄语: "_widget_1553656302601",
  德育处评价: "_widget_1553656302616",
  学生照片: "_widget_1553656302631",
  任职开始时间: "_widget_1753070292855",
  任职结束时间: "_widget_1753070292856",
  班主任: "_widget_1769153103519",
  级部主任: "_widget_1769153103520",
  提交人: "creator",
  提交时间: "createTime",
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

//学期信息
export const TERM_INFO_WIDGET_IDS = {
  学期开始时间: "start_time",
  学期结束时间: "end_time",
  是否是当前学期: "is_current_term",
  学年: "year",
  学期季度: "quarter",
  学期: "term",
  学期名称: "term_alias",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime"
} as const;

//科目信息
export const COURSE_INFO_WIDGET_IDS = {
  科目: "course",
  学科_国标: "discipline",
  分组_国标: "group",
  学段: "stage",
  学段科目名: "course_stage",
  教研学科名: "tar_name",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//年级信息
export const GRADE_INFO_WIDGET_IDS = {
  年级: "_widget_1737097451063",
  年级别名: "_widget_1737097451059",
  年级固有名: "_widget_1737097451058",
  入学年份: "_widget_1737097451064",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师获奖记录
export const TEACHER_REWARD_RECORD_WIDGET_IDS = {
  教师: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  有无获奖记录: "_widget_1763004929926",
  教职工编号: "_widget_1752482652832",
  员工状态: "_widget_1752137223525",
  部门: "_widget_1752220329428",
  岗位: "_widget_1752220329451",
  岗位类型: "_widget_1752138102664",
  "党委/行政职务": "_widget_1752220329429",
  联系方式: "_widget_1752220329433",
  担任学科: "_widget_1752220329444",
  "教师姓名（文本）": "_widget_1752220329437",
  教师奖状: "_widget_1698215745913",
  教师奖状_编号: "_widget_1698215745913._widget_1698215745924",
  教师奖状_获奖时间: "_widget_1698215745913._widget_1698215745915",
  教师奖状_获奖名称: "_widget_1698215745913._widget_1698215745917",
  教师奖状_获奖级别: "_widget_1698215745913._widget_1698215745918",
  教师奖状_荣获奖项: "_widget_1698215745913._widget_1698215745921",
  教师奖状_唯一性校验: "_widget_1698215745913._widget_1699344180780",
  教师奖状_颁发单位: "_widget_1698215745913._widget_1698215745923",
  教师奖状_奖状照片: "_widget_1698215745913._widget_1698217978281",
  教师奖状_提交校验: "_widget_1698215745913._widget_1698217575347",
  审核意见: "_widget_1761534383986",
  审核人: "_widget_1763004929929",
  审批人签名: "_widget_1761534383988",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师荣誉称号
export const TEACHER_HONORARY_TITLE_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  有无荣誉称号: "_widget_1763003193627",
  教职工编号: "_widget_1752482199927",
  员工状态: "_widget_1752137054269",
  部门: "_widget_1752136720740",
  岗位: "_widget_1752136720741",
  岗位类型: "_widget_1752136720739",
  "党委/行政职务": "_widget_1752136720742",
  联系方式: "_widget_1752220034623",
  担任学科: "_widget_1752220034625",
  "教师姓名（文本）": "_widget_1752220034624",
  荣誉称号: "_widget_1698215745913",
  荣誉称号_编号: "_widget_1698215745913._widget_1698215745924",
  荣誉称号_获评日期: "_widget_1698215745913._widget_1698215745915",
  荣誉称号_荣誉称号: "_widget_1698215745913._widget_1698215745917",
  荣誉称号_荣誉级别: "_widget_1698215745913._widget_1698215745918",
  荣誉称号_颁发单位: "_widget_1698215745913._widget_1698215745923",
  荣誉称号_相关照片: "_widget_1698215745913._widget_1698217978281",
  荣誉称号_提交校验: "_widget_1698215745913._widget_1698217575347",
  荣誉称号_唯一性校验: "_widget_1698215745913._widget_1699344288538",
  审核意见: "_widget_1761534298468",
  审核人: "_widget_1763003193634",
  审批人签名: "_widget_1761534298470",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师职称信息
export const FACULTY_POSITION_TITLES_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  有无职称: "_widget_1763002535994",
  身份证号码: "_widget_1699236364971",
  教职工编号: "_widget_1752481442670",
  员工状态: "_widget_1752136966196",
  部门: "_widget_1752220186256",
  岗位: "_widget_1752220186255",
  岗位类型: "_widget_1752138073710",
  "党委/行政职务": "_widget_1752220186257",
  联系方式: "_widget_1752220186260",
  担任学科: "_widget_1752220186262",
  "教师姓名（文本）": "_widget_1752220186261",
  证书编号: "_widget_1778566606530",
  教师职称级别: "_widget_1778566606531",
  获评时间: "_widget_1778566606533",
  职称证书: "_widget_1778566606534",
  审核意见: "_widget_1761533976808",
  审核人: "_widget_1763002536070",
  审核人签名: "_widget_1761533976813",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师工作履历
export const TEACHER_TEACHING_EXPERIENCE_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  有无工作经历: "_widget_1763005467393",
  教职工编号: "_widget_1752482925110",
  员工状态: "_widget_1752137342818",
  部门: "_widget_1752221291485",
  岗位: "_widget_1752221291486",
  岗位类型: "_widget_1752139056554",
  "党委/行政职务": "_widget_1752221291489",
  联系方式: "_widget_1752221291490",
  担任学科: "_widget_1752221291494",
  "教师姓名（文本）": "_widget_1752221291493",
  是否补录信息: "_widget_1763372515760",
  工作履历: "_widget_1698215745913",
  "工作履历.编号": "_widget_1698215745913._widget_1698215745924",
  "工作履历.任职单位": "_widget_1698215745913._widget_1698215745917",
  "工作履历.开始日期": "_widget_1698215745913._widget_1698215745915",
  "工作履历.结束日期": "_widget_1698215745913._widget_1699251988748",
  "工作履历.任职岗位": "_widget_1698215745913._widget_1699252771780",
  "工作履历.所教学科": "_widget_1698215745913._widget_1699252771781",
  "工作履历.提交校验": "_widget_1698215745913._widget_1698217575347",
  审核意见: "_widget_1761534766837",
  审核人: "_widget_1763005467407",
  审核人签名: "_widget_1761534766845",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师教育经历
export const TEACHER_EDUCATIONAL_BACKGROUND_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  教职工编号: "_widget_1752482900053",
  员工状态: "_widget_1752137298172",
  部门: "_widget_1752220962309",
  岗位: "_widget_1752220962308",
  岗位类型: "_widget_1752139028957",
  "党委/行政职务": "_widget_1752220962314",
  联系方式: "_widget_1752220962315",
  担任学科: "_widget_1752220962321",
  "教师姓名（文本）": "_widget_1752220962320",
  是否补录信息: "_widget_1763372377533",
  教育经历: "_widget_1698215745913",
  "教育经历.编号": "_widget_1698215745913._widget_1698215745924",
  "教育经历.就读学校": "_widget_1698215745913._widget_1698215745917",
  "教育经历.学历": "_widget_1698215745913._widget_1699253061126",
  "教育经历.学位": "_widget_1698215745913._widget_1763087996753",
  "教育经历.学历证书（pdf/图片）": "_widget_1698215745913._widget_1763087996761",
  "教育经历.学位证书（pdf/图片）": "_widget_1698215745913._widget_1763087996762",
  "教育经历.学习形式": "_widget_1698215745913._widget_1699252771781",
  "教育经历.开始日期": "_widget_1698215745913._widget_1698215745915",
  "教育经历.结束日期": "_widget_1698215745913._widget_1699251988748",
  "教育经历.提交校验": "_widget_1698215745913._widget_1698217575347",
  "教育经历.唯一性校验": "_widget_1698215745913._widget_1699344524114",
  审核意见: "_widget_1761534521422",
  审核人: "_widget_1763017047386",
  审核人签名: "_widget_1761534521424",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师教学兼职
export const TEACHER_PART_TIME_TEACHING_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  有无教学兼职: "_widget_1763009713716",
  教职工编号: "_widget_1752482957156",
  员工状态: "_widget_1752137379611",
  部门: "_widget_1752221618748",
  岗位: "_widget_1752221618747",
  岗位类型: "_widget_1752139402209",
  "党委/行政职务": "_widget_1752221618749",
  联系方式: "_widget_1752221618750",
  担任学科: "_widget_1752221618754",
  "教师姓名（文本）": "_widget_1752221618753",
  教学兼职: "_widget_1698215745913",
  "教学兼职.编号": "_widget_1698215745913._widget_1698215745924",
  "教学兼职.兼职职务": "_widget_1698215745913._widget_1699423666571",
  "教学兼职.其他兼职职务": "_widget_1698215745913._widget_1763087454621",
  "教学兼职.任职单位": "_widget_1698215745913._widget_1698215745917",
  "教学兼职.兼职开始日期": "_widget_1698215745913._widget_1698215745915",
  "教学兼职.兼职结束日期": "_widget_1698215745913._widget_1699251988748",
  "教学兼职.年限": "_widget_1698215745913._widget_1699423666574",
  "教学兼职.提交校验": "_widget_1698215745913._widget_1698217575347",
  审核意见: "_widget_1761530868994",
  审批人: "_widget_1763009713726",
  审批人签名: "_widget_1761530868999",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师论文
export const TEACHER_PAPER_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  有无论文: "_widget_1763015954128",
  教职工编号: "_widget_1752482983506",
  员工状态: "_widget_1752137405815",
  部门: "_widget_1752222064178",
  岗位: "_widget_1752222064177",
  岗位类型: "_widget_1752139506817",
  "党委/行政职务": "_widget_1752222064187",
  联系方式: "_widget_1752222064192",
  担任学科: "_widget_1752222064194",
  "教师姓名（文本）": "_widget_1752222064193",
  论文发表: "_widget_1698215745913",
  论文发表_编号: "_widget_1698215745913._widget_1698215745924",
  论文发表_类型: "_widget_1698215745913._widget_1741341560273",
  论文发表_成果名称: "_widget_1698215745913._widget_1698215745917",
  论文发表_作者: "_widget_1698215745913._widget_1733986791531",
  论文发表_时间: "_widget_1698215745913._widget_1698215745915",
  论文发表_级别: "_widget_1698215745913._widget_1698215745918",
  论文发表_等级: "_widget_1698215745913._widget_1741341560275",
  论文发表_刊物名称: "_widget_1698215745913._widget_1698215745921",
  论文发表_证明图片: "_widget_1698215745913._widget_1734056195423",
  论文发表_唯一性校验: "_widget_1698215745913._widget_1699344180780",
  论文发表_提交校验: "_widget_1698215745913._widget_1698217575347",
  审核意见: "_widget_1761531116435",
  审核人: "_widget_1763015954138",
  审批人签名: "_widget_1761531116437",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师论文获奖
export const TEACHER_AWARD_WINNING_PAPER_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  校区: "_widget_1733987381009",
  身份证号码: "_widget_1699236364971",
  论文发表: "_widget_1698215745913",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师课题
export const TEACHER_RESEARCH_TOPIC_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  有无课题: "_widget_1763016502532",
  教职工编号: "_widget_1752483195755",
  员工状态: "_widget_1752137430211",
  部门: "_widget_1752222707568",
  岗位: "_widget_1752222707567",
  岗位类型: "_widget_1752139527785",
  "党委/行政职务": "_widget_1752222707569",
  联系方式: "_widget_1752222707570",
  担任学科: "_widget_1752222707575",
  "教师姓名（文本）": "_widget_1752222707574",
  课题: "_widget_1698215745913",
  课题_编号: "_widget_1698215745913._widget_1698215745924",
  课题_课题名称: "_widget_1698215745913._widget_1698215745917",
  课题_级别: "_widget_1698215745913._widget_1698215745918",
  "课题_立项/结项": "_widget_1698215745913._widget_1741340313737",
  课题_图片证明材料: "_widget_1698215745913._widget_1741342580242",
  课题_唯一性校验: "_widget_1698215745913._widget_1699344180780",
  课题_提交校验: "_widget_1698215745913._widget_1698217575347",
  审核意见: "_widget_1761531238907",
  审核人: "_widget_1763016502541",
  审核人签名: "_widget_1761531238909",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师著作
export const TEACHER_MONOGRAPHS_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  有无著作: "_widget_1763017280855",
  教职工编号: "_widget_1752483218121",
  员工状态: "_widget_1752137444869",
  部门: "_widget_1752223656256",
  岗位: "_widget_1752223656253",
  岗位类型: "_widget_1752139542405",
  "党委/行政职务": "_widget_1752223656254",
  联系方式: "_widget_1752223656255",
  担任学科: "_widget_1752223656260",
  "教师姓名（文本）": "_widget_1752223656259",
  著作: "_widget_1698215745913",
  "著作.编号": "_widget_1698215745913._widget_1698215745924",
  "著作.著作名称": "_widget_1698215745913._widget_1698215745917",
  "著作.角色类型": "_widget_1698215745913._widget_1741341143290",
  "著作.出版年份": "_widget_1698215745913._widget_1741341143289",
  "著作.图片证明材料": "_widget_1698215745913._widget_1741342675138",
  "著作.唯一性校验": "_widget_1698215745913._widget_1699344180780",
  "著作.提交校验": "_widget_1698215745913._widget_1698217575347",
  审核意见: "_widget_1761533846136",
  审批人: "_widget_1763017280857",
  审批人签名: "_widget_1761533846138",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师培训
export const TEACHER_TRAINING_EXPERIENCE_WIDGET_IDS = {
  培训渠道: "_widget_1773803280618",
  培训名称: "_widget_1773803280615",
  培训开始时间: "_widget_1773803280613",
  培训结束时间: "_widget_1773803280614",
  主讲人: "_widget_1774259594524",
  培训地点: "_widget_1773803280617",
  参训人员: "_widget_1774839566974",
  具体人数: "_widget_1773803280622",
  培训形式: "_widget_1773803280623",
  备注: "_widget_1773803280624",
  审核意见: "_widget_1773818596904",
  审核人: "_widget_1773818596906",
  审核人签名: "_widget_1773818596909",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师资格证
export const TEACHER_QUALIFICATION_CERTIFICATE_WIDGET_IDS = {
  教师姓名: "_widget_1698215745912",
  身份证号码: "_widget_1699236364971",
  有无教师资格证: "_widget_1763002535994",
  教职工编号: "_widget_1752481442670",
  员工状态: "_widget_1752136966196",
  部门: "_widget_1752220186256",
  岗位: "_widget_1752220186255",
  岗位类型: "_widget_1752138073710",
  "党委/行政职务": "_widget_1752220186257",
  联系方式: "_widget_1752220186260",
  担任学科: "_widget_1752220186262",
  "教师姓名（文本）": "_widget_1752220186261",
  教资证书编号: "_widget_1778568190536",
  教师资格种类: "_widget_1778568190537",
  任教科目: "_widget_1778568190539",
  教师资格证书图片: "_widget_1778568190541",
  获证时间: "_widget_1778568190542",
  审核意见: "_widget_1761533976808",
  审核人: "_widget_1763002536070",
  审核人签名: "_widget_1761533976813",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教师带班级排名
export const TEACHER_RANKING_OF_CLASSES_TAUGHT_WIDGET_IDS = {
  学期: "_widget_1767778829291",
  考试名称: "_widget_1767778829292",
  年级: "_widget_1767778829293",
  班级: "_widget_1767778829294",
  教师姓名: "_widget_1767779019989",
  学科: "_widget_1767778829296",
  班级排名: "_widget_1767778829297",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//文明班级
export const CIVILIZED_CLASS_WIDGET_IDS = {
  年份: "_widget_1770261317505",
  周次: "_widget_1770261317507",
  级部: "_widget_1770261317499",
  班级: "_widget_1770261317500",
  班主任: "_widget_1770261317502",
  级部主任: "_widget_1770261317516",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//文明宿舍
export const CIVILIZED_DORMITORY_WIDGET_IDS = {
  年份: "_widget_1770261317505",
  周次: "_widget_1770261317507",
  楼栋: "_widget_1770261770295",
  楼层: "_widget_1770261872176",
  宿舍号: "_widget_1770261872186",
  班级: "_widget_1770261317500",
  级部: "_widget_1770261317499",
  班主任: "_widget_1770261317502",
  级部主任: "_widget_1770261317516",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教职工花名册
export const STAFF_DIRECTORY_WIDGET_IDS = {
  教职工姓名: "name",
  教职工企业微信: "_widget_1685632027402",
  教职工编号: "code",
  员工状态: "_widget_1685697488906",
  入职日期: "_widget_1685697488905",
  今年入职周年日期: "_widget_1760520045803",
  转正日期: "_widget_1750406237772",
  预计转正时间: "_widget_1773119951705",
  "试用期（月）": "_widget_1750406237758",
  离职日期: "_widget_1685697488908",
  离职原因: "_widget_1764302027954",
  聘用形式: "_widget_1692414513897",
  "司龄（年）": "_widget_1750406237799",
  是否签订合同: "_widget_1760169294937",
  最新合同公司: "_widget_1760169294938",
  最新合同类型: "_widget_1760169294939",
  最新合同开始时间: "_widget_1760169294958",
  最新合同到期时间: "_widget_1760169294959",
  合同签订次数: "_widget_1760169294960",
  "企业微信部门（可多选）": "_widget_1758772785866",
  部门: "_widget_1750323358434",
  岗位: "_widget_1751600513077",
  "党委/行政职务": "_widget_1751013458027",
  职级: "_widget_1763022574214",
  "党委/行政职务任职开始时间": "_widget_1761208094957",
  "党委/行政职务任职结束时间": "_widget_1761208094958",
  历史任职: "_widget_1772694830859",
  岗位类型: "_widget_1685697488894",
  其他岗位类型: "_widget_1751013457749",
  兼任岗位类型: "_widget_1766039980373",
  担任学科: "_widget_1685697488892",
  是否是教学岗: "_widget_1766041848860",
  担任学科与教资是否相符: "_widget_1773826906392",
  身份证号: "id_card",
  手机号码: "_widget_1685632025817",
  个人邮箱: "_widget_1758772785569",
  性别: "_widget_1685632025815",
  出生日期: "_widget_1696925792183",
  今年生日: "_widget_1760514420871",
  年龄: "_widget_1750649174344",
  年龄段: "_widget_1750646712303",
  民族: "_widget_1685632025821",
  籍贯: "_widget_1692780674830",
  家庭地址: "_widget_1750406237701",
  政治面貌: "_widget_1685697488896",
  党组织名称: "_widget_1758772785644",
  所属党支部: "_widget_1758772786068",
  婚姻状况: "_widget_1685697488898",
  首次参加工作时间: "_widget_1685697488904",
  "工龄(年）": "_widget_1752134992034",
  备注: "_widget_1685632025835",
  执业资格证: "_widget_1685632025844",
  其他资格证备注: "_widget_1751013457475",
  执业资格证图片: "_widget_1687677938025",
  教师资格种类: "_widget_1751013457506",
  任教学科: "_widget_1685697488923",
  教师资格证编号: "_widget_1693478255915",
  教师职称级别: "_widget_1685697488927",
  教师职称级别图片: "_widget_1687677938026",
  普通话等级: "_widget_1758772785755",
  英语等级: "_widget_1758772785758",
  开户行: "_widget_1750406237813",
  银行卡号: "_widget_1750406237814",
  最高学历: "_widget_1685697488900",
  学位: "_widget_1685697488902",
  学位名称: "_widget_1761185932191",
  其他学位名称: "_widget_1761639451403",
  毕业院校: "_widget_1685632025827",
  所学专业: "_widget_1685632025828",
  学习形式: "_widget_1750406237714",
  毕业时间: "_widget_1758772785699",
  毕业证编号: "_widget_1693478255916",
  "学历证书（pdf/图片）": "_widget_1693478255934",
  "学位证书（pdf/图片）": "_widget_1758772785718",
  前工作公司: "_widget_1750406237885",
  前工作部门: "_widget_1750406237886",
  前工作职位: "_widget_1750406237887",
  前工作开始日期: "_widget_1750406237888",
  前工作结束日期: "_widget_1750406237889",
  主要紧急联系人姓名: "_widget_1750406237829",
  主要紧急联系人关系: "_widget_1750406237830",
  主要紧急联系人其他关系: "_widget_1761713224166",
  主要紧急联系人电话: "_widget_1750406237857",
  主要紧急联系人工作单位: "_widget_1758772786069",
  主要紧急联系人性别: "_widget_1760152169064",
  主要紧急联系人出生日期: "_widget_1760152169084",
  "身份证（人像面）": "_widget_1693478255930",
  "身份证（国徽面）": "_widget_1758772785607",
  人脸识别照: "_widget_1685632027400",
  形象照: "_widget_1685632027401",
  英语等级证书: "_widget_1758772785800",
  普通话等级证书: "_widget_1758772785801",
  "个人简历（电子版）": "_widget_1758772785822",
  "无犯罪记录证明（电子版）": "_widget_1758772785823",
  体检报告: "_widget_1758772785824",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//教研组组长
export const TEACHING_RESEARCH_GROUP_WIDGET_IDS = {
  科目: "_widget_1750301718560",
  教研组: "_widget_1750301718561",
  科组类别: "_widget_1762770137945",
  教研组长: "_widget_1750301718562",
  请选择教研组长: "_widget_1751446909638",
  "教研组长（企微）": "_widget_1750301718563",
  教研组长职工编号: "_widget_1750301718564",
  教研组长电话: "_widget_1750301718565",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//备课组长
export const LESSON_PREPARE_GROUP_WIDGET_IDS = {
  年级别名: "_widget_1750301718558",
  年级: "_widget_1750301718557",
  科目: "_widget_1750301718560",
  备课组: "_widget_1750301718561",
  科组类别: "_widget_1762770137945",
  备课组长: "_widget_1750301718562",
  请选择备课组长: "_widget_1751446909638",
  "备课组长（企微）": "_widget_1750301718563",
  备课组长职工编号: "_widget_1750301718564",
  备课组长电话: "_widget_1750301718565",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//消费记录
export const TRANSACTIONS_RECORD_WIDGET_IDS = {
  学期: "term",
  身份: "type",
  姓名: "name",
  "宏德学/工号": "code",
  班级: "class_name",
  年级: "grade_name",
  级部: "grade_level",
  订单号: "trade_no",
  订单类型: "related_type",
  支付方式: "pay_type",
  交易金额: "amount",
  实付金额: "real_amount",
  消费机时间: "pay_device_time",
  交易时间: "created_at",
  支付时间: "pay_time",
  订单状态: "order_status",
  消费方式: "pay_way",
  门店: "store_name",
  交易号: "callback_trade_no",
  消费机SN: "dev_sn",
  退款时间: "refund_time",
  退款金额: "refund_amount",
  退款状态: "refund_status",
  "班主任（文字）": "class_teacher",
  班主任: "class_teacher_info",
  级部主任: "grade_level_director_info",
  设备状态: "device_status",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
} as const;

//门禁记录
export const ACCESS_LOGS_WIDGET_IDS = {
  学期: "term",
  姓名: "name",
  年级: "grade_name",
  级部: "grade_level",
  班级: "class_name",
  "宏德学/工号": "code",
  身份: "type",
  打卡设备: "sn",
  通行方向: "direction",
  通行时间: "pass_time",
  出入场所: "location",
  "班主任（文字）": "class_teacher",
  班主任: "class_teacher_info",
  级部主任: "grade_level_director_info",
  设备状态: "device_status",
  提交人: "creator",
  提交时间: "createTime",
  更新时间: "updateTime",
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

// ── 写操作接口 ──────────────────────────────────────────────

export interface JdyMutationResponse {
  success: boolean;
  message?: string;
}

export interface JdyCreateParams {
  app_id: string;
  entry_id: string;
  data: Record<string, { value: unknown }>;
  data_creator?: string;
  transaction_id?: string;
  is_start_workflow?: boolean;
  is_start_trigger?: boolean;
}

export interface JdyBatchCreateParams {
  app_id: string;
  entry_id: string;
  data_list: Array<Record<string, { value: unknown }>>;
  data_creator?: string;
  is_start_workflow?: boolean;
  is_start_trigger?: boolean;
}

export interface JdyUpdateParams {
  app_id: string;
  entry_id: string;
  data_id: string;
  data: Record<string, { value: unknown }>;
  data_creator?: string;
  data_updater?: string;
  transaction_id?: string;
  is_start_trigger?: boolean;
}

export interface JdyBatchUpdateParams {
  app_id: string;
  entry_id: string;
  data_ids: string[];
  data: Record<string, { value: unknown }>;
}

export interface JdyDeleteParams {
  app_id: string;
  entry_id: string;
  data_id: string;
  is_start_trigger?: boolean;
}

export interface JdyBatchDeleteParams {
  app_id: string;
  entry_id: string;
  data_ids: string[];
}

async function jdyMutate(action: string, body: unknown): Promise<JdyMutationResponse> {
  const res = await fetch(`/api/jdy/data/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`JDY ${action} failed (${res.status}): ${text}`);
  }
  return res.json();
}

export function jdyCreate(params: JdyCreateParams): Promise<JdyMutationResponse> {
  return scheduler.schedule(() => jdyMutate("create", params));
}

export function jdyBatchCreate(params: JdyBatchCreateParams): Promise<JdyMutationResponse> {
  return scheduler.schedule(() => jdyMutate("batch-create", params));
}

export function jdyUpdate(params: JdyUpdateParams): Promise<JdyMutationResponse> {
  return scheduler.schedule(() => jdyMutate("update", params));
}

export function jdyBatchUpdate(params: JdyBatchUpdateParams): Promise<JdyMutationResponse> {
  return scheduler.schedule(() => jdyMutate("batch-update", params));
}

export function jdyDelete(params: JdyDeleteParams): Promise<JdyMutationResponse> {
  return scheduler.schedule(() => jdyMutate("delete", params));
}

export function jdyBatchDelete(params: JdyBatchDeleteParams): Promise<JdyMutationResponse> {
  return scheduler.schedule(() => jdyMutate("batch-delete", params));
}

// ── 文件上传 ──────────────────────────────────────────────

interface JdyUploadTokenResponse {
  token_and_url_list: { url: string; token: string }[];
}

function safeUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  // Fallback for insecure contexts (HTTP mobile)
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  const hex = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}

export async function jdyGetUploadTokens(app_id: string, entry_id: string, count: number, transaction_id?: string): Promise<{ tokens: { url: string; token: string }[]; transaction_id: string }> {
  const tid = transaction_id ?? safeUUID();
  const res = await fetch("/api/jdy/upload-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id, entry_id, transaction_id: tid }),
  });
  if (!res.ok) throw new Error(`get upload token failed (${res.status})`);
  const data: JdyUploadTokenResponse = await res.json();
  const list = data.token_and_url_list ?? [];
  if (list.length < count) throw new Error(`need ${count} upload tokens but got ${list.length}`);
  return { tokens: list.slice(0, count), transaction_id: tid };
}

async function uploadOneFile(file: File, url: string, token: string): Promise<string> {
  const fullUrl = url.startsWith("http") ? url : `https://api.jiandaoyun.com${url.startsWith("/") ? "" : "/"}${url}`;
  const form = new FormData();
  form.append("file", file);
  form.append("token", token);
  const res = await fetch(fullUrl, { method: "POST", body: form });
  if (!res.ok) throw new Error(`upload file failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.key as string;
}

export async function jdyUploadFiles(files: File[], app_id: string, entry_id: string, transaction_id?: string): Promise<{ keys: string[]; transaction_id: string }> {
  if (files.length === 0) return { keys: [], transaction_id: transaction_id ?? safeUUID() };
  const { tokens, transaction_id: tid } = await jdyGetUploadTokens(app_id, entry_id, files.length, transaction_id);
  const keys = await Promise.all(files.map((f, i) => uploadOneFile(f, tokens[i].url, tokens[i].token)));
  return { keys, transaction_id: tid };
}
