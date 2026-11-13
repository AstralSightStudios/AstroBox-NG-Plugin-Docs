"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { hasPreviewOptions, PreviewOptions } from "./preview-options";
import "./preview.css";

const codePanel = "var(--aeris-panel-background, #191919)";

export function AerisPreview({
  component,
  title,
  palette,
  children,
}: {
  component: string;
  title: string;
  palette?: string;
  children?: ReactNode;
}) {
  const [height, setHeight] = useState<number>();
  const [settings, setSettings] = useState<{ option: number; color?: string; firstStage?: number; firstTap?: string }>();
  const [pendingSettings, setPendingSettings] = useState<typeof settings>();
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeOverflows, setCodeOverflows] = useState(false);
  const iframe = useRef<HTMLIFrameElement>(null);
  const code = useRef<HTMLDivElement>(null);
  const params = new URLSearchParams({ component });
  const hasControls = hasPreviewOptions(component);

  if (settings?.color !== undefined) params.set("color", settings.color);
  if (settings !== undefined) params.set("option", String(settings.option));
  if (settings?.firstStage !== undefined) params.set("firstStage", String(settings.firstStage));
  if (settings?.firstTap !== undefined) params.set("firstTap", settings.firstTap);
  if (palette !== undefined) params.set("palette", palette);

  useEffect(() => {
    function resize(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== iframe.current?.contentWindow) return;
      const { type, height } = event.data ?? {};
      if (type === "aeris-preview-size" && Number.isInteger(height) && height >= 1 && height <= 480) {
        setHeight(height);
      }
    }

    window.addEventListener("message", resize);
    // 预览可能在 React 接管页面之前完成初始化。
    const viewport = iframe.current?.contentDocument?.getElementById("viewport");
    const initialHeight = Number(viewport?.dataset.cropHeight);
    if (Number.isInteger(initialHeight) && initialHeight >= 1 && initialHeight <= 480) {
      setHeight(initialHeight);
    }
    return () => window.removeEventListener("message", resize);
  }, []);

  useEffect(() => {
    if (!pendingSettings) return;
    const timeout = window.setTimeout(() => setSettings(pendingSettings), 250);
    return () => window.clearTimeout(timeout);
  }, [pendingSettings]);

  useEffect(() => {
    const element = code.current;
    if (!element) return;

    const check = () => setCodeOverflows(element.scrollHeight > 176);
    check();

    const observer = new ResizeObserver(check);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children]);

  const frame = (
    <div className={`relative w-full overflow-hidden ${component === "theme" ? "max-w-[336px]" : "max-w-[168px]"}${height === 480
      ? " rounded-[20px] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-white/20"
      : ""}`}>
      <iframe
        ref={iframe}
        className="block h-auto w-full max-w-full border-0"
        style={{ aspectRatio: `336 / ${height ?? 480}` }}
        title={title}
        width={336}
        height={480}
        src={`/assets/canopus/ui-gallery/preview.html?${params}`}
      />
    </div>
  );

  if (component === "theme") {
    return <div className="not-prose">{frame}</div>;
  }

  const codeCollapsed = Boolean(children) && codeOverflows && !codeOpen;

  return (
    <div data-theme="dark"
      className={`aeris-preview-controls dark not-prose rounded-xl border border-fd-border bg-[var(--aeris-panel-background,#191919)] text-fd-foreground [color-scheme:dark]`}>
      <PreviewOptions component={component} onChange={(option, color, firstStage, firstTap) => setPendingSettings({ option, color, firstStage, firstTap })} />

      <div className={`grid min-h-[328px] content-center justify-items-center bg-black p-4 sm:p-8${hasControls ? "" : " rounded-t-[calc(var(--radius-xl)-1px)]"}${children ? "" : " rounded-b-[calc(var(--radius-xl)-1px)]"}`}>
        {frame}
      </div>

      {children && (
        <div className="relative border-t border-fd-border">
          <div
            ref={code}
            className={`overflow-hidden rounded-b-[calc(var(--radius-xl)-1px)] [&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0 [&_figure]:bg-transparent [&_figure]:shadow-none [&_pre]:px-4`}
            style={codeCollapsed ? ({ maxHeight: "176px" } as CSSProperties) : undefined}
          >
            {children}
          </div>

          {codeCollapsed && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 flex h-28 items-end justify-center rounded-b-[calc(var(--radius-xl)-1px)] pb-3"
              style={{ backgroundImage: `linear-gradient(to top, ${codePanel}, color-mix(in srgb, ${codePanel} 88%, transparent), transparent)` }}
            >
              <button
                type="button"
                onClick={() => setCodeOpen(true)}
                className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-fd-border bg-fd-background/95 px-4 py-1.5 text-sm font-medium text-fd-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
              >
                展开代码
                <ChevronDown className="size-4" />
              </button>
            </div>
          )}

          {codeOverflows && codeOpen && (
            <div className="flex justify-center border-t border-fd-border/60 py-1.5">
              <button
                type="button"
                onClick={() => setCodeOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
              >
                收起代码
                <ChevronUp className="size-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
