// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
    integrations: [
        starlight({
            title: "AstroBox 插件文档",
            social: [
                {
                    icon: "github",
                    label: "GitHub",
                    href: "https://github.com/withastro/starlight",
                },
            ],
            sidebar: [
                {
                    label: "基本架构",
                    items: [
                        {
                            label: "工作原理",
                            link: "/framework/arch",
                        },
                        {
                            label: "运行环境",
                            link: "/framework/runtime",
                        },
                    ],
                },
                {
                    label: "通用资源",
                    items: [
                        {
                            label: "Manifest 文件",
                            link: "/general/manifest",
                        },
                        {
                            label: "API Level",
                            link: "/general/apilevel",
                        },
                        {
                            label: "WASI 版本",
                            link: "/general/wasi-version"
                        },
                        {
                            label: "WIT 文件",
                            link: "/general/wit-files"
                        }
                    ],
                },
                {
                    label: "快速上手",
                    items: [
                        {
                            label: "语言选择",
                            link: "/getstarted/language",
                        },
                        {
                            label: "Rust 上手教程",
                            link: "/getstarted/rust",
                        },
                    ],
                },
                {
                    label: "API 参考",
                    items: [
                    ],
                },
            ],
        }),
    ],
});
