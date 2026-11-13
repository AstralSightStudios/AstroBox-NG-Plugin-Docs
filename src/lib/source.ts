import { docs } from "fumadocs-mdx:collections/server";
import { createElement } from "react";
import { loader } from "fumadocs-core/source";
import { DocIcon } from "@/components/sidebar/doc-icon";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
  i18n: {
    defaultLanguage: "zh-CN",
    languages: ["zh-CN"],
    hideLocale: "always",
  },
  pageTree: {
    noRef: true,
  },
  icon(name) {
    if (!name) return;
    return createElement(DocIcon, { name });
  },
});
