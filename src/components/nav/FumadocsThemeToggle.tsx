"use client";

import { Airplay, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

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
    active ? "bg-fd-accent text-fd-accent-foreground" : "text-fd-muted-foreground",
  ].join(" ");

export function FumadocsThemeToggle({
  className,
  mode = "light-dark-system",
}: FumadocsThemeToggleProps) {
  const { resolvedTheme, setTheme, theme } = useTheme();
  const containerClassName = ["inline-flex items-center rounded-full border p-1", className].filter(Boolean).join(" ");

  if (mode === "light-dark") {
    const value = resolvedTheme;

    return (
      <button
        type="button"
        className={containerClassName}
        aria-label="切换主题"
        data-theme-toggle=""
        onClick={() => setTheme(value === "light" ? "dark" : "light")}
      >
        {themeItems.map(([key, Icon]) => {
          if (key === "system") return null;

          return <Icon key={key} fill="currentColor" className={getItemClassName(value === key)} />;
        })}
      </button>
    );
  }

  const value = theme;

  return (
    <div className={containerClassName} data-theme-toggle="">
      {themeItems.map(([key, Icon]) => (
        <button
          key={key}
          type="button"
          aria-label={key}
          className={getItemClassName(value === key)}
          onClick={() => setTheme(key)}
        >
          <Icon className="size-full" fill="currentColor" />
        </button>
      ))}
    </div>
  );
}
