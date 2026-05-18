import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Banner } from "fumadocs-ui/components/banner";
import {
  siteBrandName,
  siteDescription,
  siteHomeHref,
  siteKeywords,
  siteLanguage,
  siteLocale,
  sitePublisherName,
  siteTitle,
  siteUrl,
} from "@/lib/site-config";
import { Body } from "./layout.client";
import "./global.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  applicationName: siteBrandName,
  authors: [{ name: sitePublisherName }],
  creator: sitePublisherName,
  publisher: sitePublisherName,
  alternates: {
    canonical: siteHomeHref,
  },
  category: "technology",
  openGraph: {
    type: "website",
    locale: siteLocale,
    url: siteHomeHref,
    title: siteTitle,
    description: siteDescription,
    siteName: siteTitle,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/assets/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: ["/assets/brand/favicon.svg"],
    apple: "/icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1972F8" },
    { media: "(prefers-color-scheme: dark)", color: "#1C4D98" },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html
      lang={siteLanguage}
      className={`font-sans font-setting`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://i02.appmifile.com/i18n/fonts/MiSansChinese/index.css"
        />
        <meta
          name="theme-color"
          content="#1972F8"
          media="(prefers-color-scheme: light)"
        />
        <meta
          name="theme-color"
          content="#1C4D98"
          media="(prefers-color-scheme: dark)"
        />
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
