import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { ImageZoom } from 'fumadocs-ui/components/image-zoom';
import { CodeBlock, Pre } from 'fumadocs-ui/components/codeblock';

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    img: (props) => <ImageZoom {...(props as any)} />,
    pre: ({ ref: _ref, ...props }) => (
      <CodeBlock {...props} className="shadow-none">
        <Pre>{props.children}</Pre> 
      </CodeBlock>
    ),
    ...components,
  };
}