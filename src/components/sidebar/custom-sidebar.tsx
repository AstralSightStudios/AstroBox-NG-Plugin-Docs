"use client";

import { cn } from "fumadocs-ui/utils/cn";
import { buttonVariants } from "fumadocs-ui/components/ui/button";
import { mergeRefs } from "fumadocs-ui/utils/merge-refs";
import {
  SidebarCollapseTrigger,
  SidebarContent as BaseSidebarContent,
  SidebarDrawerContent,
  SidebarDrawerOverlay,
  SidebarFolder,
  SidebarFolderContent,
  SidebarFolderLink,
  SidebarFolderTrigger,
  SidebarItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useFolder,
  useFolderDepth,
} from "fumadocs-ui/components/sidebar/base";
import { createLinkItemRenderer } from "fumadocs-ui/components/sidebar/link-item";
import { createPageTreeRenderer } from "fumadocs-ui/components/sidebar/page-tree";
import { ScrollArea, ScrollViewport } from "fumadocs-ui/components/ui/scroll-area";
import { LinkItem } from "fumadocs-ui/utils/link-item";
import { SidebarTabsDropdown } from "fumadocs-ui/components/sidebar/tabs/dropdown";
import { getSidebarTabs } from "fumadocs-ui/components/sidebar/tabs/index";
import { useMemo, useRef, Fragment } from "react";
import { SidebarSimpleIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { renderTitleNav, useLinkItems } from "fumadocs-ui/layouts/shared";
import type { Root as PageTreeRoot } from "fumadocs-core/page-tree";
import type { ReactNode, ComponentProps } from "react";
import type { NavOptions } from "fumadocs-ui/layouts/shared";

function getSectionFromUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const path = url.replace(/^\/(?:docs\/)?/, "");
  const [dir] = path.split("/", 1);
  if (!dir) return undefined;
  switch (dir) {
    case "plugin-dev":
      return "plugin";
    case "creator-tools":
      return "creator";
    case "usage":
      return "usage";
    default:
      return undefined;
  }
}

// ============================
// 基础组件（复制自 fumadocs-ui/layouts/docs/sidebar）
// ============================

function SidebarViewport({ className, children, ...props }: ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea {...props} className={cn("min-h-0 flex-1", className)}>
      <ScrollViewport
        className="*:flex! *:flex-col! *:gap-0.5! p-4 overscroll-contain"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, white 12px, white calc(100% - 12px), transparent)",
        }}
      >
        {children}
      </ScrollViewport>
    </ScrollArea>
  );
}

function getItemOffset(depth: number) {
  return `calc(${2 + 3 * depth} * var(--spacing))`;
}

function CustomSidebarSeparator({ className, style, children, ...props }: ComponentProps<typeof SidebarSeparator>) {
  const depth = useFolderDepth();
  return (
    <SidebarSeparator
      className={cn(
        "inline-flex items-center gap-2 mb-1 px-2 mt-6 empty:mb-0 [&_svg]:size-4 [&_svg]:shrink-0",
        depth === 0 && "first:mt-0",
        className
      )}
      style={{ paddingInlineStart: getItemOffset(depth), ...style }}
      {...props}
    >
      {children}
    </SidebarSeparator>
  );
}

function CustomSidebarItem({ className, style, children, ...props }: ComponentProps<typeof SidebarItem>) {
  const depth = useFolderDepth();
  return (
    <SidebarItem
      className={cn(
        "relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0 transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors",
        depth >= 1 && "data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5",
        className
      )}
      style={{ paddingInlineStart: getItemOffset(depth), ...style }}
      {...props}
    >
      {children}
    </SidebarItem>
  );
}

function CustomSidebarFolderTrigger({ className, style, ...props }: ComponentProps<typeof SidebarFolderTrigger>) {
  const folder = useFolder();
  const depth = folder?.depth ?? 0;
  const collapsible = folder?.collapsible ?? false;
  return (
    <SidebarFolderTrigger
      className={cn(
        "relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0 w-full transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none",
        collapsible ? null : null,
        className
      )}
      style={{ paddingInlineStart: getItemOffset(depth - 1), ...style }}
      {...props}
    >
      {props.children}
    </SidebarFolderTrigger>
  );
}

