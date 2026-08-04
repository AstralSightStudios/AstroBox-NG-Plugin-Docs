"use client";

import { useEffect } from "react";

const DARK_BACKGROUND = "#101010";

export default function ForceDarkRoute() {
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const hadDark = root.classList.contains("dark");
    const hadLight = root.classList.contains("light");
    const prevColorScheme = root.style.colorScheme;
    const prevBodyBackground = body.style.backgroundColor;

    const apply = () => {
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
      body.style.backgroundColor = DARK_BACKGROUND;
    };

    apply();
    const retry = window.setTimeout(apply, 60);

    return () => {
      window.clearTimeout(retry);
      if (!hadDark) {
        root.classList.remove("dark");
      }
      if (hadLight) {
        root.classList.add("light");
      }
      root.style.colorScheme = prevColorScheme;
      body.style.backgroundColor = prevBodyBackground;
    };
  }, []);

  return null;
}
