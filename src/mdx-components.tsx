import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: ({ src, alt, width, height, ...rest }) => (
      <ImageZoom
        src={src as string}
        alt={alt as string}
        width={width as number | undefined}
        height={height as number | undefined}
        {...(rest as any)}
      />
    ),
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props}>
        <Pre>{props.children}</Pre> 
      </CodeBlock>
    ),
    ...components,
  };
}