"use client";

import type { ComponentProps, CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  TOCScrollArea,
  TocThumb,
  useTOCItems,
} from "fumadocs-ui/components/toc/index";
import { I18nLabel, useI18n } from "fumadocs-ui/contexts/i18n";
import { useTreePath } from "fumadocs-ui/contexts/tree";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "fumadocs-ui/components/ui/collapsible";
import { TOCItem, useActiveAnchor } from "fumadocs-core/toc";
import { CaretDownIcon, TextTIcon } from "@phosphor-icons/react";

interface TocLine {
  path: string;
  width: number;
  height: number;
}

function getItemOffset(depth: number) {
  if (depth <= 2) return 14;
  if (depth === 3) return 26;
  return 36;
}

function getLineOffset(depth: number) {
  return depth >= 3 ? 11 : 1;
}

function appendCurve(
  parts: string[],
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
) {
  if (fromX === toX) {
    parts.push(`L${toX} ${toY}`);
    return;
  }

  const deltaY = toY - fromY;
  const direction = deltaY >= 0 ? 1 : -1;
  const controlY = Math.max(4, Math.abs(deltaY) * 0.55);

  parts.push(
    `C${fromX} ${fromY + direction * controlY} ${toX} ${
      toY - direction * controlY
    } ${toX} ${toY}`,
  );
}

function buildMask(path: string, width: number, height: number) {
  return `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path d="${path}" stroke="black" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  )}")`;
}

function RoundedTocItems() {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = useTOCItems();
  const { text } = useI18n();
  const [line, setLine] = useState<TocLine>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function measure() {
      if (!container || container.clientHeight === 0) return;

      let width = 0;
      let height = 0;
      let previousX: number | undefined;
      let previousY: number | undefined;
      const parts: string[] = [];
      const anchors = Array.from(container.querySelectorAll("a"));

      for (const item of items) {
        const element = anchors.find(
          (anchor) => anchor.getAttribute("href") === item.url,
        );
        if (!element) continue;

        const styles = getComputedStyle(element);
        const offset = getLineOffset(item.depth);
        const top = element.offsetTop + parseFloat(styles.paddingTop);
        const bottom =
          element.offsetTop +
          element.clientHeight -
          parseFloat(styles.paddingBottom);

        width = Math.max(offset, width);
        height = Math.max(bottom, height);

        if (previousX === undefined || previousY === undefined) {
          parts.push(`M${offset} ${top}`);
        } else {
          appendCurve(parts, previousX, previousY, offset, top);
        }

        parts.push(`L${offset} ${bottom}`);
        previousX = offset;
        previousY = bottom;
      }

      setLine(
        parts.length > 0
          ? {
              path: parts.join(" "),
              width: width + 2,
              height: height + 1,
            }
          : undefined,
      );
    }

    const observer = new ResizeObserver(measure);
    measure();
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-fd-card p-3 text-xs text-fd-muted-foreground">
        {text.tocNoHeadings}
      </div>
    );
  }

  const maskStyle =
    line &&
    ({
      width: line.width,
      height: line.height,
      maskImage: buildMask(line.path, line.width, line.height),
      WebkitMaskImage: buildMask(line.path, line.width, line.height),
    } satisfies CSSProperties);

  return (
    <>
      {line ? (
        <>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute start-0 top-0 overflow-visible text-fd-foreground/10 rtl:-scale-x-100"
            style={{ width: line.width, height: line.height }}
            viewBox={`0 0 ${line.width} ${line.height}`}
          >
            <path
              d={line.path}
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
          </svg>
          <div
            aria-hidden="true"
            className="absolute start-0 top-0 rtl:-scale-x-100"
            style={maskStyle}
          >
            <TocThumb
              containerRef={containerRef}
              className="absolute top-(--fd-top) h-(--fd-height) w-full bg-fd-primary transition-[top,height] data-[hidden=true]:opacity-0"
            />
          </div>
        </>
      ) : null}
      <div ref={containerRef} className="flex flex-col">
        {items.map((item) => (
          <TOCItem
            key={item.url}
            href={item.url}
            style={{ paddingInlineStart: getItemOffset(item.depth) }}
            className="prose relative py-1.5 text-sm text-fd-muted-foreground transition-colors wrap-anywhere first:pt-0 last:pb-0 hover:text-fd-accent-foreground data-[active=true]:text-fd-primary"
          >
            {item.title}
          </TOCItem>
        ))}
      </div>
    </>
  );
}

