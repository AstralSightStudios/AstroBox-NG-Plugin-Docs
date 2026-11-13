"use client";

import { useEffect, useRef, useState } from "react";
import { hasPreviewOptions, PreviewOptions } from "./preview-options";
import "./preview.css";

export function AerisPreview({
  component,
  title,
  palette,
}: {
  component: string;
  title: string;
  palette?: string;
}) {
  const [height, setHeight] = useState<number>();
  const [settings, setSettings] = useState<{ option: number; color?: string; firstStage?: number; firstTap?: string }>();
  const iframe = useRef<HTMLIFrameElement>(null);
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

  const frame = (
    <div className={`relative w-full max-w-[336px] overflow-hidden${height === 480
      ? " rounded-[44px] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border after:border-white/20"
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

  return (
    <div data-theme="dark"
      className={`not-prose rounded-xl border border-white/10 bg-[var(--aeris-panel-background,#191919)] text-white [color-scheme:dark]${hasControls ? "" : " overflow-hidden"}`}>
      <div className={`grid justify-items-center rounded-t-[inherit] bg-black p-4 sm:p-8${hasControls ? "" : " rounded-b-[inherit]"}`}>
        {frame}
      </div>
      <PreviewOptions component={component} onChange={(option, color, firstStage, firstTap) => setSettings({ option, color, firstStage, firstTap })} />
    </div>
  );
}
