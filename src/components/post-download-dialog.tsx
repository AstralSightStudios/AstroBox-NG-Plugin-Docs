"use client";

import { useEffect } from "react";
import { BookOpen, X } from "lucide-react";
import Link from "next/link";

interface PostDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  docHref?: string;
  docLabel?: string;
}

export function PostDownloadDialog({
  isOpen,
  onClose,
  docHref = "/docs/usage",
  docLabel = "查看使用教程",
}: PostDownloadDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 对话框卡片 */}
      <div className="relative w-full max-w-[360px] rounded-2xl border border-fd-border bg-fd-background p-6 shadow-2xl">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex items-center justify-center rounded-md p-1 text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
          aria-label="关闭"
        >
          <X className="size-4" />
        </button>

        {/* 图标 */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-fd-primary/10 text-fd-primary">
          <BookOpen className="size-7" />
        </div>

        {/* 标题 */}
        <h3 className="mt-4 text-center text-lg font-semibold text-fd-foreground">
          下载已开始
        </h3>

        {/* 说明 */}
        <p className="mt-2 text-center text-sm leading-relaxed text-fd-muted-foreground">
          文件正在下载中。如需了解安装和配置步骤，可以查看对应的使用教程。
        </p>

        {/* 居中的跳转按钮 */}
        <div className="mt-6 flex justify-center">
          <Link
            href={docHref}
            onClick={onClose}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-fd-primary px-6 py-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            <BookOpen className="size-4" />
            {docLabel}
          </Link>
        </div>

        {/* 底部关闭 */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={onClose}
            className="text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            稍后再说
          </button>
        </div>
      </div>
    </div>
  );
}
