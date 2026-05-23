import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";
import { source } from "@/lib/source";

// 页面类型优先级配置
const PRIORITY_CONFIG = {
  // 首页最高优先级
  home: 1.0,
  // 一级分类页面
  category: 0.9,
  // 核心文档页面（安装、快速开始等）
  core: 0.85,
  // 普通文档页面
  doc: 0.7,
  // 深层嵌套页面
  nested: 0.6,
} as const;

// 核心页面关键词（用于识别重要页面）
const CORE_PAGE_KEYWORDS = [
  "install",
  "quickstart",
  "getting-started",
  "usage",
  "plugin-dev",
  "creator-tools",
];

/**
 * 根据页面路径判断优先级
 */
function getPagePriority(
  url: string,
  slugLength: number,
): number {
  // 首页
  if (url === "/") return PRIORITY_CONFIG.home;

  const lowerUrl = url.toLowerCase();

  // 检查是否为核心页面
  const isCorePage = CORE_PAGE_KEYWORDS.some((keyword) =>
    lowerUrl.includes(keyword),
  );
  if (isCorePage && slugLength <= 2) return PRIORITY_CONFIG.core;

  // 一级分类页面
  if (slugLength === 1) return PRIORITY_CONFIG.category;

  // 深层嵌套页面
  if (slugLength >= 4) return PRIORITY_CONFIG.nested;

  // 默认普通页面
  return PRIORITY_CONFIG.doc;
}

/**
 * 根据页面层级判断更新频率
 */
function getChangeFrequency(
  url: string,
  slugLength: number,
): MetadataRoute.Sitemap[number]["changeFrequency"] {
  // 首页更新最频繁
  if (url === "/") return "daily";

  // 核心文档经常更新
  if (slugLength <= 2) return "weekly";

  // 深层文档更新较少
  return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  // 获取所有文档页面
  const pages = source.getPages();

  // 构建 sitemap 条目
  const sitemapEntries: MetadataRoute.Sitemap = [
    // 首页
    {
      url: getSiteUrl("/"),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: PRIORITY_CONFIG.home,
    },
  ];

  // 添加文档页面
  for (const page of pages) {
    const url = page.url;
    const slugLength = page.slugs.length;

    sitemapEntries.push({
      url: getSiteUrl(url),
      lastModified: new Date(),
      changeFrequency: getChangeFrequency(url, slugLength),
      priority: getPagePriority(url, slugLength),
    });
  }

  // 去重（基于 URL）
  const seen = new Set<string>();
  const uniqueEntries = sitemapEntries.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });

  return uniqueEntries;
}
