import type { BlogFrontmatter } from "./blog-types";

export interface BlogListItem {
  url: string;
  title: string;
  description?: string;
  date: string;
  tags: string[];
  cover?: string;
}

export function toBlogListItem(page: {
  url: string;
  data: unknown;
}): BlogListItem {
  const data = page.data as BlogFrontmatter;
  return {
    url: page.url,
    title: data.title,
    description: data.description,
    date: data.date,
    tags: data.tags ?? [],
    cover: data.cover,
  };
}

function toTime(date: string | undefined): number {
  const time = date ? new Date(date).getTime() : Number.NaN;
  return Number.isNaN(time) ? 0 : time;
}

export function sortBlogItems(items: BlogListItem[]): BlogListItem[] {
  return [...items].sort((a, b) => toTime(b.date) - toTime(a.date));
}

export function collectBlogTags(items: BlogListItem[]): string[] {
  const tags = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags) tags.add(tag);
  }
  return Array.from(tags);
}

export function estimateReadMinutes(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) ?? []).length;
  const words = (
    text.replace(/[\u4e00-\u9fff]/g, " ").match(/[A-Za-z0-9]+/g) ?? []
  ).length;
  return Math.max(1, Math.round(cjk / 400 + words / 220));
}

export function getRelatedPosts(
  items: BlogListItem[],
  currentUrl: string,
  currentTags: string[],
  limit = 3,
): BlogListItem[] {
  const candidates = items
    .filter((item) => item.url !== currentUrl)
    .map((item) => ({
      item,
      score: item.tags.filter((tag) => currentTags.includes(tag)).length,
    }));

  const matched = candidates
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) => b.score - a.score || toTime(b.item.date) - toTime(a.item.date),
    );

  const chosen =
    matched.length > 0
      ? matched
      : [...candidates].sort(
          (a, b) => toTime(b.item.date) - toTime(a.item.date),
        );

  return chosen.slice(0, limit).map((entry) => entry.item);
}
