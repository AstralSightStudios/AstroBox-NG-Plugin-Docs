"use client";

import { useState } from "react";
import {
  CaretDownIcon,
  CaretRightIcon,
  CaretUpIcon,
  CheckCircleIcon,
  WatchIcon,
  XCircleIcon,
  WindowsLogo,
  LinuxLogo,
  AppleLogo,
  AndroidLogo,
  GoogleChromeLogo,
} from "@phosphor-icons/react";
import { DownloadDialog, type DownloadItem } from "./download-dialog";
import { PostDownloadDialog } from "./post-download-dialog";
import { MacIcon } from "./mac-icon";

interface Platform {
  icon: React.FC<{ className?: string }>;
  name: string;
  version: string;
  hasDownload: boolean;
  downloads: DownloadItem[];
  docHref?: string;
  docLabel?: string;
  actionLabel?: string;
}

import rawDownloads from "@/lib/downloads.json";

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

const platforms: Platform[] = rawDownloads.platforms.map((p) => ({
  ...p,
  icon: iconMap[p.icon] ?? WindowsLogo,
}));

const supportedDevices = rawDownloads.supportedDevices;

export function DownloadCards() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [deviceListOpen, setDeviceListOpen] = useState(true);

  const handleDownloadClick = (platform: Platform) => {
    if (!platform.hasDownload) return;
    setActivePlatform(platform);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    setDialogOpen(false);
    setPostDialogOpen(true);
  };

  return (
    <section className="mx-auto w-full max-w-4xl font-mono">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-wide text-fd-foreground md:text-4xl">
          快速开始
        </h2>
        <p className="mt-4 text-sm text-fd-muted-foreground md:text-base">
          从下载最新版 AstroBox 开始
        </p>
      </div>

      {/* 设备兼容性提示 */}
      <div className="mx-2.5 mb-8 rounded-3xl border border-fd-border/60 bg-fd-background p-3 md:p-4.5">
        <button
          onClick={() => setDeviceListOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="inline-flex shrink-0 items-center justify-center rounded-xl bg-fd-primary/10 p-2.5 text-fd-primary">
              <WatchIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-fd-foreground">
                下载前，先确认你的设备是否受支持
              </h3>
              <p className="text-sm text-fd-muted-foreground">
                AstroBox
                支持多种主流穿戴设备，但不同型号的功能适配情况可能存在差异。
              </p>
            </div>
          </div>
          <div className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-fd-muted-foreground transition-colors hover:bg-fd-accent/50 hover:text-fd-foreground">
            {deviceListOpen ? (
              <CaretUpIcon className="size-5" />
            ) : (
              <CaretDownIcon className="size-5" />
            )}
          </div>
        </button>

        <div
          className={`grid transition-all duration-300 ease-in-out ${deviceListOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="mt-4 overflow-hidden rounded-xl border border-fd-border/60">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="hidden bg-fd-accent/50 md:table-row">
                    <th className="px-4 py-2.5 font-medium text-fd-foreground">
                      型号
                    </th>
                    <th className="px-4 py-2.5 font-medium text-fd-foreground">
                      状态
                    </th>
                    <th className="px-4 py-2.5 font-medium text-fd-foreground">
                      备注
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-fd-border/60">
                  {supportedDevices.map((device) => (
                    <tr
                      key={device.name}
                      className="block transition-colors hover:bg-fd-accent/30 md:table-row"
                    >
                      <td className="block px-4 pt-4 pb-1 text-fd-foreground md:table-cell md:py-2.5">
                        <div className="flex items-start justify-between gap-3 md:block">
                          <span>{device.name}</span>
                          <span className="shrink-0 md:hidden">
                            {device.status === "supported" ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-green-600 dark:text-green-400">
                                <CheckCircleIcon className="size-3" />
                                完整支持
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-fd-muted/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-fd-muted-foreground">
                                <XCircleIcon className="size-3" />
                                不支持
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-4 py-2.5 md:table-cell">
                        {device.status === "supported" ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-green-500/10 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-green-600 dark:text-green-400">
                            <CheckCircleIcon className="size-3" />
                            完整支持
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-fd-muted/20 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-fd-muted-foreground">
                            <XCircleIcon className="size-3" />
                            不支持
                          </span>
                        )}
                      </td>
                      <td className="block px-4 pt-1 pb-4 text-sm text-fd-muted-foreground md:table-cell md:py-2.5">
                        {device.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-fd-border/70 md:grid-cols-3">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              className="group relative flex flex-col items-center justify-center bg-fd-background py-8 text-center transition-colors hover:bg-fd-accent/30"
            >
              <div className="mb-4 inline-flex size-10 items-center justify-center rounded-full border border-fd-border/60 text-fd-muted-foreground transition-colors group-hover:border-fd-primary/50 group-hover:text-fd-primary">
                <Icon className="size-6" />
              </div>
              <span className="text-sm tracking-wide text-fd-muted-foreground">
                {p.name}
              </span>
              {p.version && (
                <span className="mt-1 text-xs tracking-wide text-fd-muted-foreground/70">
                  {p.version}
                </span>
              )}
              {p.hasDownload && (
                <button
                  onClick={() => handleDownloadClick(p)}
                  className="mt-2 inline-flex items-center text-sm tracking-wide text-fd-foreground transition-colors hover:text-fd-primary"
                >
                  {p.actionLabel ?? "下载"}
                  <CaretRightIcon className="ml-0.5 size-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <DownloadDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="即将离开 AstroBox 文档"
        description="目标页面由第三方提供，请确认链接地址后再继续访问。"
        downloads={activePlatform?.downloads}
        onConfirm={handleConfirm}
      />

      <PostDownloadDialog
        isOpen={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        docHref={activePlatform?.docHref}
        docLabel={activePlatform?.docLabel}
      />
    </section>
  );
}
