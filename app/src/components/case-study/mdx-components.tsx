import type { ComponentProps, ReactNode } from "react";
import type { MDXComponents } from "mdx/types";

/** Stable anchor ids for headings so sections can be linked to. */
function slugify(node: ReactNode): string {
  const text = Array.isArray(node) ? node.join("") : String(node ?? "");
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function Heading(Tag: "h2" | "h3") {
  return function CaseHeading({ children, ...rest }: ComponentProps<"h2">) {
    const id = rest.id ?? slugify(children);
    return (
      <Tag id={id} {...rest}>
        <a href={`#${id}`} className="case-anchor">
          {children}
        </a>
      </Tag>
    );
  };
}

function Anchor({ href = "", children, ...rest }: ComponentProps<"a">) {
  const external = /^https?:\/\//.test(href) && !href.startsWith("https://sammii.dev");
  return (
    <a href={href} {...rest} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {children}
    </a>
  );
}

function Img({ src = "", alt = "" }: ComponentProps<"img">) {
  return (
    <figure className="case-figure">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={typeof src === "string" ? src : ""} alt={alt} loading="lazy" />
      {alt && <figcaption>{alt}</figcaption>}
    </figure>
  );
}

/**
 * The MDX component map for case studies (Phase 2I). Markdown stays plain;
 * this only adds heading anchors, safe external links and captioned
 * figures. The blog does not use it.
 */
export const caseStudyComponents: MDXComponents = {
  h2: Heading("h2"),
  h3: Heading("h3"),
  a: Anchor,
  img: Img,
};
