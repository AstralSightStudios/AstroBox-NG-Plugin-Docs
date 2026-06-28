import type { MainItemType } from "fumadocs-ui/layouts/shared";

export const siteHomeHref = "/";
export const siteBrandName = "AstroBox";
export const siteGithubUrl = "https://github.com/AstralSightStudios/AstroBox-NG";
export const siteTitle = "AstroBox 文档";
export const siteLocale = "zh_CN";
export const siteLanguage = "zh-CN";
export const sitePublisherName = "AstralSight Studios";
export const siteDescription =
  "AstroBox 官方文档站。AstroBox 是业界领先的穿戴设备第三方工具箱，你可以使用 AstroBox 快速连接你的穿戴设备，在穿戴设备上安装表盘、快应用、固件，又或是结合 AstroBox 插件系统触发更多玩法。这份文档中涵盖了安装使用、插件开发与创作者工具的完整指南，助你快速上手 AstroBox。";
export const siteKeywords = [
  "AstroBox",
  "AstroBox下载",
  "AstroBox文档",
  "AstroBox教程",
  "AstroBox使用教程",
  "AstroBox怎么用",
  "AstroBox插件",
  "AstroBox插件开发",
  "AstroBox创作者工具",
  "WebAssembly",
  "WASI",
  "Tauri",
  "Rust",
  "穿戴设备",
  "小米账号",
  "二次验证",
  "小米手环",
  "小米手表",
  "vivo手表",
  "表盘",
  "自定义表盘",
  "bandbbs",
  "米坛",
  "米坛社区",
  "表盘自定义工具",
  "notifyformiband",
  "CLI",
  "Skills",
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
