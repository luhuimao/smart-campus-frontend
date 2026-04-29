"use client";

import { useState, useRef } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { PageHeader } from "./PageHeader";

const focusStyle = { borderColor: "#10b981", boxShadow: "0 0 0 4px rgba(16,185,129,0.1)" };
const blurStyle  = { borderColor: "#e5e7eb", boxShadow: "none" };

// ── Section header ────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="relative flex items-center justify-center my-6" style={{ height: 32 }}>
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, transparent 0%, #10b981 10%, #10b981 90%, transparent 100%)" }} />
      <div className="absolute" style={{ left: "10%", width: 12, height: 12, background: "#10b981", transform: "rotate(45deg)" }} />
      <div className="absolute" style={{ right: "10%", width: 12, height: 12, background: "#10b981", transform: "rotate(45deg)" }} />
      <span className="relative z-10 text-white font-medium text-sm">{title}</span>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────────────────────
function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-base font-semibold mb-2" style={{ color: "#1d1d1f" }}>
        {required && <span style={{ color: "#ff4d4f", marginRight: 4 }}>*</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

// ── Input ─────────────────────────────────────────────────────────
function Input({ placeholder = "", type = "text", disabled }: {
  placeholder?: string; type?: string; disabled?: boolean;
}) {
  return (
    <input type={type} placeholder={placeholder} disabled={disabled}
      className="form-input"
      style={disabled ? { background: "#f9fafb", color: "#9ca3af" } : undefined}
      onFocus={e => { if (!disabled) Object.assign(e.currentTarget.style, focusStyle); }}
      onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}
    />
  );
}

// ── SelectField ───────────────────────────────────────────────────
function SelectField({ options, disabled }: { options: string[]; disabled?: boolean }) {
  return (
    <div className="relative">
      <select disabled={disabled}
        className="form-input appearance-none pr-9"
        style={disabled ? { background: "#f9fafb", color: "#9ca3af" } : { color: "#1d1d1f" }}
        defaultValue=""
        onFocus={e => { if (!disabled) Object.assign(e.currentTarget.style, focusStyle); }}
        onBlur={e => Object.assign(e.currentTarget.style, blurStyle)}>
        <option value="" disabled />
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={15} className="absolute right-3.5 top-3 pointer-events-none" style={{ color: "#9ca3af" }} />
    </div>
  );
}

// ── Photo upload zone ─────────────────────────────────────────────
function PhotoZone({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 py-8 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors">
      <Upload className="w-6 h-6 text-gray-300" />
      <span className="text-base text-gray-400">{label}</span>
      <span className="text-sm text-gray-300 text-center px-2">{hint}</span>
    </div>
  );
}

// ── Radio group ───────────────────────────────────────────────────
function RadioGroup({ name, options }: { name: string; options: string[] }) {
  return (
    <div className="flex items-center gap-6 h-10">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2 text-base cursor-pointer" style={{ color: "#374151" }}>
          <input type="radio" name={name} value={opt} className="w-4 h-4 accent-emerald-500" />
          {opt}
        </label>
      ))}
    </div>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────
const TABS = ["基础信息", "请假数据", "进出数据", "消费数据", "资助情况", "学生干部风采", "体质检测", "获奖记录", "好人好事","一生一案谈心谈话记录表"];

