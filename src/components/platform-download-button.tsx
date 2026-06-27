"use client";

import { useState } from "react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { DownloadDialog, type DownloadSource } from "./download-dialog";
import { PostDownloadDialog } from "./post-download-dialog";
import rawDownloads from "@/lib/downloads.json";

import {
  WindowsLogo,
  LinuxLogo,
  AppleLogo,
  AndroidLogo,
  GoogleChromeLogo,
} from "@phosphor-icons/react";
import { MacIcon } from "./mac-icon";

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  WinIcon: ({ className }) => (
    <WindowsLogo
      className={[className, "opacity-50"].filter(Boolean).join(" ")}
      weight="fill"
    />
  ),
  MacIcon,
  LinuxIcon: ({ className }) => (
    <LinuxLogo
      className={[className, "opacity-50"].filter(Boolean).join(" ")}
      weight="fill"
    />
  ),
  IosIcon: ({ className }) => (
    <AppleLogo
      className={[className, "opacity-50"].filter(Boolean).join(" ")}
      weight="fill"
    />
  ),
  AndroidIcon: ({ className }) => (
    <AndroidLogo
      className={[className, "opacity-50"].filter(Boolean).join(" ")}
      weight="fill"
    />
  ),
  ChromiumIcon: ({ className }) => (
    <GoogleChromeLogo
      className={[className, "opacity-50"].filter(Boolean).join(" ")}
      weight="fill"
    />
  ),
};
interface PlatformDownloadButtonProps {
  product?: string;
  platform: string;
  label?: string;
  showPostDialog?: boolean;
}

export function PlatformDownloadButton({
  product = "astrobox",
  platform,
  label,
  showPostDialog = true,
}: PlatformDownloadButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const productData = rawDownloads.products.find(
    (p) => p.id.toLowerCase() === product.toLowerCase(),
  );

  const platformData = productData?.platforms.find(
    (p) =>
      p.name.toLowerCase() === platform.toLowerCase() ||
      p.icon.toLowerCase() === `${platform.toLowerCase()}icon` ||
      p.icon.toLowerCase().startsWith(platform.toLowerCase()) ||
      p.name.toLowerCase().includes(platform.toLowerCase()),
  );

  if (!platformData) return null;

  const Icon = iconMap[platformData.icon] ?? MacIcon;

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const handleConfirm = () => {
    setDialogOpen(false);
    if (showPostDialog) {
      setPostDialogOpen(true);
    }
  };

  const sources: DownloadSource[] = (platformData as any).sources ?? [];

  if (!platformData.hasDownload) {
    return (
      <>
        <button
          onClick={() => showToast("暂时不可下载")}
          className="group flex w-full cursor-not-allowed items-center justify-between rounded-2xl border border-fd-border/60 bg-fd-background p-4 text-left opacity-60"
        >
          <div className="flex items-center gap-4">
            <div className="inline-flex size-10 items-center justify-center rounded-full border border-fd-border/60 text-fd-muted-foreground">
              <Icon className="size-6" />
            </div>
            <div>
              <div className="text-sm font-medium text-fd-muted-foreground">
                {label ?? platformData.name}
              </div>
              <div className="text-xs text-fd-muted-foreground">
                {platformData.version}
              </div>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center justify-center rounded-full bg-fd-muted/10 p-2 text-fd-muted-foreground">
            <CaretRightIcon className="size-5" />
          </div>
        </button>

        {/* Toast */}
        <div
          className={`fixed top-6 left-1/2 z-[1200] -translate-x-1/2 transition-all duration-300 ${toast.show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}
        >
          <div className="rounded-xl border border-fd-border bg-fd-background px-5 py-3 text-sm font-medium text-fd-foreground shadow-xl">
            {toast.message}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className="group flex w-full cursor-pointer items-center justify-between rounded-2xl border border-fd-border/60 bg-fd-background p-4 text-left transition-all hover:border-fd-primary/50 hover:bg-fd-accent/30 hover:shadow-lg hover:shadow-fd-primary/5"
      >
        <div className="flex items-center gap-4">
          <div className="inline-flex size-10 items-center justify-center rounded-full border border-fd-border/60 text-fd-muted-foreground transition-colors group-hover:border-fd-primary/50 group-hover:text-fd-primary">
            <Icon className="size-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-fd-foreground">
              {label ?? `下载 ${platformData.name}`}
            </div>
            <div className="text-xs text-fd-muted-foreground">
              {platformData.version}
            </div>
          </div>
        </div>
        <div className="inline-flex shrink-0 items-center justify-center rounded-full bg-fd-primary/10 p-2 text-fd-primary transition-all group-hover:bg-fd-primary group-hover:text-fd-primary-foreground">
          <CaretRightIcon className="size-5" />
        </div>
      </button>

      <DownloadDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="即将离开 AstroBox 文档"
        description="目标页面由第三方提供，请确认链接地址后再继续访问。"
        sources={sources}
        onConfirm={handleConfirm}
      />

      <PostDownloadDialog
        isOpen={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        docHref={platformData.docHref}
        docLabel={platformData.docLabel}
      />
    </>
  );
}
