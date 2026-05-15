import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { AstroBoxBrandTitle } from "@/components/brand";
import { FumadocsNavbar } from "@/components/nav";
import { siteHomeHref, topNavLinks } from "@/lib/site-config";

type BaseOptionsConfig = {
  showNav?: boolean;
};

export function baseOptions({ showNav = true }: BaseOptionsConfig = {}): BaseLayoutProps {
  return {
    links: topNavLinks,
    nav: showNav
      ? {
          enabled: true,
          component: <FumadocsNavbar />,
          title: <AstroBoxBrandTitle />,
          url: siteHomeHref,
          transparentMode: "top",
        }
      : {
          enabled: false,
        },
    githubUrl: "https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Template-Rust",
    themeSwitch: {
      mode: "light-dark-system",
    },
  };
}
