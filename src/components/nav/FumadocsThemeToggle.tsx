"use client";

import { Airplay, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type ThemeMode = "light-dark" | "light-dark-system";

type FumadocsThemeToggleProps = {
  className?: string;
  mode?: ThemeMode;
};

const themeItems = [
  ["light", Sun],
  ["dark", Moon],
  ["system", Airplay],
] as const;

const getItemClassName = (active: boolean) =>
  [
    "size-6.5 rounded-full p-1.5 transition-colors",
    active
      ? "bg-fd-accent text-fd-accent-foreground"
      : "text-fd-muted-foreground",
  ].join(" ");

export function FumadocsThemeToggle({
  className,
  mode = "light-dark-system",
}: FumadocsThemeToggleProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerClassName = [
    "inline-flex items-center rounded-full border p-1",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  useEffect(() => {
    setMounted(true);
  }, []);

  // 避免 hydration mismatch：未挂载前使用中性样式
  const itemClassName = (key: string) => {
    if (!mounted)
      return "size-6.5 rounded-full p-1.5 transition-colors text-fd-muted-foreground";
    return getItemClassName(
      mode === "light-dark" ? resolvedTheme === key : theme === key,
    );
  };

  const handleToggle = () => {
    if (mode === "light-dark") {
      setTheme(resolvedTheme === "light" ? "dark" : "light");
    }
  };

  if (mode === "light-dark") {
    return (
      <button
        type="button"
        className={containerClassName}
        aria-label="切换主题"
        data-theme-toggle=""
        onClick={handleToggle}
      >
        {themeItems.map(([key, Icon]) => {
          if (key === "system") return null;
          return (
            <Icon
              key={key}
              fill="currentColor"
              className={itemClassName(key)}
            />
          );
        })}
      </button>
    );
  }

  return (
    <div className={containerClassName} data-theme-toggle="">
      {themeItems.map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          aria-label={key}
          className={itemClassName(key)}
          onClick={() => setTheme(key)}
        >
          <Icon className="size-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
