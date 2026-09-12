import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { blogSource } from "@/lib/blog-source";
import { getMDXComponents } from "@/mdx-components";
import { Footer } from "@/components/footer";
import { BlogBreadcrumb } from "@/components/blog-breadcrumb";
import { BlogToc } from "@/components/blog-toc";
import { siteTitle } from "@/lib/site-config";
import type { BlogFrontmatter } from "@/lib/blog-types";
import type { TOCItemType } from "fumadocs-core/toc";
import {
  estimateReadMinutes,
  getRelatedPosts,
  sortBlogItems,
  toBlogListItem,
  type BlogListItem,
} from "@/lib/blog-utils";

interface BlogPostParams {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<BlogPostParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);

  if (!page) {
    return {
      title: "文章不存在",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const data = page.data as unknown as BlogFrontmatter;
  const title = data.title ?? siteTitle;
  const description = data.description ?? `${title} - AstroBox 博客`;

  return {
    title: `${title} | 博客`,
    description,
    alternates: {
      canonical: page.url,
    },
    openGraph: {
      type: "article",
      url: page.url,
      title,
      description,
      siteName: siteTitle,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<BlogPostParams>;
}) {
  const { slug } = await params;
  const page = blogSource.getPage([slug]);

  if (!page) {
    notFound();
  }

  const data = page.data as unknown as BlogFrontmatter & {
    body: ComponentType<any>;
    toc?: TOCItemType[];
    getText?: (type: "raw" | "processed") => Promise<string>;
  };
  const MDX = data.body;
  const tags = data.tags ?? [];

  const allItems = sortBlogItems(blogSource.getPages().map(toBlogListItem));
  const related = getRelatedPosts(allItems, page.url, tags);

  const currentIndex = allItems.findIndex((item) => item.url === page.url);
  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < allItems.length - 1
      ? allItems[currentIndex + 1]
      : null;

  let readMinutes: number | null = null;
  if (typeof data.getText === "function") {
    try {
      const text = await data.getText("processed");
      readMinutes = estimateReadMinutes(text);
    } catch {
      readMinutes = null;
    }
  }

  const metaText =
    readMinutes !== null
      ? `阅读时长：${readMinutes} 分钟 / ${data.date}`
      : data.date;

  return (
    <HomeLayout {...baseOptions()} className="bg-fd-background">
      <div
        data-blog-article
        className="mx-auto w-full max-w-7xl px-6 py-10 md:py-14"
      >
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="min-w-0">
            <BlogBreadcrumb
              items={[
                { label: "首页", href: "/" },
                { label: "博客", href: "/blog" },
                { label: data.title },
              ]}
            />

            <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-fd-foreground md:text-4xl lg:text-5xl">
              {data.title}
            </h1>

            {data.description && (
              <p className="mt-5 text-lg leading-relaxed text-fd-muted-foreground">
                {data.description}
              </p>
            )}

            <Link
              href="/docs/usage"
              className="mt-7 inline-flex items-center rounded-full bg-fd-foreground/10 px-5 py-2.5 text-sm font-medium text-fd-foreground transition-colors hover:bg-fd-foreground/15"
            >
              开始使用 AstroBox
            </Link>

            <p className="mt-6 text-sm text-fd-muted-foreground">{metaText}</p>
          </div>

          {data.cover && (
            <div className="relative aspect-[64/27] overflow-hidden rounded-2xl bg-fd-foreground/5">
              <Image
                src={data.cover}
                alt={data.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          )}
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
          <div className="min-w-0">
            <div className="prose prose-lg max-w-none">
              <MDX components={getMDXComponents()} />
            </div>

            {related.length > 0 && (
              <section className="mt-16 border-t border-fd-border/60 pt-10">
                <h2 className="mb-6 text-xl font-semibold tracking-tight text-fd-foreground">
                  相关推荐
                </h2>
                <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <RelatedCard key={item.url} post={item} />
                  ))}
                </div>
              </section>
            )}

            {(prevItem || nextItem) && (
              <nav className="mt-16 flex items-start justify-between gap-8 border-t border-fd-border/60 pt-8 text-sm">
                {prevItem ? (
                  <Link href={prevItem.url} className="group flex-1">
                    <span className="text-fd-muted-foreground">上一篇</span>
                    <span className="mt-1 block font-medium text-fd-foreground transition-colors group-hover:text-fd-primary">
                      {prevItem.title}
                    </span>
                  </Link>
                ) : (
                  <span className="flex-1" />
                )}
                {nextItem ? (
                  <Link href={nextItem.url} className="group flex-1 text-right">
                    <span className="text-fd-muted-foreground">下一篇</span>
                    <span className="mt-1 block font-medium text-fd-foreground transition-colors group-hover:text-fd-primary">
                      {nextItem.title}
                    </span>
                  </Link>
                ) : (
                  <span className="flex-1" />
                )}
              </nav>
            )}
          </div>

          <BlogToc toc={data.toc ?? []} />
        </div>
      </div>
      <Footer />
    </HomeLayout>
  );
}

function RelatedCard({ post }: { post: BlogListItem }) {
  return (
    <Link href={post.url} className="group flex flex-col">
      <div className="relative aspect-[64/27] overflow-hidden rounded-xl bg-fd-foreground/5">
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-fd-primary/10 to-fd-primary/5">
            <span className="text-2xl font-bold text-fd-primary/30">
              {post.title.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <h3 className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-fd-foreground">
        {post.title}
      </h3>
      <span className="mt-1 text-xs text-fd-muted-foreground">{post.date}</span>
    </Link>
  );
}

export function generateStaticParams() {
  return blogSource.generateParams().map((param) => ({
    slug: param.slug?.[0] ?? "",
  }));
}
