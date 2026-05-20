"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

// ── Section header ────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (<div className="relative flex items-center justify-center my-6" style={{ height: 32 }}><div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 0%, #10b981 10%, #10b981 90%, transparent 100%)" }} /><div className="absolute" style={{ left: "10%", width: 12, height: 12, background: "#10b981", transform: "rotate(45deg)" }} /><div className="absolute" style={{ right: "10%", width: 12, height: 12, background: "#10b981", transform: "rotate(45deg)" }} /><span className="relative z-10 text-white font-medium text-sm">{title}</span></div>);
}

// ── Field wrapper ─────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (<div><label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>{required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}{label}</label>{children}</div>);
}

// ── Input ─────────────────────────────────────────────────────────
function Input({ placeholder = "", type = "text", disabled, value, onChange }: { placeholder?: string; type?: string; disabled?: boolean; value?: string; onChange?: (v: string) => void }) {
  return (<input type={type} placeholder={placeholder} disabled={disabled} value={value ?? ""} onChange={(e) => onChange?.(e.target.value)} className="form-input" style={disabled ? { background: "#f9fafb", color: "#9ca3af" } : undefined} onFocus={(e) => { if (!disabled) Object.assign(e.currentTarget.style, focusStyle); }} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />);
}

// ── SelectField ───────────────────────────────────────────────────
function SelectField({ value, onChange, options, disabled }: { value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean }) {
  return (<div className="relative"><select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="form-input appearance-none pr-9" style={disabled ? { background: "#f9fafb", color: "#9ca3af" } : { color: value ? "#1d1d1f" : "#9ca3af" }} onFocus={(e) => { if (!disabled) Object.assign(e.currentTarget.style, focusStyle); }} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)}><option value="" disabled />{options.map((o) => <option key={o}>{o}</option>)}</select><ChevronDown size={15} className="absolute right-3.5 top-3 pointer-events-none" style={{ color: "#9ca3af" }} /></div>);
}

