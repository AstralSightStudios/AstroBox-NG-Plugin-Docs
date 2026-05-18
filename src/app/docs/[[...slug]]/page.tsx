import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentType } from "react";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "fumadocs-ui/layouts/docs/page";
import { createRelativeLink } from "fumadocs-ui/mdx";
import { getMDXComponents } from "@/mdx-components";
import { source } from "@/lib/source";
import { Footer } from "@/components/footer";
import {
  RoundedTableOfContent,
  RoundedTableOfContentPopover,
} from "@/components/rounded-toc";
import {
  resolvePageDescription,
  siteKeywords,
  siteTitle,
} from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    return {
      title: "文档不存在",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = page.data.title ?? siteTitle;
  const description = resolvePageDescription(title, page.data.description);
  const slugs = page.slugs.filter(
    (item): item is string => typeof item === "string" && item.trim().length > 0,
  );
  const keywords = Array.from(
    new Set([...siteKeywords, title, ...slugs]),
  );

  return {
    title,
    description,
    keywords,
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

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    notFound();
  }

  const pageData = page.data as typeof page.data & {
    body: ComponentType<any>;
    description?: string;
    full?: boolean;
    title?: string;
    toc?: unknown;
  };
  const MDX = pageData.body;
  const title = pageData.title ?? siteTitle;

  return (
    <DocsPage
      toc={pageData.toc}
      full={pageData.full}
      tableOfContent={{ component: <RoundedTableOfContent /> }}
      tableOfContentPopover={{ component: <RoundedTableOfContentPopover /> }}
      footer={{ children: <Footer /> }}
    >
      <DocsTitle>{title}</DocsTitle>
      <DocsDescription>{pageData.description}</DocsDescription>
      <DocsBody>
        <MDX
          components={getMDXComponents({
            a: createRelativeLink(source, page),
          })}
        />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return source.generateParams();
}
