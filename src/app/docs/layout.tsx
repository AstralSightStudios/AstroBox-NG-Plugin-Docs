import type { ReactNode } from "react";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";
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
