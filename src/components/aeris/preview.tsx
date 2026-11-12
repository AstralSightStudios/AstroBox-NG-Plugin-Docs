"use client";

import { useEffect, useRef, useState } from "react";
import { PreviewOptions } from "./preview-options";

export function AerisPreview({
  component,
  title,
  palette,
}: {
  component: string;
  title: string;
  palette?: string;
}) {
  const [aspectRatio, setAspectRatio] = useState("336 / 480");
  const [settings, setSettings] = useState<{ option: number; color?: string }>();
  const observer = useRef<ResizeObserver | null>(null);
  const params = new URLSearchParams({ component });

  if (settings?.color !== undefined) params.set("color", settings.color);
  if (settings !== undefined) params.set("option", String(settings.option));
  if (palette !== undefined) params.set("palette", palette);

  useEffect(() => () => observer.current?.disconnect(), []);

  function observeCanvas(frame: HTMLIFrameElement) {
    observer.current?.disconnect();
    const canvas = frame.contentDocument?.querySelector("canvas");
    if (!canvas) return;

    const syncSize = () => setAspectRatio(`${canvas.width} / ${canvas.height}`);

    syncSize();
    observer.current = new ResizeObserver(syncSize);
    observer.current.observe(canvas);
  }

  return (
    <>
      <PreviewOptions component={component} onChange={(option, color) => setSettings({ option, color })} />
      <iframe
        className="block h-auto max-w-full"
        style={{ aspectRatio }}
        title={title}
        width={336}
        height={480}
        src={`/assets/canopus/ui-gallery/preview.html?${params}`}
        onLoad={(event) => observeCanvas(event.currentTarget)}
      />
    </>
  );
}
