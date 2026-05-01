"use client";

import { useEffect, useCallback, useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";

export interface DownloadItem {
  label: string;
  href: string;
  password?: string;
}

interface DownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  downloads?: DownloadItem[];
  onConfirm?: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
    }
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-fd-border bg-fd-background px-3 py-2 text-xs font-medium text-fd-foreground transition-colors hover:bg-fd-accent/50"
      title="复制提取码"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-500" />
          <span>已复制</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          <span>复制</span>
        </>
      )}
    </button>
  );
}

function DownloadItemCard({
  item,
  showGoButton,
  onGo,
}: {
  item: DownloadItem;
  showGoButton?: boolean;
  onGo?: () => void;
}) {
  return (
    <div className="rounded-xl border border-fd-border/60 bg-fd-accent/30 p-4">
      {/* 版本标签 */}
      <div className="text-xs font-medium text-fd-primary">{item.label}</div>

      {/* 下载链接 */}
      <div className="mt-2">
        <div className="text-xs text-fd-muted-foreground">下载链接</div>
        <div className="mt-1 flex items-center gap-2">
          <span className="truncate text-sm text-fd-foreground">
            {item.href}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center rounded-md bg-fd-background px-2 py-1 text-[11px] font-medium text-fd-muted-foreground">
            第三方站点
          </span>
          <span className="inline-flex items-center rounded-md bg-fd-primary/10 px-2 py-1 text-[11px] font-medium text-fd-primary">
            将在新标签页打开
          </span>
        </div>
      </div>

      {/* 提取码 */}
      {item.password && (
        <div className="mt-3 border-t border-fd-border/50 pt-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-fd-muted-foreground">
                网盘提取码
              </div>
              <div className="mt-1 text-lg font-mono font-semibold tracking-widest text-fd-foreground">
                {item.password}
              </div>
            </div>
            <CopyButton text={item.password} />
          </div>
        </div>
      )}

      {/* 卡片内前往按钮（多版本时显示） */}
      {showGoButton && (
        <div className="mt-3 flex justify-end">
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              onGo?.();
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-3 py-1.5 text-xs font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            立即前往
            <ExternalLink className="size-3" />
          </a>
        </div>
      )}
    </div>
  );
}

export function DownloadDialog({
  isOpen,
  onClose,
  title = "下载确认",
  description = "目标页面由第三方提供，请确认链接地址后再继续访问。",
  downloads = [],
  onConfirm,
}: DownloadDialogProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleCustomClose = () => onClose();
    document.addEventListener("keydown", handleEsc);
    window.addEventListener("download-dialog-close", handleCustomClose);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      window.removeEventListener("download-dialog-close", handleCustomClose);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const single = downloads.length === 1 ? downloads[0] : null;
  const multiple = downloads.length > 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 对话框卡片 */}
      <div className="relative w-full max-w-[460px] rounded-2xl border border-fd-border bg-fd-background shadow-2xl">
        <div className="p-6">
          {/* 标题 */}
          <h3 className="text-lg font-semibold text-fd-foreground">{title}</h3>
          <p className="mt-1.5 text-sm text-fd-muted-foreground">
            {description}
          </p>

          {/* 多版本列表 */}
          {multiple && (
            <div className="mt-5 flex flex-col gap-3">
              {downloads.map((item) => (
                <DownloadItemCard
                  key={item.label}
                  item={item}
                  showGoButton
                  onGo={onConfirm}
                />
              ))}
            </div>
          )}

          {/* 单版本 */}
          {single && (
            <div className="mt-5">
              <DownloadItemCard item={single} />
            </div>
          )}

          {/* 底部说明 */}
          <p className="mt-4 text-xs leading-relaxed text-fd-muted-foreground/80">
            我们在添加该链接时已进行基本安全核验，但无法持续保证第三方页面后续的内容、隐私政策或安全性。是否继续访问，请您自行判断。
          </p>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2 border-t border-fd-border/60 px-6 py-4">
          {single ? (
            <>
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-lg bg-fd-secondary px-4 py-2 text-sm font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
              >
                取消
              </button>
              <button
                onClick={() => {
                  window.open(single.href, "_blank", "noopener,noreferrer");
                  onConfirm?.();
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
              >
                立即前往
                <ExternalLink className="size-3.5" />
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg bg-fd-secondary px-4 py-2 text-sm font-medium text-fd-secondary-foreground transition-colors hover:bg-fd-accent"
            >
              关闭
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
