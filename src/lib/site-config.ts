import type { MainItemType } from "fumadocs-ui/layouts/shared";

export const siteHomeHref = "/";
export const siteBrandName = "AstroBox";

export const topNavLinks: MainItemType[] = [
  { text: "使用教程", url: "/docs/usage", active: "nested-url" },
  { text: "插件开发", url: "/docs/plugin-dev", active: "nested-url" },
  { text: "创作者工具", url: "/docs/creator-tools", active: "nested-url" },
];
