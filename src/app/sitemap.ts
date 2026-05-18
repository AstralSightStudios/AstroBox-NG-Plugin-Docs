import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-config";
import { source } from "@/lib/source";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const pages = source.getPages().map((page) => ({
    url: getSiteUrl(page.url),
    lastModified,
    changeFrequency: "weekly" as const,
    priority: page.slugs.length <= 1 ? 0.8 : 0.7,
  }));

  return [
    {
      url: getSiteUrl("/"),
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    ...pages,
  ];
}
