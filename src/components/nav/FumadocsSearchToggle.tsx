"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useSearchContext } from "fumadocs-ui/contexts/search";

type FumadocsSearchToggleProps = {
  className?: string;
  style?: CSSProperties;
};

export function FumadocsSearchToggle({ className, style }: FumadocsSearchToggleProps) {
  const { enabled, setOpenSearch } = useSearchContext();
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  if (!enabled) return null;

  const handlePointerDown = () => setPressed(true);
  const handlePointerUp = () => setPressed(false);
  const handlePointerEnter = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType !== "touch") setHovered(true);
  };
  const handlePointerLeave = () => {
    setHovered(false);
    setPressed(false);
  };

  const resolvedStyle: CSSProperties = {
    ...style,
    background: hovered
      ? "color-mix(in srgb, var(--color-text) 10%, transparent)"
      : "transparent",
    transform: pressed ? "scale(0.9)" : "scale(1)",
  };

  return (
    <button
      type="button"
      className={className}
      style={resolvedStyle}
      aria-label="打开搜索"
      data-search=""
      data-ab-mobile-icon-button=""
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerLeave}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={() => setOpenSearch(true)}
    >
      <MagnifyingGlassIcon className="size-[18px]" weight="bold" />
    </button>
  );
}
