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
      className={[buttonVariants({ color: "ghost", size: "icon-sm" }), className].filter(Boolean).join(" ")}
      aria-label="打开搜索"
      data-search=""
      onClick={() => setOpenSearch(true)}
    >
      <Search className="size-4" />
    </button>
  );
}
