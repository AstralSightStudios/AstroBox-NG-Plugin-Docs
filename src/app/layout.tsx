import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Banner } from "fumadocs-ui/components/banner";
import { Footer } from "@/components/footer";
import "./global.css";

export const metadata = {
  title: {
    default: "AstroBox 文档",
    template: "%s | AstroBox 文档",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`font-sans font-setting`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://i02.appmifile.com/i18n/fonts/MiSansChinese/index.css" />
      </head>
      <body className="relative flex min-h-screen flex-col" suppressHydrationWarning>
        <Banner height="2.5rem" className="bg-[#1781ff] text-white z-50">
          未完成内容，不代表最终质量
        </Banner>
        <RootProvider>{children}</RootProvider>
        <Footer />
      </body>
    </html>
  );
}
