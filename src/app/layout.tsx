import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./providers";

export const metadata: Metadata = {
  title: "应用首页 - 教职工管理",
  description: "教职工管理系统 - 个人档案看板",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full overflow-hidden antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
