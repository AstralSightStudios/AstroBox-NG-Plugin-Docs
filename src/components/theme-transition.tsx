"use client";

type ThemeTransitionTarget = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const THEME_TRANSITION_DURATION = 170;
const THEME_TRANSITION_PREPARE_DELAY = 16;

let cleanupTimeoutId: number | null = null;

type ThemeTransitionApplier = (value: ThemeTransitionTarget) => void;

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    updateCallback: () => void | Promise<void>,
  ) => {
    finished: Promise<void>;
  };
};

function isReducedMotionPreferred() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveThemeTarget(target: ThemeTransitionTarget): ResolvedTheme {
  if (target === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return target;
}

function applyResolvedThemeToDocument(target: ThemeTransitionTarget) {
  const resolvedTheme = resolveThemeTarget(target);
  const root = document.documentElement;

  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  root.style.colorScheme = resolvedTheme;
}

function startFallbackThemeTransition(target: ThemeTransitionTarget) {
  if (typeof window === "undefined" || isReducedMotionPreferred()) return 0;

  const root = document.documentElement;

  if (cleanupTimeoutId !== null) {
    window.clearTimeout(cleanupTimeoutId);
  }

  root.dataset.themeTarget = target;
  root.dataset.themeTransition = "active";

  // 强制浏览器先应用过渡规则，再切真实主题，避免同帧合并导致无动画。
  root.getBoundingClientRect();

  cleanupTimeoutId = window.setTimeout(() => {
    root.removeAttribute("data-theme-transition");
    root.removeAttribute("data-theme-target");
    cleanupTimeoutId = null;
  }, THEME_TRANSITION_DURATION);

  return THEME_TRANSITION_PREPARE_DELAY;
}

export function applyThemeTransition(
  target: ThemeTransitionTarget,
  apply: ThemeTransitionApplier,
) {
  if (typeof window === "undefined" || isReducedMotionPreferred()) {
    apply(target);
    return;
  }

  const root = document.documentElement;
  const doc = document as DocumentWithViewTransition;

  if (typeof doc.startViewTransition === "function") {
    try {
      const transition = doc.startViewTransition(() => {
        applyResolvedThemeToDocument(target);
        apply(target);
      })
      void transition.finished.catch(() => {});
      return;
    } catch {
      applyResolvedThemeToDocument(target);
      apply(target);
      return;
    }
  }

  const delay = startFallbackThemeTransition(target);
  window.setTimeout(() => {
    apply(target);
  }, delay);
}