// ── Photo upload zone ─────────────────────────────────────────────
function PhotoZone({ label, hint }: { label: string; hint: string }) {
  return (<div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"><Upload className="w-6 h-6 text-gray-300" /><span className="text-base text-gray-400">{label}</span><span className="text-sm text-gray-300 text-center px-2">{hint}</span></div>);
}

// ── Radio group ───────────────────────────────────────────────────
function RadioGroup({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (<div className="flex items-center gap-6 pt-1">{options.map(opt => (<label key={opt} className="inline-flex items-center gap-2 cursor-pointer select-none"><span onClick={() => onChange(opt)} className="shrink-0 flex items-center justify-center rounded-full border-2 transition-colors" style={{ width: 18, height: 18, borderColor: value === opt ? "#10b981" : "#d1d5db", background: "white" }}>{value === opt && <span className="rounded-full" style={{ width: 10, height: 10, background: "#10b981", display: "block" }} />}</span><span className="text-sm" style={{ color: "#374151" }}>{opt}</span></label>))}</div>);
}

// ── 3‑level region data ──────────────────────────────────────────
type RegionNode = { label: string; children?: RegionNode[] };

const REGION_TREE: RegionNode[] = [
  {
    label: "北京市", children: [
      { label: "东城区", children: [{ label: "东华门街道" }, { label: "景山街道" }, { label: "交道口街道" }, { label: "安定门街道" }, { label: "北新桥街道" }, { label: "东四街道" }, { label: "朝阳门街道" }, { label: "建国门街道" }, { label: "前门街道" }, { label: "崇文门外街道" }, { label: "东花市街道" }, { label: "龙潭街道" }, { label: "体育馆路街道" }, { label: "天坛街道" }, { label: "永定门外街道" }] },
      { label: "西城区", children: [{ label: "西长安街街道" }, { label: "新街口街道" }, { label: "金融街街道" }, { label: "陶然亭街道" }, { label: "大栅栏街道" }, { label: "什刹海街道" }] },
      { label: "朝阳区", children: [{ label: "建国门外街道" }, { label: "三里屯街道" }, { label: "望京街道" }, { label: "大屯街道" }, { label: "亚运村街道" }, { label: "奥运村街道" }] },
      { label: "丰台区", children: [{ label: "丰台街道" }, { label: "卢沟桥街道" }, { label: "南苑街道" }, { label: "马家堡街道" }] },
      { label: "石景山区" }, { label: "海淀区" }, { label: "顺义区" }, { label: "通州区" }, { label: "大兴区" }, { label: "昌平区" },
      { label: "房山区" }, { label: "门头沟区" }, { label: "怀柔区" }, { label: "平谷区" }, { label: "密云区" }, { label: "延庆区" },
    ],
  },
  {
    label: "上海市", children: [
      { label: "黄浦区", children: [{ label: "南京东路街道" }, { label: "外滩街道" }, { label: "豫园街道" }, { label: "老西门街道" }] },
      { label: "徐汇区" }, { label: "长宁区" }, { label: "静安区" }, { label: "普陀区" }, { label: "虹口区" }, { label: "杨浦区" },
      { label: "浦东新区" }, { label: "闵行区" }, { label: "宝山区" }, { label: "嘉定区" }, { label: "金山区" }, { label: "松江区" },
      { label: "青浦区" }, { label: "奉贤区" }, { label: "崇明区" },
    ],
  },
  {
    label: "广东省", children: [
      { label: "广州市", children: [{ label: "越秀区" }, { label: "海珠区" }, { label: "荔湾区" }, { label: "天河区" }, { label: "白云区" }, { label: "黄埔区" }, { label: "番禺区" }, { label: "花都区" }, { label: "南沙区" }, { label: "增城区" }, { label: "从化区" }] },
      { label: "深圳市", children: [{ label: "罗湖区" }, { label: "福田区" }, { label: "南山区" }, { label: "宝安区" }, { label: "龙岗区" }, { label: "盐田区" }, { label: "龙华区" }, { label: "坪山区" }, { label: "光明区" }] },
      { label: "珠海市" }, { label: "汕头市" }, { label: "佛山市" }, { label: "韶关市" }, { label: "湛江市" }, { label: "肇庆市" },
      { label: "江门市" }, { label: "茂名市" }, { label: "惠州市" }, { label: "梅州市" }, { label: "汕尾市" }, { label: "河源市" },
      { label: "阳江市" }, { label: "清远市" }, { label: "东莞市" }, { label: "中山市" }, { label: "潮州市" }, { label: "揭阳市" }, { label: "云浮市" },
    ],
  },
  {
    label: "广西壮族自治区", children: [
      { label: "南宁市", children: [{ label: "青秀区" }, { label: "兴宁区" }, { label: "江南区" }, { label: "西乡塘区" }, { label: "良庆区" }, { label: "邕宁区" }, { label: "武鸣区" }] },
      { label: "柳州市", children: [{ label: "城中区" }, { label: "鱼峰区" }, { label: "柳南区" }, { label: "柳北区" }, { label: "柳江区" }] },
      { label: "桂林市", children: [{ label: "秀峰区" }, { label: "叠彩区" }, { label: "象山区" }, { label: "七星区" }, { label: "雁山区" }, { label: "临桂区" }] },
      { label: "梧州市" }, { label: "北海市" }, { label: "防城港市" }, { label: "钦州市" }, { label: "贵港市" },
      { label: "玉林市" }, { label: "百色市" }, { label: "贺州市" }, { label: "河池市" }, { label: "来宾市" }, { label: "崇左市" },
    ],
  },
  { label: "天津市" }, { label: "河北省" }, { label: "山西省" }, { label: "内蒙古自治区" },
  { label: "辽宁省" }, { label: "吉林省" }, { label: "黑龙江省" },
  { label: "江苏省" }, { label: "浙江省" }, { label: "安徽省" }, { label: "福建省" }, { label: "江西省" },
  { label: "山东省" }, { label: "河南省" }, { label: "湖北省" }, { label: "湖南省" },
  { label: "海南省" }, { label: "重庆市" }, { label: "四川省" }, { label: "贵州省" }, { label: "云南省" },
  { label: "西藏自治区" }, { label: "陕西省" }, { label: "甘肃省" }, { label: "青海省" }, { label: "宁夏回族自治区" }, { label: "新疆维吾尔自治区" },
];

// ── Cascading address picker ──────────────────────────────────────
function CascaderAddress({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [col1, setCol1] = useState<RegionNode | null>(null);
  const [col2, setCol2] = useState<RegionNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    function onClick(e: MouseEvent) { if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); }
    if (open) { document.addEventListener("keydown", onKey); document.addEventListener("mousedown", onClick); }
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  const columns: RegionNode[][] = [REGION_TREE];
  if (col1?.children) columns.push(col1.children);
  if (col2?.children) columns.push(col2.children);

  const select = (node: RegionNode, level: number) => {
    if (level === 0) { setCol1(node); setCol2(null); }
    else if (level === 1) { setCol2(node); }
    else {
      const path = [col1?.label, col2?.label, node.label].filter(Boolean).join(" / ");
      onChange(path);
      setCol1(null); setCol2(null); setOpen(false);
      return;
    }
    if (!node.children?.length) {
      const path = [level === 0 ? node.label : col1?.label, level === 1 ? node.label : col2?.label].filter(Boolean).join(" / ");
      onChange(path);
      setCol1(null); setCol2(null); setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input type="text" readOnly value={value} placeholder="请选择省市县" className="form-input cursor-pointer" style={{ color: value ? "#374151" : "#9ca3af" }} onClick={() => setOpen(!open)} onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} />
      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 flex" style={{ height: 260 }}>
          {columns.map((col, ci) => (
            <div key={ci} className="overflow-y-auto border-r border-gray-100 last:border-r-0" style={{ width: 156, minWidth: 0 }}>
              {col.map((node) => (
                <button key={node.label} type="button" onClick={() => select(node, ci)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors truncate"
                  style={{ color: (ci === 0 ? col1 : ci === 1 ? col2 : null)?.label === node.label ? "#10b981" : "#374151", background: (ci === 0 ? col1 : ci === 1 ? col2 : null)?.label === node.label ? "#ecfdf5" : "transparent" }}
                >{node.label}{node.children?.length ? <span className="text-gray-300 ml-1">›</span> : ""}</button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────
const TABS = ["基础信息", "请假数据", "进出数据", "消费数据", "资助情况", "学生干部风采", "体质检测", "获奖记录", "好人好事","一生一案谈心谈话记录表"];

// ── Main component ────────────────────────────────────────────────
export function StudentRosterPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  // ── form state ──
  const [regStatus, setRegStatus] = useState("");
  const [regStatusOps, setRegStatusOps] = useState("");
  const [name, setName] = useState("");
  const [formerName, setFormerName] = useState("");
  const [idCard, setIdCard] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [gender, setGender] = useState("");
  const [nation, setNation] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [age, setAge] = useState("");
  const [political, setPolitical] = useState("");
  const [householdType, setHouseholdType] = useState("");
  const [addressRegion, setAddressRegion] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [guardian1Name, setGuardian1Name] = useState("");
  const [guardian1Relation, setGuardian1Relation] = useState("");
  const [guardian1Phone, setGuardian1Phone] = useState("");
  const [guardian1Work, setGuardian1Work] = useState("");
  const [guardian2Name, setGuardian2Name] = useState("");
  const [guardian2Relation, setGuardian2Relation] = useState("");
  const [guardian2Phone, setGuardian2Phone] = useState("");
  const [guardian2Work, setGuardian2Work] = useState("");
  const [campus, setCampus] = useState("");
  const [gradeAlias, setGradeAlias] = useState("");
  const [gradeName, setGradeName] = useState("");
  const [className, setClassName] = useState("");
  const [classNo, setClassNo] = useState("");
  const [cls, setCls] = useState("");
  const [classTeacher, setClassTeacher] = useState("");
  const [classTeacherWx, setClassTeacherWx] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [gradeDirectorWx, setGradeDirectorWx] = useState("");
  const [studentType, setStudentType] = useState("");
  const [gradSchool, setGradSchool] = useState("");
  const [gradSchoolCode, setGradSchoolCode] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [isDisabled, setIsDisabled] = useState("");
  const [boardingSubsidy, setBoardingSubsidy] = useState("");
  const [nutritionSubsidy, setNutritionSubsidy] = useState("");
  const [isPoor, setIsPoor] = useState("");
  const [isPovertyRelief, setIsPovertyRelief] = useState("");
  const [isMigrant, setIsMigrant] = useState("");
  const [isLeftBehind, setIsLeftBehind] = useState("");
  const [remark, setRemark] = useState("");
  const [dormStatus, setDormStatus] = useState("");
  const [dormBuildingNo, setDormBuildingNo] = useState("");
  const [dormBuilding, setDormBuilding] = useState("");
  const [dormNo, setDormNo] = useState("");
  const [bedNo, setBedNo] = useState("");
  const [electiveSubject, setElectiveSubject] = useState("");
  const [electiveDirection, setElectiveDirection] = useState("");
  const [elective1, setElective1] = useState("");
  const [elective2, setElective2] = useState("");
  const [foreignLang, setForeignLang] = useState("");
  const [examNo, setExamNo] = useState("");
  const [updateFlag, setUpdateFlag] = useState("");

  const [submitted, setSubmitted] = useState(false);

  const scroll = (dir: "left" | "right") => {
    if (tabsRef.current) tabsRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const baseInfo = [regStatus, name, idCard, gender, guardian1Name, guardian1Relation, guardian1Phone, campus, gradeAlias, className, electiveSubject, electiveDirection, elective1, elective2, foreignLang];
    if (baseInfo.find((f) => !f)) window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader breadcrumbs={[{ label: "学生档案" }, { label: "学生花名册", active: true }]} onMenuOpen={onMenuOpen} />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          <div className="rounded-2xl md:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Tab bar */}
            <div className="flex items-center border-b border-gray-100/50">
              <button onClick={() => scroll("left")} className="shrink-0 px-2 py-4 text-gray-400 hover:text-gray-600 transition-colors"><ChevronLeft size={18} /></button>
              <div ref={tabsRef} className="flex flex-1 overflow-x-auto items-center" style={{ scrollbarWidth: "none" }}>
                {TABS.map((tab, i) => (
                  <button key={tab} onClick={() => setActiveTab(i)} className={`pb-4 px-4 pt-4 text-xl font-bold whitespace-nowrap shrink-0${activeTab === i ? " macos-tab-active" : " text-gray-400 hover:text-gray-600 transition-colors"}`}>{tab}</button>
                ))}
              </div>
              <button onClick={() => scroll("right")} className="shrink-0 px-2 py-4 text-gray-400 hover:text-gray-600 transition-colors"><ChevronRight size={18} /></button>
            </div>

            {/* Form content */}
            <div className="px-6 md:px-10 py-4">

              {activeTab === 0 && (
                <>
                  {/* ── 基本信息-学籍 ── */}
                  <SectionHeader title="基本信息-学籍" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="学籍状态-教务" required><SelectField value={regStatus} onChange={setRegStatus} options={["招生【增加】","转入【增加】","复读【增加】","复学【增加】"]} />{submitted && !regStatus && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="学籍状态-运营"><SelectField value={regStatusOps} onChange={setRegStatusOps} options={["招生【增加】","转入【增加】","复读【增加】","复学【增加】"]} /></Field>
                  </div>

                  {/* ── 照片 ── */}
                  <SectionHeader title="照片" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PhotoZone label="证件照" hint="支持 jpg/png 格式，建议尺寸 120×160 像素" />
                    <PhotoZone label="生活照" hint="支持 jpg/png 格式，建议尺寸 120×160 像素" />
                  </div>

                  {/* ── 身份信息 ── */}
                  <SectionHeader title="身份信息" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="姓名" required><Input value={name} onChange={setName} placeholder="请输入姓名" />{submitted && !name && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="曾用名"><Input value={formerName} onChange={setFormerName} placeholder="请输入曾用名" /></Field>
                    <Field label="身份证号" required><Input value={idCard} onChange={setIdCard} placeholder="请输入身份证号" />{submitted && !idCard && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="全国学籍号"><Input value={nationalId} onChange={setNationalId} placeholder="导入内容" disabled /></Field>
                    <Field label="性别" required><SelectField value={gender} onChange={setGender} options={["男", "女"]} />{submitted && !gender && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="民族"><Input value={nation} onChange={setNation} placeholder="请输入民族" /></Field>
                    <Field label="出生日期"><Input value={birthDate} onChange={setBirthDate} type="date" /></Field>
                    <Field label="年龄"><Input value={age} onChange={setAge} type="number" placeholder="自动计算" disabled /></Field>
                    <Field label="政治面貌"><SelectField value={political} onChange={setPolitical} options={["群众","共青团员","中共党员","中共预备党员"]} /></Field>
                    <Field label={'户籍类型（含"一卡通"情况）'}><SelectField value={householdType} onChange={setHouseholdType} options={["农业户籍","非农业户籍"]} /></Field>
                    <div>
                      <Field label="现居地址（省市县/具体街道）">
                        <CascaderAddress value={addressRegion} onChange={setAddressRegion} />
                        <div className="mt-2"><textarea value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} placeholder="请填写具体街道、门牌号" rows={3} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /></div>
                      </Field>
                    </div>
                    <Field label="本人手机号"><Input value={phone} onChange={setPhone} placeholder="请输入手机号" /></Field>
                  </div>

                  {/* ── 监护人信息 ── */}
                  <SectionHeader title="监护人信息" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="监护人1 姓名" required><Input value={guardian1Name} onChange={setGuardian1Name} placeholder="请输入姓名" />{submitted && !guardian1Name && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="监护人1 关系" required><Input value={guardian1Relation} onChange={setGuardian1Relation} placeholder="父亲、母亲、爷爷、奶奶等" />{submitted && !guardian1Relation && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="监护人1 电话" required><Input value={guardian1Phone} onChange={setGuardian1Phone} placeholder="请输入联系电话" />{submitted && !guardian1Phone && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="监护人1 工作单位"><Input value={guardian1Work} onChange={setGuardian1Work} placeholder="请输入工作单位" /></Field>
                    <Field label="监护人2 姓名"><Input value={guardian2Name} onChange={setGuardian2Name} placeholder="请输入姓名" /></Field>
                    <Field label="监护人2 关系"><Input value={guardian2Relation} onChange={setGuardian2Relation} placeholder="父亲、母亲、爷爷、奶奶等" /></Field>
                    <Field label="监护人2 电话"><Input value={guardian2Phone} onChange={setGuardian2Phone} placeholder="请输入联系电话" /></Field>
                    <Field label="监护人2 工作单位"><Input value={guardian2Work} onChange={setGuardian2Work} placeholder="请输入工作单位" /></Field>
                  </div>

                  {/* ── 就读学校信息 ── */}
                  <SectionHeader title="就读学校信息" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="校区" required><RadioGroup value={campus} onChange={setCampus} options={["北区校内","南区校外"]} />{submitted && !campus && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="年级别名" required><SelectField value={gradeAlias} onChange={setGradeAlias} options={["请选择"]} />{submitted && !gradeAlias && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="年级名称" required><Input value={gradeName} onChange={setGradeName} placeholder="输入内容" disabled />{submitted && !gradeName && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="班级名称" required><SelectField value={className} onChange={setClassName} options={["北区","南区"]} />{submitted && !className && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="班级号"><Input value={classNo} onChange={setClassNo} placeholder="请输入班级号" /></Field>
                    <Field label="班级"><Input value={cls} onChange={setCls} placeholder="请输入班级" /></Field>
                    <Field label="班主任"><Input value={classTeacher} onChange={setClassTeacher} placeholder="请输入班主任" /></Field>
                    <Field label="班主任-企微"><Input value={classTeacherWx} onChange={setClassTeacherWx} placeholder="请输入班主任-企微" /></Field>
                    <Field label="级部"><Input value={gradeLevel} onChange={setGradeLevel} placeholder="请输入级部" /></Field>
                    <Field label="级部主任-企微"><Input value={gradeDirectorWx} onChange={setGradeDirectorWx} placeholder="请输入级部主任-企微" /></Field>
                    <Field label="学生类型"><SelectField value={studentType} onChange={setStudentType} options={["文化生","体育生","舞蹈生","音乐声"]} /></Field>
                  </div>

                  {/* ── 毕业学校信息 ── */}
                  <SectionHeader title="毕业学校信息" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="毕业学校"><Input value={gradSchool} onChange={setGradSchool} placeholder="请输入毕业学校" /></Field>
                    <Field label="毕业学校识别码"><Input value={gradSchoolCode} onChange={setGradSchoolCode} placeholder="请输入毕业学校识别码" /></Field>
                  </div>

                  {/* ── 身体情况 ── */}
                  <SectionHeader title="身体情况" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="既往病史"><Input value={medicalHistory} onChange={setMedicalHistory} placeholder="请输入既往病史" /></Field>
                    <Field label="是否残疾"><SelectField value={isDisabled} onChange={setIsDisabled} options={["是","否"]} /></Field>
                  </div>

                  {/* ── 其他 ── */}
                  <SectionHeader title="其他" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="享受寄宿生生活补助金额（元）"><Input value={boardingSubsidy} onChange={setBoardingSubsidy} placeholder="" /></Field>
                    <Field label="享受营养改善计划补助金额（元）"><Input value={nutritionSubsidy} onChange={setNutritionSubsidy} placeholder="" /></Field>
                    <Field label="是建档立卡贫困户"><SelectField value={isPoor} onChange={setIsPoor} options={["是","否"]} /></Field>
                    <Field label="建档立卡脱贫户子女"><SelectField value={isPovertyRelief} onChange={setIsPovertyRelief} options={["是","否"]} /></Field>
                    <Field label="随迁子女入"><SelectField value={isMigrant} onChange={setIsMigrant} options={["是","否"]} /></Field>
                    <Field label="在校（园）农村留守儿童"><SelectField value={isLeftBehind} onChange={setIsLeftBehind} options={["是","否"]} /></Field>
                    <Field label="备注"><textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="" rows={3} className="form-input resize-none" onFocus={(e) => Object.assign(e.currentTarget.style, focusStyle)} onBlur={(e) => Object.assign(e.currentTarget.style, blurStyle)} /></Field>
                  </div>

                  {/* ── 宿舍信息 ── */}
                  <SectionHeader title="宿舍信息" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="宿舍入住状态"><SelectField value={dormStatus} onChange={setDormStatus} options={["是","否"]} /></Field>
                    <Field label="宿舍楼号"><Input value={dormBuildingNo} onChange={setDormBuildingNo} placeholder="" /></Field>
                    <Field label="宿舍楼栋"><Input value={dormBuilding} onChange={setDormBuilding} placeholder="" /></Field>
                    <Field label="宿舍号"><Input value={dormNo} onChange={setDormNo} placeholder="" /></Field>
                    <Field label="床位"><Input value={bedNo} onChange={setBedNo} placeholder="" /></Field>
                  </div>

                  {/* ── 新高考选科信息 ── */}
                  <SectionHeader title="新高考选科信息" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="选科科目" required><SelectField value={electiveSubject} onChange={setElectiveSubject} options={["物化生","物化政","物化地","物生政","物生地","物政地"]} />{submitted && !electiveSubject && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="选科方向" required><Input value={electiveDirection} onChange={setElectiveDirection} placeholder="" />{submitted && !electiveDirection && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="选科1" required><Input value={elective1} onChange={setElective1} placeholder="" />{submitted && !elective1 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="选科2" required><Input value={elective2} onChange={setElective2} placeholder="" />{submitted && !elective2 && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="外语选科" required><SelectField value={foreignLang} onChange={setForeignLang} options={["英语","日语"]} />{submitted && !foreignLang && <p className="text-xs mt-1.5" style={{ color: "#ff4d4f" }}>此项为必填项</p>}</Field>
                    <Field label="考号"><Input value={examNo} onChange={setExamNo} placeholder="" /></Field>
                    <Field label="更新标识"><Input value={updateFlag} onChange={setUpdateFlag} placeholder="" /></Field>
                  </div>
                </>
              )}

              {activeTab !== 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                  <span className="text-4xl mb-4">📄</span>
                  <p className="text-sm">{TABS[activeTab]}暂无数据</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div className="form-footer shrink-0 flex gap-3 px-6 md:px-10 py-4">
        <button className="px-8 py-2.5 rounded-xl text-base font-semibold text-white transition-all hover:opacity-90 active:translate-y-px" style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }} onClick={handleSubmit}>提交</button>
        <button className="btn-secondary">保存至草稿</button>
      </div>

    </div>
  );
}
