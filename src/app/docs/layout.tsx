import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
import { getSection } from "@/lib/section";
import { CustomSidebar } from "@/components/sidebar/custom-sidebar";

const locale = "zh-CN";

export default function Layout({ children }: { children: ReactNode }) {
  const options = baseOptions();
  const tree = source.getPageTree(locale);

  return (
    <DocsLayout
      tree={tree}
      {...options}
      links={[]}
      searchToggle={{ enabled: true }}
      themeSwitch={{
        ...options.themeSwitch,
        component: (
          <ThemeSwitcher
            mode="light-dark-system"
            variant="slider"
            className="ms-auto"
          />
        ),
      }}
      sidebar={{
        defaultOpenLevel: 1,
        tabs: {
          transform(option, node) {
            const meta = source.getNodeMeta(node, locale);
            if (!meta || !node.icon) return option;

            const section = getSection(meta.path);
            const color = section
              ? `var(--${section}-color)`
              : "var(--color-fd-foreground)";

            return {
              ...option,
              icon: (
                <div
                  className="[&_svg]:size-full rounded-lg size-full text-(--tab-color) max-md:bg-(--tab-color)/10 max-md:border max-md:p-1.5"
                  style={{ "--tab-color": color } as React.CSSProperties}
                >
                  {node.icon}
                </div>
              ),
            };
          },
        },
        component: (
          <CustomSidebar
            tree={tree}
            nav={options.nav}
            githubUrl={options.githubUrl}
            links={[]}
            searchToggle={{ enabled: true }}
            themeSwitch={{
              ...options.themeSwitch,
              component: (
                <ThemeSwitcher
                  mode="light-dark-system"
                  variant="slider"
                  className="ms-auto"
                />
              ),
            }}
            sidebarProps={{
              defaultOpenLevel: 1,
            }}
            tabMode="auto"
            i18n={false}
          />
        ),
      }}
    >
      {children}
    </DocsLayout>
  );
}
