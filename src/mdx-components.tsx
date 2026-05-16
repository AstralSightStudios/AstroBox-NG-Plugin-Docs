import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ImageZoom } from "fumadocs-ui/components/image-zoom";
import Zoom from "react-medium-image-zoom";
import { CodeBlock, Pre } from "fumadocs-ui/components/codeblock";

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

      return (
        <Zoom zoomMargin={20} wrapElement="span" zoomImg={{ src: imgSrc }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgSrc}
            alt={rest.alt ?? ""}
            className="mx-auto block w-4/5 max-w-md rounded-xl sm:w-2/5"
          />
        </Zoom>
      );
    },
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props} className="shadow-none">
        <Pre>{props.children}</Pre>
      </CodeBlock>
    ),
    ...components,
  };
}
