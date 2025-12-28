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
                    label: "Host API 参考",
                    items: [
                        {
                            label: "Device",
                            link: "/host-api/device"
                        },
                        {
                            label: "Dialog",
                            link: "/host-api/dialog"
                        },
                        {
                            label: "Event",
                            link: "/host-api/event"
                        },
                        {
                            label: "Interconnect",
                            link: "/host-api/interconnect"
                        },
                        {
                            label: "OS",
                            link: "/host-api/os"
                        },
                        {
                            label: "Queue",
                            link: "/host-api/queue"
                        },
                        {
                            label: "Register",
                            link: "/host-api/register"
                        },
                        {
                            label: "ThirdPartyApp",
                            link: "/host-api/thirdpartyapp"
                        },
                        {
                            label: "Transport",
                            link: "/host-api/transport"
                        },
                        {
                            label: "UI",
                            link: "/host-api/ui"
                        },
                    ],
                },
            ],
        }),
    ],
});
