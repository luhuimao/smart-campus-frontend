import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./providers";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "一师（生）一案",
  description: "南宁市宏德高级中学一师（生）一案管理信息平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="h-full overflow-hidden antialiased">
        <QueryProvider>
          <AuthGuard>{children}</AuthGuard>
        </QueryProvider>
      </body>
    </html>
  );
}
