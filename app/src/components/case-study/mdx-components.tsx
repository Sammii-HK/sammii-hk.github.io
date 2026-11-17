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

/** A row of headline numbers. Each stat is a value plus a plain-language label. */
function Stats({ children }: { children: ReactNode }) {
  return <dl className="case-stats">{children}</dl>;
}

function Stat({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div className="case-stat">
      <dt>{label}</dt>
      <dd>
        <span className="case-stat-value">{value}</span>
        {note && <span className="case-stat-note">{note}</span>}
      </dd>
    </div>
  );
}

/**
 * Two journeys side by side, step by step. Written with children so it works
 * under next-mdx-remote's default of blocking JS expressions in content:
 *
 *   <FlowCompare>
 *     <FlowColumn title="Before">
 *       <FlowStep label="Create an account" detail="Email and password" />
 *       <FlowStep label="Check your email" end="dead" />
 *     </FlowColumn>
 *   </FlowCompare>
 */
function FlowCompare({ children }: { children: ReactNode }) {
  return <figure className="case-flow">{children}</figure>;
}

function FlowColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="case-flow-col">
      <p className="case-flow-title">{title}</p>
      <ol>{children}</ol>
    </div>
  );
}

function FlowStep({ label, detail, end }: { label: string; detail?: string; end?: "dead" | "done" }) {
  return (
    <li data-end={end}>
      <span className="case-flow-label">{label}</span>
      {detail && <span className="case-flow-detail">{detail}</span>}
      {end === "dead" && <span className="sr-only"> (dead end)</span>}
      {end === "done" && <span className="sr-only"> (done)</span>}
    </li>
  );
}

/**
 * Before/after comparison bars. Each row takes "n/d" strings. Every bar
 * carries its numbers as text, so it reads the same to a screen reader.
 *
 *   <BeforeAfterBars caption="…">
 *     <BarRow label="All sign-ups" before="78/115" after="109/121" />
 *   </BeforeAfterBars>
 */
function BeforeAfterBars({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="case-bars">
      <table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Slice</th>
            <th scope="col">Before</th>
            <th scope="col">After</th>
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </figure>
  );
}

function BarRow({ label, before, after }: { label: string; before: string; after: string }) {
  const cell = (side: "before" | "after", value: string) => {
    const [n, d] = value.split("/").map(Number);
    const p = d ? (n / d) * 100 : 0;
    return (
      <td data-side={side}>
        <span className="case-bar" style={{ ["--p" as string]: `${p}%` }} aria-hidden="true" />
        <span className="case-bar-text">
          {p.toFixed(1)}% <span className="case-bar-n">({n} of {d})</span>
        </span>
      </td>
    );
  };
  return (
    <tr>
      <th scope="row">{label}</th>
      {cell("before", before)}
      {cell("after", after)}
    </tr>
  );
}

/** A clearly marked aside for caveats and limits. */
function Caveat({ title = "What this doesn't prove", children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="case-caveat" aria-label={title}>
      <p className="case-caveat-title">{title}</p>
      {children}
    </aside>
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
  Stats,
  Stat,
  FlowCompare,
  FlowColumn,
  FlowStep,
  BeforeAfterBars,
  BarRow,
  Caveat,
};
