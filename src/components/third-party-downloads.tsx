"use client";

import { useState } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { DownloadDialog, type DownloadSource } from "./download-dialog";
import rawDownloads from "@/lib/downloads.json";

interface RawThirdPartyItem {
  name: string;
  description?: string;
  version: string;
  hasDownload: boolean;
  hideVersion?: boolean;
  badge?: string | null;
  badgeTooltip?: string | null;
  sources: DownloadSource[];
  docHref?: string;
  docLabel?: string;
  actionLabel?: string;
}

interface ThirdPartyItem {
  name: string;
  description?: string;
  version: string;
  hasDownload: boolean;
  hideVersion?: boolean;
  badge: string | null;
  badgeTooltip: string | null;
  sources: DownloadSource[];
  docHref?: string;
  docLabel?: string;
  actionLabel?: string;
}

interface RawThirdPartySection {
  title: string;
  subtitle: string;
  badge?: string | null;
  badgeTooltip?: string | null;
  items: RawThirdPartyItem[];
}

const rawThirdParty = (rawDownloads.thirdParty ?? {
  title: "第三方社区版",
  subtitle: "",
  items: [],
}) as RawThirdPartySection;

const {
  title,
  subtitle,
  badge: sectionBadge = "第三方社区",
  badgeTooltip: sectionBadgeTooltip = "此版本为第三方社区使用 AstroBox 核心制作，不代表官方团队",
  items,
} = rawThirdParty;

const thirdPartyItems: ThirdPartyItem[] = items.map((item) => ({
  name: item.name,
  description: item.description,
  version: item.version,
  hasDownload: item.hasDownload,
  hideVersion: item.hideVersion,
  badge: item.badge === undefined ? sectionBadge : item.badge,
  badgeTooltip: item.badgeTooltip === undefined ? sectionBadgeTooltip : item.badgeTooltip,
  sources: item.sources,
  docHref: item.docHref,
  docLabel: item.docLabel,
  actionLabel: item.actionLabel,
}));

export function ThirdPartyDownloads() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<ThirdPartyItem | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  });

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const handleClick = (item: ThirdPartyItem) => {
    if (!item.hasDownload) {
      showToast("暂时不可下载");
      return;
    }
    setActiveItem(item);
    setDialogOpen(true);
  };

  if (thirdPartyItems.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-4xl px-4 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-wide text-fd-foreground md:text-3xl">
          {title}
        </h2>
        <p className="mt-3 text-sm text-fd-muted-foreground md:text-base">
          {subtitle}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {thirdPartyItems.map((item) => (
          <div
            key={item.name}
            className="group flex flex-col gap-4 rounded-2xl border border-fd-border/60 bg-fd-background p-4 transition-all hover:border-fd-primary/30 hover:bg-fd-accent/20 hover:shadow-lg hover:shadow-fd-primary/5 sm:flex-row sm:items-center sm:justify-between"
          >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-base font-semibold text-fd-foreground">
                    {item.name}
                  </span>
                  {item.badge && (
                    <span className="group/badge relative inline-flex cursor-help items-center rounded-full border border-yellow-400/50 bg-yellow-400/10 px-2 py-0.5 text-xs font-medium text-yellow-600 transition-colors hover:border-yellow-500 hover:bg-yellow-400/20 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300">
                      {item.badge}
                      <span className="absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-[18rem] -translate-x-1/2 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-center text-xs text-fd-foreground opacity-0 shadow-lg transition-opacity duration-200 pointer-events-none group-hover/badge:opacity-100">
                        {item.badgeTooltip}
                      </span>
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="mt-1 text-sm text-fd-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-4 sm:justify-end">
                {item.version && !item.hideVersion && (
                  <span className="text-xs tracking-wide text-fd-muted-foreground/70">
                    {item.version}
                  </span>
                )}
                {item.hasDownload ? (
                  <button
                    onClick={() => handleClick(item)}
                    className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90 dark:!text-[#051327] sm:w-auto"
                  >
                    {item.actionLabel ?? "下载"}
                    <CaretRightIcon className="size-4" />
                  </button>
                ) : (
                  <span className="inline-flex w-full items-center justify-center rounded-xl border border-fd-border/60 bg-fd-muted/10 px-4 py-2 text-sm font-medium text-fd-muted-foreground/60 cursor-not-allowed sm:w-auto">
                    暂不可下载
                  </span>
                )}
              </div>
            </div>
        ))}
      </div>

      <DownloadDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="即将离开 AstroBox 文档"
        description="目标页面由第三方提供，请确认链接地址后再继续访问。"
        sources={activeItem?.sources}
      />

      {/* Toast */}
      <div
        className={`fixed top-6 left-1/2 z-[1200] -translate-x-1/2 transition-all duration-300 ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}
      >
        <div className="rounded-xl border border-fd-border bg-fd-background px-5 py-3 text-sm font-medium text-fd-foreground shadow-xl">
          {toast.message}
        </div>
      </div>
    </section>
  );
}
