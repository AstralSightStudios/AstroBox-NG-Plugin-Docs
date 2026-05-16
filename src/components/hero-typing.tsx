"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

type HeroTypingProps = {
  words: string[];
  className?: string;
  typingSpeed?: number;
  pauseMs?: number;
  deleteSpeed?: number;
};

type Phase = "typing" | "hold" | "deleting";

type FrameState = {
  wordIndex: number;
  progress: number;
  phase: Phase;
  holdUntil: number;
};

const smoothstep = (x: number) => {
  const v = Math.min(1, Math.max(0, x));
  return v * v * (3 - 2 * v);
};

const easeOutCubic = (x: number) => {
  const v = Math.min(1, Math.max(0, x));
  return 1 - Math.pow(1 - v, 3);
};

const easeInCubic = (x: number) => {
  const v = Math.min(1, Math.max(0, x));
  return v * v * v;
};

/** 统一 CSS 数值精度，避免不同 JS 引擎（V8 vs JSC）toString() 差异导致 hydration mismatch */
const cssNum = (n: number, digits = 6): string => {
  const s = n.toFixed(digits);
  // 去除末尾无意义的 0，但保留至少一位数字
  const trimmed = s.replace(/\.?0+$/, "");
  return trimmed || "0";
};

export function HeroTyping({
  words,
  className,
  typingSpeed = 700,
  pauseMs = 1500,
  deleteSpeed = 700,
}: HeroTypingProps) {
  const wordsSafe = useMemo(() => (words.length > 0 ? words : [""]), [words]);
  const charsByWord = useMemo(
    () => wordsSafe.map((word) => Array.from(word)),
    [wordsSafe],
  );
  const lengthsByWord = useMemo(
    () => charsByWord.map((chars) => Math.max(chars.length, 1)),
    [charsByWord],
  );

  const [frame, setFrame] = useState<FrameState>({
    wordIndex: 0,
    progress: 0.02,
    phase: "typing",
    holdUntil: 0,
  });
  const frameRef = useRef<FrameState>(frame);
  const [charWidthsByWord, setCharWidthsByWord] = useState<number[][]>([]);
  const [ready, setReady] = useState(false);
  const isMd = useSyncExternalStore(
    (callback) => {
      const mql = window.matchMedia("(min-width: 768px)");
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(min-width: 768px)").matches
        : false,
    () => false,
  );

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const rootRef = useRef<HTMLSpanElement | null>(null);
  const measureRefs = useRef<(HTMLSpanElement | null)[][]>([]);

  useEffect(() => {
    frameRef.current = frame;
  }, [frame]);

  useEffect(() => {
    if (!wordsSafe.length) return;

    let rafId = 0;
    let lastTime = 0;

    const tick = (time: number) => {
      if (lastTime === 0) lastTime = time;
      const dt = time - lastTime;
      lastTime = time;

      const prev = frameRef.current;
      let { wordIndex, progress, phase, holdUntil } = prev;
      const length = lengthsByWord[wordIndex] ?? 1;

      if (phase === "typing") {
        progress += (dt * length) / Math.max(1, typingSpeed);
        if (progress >= length) {
          progress = length;
          phase = "hold";
          holdUntil = time + pauseMs;
        }
      } else if (phase === "hold") {
        progress = length;
        if (time >= holdUntil) {
          phase = "deleting";
        }
      } else {
        progress -= (dt * length) / Math.max(1, deleteSpeed);
        if (progress <= 0.02) {
          wordIndex = (wordIndex + 1) % wordsSafe.length;
          const nextLength = lengthsByWord[wordIndex] ?? 1;
          progress = Math.min(0.02, nextLength * 0.04);
          phase = "typing";
          holdUntil = 0;
        }
      }

      const next: FrameState = { wordIndex, progress, phase, holdUntil };
      frameRef.current = next;
      setFrame(next);

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [deleteSpeed, lengthsByWord, pauseMs, typingSpeed, wordsSafe.length]);

  useLayoutEffect(() => {
    measureRefs.current = charsByWord.map((chars, wi) =>
      chars.map((_, ci) => measureRefs.current[wi]?.[ci] ?? null),
    );

    const updateWidths = () => {
      const measured = charsByWord.map((chars, wi) =>
        chars.map(
          (_, ci) =>
            measureRefs.current[wi]?.[ci]?.getBoundingClientRect().width ?? 0,
        ),
      );
      setCharWidthsByWord(measured);
    };

    updateWidths();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && rootRef.current) {
      observer = new ResizeObserver(updateWidths);
      observer.observe(rootRef.current);
    }

    window.addEventListener("resize", updateWidths);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateWidths);
    };
  }, [charsByWord]);

  const currentChars = charsByWord[frame.wordIndex] ?? [];
  const currentLength = Math.max(currentChars.length, 1);
  const currentCharWidths = charWidthsByWord[frame.wordIndex] ?? [];
  const allWidths = charWidthsByWord.flat().filter((w) => w > 0);
  const fallbackWidth =
    allWidths.length > 0
      ? allWidths.reduce((sum, width) => sum + width, 0) / allWidths.length
      : 9;

  const maxWordWidth = useMemo(() => {
    if (!charWidthsByWord.length) return 0;
    return Math.max(
      ...charWidthsByWord.map((widths) =>
        widths.reduce((sum, w) => sum + (w > 0 ? w : fallbackWidth), 0),
      ),
    );
  }, [charWidthsByWord, fallbackWidth]);

  const getCharWidth = (index: number) => {
    const width = currentCharWidths[index];
    return width && width > 0 ? width : fallbackWidth;
  };

  const getCharProgress = (index: number) => {
    const raw = frame.progress - index;
    return Math.min(1, Math.max(0, raw));
  };

  const getWidthProgress = (index: number) => {
    const raw = getCharProgress(index);
    // Non-linear and C1-continuous at 0/1 to avoid jerky width transitions.
    const base = smoothstep(raw);
    if (frame.phase === "deleting") return easeInCubic(base);
    return easeOutCubic(base);
  };

  const dynamicWidth = currentChars.reduce((sum, _char, i) => {
    const widthProgress = getWidthProgress(i);
    return sum + getCharWidth(i) * widthProgress;
  }, 0);

  const isDeleting = frame.phase === "deleting";

  return (
    <span
      ref={rootRef}
      className={className}
      data-ready={ready ? "true" : undefined}
    >
      <span className="relative inline-flex items-baseline whitespace-nowrap">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] top-0 whitespace-nowrap opacity-0"
        >
          {charsByWord.map((chars, wi) => (
            <span key={`measure-word-${wi}`} className="mr-4 inline-block">
              {chars.map((char, ci) => (
                <span
                  key={`measure-char-${wi}-${ci}`}
                  ref={(el) => {
                    if (!measureRefs.current[wi]) measureRefs.current[wi] = [];
                    measureRefs.current[wi][ci] = el;
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
          ))}
        </span>

        <span
          className={`hero-typing-container inline-flex items-baseline whitespace-nowrap ${isMd ? "justify-start" : "justify-center"}`}
          style={{
            width: `${cssNum(Math.max(0.5, dynamicWidth))}px`,
            minWidth: isMd ? undefined : `${cssNum(maxWordWidth)}px`,
          }}
        >
          {currentChars.map((char, i) => {
            const eased = smoothstep(getCharProgress(i));
            const baseSlotWidth = getCharWidth(i) * getWidthProgress(i);
            const slotWidth = baseSlotWidth;
            const y = isDeleting ? -(1 - eased) * 8 : (1 - eased) * 8;
            const blur = (1 - eased) * 2.1;

            return (
              <span
                key={`char-${i}`}
                className="inline-flex items-baseline justify-start will-change-[transform,opacity,filter,width]"
                style={{
                  width: `${cssNum(slotWidth)}px`,
                  opacity: cssNum(eased),
                  transform: `translate3d(0px, ${cssNum(y)}px, 0px) scale(${cssNum(0.988 + eased * 0.012)})`,
                  filter: `blur(${cssNum(blur)}px)`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
          {currentLength === 1 && currentChars.length === 0 ? "\u00A0" : null}
        </span>
      </span>
    </span>
  );
}
