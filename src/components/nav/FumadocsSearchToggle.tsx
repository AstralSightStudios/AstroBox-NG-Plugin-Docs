"use client";

import { Search } from "lucide-react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { buttonVariants } from "fumadocs-ui/components/ui/button";

type FumadocsSearchToggleProps = {
  className?: string;
};

export function FumadocsSearchToggle({ className }: FumadocsSearchToggleProps) {
  const { enabled, setOpenSearch } = useSearchContext();

  if (!enabled) return null;

  return (
    <button
      type="button"
      className={[
        buttonVariants({ color: "ghost", size: "icon-sm" })
          .replace("rounded-md", "")
          .replace("[&_svg]:size-4.5", ""),
        "rounded-full size-9",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="打开搜索"
      data-search=""
      onClick={() => setOpenSearch(true)}
    >
      <Search className="size-3.5" />
    </button>
  );
}
