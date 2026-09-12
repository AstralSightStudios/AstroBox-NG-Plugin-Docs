import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function BlogBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="面包屑">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fd-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex items-center gap-1.5"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-fd-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "text-fd-foreground/80" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-fd-muted-foreground/50">/</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
