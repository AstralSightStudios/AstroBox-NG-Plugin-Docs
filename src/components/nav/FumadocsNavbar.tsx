"use client";

import type { ComponentProps, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { NavHeader as BaseNavHeader, type NavHeaderItem } from "@claralight-design/abweb-navbar";
import { PanelLeft, Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { SidebarTrigger } from "fumadocs-ui/components/sidebar/base";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { AstroBoxBrandTitle } from "@/components/brand";
import { siteBrandName, siteHomeHref, topNavLinks } from "@/lib/site-config";
import { FumadocsSearchToggle } from "./FumadocsSearchToggle";
import { FumadocsThemeToggle } from "./FumadocsThemeToggle";

const normalizePath = (path: string): string => {
  if (!path) return "/";

  const cleanPath = path.split("?")[0]?.split("#")[0] ?? "/";
  const withLeading = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`;

  if (withLeading === "/") return "/";

  return withLeading.endsWith("/") ? withLeading.slice(0, -1) : withLeading;
};

const isLinkActive = (currentPath: string, targetPath: string, mode: "url" | "nested-url" | "none" = "url") => {
  if (mode === "none") return false;

  const normalizedCurrent = normalizePath(currentPath);
  const normalizedTarget = normalizePath(targetPath);

  if (mode === "url") {
    return normalizedCurrent === normalizedTarget;
  }

  if (normalizedTarget === "/") {
    return normalizedCurrent === "/";
  }

  return normalizedCurrent === normalizedTarget || normalizedCurrent.startsWith(`${normalizedTarget}/`);
};

const isInternalHref = (href: string) => /^\/(?!\/)/.test(href);

const isModifiedEvent = (event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

const navToolButtonClassName =
  "rounded-full border border-fd-border/60 bg-fd-background/80 text-fd-foreground backdrop-blur-sm";

type ExtendedNavHeaderProps = ComponentProps<typeof BaseNavHeader> & {
  showMobileMenuButton?: boolean;
  mobileMenuSlot?: ReactNode;
};

const NavHeader = BaseNavHeader as unknown as (props: ExtendedNavHeaderProps) => ReactNode;

export function FumadocsNavbar() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const isDocsRoute = pathname.startsWith("/docs");
  const { enabled: searchEnabled, setOpenSearch } = useSearchContext();

  const navItems: NavHeaderItem[] = topNavLinks.flatMap((item) => {
    if (!("text" in item) || !("url" in item)) return [];
    if ("on" in item && item.on === "menu") return [];

    const href = item.url;
    const external = "external" in item ? item.external : undefined;
    const activeMode = "active" in item ? item.active : undefined;
    const ariaLabel = typeof item.text === "string" ? item.text : href;

    return [
      {
        id: href,
        label: item.text,
        ariaLabel,
        href,
        external,
        active: isLinkActive(pathname, href, activeMode),
        matchPath: href,
        onClick: (event: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
          if (external || !isInternalHref(href) || isModifiedEvent(event)) return;

          event.preventDefault();
          router.push(href);
        },
      },
    ];
  });

  if (searchEnabled) {
    navItems.push({
      id: "__search__",
      ariaLabel: "打开搜索",
      hideInMobileMenu: true,
      onClick: () => setOpenSearch(true),
      label: (
        <span className="inline-flex items-center gap-1.5">
          <Search className="size-4" />
          <span>搜索</span>
        </span>
      ),
    });
  }

  return (
    <NavHeader
      className={isDocsRoute ? "ab-docs-mobile-nav md:hidden" : undefined}
      variant="docs"
      currentPath={pathname}
      navItems={navItems}
      showMobileMenuButton={!isDocsRoute}
      mobileMenuSlot={
        isDocsRoute ? (
          <SidebarTrigger
            className={[
              buttonVariants({ color: "ghost", size: "icon-sm" }),
              navToolButtonClassName,
              "md:hidden",
            ].join(" ")}
          >
            <PanelLeft className="size-4" />
          </SidebarTrigger>
        ) : undefined
      }
      logo={<AstroBoxBrandTitle />}
      brandName={siteBrandName}
      homeHref={siteHomeHref}
      labels={{ menu: "菜单", close: "关闭" }}
      leftSlotDesktop={
        <FumadocsThemeToggle
          mode="light-dark-system"
          className={navToolButtonClassName}
        />
      }
      leftSlotMobile={
        <FumadocsSearchToggle className={navToolButtonClassName} />
      }
    />
  );
}