export function RoundedTableOfContent() {
  return (
    <div
      id="nd-toc"
      className="sticky top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] flex w-(--fd-toc-width) flex-col [grid-area:toc] pe-4 pb-2 pt-12 max-xl:hidden"
    >
      <h3
        id="toc-title"
        className="inline-flex items-center gap-1.5 text-sm text-fd-muted-foreground"
      >
        <TextTIcon className="size-4" />
        <I18nLabel label="toc" />
      </h3>
      <TOCScrollArea>
        <RoundedTocItems />
      </TOCScrollArea>
    </div>
  );
}

export function RoundedTableOfContentPopover() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!open) return;
      if (
        headerRef.current &&
        event.target instanceof Node &&
        !headerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, [open]);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      data-toc-popover=""
      className="sticky top-(--fd-docs-row-2) z-10 h-(--fd-toc-popover-height) [grid-area:toc-popover] max-xl:layout:[--fd-toc-popover-height:--spacing(10)] xl:hidden"
    >
      <header
        ref={headerRef}
        className={`border-b bg-fd-background/80 backdrop-blur-sm transition-colors ${
          open ? "shadow-lg" : ""
        }`}
      >
        <RoundedTableOfContentPopoverTrigger open={open} />
        <CollapsibleContent
          data-toc-popover-content=""
          className="flex max-h-[50vh] flex-col px-6 md:px-6"
        >
          <TOCScrollArea>
            <RoundedTocItems />
          </TOCScrollArea>
        </CollapsibleContent>
      </header>
    </Collapsible>
  );
}

function RoundedTableOfContentPopoverTrigger({ open }: { open: boolean }) {
  const { text } = useI18n();
  const items = useTOCItems();
  const active = useActiveAnchor();
  const selected = useMemo(
    () => items.findIndex((item) => active === item.url.slice(1)),
    [active, items],
  );
  const path = useTreePath().at(-1);
  const showItem = selected !== -1 && !open;

  return (
    <CollapsibleTrigger
      className="flex h-10 w-full items-center gap-2.5 px-4 py-2.5 text-start text-sm text-fd-muted-foreground focus-visible:outline-none md:px-6 [&_svg]:size-4"
      data-toc-popover-trigger=""
    >
      <ProgressCircle
        value={(selected + 1) / Math.max(1, items.length)}
        max={1}
        className={`shrink-0 ${open ? "text-fd-primary" : ""}`}
      />
      <span className="grid flex-1 *:col-start-1 *:row-start-1 *:my-auto">
        <span
          className={`truncate transition-[opacity,translate,color] ${
            open ? "text-fd-foreground" : ""
          } ${
            showItem ? "pointer-events-none -translate-y-full opacity-0" : ""
          }`}
        >
          {path?.name ?? text.toc}
        </span>
        <span
          className={`truncate transition-[opacity,translate] ${
            showItem ? "" : "pointer-events-none translate-y-full opacity-0"
          }`}
        >
          {items[selected]?.title}
        </span>
      </span>
      <CaretDownIcon
        className={`mx-0.5 shrink-0 transition-transform ${
          open ? "rotate-180" : ""
        }`}
      />
    </CollapsibleTrigger>
  );
}

function ProgressCircle({
  value,
  strokeWidth = 2,
  size = 24,
  min = 0,
  max = 100,
  ...props
}: ComponentProps<"svg"> & {
  value: number;
  strokeWidth?: number;
  size?: number;
  min?: number;
  max?: number;
}) {
  const normalizedValue = Math.min(Math.max(value, min), max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedValue / max) * circumference;
  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth,
  };

  return (
    <svg
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      aria-valuenow={normalizedValue}
      aria-valuemin={min}
      aria-valuemax={max}
      {...props}
    >
      <circle {...circleProps} className="stroke-current/25" />
      <circle
        {...circleProps}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="transition-all"
      />
    </svg>
  );
}
