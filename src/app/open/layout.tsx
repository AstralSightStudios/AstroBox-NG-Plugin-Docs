import type { ReactNode } from "react";
import ForceDarkRoute from "@/components/force-dark-route";

export default function OpenLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ForceDarkRoute />
      {children}
    </>
  );
}
