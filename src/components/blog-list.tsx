"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { collectBlogTags, type BlogListItem } from "@/lib/blog-utils";

interface BlogListProps {
  posts: BlogListItem[];
}

export function BlogList({ posts }: BlogListProps) {
  const tags = useMemo(() => collectBlogTags(posts), [posts]);

  const [activeTag, setActiveTag] = useState<string | null>(null);
  const filtered = activeTag
    ? posts.filter((post) => post.tags.includes(activeTag))
    : posts;

  return (
    <div>
      {tags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-x-1 gap-y-2">
          <FilterTab active={activeTag === null} onClick={() => setActiveTag(null)}>
            全部
          </FilterTab>
          {tags.map((tag) => (
            <FilterTab
              key={tag}
              active={activeTag === tag}
              onClick={() => setActiveTag(tag)}
            >
              {tag}
            </FilterTab>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((post, index) => (
          <BlogCard key={post.url} post={post} priority={index === 0} />
        ))}
      </div>
    </div>
  );
}

function FilterTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? "rounded-xl bg-fd-foreground/10 px-4 py-1.5 text-sm font-medium text-fd-foreground"
          : "rounded-xl px-4 py-1.5 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
      }
    >
      {children}
    </button>
  );
}

function BlogCard({
  post,
  priority,
}: {
  post: BlogListItem;
  priority: boolean;
}) {
  return (
    <Link href={post.url} className="group flex flex-col">
      <div className="relative aspect-[64/27] overflow-hidden rounded-2xl bg-fd-foreground/5">
        {post.cover ? (
          <Image
            src={post.cover}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-fd-primary/10 to-fd-primary/5">
            <span className="text-4xl font-bold text-fd-primary/30">
              {post.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <h2 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-fd-foreground md:text-xl">
        {post.title}
      </h2>

      {post.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-fd-muted-foreground">
          {post.description}
        </p>
      )}
    </Link>
  );
}
