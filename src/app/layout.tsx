import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import "./global.css";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "AstroBox 文档",
    template: "%s | AstroBox 文档",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geist.variable} ${mono.variable} font-setting`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://i02.appmifile.com/i18n/fonts/MiSansChinese/index.css" />
      </head>
      <body className="relative flex min-h-screen flex-col" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
        <Footer />
      </body>
    </html>
  );
}
