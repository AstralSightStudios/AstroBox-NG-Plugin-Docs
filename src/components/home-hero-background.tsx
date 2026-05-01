"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "next-themes";

const GrainGradient = dynamic(
  () => import("@paper-design/shaders-react").then((mod) => mod.GrainGradient),
  { ssr: false },
);

let observer: IntersectionObserver;
const observerTargets = new WeakMap<Element, (entry: IntersectionObserverEntry) => void>();

function useIsVisible(ref: RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    observer ??= new IntersectionObserver((entries) => {
      for (const entry of entries) {
        observerTargets.get(entry.target)?.(entry);
      }
    });

    const element = ref.current;
    if (!element) return;

    observerTargets.set(element, (entry) => {
      setVisible(entry.isIntersecting);
    });
    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observerTargets.delete(element);
    };
  }, [ref]);

  return visible;
}

function BrandDitherIcon() {
  const dots = useMemo(() => {
    const cols = 70;
    const rows = 70;
    const cell = 8;
    const list: Array<{ x: number; y: number; size: number; opacity: number }> = [];

    const hash2d = (x: number, y: number) => {
      const value = Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const nx = x / (cols - 1);
        const ny = y / (rows - 1);
        // Left-top very dense, right-top sparse; avoid over-sparse regions.
        const bias = (1 - nx) * 0.8 + (1 - ny) * 0.2;
        const density = Math.min(1, Math.max(0, 0.18 + 0.68 * bias + 0.14 * (1 - nx) * (1 - ny)));
        const threshold = 0.3 + 0.63 * density;
        if (hash2d(x, y) > threshold) continue;

        const size = 1.4 + 1.9 * density;
        const px = x * cell + (cell - size) / 2;
        const py = y * cell + (cell - size) / 2;
        const opacity = 0.72 + 0.28 * density;
        list.push({ x: px, y: py, size, opacity });
      }
    }

    return list;
  }, []);

  return (
    <div className="hero-brand-dots">
      <svg className="hero-brand-dots-svg" viewBox="0 0 560 560" aria-hidden="true">
        <defs>
          <mask
            id="hero-brand-mask"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="560"
            height="560"
            style={{ maskType: "alpha" }}
          >
            <image href="/brand-icon.png" x="0" y="0" width="560" height="560" preserveAspectRatio="xMidYMid meet" />
          </mask>
        </defs>
        <g mask="url(#hero-brand-mask)">
          {dots.map((dot) => (
            <rect
              key={`${dot.x}-${dot.y}`}
              x={dot.x}
              y={dot.y}
              width={dot.size}
              height={dot.size}
              fill="#1781FF"
              fillOpacity={dot.opacity}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

export function HomeHeroBackground() {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement | null>(null);
  const visible = useIsVisible(ref);
  const [showShaders, setShowShaders] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowShaders(true);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      <div ref={ref} className="pointer-events-none absolute inset-0" aria-hidden="true" />

      {showShaders && (
        <GrainGradient
          className="absolute inset-0 animate-fd-fade-in duration-800"
          colors={
            resolvedTheme === "dark"
              ? ["#5cafff", "#1781FF", "#05132700"]
              : ["#A9DDFF", "#1781FF", "#1781FF22"]
          }
          colorBack="#00000000"
          softness={1}
          intensity={0.9}
          noise={0.5}
          speed={visible ? 1 : 0}
          shape="corners"
          minPixelRatio={1}
          maxPixelCount={1920 * 1080}
        />
      )}

      {showShaders && (
        <div
          className="pointer-events-none absolute animate-fd-fade-in duration-400 max-md:hidden lg:right-[12%] lg:top-[32%]"
        >
          <BrandDitherIcon />
        </div>
      )}
    </>
  );
}
