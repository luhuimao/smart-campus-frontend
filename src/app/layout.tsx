import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "./providers";
import { AuthGuard } from "@/components/AuthGuard";

export const metadata: Metadata = {
  title: "Smart Campus",
  description: "Smart Campus Management System",
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
