"use client";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogFooter,
  SearchDialogHeader,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  TagsList,
  TagsListItem,
  useSearch,
} from "fumadocs-ui/components/dialog/search";
import { useMemo, useState } from "react";
import { useOnChange } from "fumadocs-core/utils/use-on-change";
import { useDocsSearch } from "fumadocs-core/search/client";
import { cn } from "fumadocs-ui/utils/cn";
import type { SharedProps } from "fumadocs-ui/contexts/search";

function CustomSearchDialogIcon(props: Record<string, unknown>) {
  const { isLoading } = useSearch();
  return (
    <MagnifyingGlassIcon
      {...props}
      className={cn(
        "size-5 text-fd-muted-foreground",
        isLoading && "animate-pulse duration-400",
        props.className as string
      )}
      weight="bold"
    />
  );
}

interface CustomSearchDialogProps extends SharedProps {
  defaultTag?: string;
  tags?: { name: string; value: string }[];
  api?: string;
  delayMs?: number;
  type?: "fetch" | "static";
  allowClear?: boolean;
  links?: [string, string][];
  footer?: React.ReactNode;
  [key: string]: unknown;
}

export function CustomSearchDialog({
  defaultTag,
  tags = [],
  api = "/api/search",
  delayMs,
  type = "fetch",
  allowClear = false,
  links = [],
  footer,
  open,
  onOpenChange,
  ...rest
}: CustomSearchDialogProps) {
  const { locale } = useI18n();
  const [tag, setTag] = useState(defaultTag);
  const { search, setSearch, query } = useDocsSearch(
    type === "fetch"
      ? { type: "fetch", api, locale, tag, delayMs }
      : { type: "static", from: api, locale, tag, delayMs }
  );

  const defaultItems = useMemo(() => {
    if (links.length === 0) return null;
    return links.map(([name, link]) => ({
      type: "page" as const,
      id: name,
      content: name,
      url: link,
    }));
  }, [links]);

  useOnChange(defaultTag, (v) => {
    setTag(v);
  });

  return (
    <SearchDialog
      open={open}
      onOpenChange={onOpenChange}
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...rest}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <CustomSearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList
          items={query.data !== "empty" ? query.data : defaultItems}
        />
      </SearchDialogContent>
      <SearchDialogFooter>
        {tags.length > 0 && (
          <TagsList tag={tag} onTagChange={setTag} allowClear={allowClear}>
            {tags.map((t) => (
              <TagsListItem key={t.value} value={t.value}>
                {t.name}
              </TagsListItem>
            ))}
          </TagsList>
        )}
        {footer}
      </SearchDialogFooter>
    </SearchDialog>
  );
}
