import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { AstroBoxBrandTitle } from "@/components/brand";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <AstroBoxBrandTitle />,
    },
    githubUrl: "https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Template-Rust",
  };
}
