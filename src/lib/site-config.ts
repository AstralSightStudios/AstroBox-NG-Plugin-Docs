import type { MainItemType } from "fumadocs-ui/layouts/shared";

export const siteHomeHref = "/";
export const siteBrandName = "AstroBox";
export const siteTitle = "AstroBox 文档";
export const siteLocale = "zh_CN";
export const siteLanguage = "zh-CN";
export const sitePublisherName = "AstralSight Studios";
export const siteDescription =
  "AstroBox 官方文档，涵盖安装使用、插件开发与创作者工具的完整指南。";
export const siteKeywords = [
  "AstroBox",
  "AstroBox 文档",
  "AstroBox 使用教程",
  "AstroBox 插件开发",
  "AstroBox 创作者工具",
  "WebAssembly",
  "WASI",
  "穿戴设备",
];

const defaultSiteUrl = "https://abox.run";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl
).replace(/\/+$/, "");

export function getSiteUrl(path = siteHomeHref) {
  return new URL(path, `${siteUrl}/`).toString();
}

export function resolvePageDescription(
  title: string,
  description?: string | null,
) {
  return description?.trim() || `${title} - ${siteDescription}`;
}

export const topNavLinks: MainItemType[] = [
  { text: "使用教程", url: "/docs/usage", active: "nested-url" },
  { text: "插件开发", url: "/docs/plugin-dev", active: "nested-url" },
  { text: "创作者工具", url: "/docs/creator-tools", active: "nested-url" },
];
