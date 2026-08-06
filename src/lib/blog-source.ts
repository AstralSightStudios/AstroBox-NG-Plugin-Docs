import { blog } from "fumadocs-mdx:collections/server";
import { loader } from "fumadocs-core/source";

export const blogSource = loader({
  baseUrl: "/blog",
  source: blog.toFumadocsSource(),
  i18n: {
    defaultLanguage: "zh-CN",
    languages: ["zh-CN"],
    hideLocale: "always",
  },
});
