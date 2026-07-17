import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";
import { DeviceSupportList } from "@/components/device-support-list";
import { DocImage } from "@/components/doc-image";

function getSrc(src: any): string {
  if (typeof src === "string") return src;
  if (typeof src === "object" && src !== null) {
    return (src as { src?: string }).src ?? "";
  }
  return "";
}

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => {
      const { width, height, ...rest } = props as any;
      const hasSize = width != null || height != null;
      const imgSrc = getSrc(rest.src);

      if (hasSize) {
        return (
          <span className="block text-center">
            <ImageZoom {...(props as any)} />
          </span>
        );
      }

      return <DocImage {...props} />;
    },
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props} className="shadow-none">
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    ...components,
    DeviceSupportList,
  };
}
