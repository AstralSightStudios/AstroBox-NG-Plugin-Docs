"use client";

import { useParams } from "next/navigation";
import type { ReactNode } from "react";
import { getSection } from "@/lib/section";

export function Body({ children }: { children: ReactNode }) {
  const mode = useMode();

  return (
    <body
      className={["relative flex min-h-screen flex-col", mode]
        .filter(Boolean)
        .join(" ")}
      suppressHydrationWarning
    >
      {children}
    </body>
  );
}

function useMode(): string | undefined {
  const params = useParams();
  const slug = params?.slug;

  // 只在 /docs/... 路由下生效
  if (Array.isArray(slug)) {
    return getSection(slug[0]);
  }

  return undefined;
}