function CustomSidebarFolderLink({ className, style, ...props }: ComponentProps<typeof SidebarFolderLink>) {
  const depth = useFolderDepth();
  return (
    <SidebarFolderLink
      className={cn(
        "relative flex flex-row items-center gap-2 rounded-lg p-2 text-start text-fd-muted-foreground wrap-anywhere [&_svg]:size-4 [&_svg]:shrink-0 w-full transition-colors hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 hover:transition-none data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary data-[active=true]:hover:transition-colors",
        depth > 1 && "data-[active=true]:before:content-[''] data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:w-px data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5",
        className
      )}
      style={{ paddingInlineStart: getItemOffset(depth - 1), ...style }}
      {...props}
    >
      {props.children}
    </SidebarFolderLink>
  );
}

function CustomSidebarFolderContent({ className, children, ...props }: ComponentProps<typeof SidebarFolderContent>) {
  const depth = useFolderDepth();
  return (
    <SidebarFolderContent
      className={cn(
        "relative flex flex-col gap-0.5 *:first:mt-0.5",
        depth === 1 && "before:content-[''] before:absolute before:w-px before:inset-y-1 before:bg-fd-border before:start-2.5",
        className
      )}
      {...props}
    >
      {children}
    </SidebarFolderContent>
  );
}

const SidebarPageTree = createPageTreeRenderer({
  SidebarFolder,
  SidebarFolderContent: CustomSidebarFolderContent,
  SidebarFolderLink: CustomSidebarFolderLink,
  SidebarFolderTrigger: CustomSidebarFolderTrigger,
  SidebarItem: CustomSidebarItem,
  SidebarSeparator: CustomSidebarSeparator,
});

const SidebarLinkItem = createLinkItemRenderer({
  SidebarFolder,
  SidebarFolderContent: CustomSidebarFolderContent,
  SidebarFolderLink: CustomSidebarFolderLink,
  SidebarFolderTrigger: CustomSidebarFolderTrigger,
  SidebarItem: CustomSidebarItem,
});

// ============================
// 自定义搜索按钮（替换 lucide Search）
// ============================

