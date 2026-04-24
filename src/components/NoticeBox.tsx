import { cn } from "@/lib/utils";

const cardStyle: React.CSSProperties = {
  width: "100%",
  backgroundColor: "white",
  backgroundImage: 'url("/images/b711e894323f.png")',
  backgroundSize: "auto",
  backgroundPosition: "right top",
  backgroundRepeat: "no-repeat",
  borderRadius: 6,
  padding: "16px 20px",
  marginBottom: 12,
  boxShadow:
    "0 0 2px 0 rgba(19,29,46,.02), 0 4px 8px 0 rgba(19,29,46,.06), 0 4px 24px 6px rgba(19,29,46,.04)",
};

const textStyle: React.CSSProperties = {
  fontSize: 14,
  lineHeight: "24px",
  color: "rgb(19, 29, 46)",
  fontWeight: 400,
  margin: 0,
};

export function NoticeBox({ className }: { className?: string }) {
  return (
    <div style={cardStyle} className={cn(className)}>
      <p style={textStyle}>
        使用说明：
        <br />
        1、第一步请确保入职时已完成【教职工档案的填写】，才能补充其他资料。
        <br />
        2、【教职工档案的填写】后，可根据实际情况补充奖状、荣誉称号、职称、工作履历、教育经历等信息，后续获奖情况也在此点击相应按钮进行新增，新增后会同步到个人档案。
      </p>
    </div>
  );
}
