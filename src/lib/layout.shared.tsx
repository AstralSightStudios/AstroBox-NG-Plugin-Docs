import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import { AstroBoxBrandTitle } from "@/components/brand";
import { FumadocsNavbar } from "@/components/nav";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { siteHomeHref, topNavLinks } from "@/lib/site-config";

type BaseOptionsConfig = {
  showNav?: boolean;
};

export function baseOptions({
  showNav = true,
}: BaseOptionsConfig = {}): BaseLayoutProps {
  return {
    links: topNavLinks,
    nav: {
      enabled: showNav,
      ...(showNav
        ? {
            component: <FumadocsNavbar />,
            transparentMode: "top",
          }
        : {}),
      title: (
        <span className="inline-flex items-center rounded-full py-1 transition-all duration-200 hover:bg-fd-foreground/10 active:scale-[0.96] active:opacity-[0.55]">
          <AstroBoxBrandTitle className="mx-0" />
        </span>
      ),
      url: siteHomeHref,
    },
    githubUrl:
      "https://github.com/AstralSightStudios/AstroBox-NG-Plugin-Template-Rust",
    themeSwitch: {
      component: <ThemeSwitcher mode="light-dark-system" variant="slider" />,
      mode: "light-dark-system",
    },
  };
}
