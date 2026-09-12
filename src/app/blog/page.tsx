import type { Metadata } from "next";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { blogSource } from "@/lib/blog-source";
import { siteTitle } from "@/lib/site-config";
import { Footer } from "@/components/footer";
import { BlogBreadcrumb } from "@/components/blog-breadcrumb";
import { BlogList } from "@/components/blog-list";
import { sortBlogItems, toBlogListItem } from "@/lib/blog-utils";

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

export default function BlogPage() {
  const posts = sortBlogItems(blogSource.getPages().map(toBlogListItem));

  return (
    <HomeLayout {...baseOptions()} className="bg-fd-background">
      <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <BlogBreadcrumb
          items={[{ label: "首页", href: "/" }, { label: "博客" }]}
        />

        <header className="mt-6 mb-10">
          <h1 className="text-4xl font-semibold tracking-tight text-fd-foreground md:text-5xl">
            博客
          </h1>
          <p className="mt-4 text-lg text-fd-muted-foreground">
            最新动态、深度文章与更新日志
          </p>
        </header>

        {posts.length === 0 ? (
          <div className="rounded-2xl bg-fd-foreground/5 p-12 text-center">
            <p className="text-fd-muted-foreground">暂无博客文章，敬请期待。</p>
          </div>
        ) : (
          <BlogList posts={posts} />
        )}
      </div>
      <Footer />
    </HomeLayout>
  );
}
