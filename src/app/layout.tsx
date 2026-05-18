import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Banner } from "fumadocs-ui/components/banner";
import { Body } from "./layout.client";
import "./global.css";

export const metadata = {
  title: {
    default: "AstroBox 文档",
    template: "%s | AstroBox 文档",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="zh-CN"
      className={`font-sans font-setting`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://i02.appmifile.com/i18n/fonts/MiSansChinese/index.css"
        />
        <meta name="theme-color" content="#1781ff" />
      </head>
      <Body>
        <Banner height="2.5rem" className="fixed! w-screen bg-[#1781ff] text-white z-50">
          未完成内容，不代表最终质量
        </Banner>
        <RootProvider i18n={{ locale: "zh-CN", translations: { toc: "大纲" } }}>
          {children}
        </RootProvider>
      </Body>
    </html>
  );
}
