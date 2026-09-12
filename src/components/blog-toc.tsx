"use client";

import {
  TOCProvider,
  TOCScrollArea,
  useTOCItems,
} from "fumadocs-ui/components/toc/index";
import { TOCItem } from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";

function TocItems() {
  const items = useTOCItems();

  return (
    <nav className="flex flex-col border-l border-fd-border/60">
      {items.map((item) => (
        <TOCItem
          key={item.url}
          href={item.url}
          style={{
            paddingInlineStart: item.depth > 2 ? 28 : 16,
          }}
          className="-ml-px block border-l-2 border-transparent py-2 text-sm leading-snug text-fd-muted-foreground transition-colors hover:text-fd-foreground data-[active=true]:border-fd-primary data-[active=true]:text-fd-foreground"
        >
          {item.title}
        </TOCItem>
      ))}
    </nav>
  );
}

export function BlogToc({ toc }: { toc: TOCItemType[] }) {
  if (!toc || toc.length === 0) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 max-h-[calc(100vh-8rem)]">
        <TOCProvider toc={toc}>
          <TOCScrollArea className="max-h-[calc(100vh-8rem)]">
            <TocItems />
          </TOCScrollArea>
        </TOCProvider>
      </div>
    </aside>
  );
}
