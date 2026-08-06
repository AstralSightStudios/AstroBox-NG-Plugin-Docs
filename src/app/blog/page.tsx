import type { Metadata } from "next";
import Link from "next/link";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { blogSource } from "@/lib/blog-source";
import { siteTitle, siteDescription } from "@/lib/site-config";
import { Footer } from "@/components/footer";
import type { BlogFrontmatter } from "@/lib/blog-types";
import { CalendarBlankIcon, TagIcon } from "@phosphor-icons/react/dist/ssr";

const pageTitle = `博客 | ${siteTitle}`;
const pageDescription = "AstroBox 官方博客：最新动态、深度文章与更新日志。";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "/blog",
    title: pageTitle,
    description: pageDescription,
    siteName: siteTitle,
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: pageDescription,
  },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getBlogData(page: ReturnType<typeof blogSource.getPages>[number]): BlogFrontmatter {
  const data = page.data as unknown as BlogFrontmatter;
  return data;
}

export default function BlogPage() {
  const posts = blogSource.getPages().sort((a, b) => {
    const aDate = getBlogData(a).date;
    const bDate = getBlogData(b).date;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });

  return (
    <HomeLayout {...baseOptions()} className="bg-fd-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <header className="mb-12 text-center md:mb-16">
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-fd-foreground md:text-5xl">
            AstroBox 博客
          </h1>
          <p className="mx-auto max-w-2xl text-base text-fd-muted-foreground md:text-lg">
            最新动态、深度文章与更新日志
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-3xl border border-fd-border/60 bg-fd-card p-12 text-center">
            <p className="text-fd-muted-foreground">暂无博客文章，敬请期待。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              const data = getBlogData(post);
              const tags = data.tags ?? [];

              return (
                <Link
                  key={post.url}
                  href={post.url}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-fd-border/60 bg-fd-card/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-primary/5 hover:shadow-xl hover:shadow-fd-primary/10"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-fd-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CalendarBlankIcon className="size-3.5" weight="bold" />
                      {formatDate(data.date)}
                    </span>
                    {tags.length > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-fd-border">·</span>
                        <TagIcon className="size-3.5" weight="bold" />
                        {tags.join(" / ")}
                      </span>
                    )}
                  </div>

                  <h2 className="mb-3 text-xl font-bold tracking-tight text-fd-foreground transition-colors group-hover:text-fd-primary md:text-2xl">
                    {data.title}
                  </h2>

                  {data.description && (
                    <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-fd-muted-foreground">
                      {data.description}
                    </p>
                  )}

                  <div className="mt-6 text-sm font-medium text-fd-primary opacity-80 transition-opacity group-hover:opacity-100">
                    阅读全文
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </HomeLayout>
  );
}