// ── Main component ────────────────────────────────────────────────
export function StudentRosterPage({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [activeTab, setActiveTab] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (tabsRef.current) tabsRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ color: "#1d1d1f" }}>
      <PageHeader
        breadcrumbs={[{ label: "学生档案" }, { label: "学生花名册", active: true }]}
        onMenuOpen={onMenuOpen}
      />

      <div className="flex-1 overflow-y-auto bg-[#f5f5f7] pb-24">
        <div className="max-w-5xl mx-auto mt-4 md:mt-10 px-3 md:px-6">

          <div className="rounded-2xl md:rounded-[28px] overflow-hidden shadow-sm border border-gray-100 bg-white">

            {/* Tab bar */}
            <div className="flex items-center border-b border-gray-100/50">
              <button onClick={() => scroll("left")}
                className="shrink-0 px-2 py-4 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div ref={tabsRef} className="flex flex-1 overflow-x-auto items-center" style={{ scrollbarWidth: "none" }}>
                {TABS.map((tab, i) => (
                  <button key={tab} onClick={() => setActiveTab(i)}
                    className={`pb-4 px-4 pt-4 text-xl font-bold whitespace-nowrap shrink-0${activeTab === i ? " macos-tab-active" : " text-gray-400 hover:text-gray-600 transition-colors"}`}>
                    {tab}
                  </button>
                ))}
              </div>
              <button onClick={() => scroll("right")}
                className="shrink-0 px-2 py-4 text-gray-400 hover:text-gray-600 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Form content */}
            <div className="px-6 md:px-10 py-4">

              {activeTab === 0 && (
                <>
                  {/* ── 基本信息-学籍 ── */}
                  <SectionHeader title="基本信息-学籍" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="学籍状态-教务" required>
                      <SelectField options={["招生【增加】","转入【增加】","复读【增加】","复学【增加】"]} />
                    </Field>
                    <Field label="学籍状态-运营">
                      <SelectField options={["招生【增加】","转入【增加】","复读【增加】","复学【增加】"]} />
                    </Field>
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
                    <Field label="姓名" required>
                      <Input placeholder="请输入姓名" />
                    </Field>
                    <Field label="曾用名" >
                      <Input placeholder="请输入曾用名" />
                    </Field>
                    <Field label="身份证号" required>
                      <Input placeholder="请输入身份证号" />
                    </Field>
                    <Field label="全国学籍号">
                      <Input placeholder="导入内容" disabled />
                    </Field>
                    <Field label="性别" required>
                      <SelectField options={["男", "女"]} />
                    </Field>
                    <Field label="民族">
                      <Input placeholder="请输入民族" />
                    </Field>
                    <Field label="出生日期">
                      <Input type="date" />
                    </Field>
                    <Field label="年龄">
                      <Input type="number" placeholder="自动计算" disabled />
                    </Field>
                    <Field label="政治面貌" >
                      <SelectField options={["群众","共青团员","中共党员","中共预备党员"]} />
                    </Field>
                    <Field label={"户籍类型（含“一卡通”情况）"}>
                      <SelectField options={["农业户籍","非农业户籍"]} />
                    </Field>
                    <Field label="现居地址（省市县/具体街道）">
                      <SelectField options={["广西壮族自治区"]} />
                      <div className="mt-2">
                        <textarea placeholder="请填写具体地址" rows={3}
                          className="form-input resize-none"
                          onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                      </div>
                    </Field>
                    <Field label="本人手机号">
                      <Input placeholder="请输入手机号" />
                    </Field>
                  </div>

                  {/* ── 监护人信息 ── */}
                  <SectionHeader title="监护人信息" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="监护人1 姓名" required>
                      <Input placeholder="请输入姓名" />
                    </Field>
                    <Field label="监护人1 关系" required>
                      <Input placeholder="父亲、母亲、爷爷、奶奶等" />
                    </Field>
                    <Field label="监护人1 电话" required>
                      <Input placeholder="请输入联系电话" />
                    </Field>
                    <Field label="监护人1 工作单位">
                      <Input placeholder="请输入工作单位" />
                    </Field>
                    <Field label="监护人2 姓名">
                      <Input placeholder="请输入姓名" />
                    </Field>
                    <Field label="监护人2 关系">
                      <Input placeholder="父亲、母亲、爷爷、奶奶等" />
                    </Field>
                    <Field label="监护人2 电话">
                      <Input placeholder="请输入联系电话" />
                    </Field>
                    <Field label="监护人2 工作单位">
                      <Input placeholder="请输入工作单位" />
                    </Field>
                  </div>

                  {/* ── 就读学校信息 ── */}
                  <SectionHeader title="就读学校信息" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="校区" required>
                      <RadioGroup name="residence" options={["北区校内","南区校外"]} />
                    </Field>
                    <Field label="年级别名" required>
                      <SelectField options={["请选择"]} />
                    </Field>
                    <Field label="年级名称" required>
                      <Input placeholder="输入内容" disabled />
                    </Field>
                    <Field label="班级名称" required>
                      <SelectField options={["北区","南区"]} />
                    </Field>
                     <Field label="班级号">
                      <Input placeholder="请输入班级号" />
                    </Field>
                    <Field label="班级">
                      <Input placeholder="请输入班级" />
                    </Field>
                    <Field label="班主任">
                      <Input placeholder="请输入班主任" />
                    </Field>
                     <Field label="班主任-企微">
                      <Input placeholder="请输入班主任-企微" />
                    </Field>
                    <Field label="级部">
                      <Input placeholder="请输入级部" />
                    </Field>
                    <Field label="级部主任-企微">
                      <Input placeholder="请输入级部主任-企微" />
                    </Field>
                    <Field label="学生类型" >
                      <SelectField options={["文化生","体育生","舞蹈生","音乐声"]} />
                    </Field>
                  </div>

                   {/* ── 毕业学校信息 ── */}
                    <SectionHeader title="毕业学校信息" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <Field label="毕业学校">
                      <Input placeholder="请输入毕业学校" />
                    </Field>
                    <Field label="毕业学校识别码">
                      <Input placeholder="请输入毕业学校识别码" />
                    </Field>
                   </div>

                  {/* ── 身体情况 ── */}
                    <SectionHeader title="身体情况" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <Field label="既往病史">
                      <Input placeholder="请输入既往病史" />
                    </Field>
                    <Field label="是否残疾" >
                      <SelectField options={["是","否"]} />
                    </Field>
                   </div>

                     {/* ── 其他 ── */}
                    <SectionHeader title="其他" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    <Field label="享受寄宿生生活补助金额（元）">
                      <Input placeholder="" />
                    </Field>
                    <Field label="享受营养改善计划补助金额（元）">
                      <Input placeholder="" />
                    </Field>
                    <Field label="是建档立卡贫困户" >
                      <SelectField options={["是","否"]} />
                    </Field>
                     <Field label="建档立卡脱贫户子女" >
                      <SelectField options={["是","否"]} />
                    </Field>
                    <Field label="随迁子女入" >
                      <SelectField options={["是","否"]} />
                    </Field>
                    <Field label="在校（园）农村留守儿童" >
                      <SelectField options={["是","否"]} />
                    </Field>
                     <Field label="备注">
                      <textarea placeholder="" rows={3}
                          className="form-input resize-none"
                          onFocus={e => Object.assign(e.currentTarget.style, focusStyle)}
                          onBlur={e => Object.assign(e.currentTarget.style, blurStyle)} />
                    </Field>
                   </div>

                  {/* ── 宿舍信息 ── */}
                    <SectionHeader title="宿舍信息" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <Field label="宿舍入住状态" >
                      <SelectField options={["是","否"]} />
                    </Field>
                    <Field label="宿舍楼号">
                      <Input placeholder="" />
                    </Field>
                     <Field label="宿舍楼栋">
                      <Input placeholder="" />
                    </Field>
                     <Field label="宿舍号">
                      <Input placeholder="" />
                    </Field>
                     <Field label="床位">
                      <Input placeholder="" />
                    </Field>
                   </div>

                     {/* ── 新高考选科信息 ── */}
                    <SectionHeader title="新高考选科信息" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                      <Field label="选科科目" required >
                      <SelectField options={["物化生","物化政","物化地","物生政","物生地","物政地"]} />
                    </Field>
                    <Field label="选科方向" required>
                      <Input placeholder="" />
                    </Field>
                     <Field label="选科1" required>
                      <Input placeholder="" />
                    </Field>
                     <Field label="选科2" required>
                      <Input placeholder="" />
                    </Field>
                    <Field label="外语选科" required >
                      <SelectField options={["英语","日语"]} />
                    </Field>
                     <Field label="考号" >
                      <Input placeholder="" />
                    </Field>
                    <Field label="更新标识" >
                      <Input placeholder="" />
                    </Field>
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
        <button
          className="px-8 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:translate-y-px"
          style={{ background: "#10b981", boxShadow: "0 4px 12px rgba(16,185,129,0.15)" }}>
          提交
        </button>
        <button className="btn-secondary">保存至草稿</button>
      </div>

    </div>
  );
}
