#!/usr/bin/env tsx
/**
 * Sitemap 生成脚本
 * 在构建时运行，生成静态 sitemap.xml 到 public 目录
 *
 * 使用方法:
 *   pnpm tsx scripts/generate-sitemap.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// 获取项目根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// 网站配置
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://abox.run"
).replace(/\/+$/, "");

// 页面类型优先级配置
const PRIORITY_CONFIG = {
  home: 1.0,
  category: 0.9,
  core: 0.85,
  doc: 0.7,
  nested: 0.6,
} as const;

const CORE_PAGE_KEYWORDS = [
  "install",
  "quickstart",
  "getting-started",
  "usage",
  "plugin-dev",
  "creator-tools",
];

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: number;
}

/**
 * 从 content 目录扫描所有文档文件
 */
function getContentPages(): Array<{ url: string; slugs: string[] }> {
  const contentDir = path.join(projectRoot, "content", "docs");
  const pages: Array<{ url: string; slugs: string[] }> = [];

  function scanDir(dir: string, baseSlugs: string[] = []) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // 递归扫描子目录
        scanDir(fullPath, [...baseSlugs, item]);
      } else if (item.endsWith(".md") || item.endsWith(".mdx")) {
        // 处理 markdown 文件
        const slug = item.replace(/\.(md|mdx)$/, "");
        // index 文件使用目录作为 slug
        const finalSlugs =
          slug === "index" ? baseSlugs : [...baseSlugs, slug];
        const urlPath = "/docs/" + finalSlugs.join("/");
        pages.push({
          url: urlPath,
          slugs: finalSlugs,
        });
      }
    }
  }

  if (fs.existsSync(contentDir)) {
    scanDir(contentDir);
  }

  return pages;
}

/**
 * 从 content/blog 目录扫描所有博客文件
 */
function getBlogPages(): Array<{ url: string; slug: string }> {
  const blogDir = path.join(projectRoot, "content", "blog");
  const pages: Array<{ url: string; slug: string }> = [];

  if (!fs.existsSync(blogDir)) {
    return pages;
  }

  const items = fs.readdirSync(blogDir);

  for (const item of items) {
    const fullPath = path.join(blogDir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      continue;
    }

    if (item.endsWith(".md") || item.endsWith(".mdx")) {
      const slug = item.replace(/\.(md|mdx)$/, "");
      if (slug === "meta") {
        continue;
      }
      pages.push({
        url: `/blog/${slug}`,
        slug,
      });
    }
  }

  return pages;
}

/**
 * 根据页面路径判断优先级
 */
function getPagePriority(url: string, slugLength: number): number {
  if (url === "/") return PRIORITY_CONFIG.home;

  const lowerUrl = url.toLowerCase();
  const isCorePage = CORE_PAGE_KEYWORDS.some((keyword) =>
    lowerUrl.includes(keyword),
  );
  if (isCorePage && slugLength <= 2) return PRIORITY_CONFIG.core;
  if (slugLength === 1) return PRIORITY_CONFIG.category;
  if (slugLength >= 4) return PRIORITY_CONFIG.nested;
  return PRIORITY_CONFIG.doc;
}

/**
 * 根据页面层级判断更新频率
 */
function getChangeFrequency(url: string, slugLength: number): string {
  if (url === "/") return "daily";
  if (slugLength <= 2) return "weekly";
  return "monthly";
}

/**
 * 生成 sitemap.xml 内容
 */
function generateSitemapXml(entries: SitemapEntry[]): string {
  const urls = entries
    .map(
      (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

/**
 * 主函数
 */
function main() {
  console.log("🗺️  开始生成 sitemap.xml...");

  try {
    // 获取所有内容页面
    const pages = getContentPages();
    console.log(`📄 发现 ${pages.length} 个页面`);

    // 构建 sitemap 条目
    const entries: SitemapEntry[] = [
      // 首页
      {
        url: SITE_URL,
        lastmod: new Date().toISOString(),
        changefreq: "daily",
        priority: PRIORITY_CONFIG.home,
      },
    ];

    // 添加文档页面
    for (const page of pages) {
      const slugLength = page.slugs.length;
      entries.push({
        url: `${SITE_URL}${page.url}`,
        lastmod: new Date().toISOString(),
        changefreq: getChangeFrequency(page.url, slugLength),
        priority: getPagePriority(page.url, slugLength),
      });
    }

    // 添加博客列表页
    entries.push({
      url: `${SITE_URL}/blog`,
      lastmod: new Date().toISOString(),
      changefreq: "weekly",
      priority: PRIORITY_CONFIG.category,
    });

    // 添加博客文章
    const blogPages = getBlogPages();
    for (const page of blogPages) {
      entries.push({
        url: `${SITE_URL}${page.url}`,
        lastmod: new Date().toISOString(),
        changefreq: "monthly",
        priority: PRIORITY_CONFIG.doc,
      });
    }

    // 去重
    const seen = new Set<string>();
    const uniqueEntries = entries.filter((entry) => {
      if (seen.has(entry.url)) return false;
      seen.add(entry.url);
      return true;
    });

    console.log(`✅ 生成 ${uniqueEntries.length} 个唯一 URL`);

    // 生成 XML
    const xml = generateSitemapXml(uniqueEntries);

    // 确保 public 目录存在
    const publicDir = path.join(projectRoot, "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 写入文件
    const sitemapPath = path.join(publicDir, "sitemap.xml");
    fs.writeFileSync(sitemapPath, xml, "utf-8");

    console.log(`🎉 Sitemap 已生成: ${sitemapPath}`);
    console.log(`🔗 访问地址: ${SITE_URL}/sitemap.xml`);
  } catch (error) {
    console.error("❌ 生成 sitemap 失败:", error);
    process.exit(1);
  }
}

// 运行
main();
