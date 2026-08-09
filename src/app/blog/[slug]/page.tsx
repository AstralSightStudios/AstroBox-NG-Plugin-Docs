import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { blogSource } from "@/lib/blog-source";
import { getMDXComponents } from "@/mdx-components";
import { Footer } from "@/components/footer";
import { BlogCover } from "@/components/blog-cover";
import { siteTitle } from "@/lib/site-config";
import type { BlogFrontmatter } from "@/lib/blog-types";
import {
  CalendarBlankIcon,
  TagIcon,
  UserIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react/dist/ssr";

interface BlogPostParams {
  slug: string;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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
  };
  const MDX = data.body;
  const tags = data.tags ?? [];

  const allPosts = blogSource.getPages().sort((a, b) => {
    const aDate = (a.data as unknown as BlogFrontmatter).date;
    const bDate = (b.data as unknown as BlogFrontmatter).date;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
  const currentIndex = allPosts.findIndex((p) => p.url === page.url);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null;

  return (
    <HomeLayout {...baseOptions()} className="bg-fd-background">
      {data.cover && (
        <BlogCover src={data.cover} alt={data.title} />
      )}

      <article className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 md:py-16">
        <header className="mb-10 md:mb-14">
          <Link
            href="/blog"
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-primary md:mb-6"
          >
            <ArrowLeftIcon className="size-4" weight="bold" />
            返回博客
          </Link>

          <h1 className="mb-4 text-2xl font-semibold leading-tight tracking-tight text-fd-foreground sm:text-3xl md:text-5xl">
            {data.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-fd-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarBlankIcon className="size-4" weight="bold" />
              {formatDate(data.date)}
            </span>
            {data.author && (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-fd-border">·</span>
                <UserIcon className="size-4" weight="bold" />
                {data.author}
              </span>
            )}
            {tags.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <span className="text-fd-border">·</span>
                <TagIcon className="size-4" weight="bold" />
                <span className="break-all">{tags.join(" / ")}</span>
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          <MDX components={getMDXComponents()} />
        </div>

        <nav className="mt-16 grid gap-4 border-t border-fd-border/60 pt-10 md:grid-cols-2">
          {prevPost ? (
            <Link
              href={prevPost.url}
              className="group flex flex-col rounded-2xl border border-fd-border/60 p-4 transition-colors hover:border-fd-primary/50 hover:bg-fd-primary/5"
            >
              <span className="mb-1 text-xs text-fd-muted-foreground">上一篇</span>
              <span className="font-medium text-fd-foreground transition-colors group-hover:text-fd-primary">
                {(prevPost.data as unknown as BlogFrontmatter).title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={nextPost.url}
              className="group flex flex-col items-end rounded-2xl border border-fd-border/60 p-4 text-right transition-colors hover:border-fd-primary/50 hover:bg-fd-primary/5"
            >
              <span className="mb-1 text-xs text-fd-muted-foreground">下一篇</span>
              <span className="font-medium text-fd-foreground transition-colors group-hover:text-fd-primary">
                {(nextPost.data as unknown as BlogFrontmatter).title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
      <Footer />
    </HomeLayout>
  );
}

export function generateStaticParams() {
  return blogSource.generateParams().map((param) => ({
    slug: param.slug?.[0] ?? "",
  }));
}
