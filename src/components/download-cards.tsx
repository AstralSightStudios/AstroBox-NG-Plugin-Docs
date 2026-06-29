"use client";

import { useState } from "react";
import {
  CaretRightIcon,
  WindowsLogo,
  LinuxLogo,
  AppleLogo,
  AndroidLogo,
  GoogleChromeLogo,
} from "@phosphor-icons/react";
import { DownloadDialog, type DownloadSource } from "./download-dialog";
import { PostDownloadDialog } from "./post-download-dialog";
import { MacIcon } from "./mac-icon";
import { DeviceSupportList } from "./device-support-list";

interface Platform {
  icon: React.FC<{ className?: string }>;
  name: string;
  version: string;
  hasDownload: boolean;
  sources: DownloadSource[];
  docHref?: string;
  docLabel?: string;
  actionLabel?: string;
}

interface Product {
  id: string;
  name: string;
  tagline: string;
  platforms: Platform[];
  supportedDevices?: Array<{ name: string; status: string; note: string }>;
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

const products: Product[] = rawDownloads.products.map((product) => ({
  ...product,
  platforms: product.platforms.map((p) => ({
    ...p,
    icon: iconMap[p.icon] ?? WindowsLogo,
  })),
}));

export function DownloadCards() {
  const [activeProductId, setActiveProductId] = useState(products[0]?.id ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [postDialogOpen, setPostDialogOpen] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform | null>(null);
  const [deviceListOpen, setDeviceListOpen] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string }>({ show: false, message: "" });

  const activeProduct = products.find((p) => p.id === activeProductId) ?? products[0];
  const supportedDevices = activeProduct?.supportedDevices ?? [];

  const showToast = (message: string) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const handleDownloadClick = (platform: Platform) => {
    if (!platform.hasDownload) {
      showToast("暂时不可下载");
      return;
    }
    setActivePlatform(platform);
    setDialogOpen(true);
  };

  const handleConfirm = () => {
    setDialogOpen(false);
    setPostDialogOpen(true);
  };

  return (
    <section className="mx-auto w-full max-w-4xl">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold tracking-wide text-fd-foreground md:text-4xl">
          快速开始
        </h2>
        <p className="mt-4 text-sm text-fd-muted-foreground md:text-base">
          从下载最新版 {activeProduct?.name ?? "AstroBox"} 开始
        </p>
      </div>

      {/* 产品切换 */}
      {products.length > 1 && (
        <div className="mx-2.5 mb-8 flex justify-center">
          <div className="inline-flex gap-1 rounded-2xl border border-fd-border/60 bg-fd-accent/20 p-1">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => setActiveProductId(product.id)}
                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all ${
                  product.id === activeProductId
                    ? "border border-fd-border bg-fd-background text-fd-foreground shadow-sm"
                    : "text-fd-muted-foreground hover:text-fd-foreground"
                }`}
              >
                {product.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 产品简介 */}
      {activeProduct?.tagline && (
        <p className="mx-2.5 mb-8 text-center text-sm text-fd-muted-foreground">
          {activeProduct.tagline}
        </p>
      )}

      {/* 设备兼容性提示（仅 AstroBox 显示） */}
      {supportedDevices.length > 0 && (
        <div className="mx-2.5 mb-8">
          <DeviceSupportList
            devices={supportedDevices}
            productName={activeProduct?.name}
            defaultOpen={deviceListOpen}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-px bg-fd-border/70 md:grid-cols-3">
        {activeProduct?.platforms.map((p) => {
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
              {p.hasDownload ? (
                <button
                  onClick={() => handleDownloadClick(p)}
                  className="mt-2 inline-flex items-center text-sm tracking-wide text-fd-foreground transition-colors hover:text-fd-primary"
                >
                  {p.actionLabel ?? "下载"}
                  <CaretRightIcon className="ml-0.5 size-4" />
                </button>
              ) : (
                <span className="mt-2 inline-flex items-center text-sm tracking-wide text-fd-muted-foreground/50 cursor-not-allowed">
                  暂不可下载
                </span>
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
        sources={activePlatform?.sources}
        onConfirm={handleConfirm}
      />

      <PostDownloadDialog
        isOpen={postDialogOpen}
        onClose={() => setPostDialogOpen(false)}
        docHref={activePlatform?.docHref}
        docLabel={activePlatform?.docLabel}
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
