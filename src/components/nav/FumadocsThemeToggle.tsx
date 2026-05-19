"use client";

import { ThemeSwitcher, type ThemeMode } from "@/components/theme-switcher";

type FumadocsThemeToggleProps = {
  className?: string;
  mode?: ThemeMode;
};

export function FumadocsThemeToggle({
  className,
  mode = "light-dark-system",
}: FumadocsThemeToggleProps) {
  return <ThemeSwitcher className={className} mode={mode} variant="slider" />;
}
