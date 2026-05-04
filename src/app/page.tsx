import Link from "next/link";
import {
  BookOpenIcon,
  CaretRightIcon,
  MagicWandIcon,
  PlugIcon,
} from "@phosphor-icons/react/dist/ssr";
import { HomeLayout } from "fumadocs-ui/layouts/home";
import { baseOptions } from "@/lib/layout.shared";
import { AstroBoxBrandTitle } from "@/components/brand";
import { HomeHeroBackground } from "@/components/home-hero-background";
import { HeroTyping } from "@/components/hero-typing";
import { DownloadCards } from "@/components/download-cards";

const docEntries = [
  {
    title: "使用教程",
    desc: "AstroBox 软件安装、多平台设备连接与基础功能使用指南。",
    icon: BookOpenIcon,
    href: "/docs/usage",
  },
  {
    title: "插件开发文档",
    desc: "探索基于 WIT + WASI 的多语言、原生级插件开发与极速分发。",
    icon: PlugIcon,
    href: "/docs/plugin-dev",
  },
  {
    title: "创作者工具使用文档",
    desc: "学习表盘、快应用等第三方资源的上传、发布，以及接入外部平台实现资源售卖的全流程。",
    icon: MagicWandIcon,
    href: "/docs/creator-tools",
  },
];

export default function HomePage() {
  return (
    <HomeLayout
      {...baseOptions()}
      searchToggle={{ enabled: true }}
      nav={{
        transparentMode: "top",
        title: <AstroBoxBrandTitle />,
      }}
      links={[
        { text: "使用教程", url: "/docs/usage", active: "nested-url" },
        { text: "插件开发", url: "/docs/plugin-dev", active: "nested-url" },
        { text: "创作者工具", url: "/docs/creator-tools", active: "nested-url" },
      ]}
      className="bg-fd-background"
    >
      <div className="pb-16 pt-8 md:pb-24 *:font-sans">
        {/* Hero Section */}
        <section className="relative mx-auto flex min-h-[80%] w-full max-w-[95%] flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-fd-border/60 px-6 py-24 text-center md:px-12">
          <HomeHeroBackground />
          <div className="relative z-10 flex max-w-5xl flex-col items-center">
            {/* 大标题与打字机效果 */}
            <h1 className="text-4xl font-semibold tracking-tight text-fd-foreground leading-[1.25] sm:text-5xl md:text-6xl">
              <span className="block md:inline">AstroBox 是</span>{" "}
              <span className="hero-typing-wrapper block md:inline" style={{ minHeight: "1.25em" }}>
                <HeroTyping words={["业界领先的", "高扩展性的", "跨平台的", "由 Rust 驱动的"]} className="text-fd-primary" />
              </span>
              <br className="hidden md:block" />
              <span className="hero-bottom-line block md:inline">穿戴设备第三方工具箱</span>
            </h1>

            {/* 三大入口模块 */}
            <div className="mt-16 grid w-full gap-6 text-left md:grid-cols-3">
              {docEntries.map((entry) => {
                const Icon = entry.icon;
                return (
                  <Link
                    key={entry.title}
                    href={entry.href}
                    className="group relative flex flex-col rounded-3xl border border-fd-border/60 bg-fd-background/60 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-fd-primary/50 hover:bg-fd-primary/5 hover:shadow-xl hover:shadow-fd-primary/10"
                  >
                    <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-fd-primary/10 text-fd-primary transition-colors group-hover:bg-fd-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold tracking-tight text-fd-foreground transition-colors">
                      {entry.title}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-fd-foreground/50">
                      {entry.desc}
                    </p>
                    <div className="mt-6 flex items-center text-sm font-medium text-fd-primary opacity-80 transition-opacity group-hover:opacity-100">
                      浏览文档 <CaretRightIcon className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 下载平台卡片 */}
        <div className="mt-12 md:mt-16">
          <DownloadCards />
        </div>
      </div>
    </HomeLayout>
  );
}
