"use client";

import { CheckIcon, GearSixIcon, MoonIcon, SunIcon, CaretUpDownIcon } from "@phosphor-icons/react";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "fumadocs-ui/components/ui/popover";
import { useTheme } from "next-themes";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { applyThemeTransition } from "@/components/theme-transition";

type ThemeMode = "light-dark" | "light-dark-system";
type ThemeSwitcherVariant = "slider" | "dropdown";
type ThemeKey = "light" | "dark" | "system";

type ThemeSwitcherProps = {
  className?: string;
  mode?: ThemeMode;
  variant?: ThemeSwitcherVariant;
};

type ThemeOption = {
  key: ThemeKey;
  label: string;
  shortLabel: string;
  icon: typeof SunIcon;
};

const themeOptions: ThemeOption[] = [
  { key: "light", label: "浅色模式", shortLabel: "浅色", icon: SunIcon },
  { key: "dark", label: "深色模式", shortLabel: "深色", icon: MoonIcon },
  { key: "system", label: "跟随系统", shortLabel: "系统", icon: GearSixIcon },
];

function getVisibleOptions(mode: ThemeMode) {
  return mode === "light-dark" ? themeOptions.filter((item) => item.key !== "system") : themeOptions;
}

function isThemeKey(value: string): value is ThemeKey {
  return value === "light" || value === "dark" || value === "system";
}

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function joinClassName(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function ThemeSwitcher({
  className,
  mode = "light-dark-system",
  variant = "slider",
}: ThemeSwitcherProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const [visualTheme, setVisualTheme] = useState<ThemeKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const hasInitializedIndicatorRef = useRef(false);
  const options = useMemo(() => getVisibleOptions(mode), [mode]);
  const currentTheme = mounted ? (mode === "light-dark" ? resolvedTheme : theme) : null;
  const displayedTheme =
    variant === "slider" ? (visualTheme ?? currentTheme) : currentTheme;
  const activeIndex = Math.max(
    0,
    options.findIndex((item) => item.key === displayedTheme),
  );

  useEffect(() => {
    if (!mounted || !currentTheme || !isThemeKey(currentTheme)) return;

    const timeoutId = window.setTimeout(() => {
      setVisualTheme((previousTheme) =>
        previousTheme === currentTheme ? previousTheme : currentTheme,
      );
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentTheme, mounted, variant]);

  const handleThemeChange = (target: ThemeKey) => {
    if (variant === "slider") {
      setVisualTheme(target);
    }

    applyThemeTransition(target, setTheme);
  };

  useLayoutEffect(() => {
    const indicator = indicatorRef.current;
    const activeButton = buttonRefs.current[activeIndex];

    if (!indicator || !activeButton) return;

    const transitionValue =
      "transform 360ms cubic-bezier(0.34,1.56,0.64,1), width 320ms cubic-bezier(0.22,1,0.36,1), opacity 180ms ease";

    const updateIndicator = (animate: boolean) => {
      const nextButton = buttonRefs.current[activeIndex];
      if (!nextButton) return;

      if (!animate) {
        indicator.style.transition = "none";
      }

      indicator.style.transform = `translate3d(${nextButton.offsetLeft}px, 0, 0)`;
      indicator.style.width = `${nextButton.offsetWidth}px`;
      indicator.style.opacity = mounted ? "1" : "0";

      if (!animate) {
        requestAnimationFrame(() => {
          if (!indicatorRef.current) return;
          indicatorRef.current.style.transition = transitionValue;
        });
      }
    };

    updateIndicator(hasInitializedIndicatorRef.current);
    hasInitializedIndicatorRef.current = true;

    const observer = new ResizeObserver(() => {
      updateIndicator(true);
    });

    const container = containerRef.current;
    if (container) observer.observe(container);
    buttonRefs.current.forEach((button) => {
      if (button) observer.observe(button);
    });

    return () => observer.disconnect();
  }, [activeIndex, mounted, options]);

  if (variant === "dropdown") {
    const activeOption = options[activeIndex] ?? options[0];
    const ActiveIcon = activeOption.icon;

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="选择主题"
            data-theme-toggle=""
            className={joinClassName(
              buttonVariants({ color: "secondary", size: "sm" }),
              "h-9 rounded-full border-fd-border/70 bg-fd-background/85 px-3 text-fd-foreground shadow-sm backdrop-blur-md transition-[background-color,border-color,color,box-shadow] duration-150 hover:border-fd-border hover:bg-fd-background",
              className,
            )}
          >
            <ActiveIcon className="size-4" weight="bold" />
            <CaretUpDownIcon
              className={joinClassName(
                "size-4 text-fd-muted-foreground transition-transform duration-200",
                open && "rotate-180",
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-0 rounded-2xl p-1.5">
          <div className="flex flex-col gap-1">
            {options.map((item) => {
              const Icon = item.icon;
              const isActive = mounted && displayedTheme === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  aria-label={item.label}
                  className="inline-flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition-colors hover:bg-fd-accent/70 hover:text-fd-accent-foreground"
                  onClick={() => {
                    handleThemeChange(item.key);
                    setOpen(false);
                  }}
                >
                  <span
                    className={joinClassName(
                      "inline-flex size-8 items-center justify-center rounded-full transition-colors",
                      isActive ? "bg-fd-primary text-fd-primary-foreground" : "bg-fd-accent/60 text-fd-muted-foreground",
                    )}
                  >
                    <Icon className="size-4" weight="bold" />
                  </span>
                  <CheckIcon
                    className={joinClassName(
                      "size-4 text-fd-primary transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                    weight="bold"
                  />
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div
      ref={containerRef}
      className={joinClassName(
        "relative inline-flex h-9 items-center gap-1 rounded-full border border-fd-border/70 bg-fd-background/85 p-1 backdrop-blur-md",
        className,
      )}
      data-theme-toggle=""
    >
      <div
        ref={indicatorRef}
        aria-hidden
        className={joinClassName(
          "absolute bottom-1 left-0 top-1 rounded-full bg-fd-primary pointer-events-none",
          mounted ? "opacity-100" : "opacity-0",
        )}
        style={{
          width: "1.75rem",
          transform: "translate3d(0, 0, 0)",
          transition:
            "transform 360ms cubic-bezier(0.34,1.56,0.64,1), width 320ms cubic-bezier(0.22,1,0.36,1), opacity 180ms ease",
        }}
      />
      {options.map((item, index) => {
        const Icon = item.icon;
        const isActive = mounted && displayedTheme === item.key;

        return (
          <button
            key={item.key}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            aria-label={item.label}
            className={joinClassName(
              "relative z-10 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm transition-[color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
              isActive
                ? "text-fd-primary-foreground"
                : "text-fd-muted-foreground hover:text-fd-foreground",
            )}
            onClick={() => handleThemeChange(item.key)}
          >
            <Icon className="size-4 shrink-0" weight="bold" />
          </button>
        );
      })}
    </div>
  );
}

export type { ThemeMode, ThemeSwitcherProps, ThemeSwitcherVariant };