function CustomLargeSearchToggle({
  hideIfDisabled,
  className,
  ...props
}: { hideIfDisabled?: boolean; className?: string } & ComponentProps<"button">) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();

  if (hideIfDisabled && !enabled) return null;

  return (
    <button
      type="button"
      data-search-full=""
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border bg-fd-secondary/50 p-1.5 ps-2 text-sm text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground",
        className
      )}
      {...props}
      onClick={() => setOpenSearch(true)}
    >
      <MagnifyingGlassIcon className="size-4" weight="bold" />
      <span>搜索</span>
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey.map((k, i) => (
          <kbd key={i} className="rounded-md border bg-fd-background px-1.5">
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}

// ============================
// 自定义 SidebarContent（宽屏）
// ============================

function CustomSidebarContent({
  ref: refProp,
  className,
  children,
  ...props
}: ComponentProps<"aside"> & { ref?: React.Ref<HTMLElement> }) {
  const ref = useRef<HTMLElement>(null);
  const { setOpenSearch } = useSearchContext();

  return (
    <BaseSidebarContent>
      {({ collapsed, hovered, ref: asideRef, onPointerEnter, onPointerLeave }) => (
        <>
          <div
            data-sidebar-placeholder=""
            className="sticky top-[var(--fd-docs-row-1)] z-20 [grid-area:sidebar] pointer-events-none *:pointer-events-auto h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))] md:layout:[--fd-sidebar-width:268px] max-md:hidden"
          >
            {collapsed && (
              <div
                className="absolute start-0 inset-y-0 w-4"
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
              />
            )}
            <aside
              id="nd-sidebar"
              ref={mergeRefs(ref, refProp, asideRef)}
              data-collapsed={collapsed}
              data-hovered={collapsed && hovered}
              className={cn(
                "absolute flex flex-col w-full start-0 inset-y-0 items-end bg-fd-card text-sm border-e duration-250 *:w-[var(--fd-sidebar-width)]",
                collapsed && [
                  "inset-y-2 rounded-xl transition-transform border w-[var(--fd-sidebar-width)]",
                  hovered
                    ? "shadow-lg translate-x-2 rtl:-translate-x-2"
                    : "-translate-x-[var(--fd-sidebar-width)] rtl:translate-x-full",
                ],
                ref.current &&
                  ref.current.getAttribute("data-collapsed") === "true" !==
                    collapsed &&
                  "transition-[width,inset-block,translate,background-color]",
                className
              )}
              {...props}
              onPointerEnter={onPointerEnter}
              onPointerLeave={onPointerLeave}
            >
              {children}
            </aside>
          </div>
          <div
            data-sidebar-panel=""
            className={cn(
              "fixed flex top-[calc(var(--spacing)*4+var(--fd-docs-row-3))] start-4 shadow-lg transition-opacity rounded-xl p-0.5 border bg-fd-muted text-fd-muted-foreground z-10",
              (!collapsed || hovered) && "pointer-events-none opacity-0"
            )}
          >
            <SidebarCollapseTrigger
              className={cn(
                buttonVariants({
                  color: "ghost",
                  size: "icon-sm",
                  className: "rounded-lg",
                })
              )}
            >
              <SidebarSimpleIcon className="size-4" weight="bold" />
            </SidebarCollapseTrigger>
            <button
              type="button"
              aria-label="Open Search"
              data-search=""
              className={cn(
                buttonVariants({
                  color: "ghost",
                  size: "icon-sm",
                  className: "rounded-lg",
                })
              )}
              onClick={() => setOpenSearch(true)}
            >
              <MagnifyingGlassIcon className="size-4" weight="bold" />
            </button>
          </div>
        </>
      )}
    </BaseSidebarContent>
  );
}

// ============================
// 自定义 SidebarDrawer（移动端）
// ============================

function CustomSidebarDrawer({
  children,
  className,
  ...props
}: ComponentProps<typeof SidebarDrawerContent>) {
  return (
    <>
      <SidebarDrawerOverlay className="fixed z-40 inset-0 backdrop-blur-xs data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out" />
      <SidebarDrawerContent
        className={cn(
          "fixed text-[0.9375rem] flex flex-col shadow-lg border-s end-0 inset-y-0 w-[85%] max-w-[380px] z-40 bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out",
          className
        )}
        {...props}
      >
        {children}
      </SidebarDrawerContent>
    </>
  );
}

// ============================
// CustomSidebar 主组件
// ============================

export interface CustomSidebarProps {
  tree: PageTreeRoot;
  sidebarProps?: {
    footer?: ReactNode;
    banner?: ReactNode;
    collapsible?: boolean;
    components?: Record<string, unknown>;
    [key: string]: unknown;
  };
  nav?: Partial<NavOptions>;
  githubUrl?: string;
  links?: any[];
  searchToggle?: {
    enabled?: boolean;
    components?: {
      lg?: ReactNode;
      sm?: ReactNode;
    };
  };
  themeSwitch?: {
    enabled?: boolean;
    component?: ReactNode;
    mode?: "light-dark" | "light-dark-system";
  };
  i18n?: boolean;
  tabMode?: "auto" | "top";
  sidebarTabs?: any;
}

export function CustomSidebar({
  tree,
  sidebarProps = {},
  nav = {},
  githubUrl,
  links = [],
  searchToggle = {},
  themeSwitch = {},
  i18n = false,
  tabMode = "auto",
  sidebarTabs,
}: CustomSidebarProps) {
  const rawTabs = useMemo(() => {
    if (Array.isArray(sidebarTabs)) return sidebarTabs;
    if (typeof sidebarTabs === "object" && sidebarTabs !== null)
      return getSidebarTabs(tree, sidebarTabs);
    if (sidebarTabs !== false) return getSidebarTabs(tree);
    return [];
  }, [tree, sidebarTabs]);

  const tabs = useMemo(() => {
    return rawTabs.map((tab: any) => {
      if (!tab.icon) return tab;
      const section = getSectionFromUrl(tab.url);
      if (!section) return tab;
      const color = `var(--${section}-color)`;
      return {
        ...tab,
        icon: (
          <div
            className="[&_svg]:size-full rounded-lg size-full text-(--tab-color) max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5"
            style={{ "--tab-color": color } as React.CSSProperties}
          >
            {tab.icon}
          </div>
        ),
      };
    });
  }, [rawTabs]);

  const { footer, banner, collapsible = true, components, ...rest } = sidebarProps;
  const { menuItems } = useLinkItems({ links, githubUrl });

  const iconLinks = menuItems.filter((item) => item.type === "icon");
  const viewport = (
    <SidebarViewport>
      {menuItems
        .filter((v) => v.type !== "icon")
        .map((item, i, list) => (
          <SidebarLinkItem
            item={item}
            className={cn(i === list.length - 1 && "mb-4")}
            key={i}
          />
        ))}
      <SidebarPageTree {...components} />
    </SidebarViewport>
  );

  return (
    <>
      <CustomSidebarContent {...rest}>
        <div className="flex flex-col gap-3 p-4 pb-2">
          <div className="flex">
            {renderTitleNav(nav, {
              className:
                "inline-flex text-[0.9375rem] items-center gap-2.5 font-medium me-auto",
            })}
            {nav.children}
            {collapsible && (
              <SidebarCollapseTrigger
                className={cn(
                  buttonVariants({
                    color: "ghost",
                    size: "icon-sm",
                    className: "mb-auto text-fd-muted-foreground",
                  })
                )}
              >
                <SidebarSimpleIcon className="size-4" weight="bold" />
              </SidebarCollapseTrigger>
            )}
          </div>
          {searchToggle.enabled !== false &&
            (searchToggle.components?.lg ?? (
              <CustomLargeSearchToggle hideIfDisabled={true} />
            ))}
          {tabs.length > 0 && tabMode === "auto" && (
            <SidebarTabsDropdown options={tabs} />
          )}
          {banner}
        </div>
        {viewport}
        {(iconLinks.length > 0 ||
          themeSwitch?.enabled !== false ||
          footer) && (
          <div className="flex flex-col border-t p-4 pt-2 empty:hidden">
            <div className="flex text-fd-muted-foreground items-center empty:hidden">
              {iconLinks.map((item, i) => (
                <LinkItem
                  item={item}
                  className={cn(buttonVariants({ size: "icon-sm", color: "ghost" }))}
                  aria-label={item.label}
                  key={i}
                >
                  {item.icon}
                </LinkItem>
              ))}
              {themeSwitch.enabled !== false && themeSwitch.component}
            </div>
            {footer}
          </div>
        )}
      </CustomSidebarContent>

      <CustomSidebarDrawer>
        <div className="flex flex-col gap-3 p-4 pb-2">
          <div className="flex text-fd-muted-foreground items-center gap-1.5">
            <div className="flex flex-1">
              {iconLinks.map((item, i) => (
                <LinkItem
                  item={item}
                  className={cn(
                    buttonVariants({
                      size: "icon-sm",
                      color: "ghost",
                      className: "p-2",
                    })
                  )}
                  aria-label={item.label}
                  key={i}
                >
                  {item.icon}
                </LinkItem>
              ))}
            </div>
            {themeSwitch.enabled !== false && themeSwitch.component}
            <SidebarTrigger
              className={cn(
                buttonVariants({
                  color: "ghost",
                  size: "icon-sm",
                  className: "p-2",
                })
              )}
            >
              <SidebarSimpleIcon className="size-4" weight="bold" />
            </SidebarTrigger>
          </div>
          {tabs.length > 0 && (
            <SidebarTabsDropdown options={tabs} />
          )}
          {banner}
        </div>
        {viewport}
        <div className="flex flex-col border-t p-4 pt-2 empty:hidden">
          {footer}
        </div>
      </CustomSidebarDrawer>
    </>
  );
}
