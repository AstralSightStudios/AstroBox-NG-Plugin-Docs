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

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geist.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="relative flex min-h-screen flex-col" suppressHydrationWarning>
        <RootProvider>{children}</RootProvider>
        <Footer />
      </body>
    </html>
  );
}
