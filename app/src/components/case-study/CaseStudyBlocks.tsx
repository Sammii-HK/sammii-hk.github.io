import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import type { Block, Media } from "../../../lib/case-study-schema";
import { caseStudyComponents } from "./mdx-components";
import "./case-blocks.css";

/**
 * Renders a structured case study. Each block type has its own form, so a
 * decision reads as a decision and a failure as a failure, instead of every
 * study being the same four headings.
 */

const mdxOptions = {
  mdxOptions: {
    rehypePlugins: [[rehypePrettyCode, { theme: "github-dark" }]] as never,
  },
};

const Md = ({ source }: { source: string }) => <MDXRemote source={source} options={mdxOptions} components={caseStudyComponents} />;

const Heading = ({ children }: { children?: string }) => (children ? <h2 className="cs-heading">{children}</h2> : null);

const MediaItem = ({ m }: { m: Media }) => (
  <figure className="cs-media-item">
    {m.kind === "video" ? (
      <video src={m.src} aria-label={m.alt} width={m.width} height={m.height} controls muted playsInline preload="metadata" />
    ) : (
      // Static export: images are served as they are, sized to avoid layout shift.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={m.src} alt={m.alt} width={m.width} height={m.height} loading="lazy" decoding="async" />
    )}
    {m.caption && <figcaption>{m.caption}</figcaption>}
  </figure>
);

const BlockView = ({ block }: { block: Block }) => {
  switch (block.type) {
    case "prose":
      return (
        <section className="cs-block cs-prose">
          <Heading>{block.heading}</Heading>
          <Md source={block.body} />
        </section>
      );
    case "decision":
      return (
        <section className="cs-block cs-decision">
          <Heading>{block.heading}</Heading>
          <Md source={block.context} />
          <ul className="cs-options" aria-label="Options weighed">
            {block.options.map((o) => (
              <li key={o.label} className={o.chosen ? "cs-option cs-option--chosen" : "cs-option"}>
                <p className="cs-option-label">
                  {o.label}
                  {o.chosen && <span className="cs-tag">Chosen</span>}
                </p>
                <p className="cs-option-detail">{o.detail}</p>
              </li>
            ))}
          </ul>
          <div className="cs-outcome">
            <Md source={block.outcome} />
          </div>
        </section>
      );
    case "tradeoff":
      return (
        <section className="cs-block cs-tradeoff">
          <Heading>{block.heading}</Heading>
          <dl className="cs-pair">
            <div>
              <dt>Gave up</dt>
              <dd>{block.gave}</dd>
            </div>
            <div>
              <dt>Got</dt>
              <dd>{block.got}</dd>
            </div>
          </dl>
        </section>
      );
    case "failure":
      return (
        <section className="cs-block cs-failure">
          <Heading>{block.heading}</Heading>
          <dl className="cs-steps">
            <div>
              <dt>What happened</dt>
              <dd><Md source={block.what} /></dd>
            </div>
            <div>
              <dt>Why</dt>
              <dd><Md source={block.why} /></dd>
            </div>
            <div>
              <dt>The fix</dt>
              <dd><Md source={block.fix} /></dd>
            </div>
          </dl>
        </section>
      );
    case "metrics":
      return (
        <section className="cs-block cs-metrics">
          <Heading>{block.heading}</Heading>
          <dl className="cs-metric-grid">
            {block.items.map((m) => (
              <div key={m.label} className="cs-metric">
                <dt>{m.label}</dt>
                <dd>
                  <span className="cs-metric-value">{m.value}</span>
                  {m.note && <span className="cs-metric-note">{m.note}</span>}
                  <span className="cs-metric-source">Source: {m.source}</span>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      );
    case "media":
      return (
        <div className={`cs-block cs-media cs-media--${block.layout ?? (block.items.length > 2 ? "grid" : block.items.length === 2 ? "pair" : "single")}`}>
          {block.items.map((m) => (
            <MediaItem key={m.src} m={m} />
          ))}
        </div>
      );
    case "beforeAfter":
      return (
        <figure className="cs-block cs-before-after">
          <div className="cs-media cs-media--pair">
            <div>
              <p className="cs-tag">Before</p>
              <MediaItem m={block.before} />
            </div>
            <div>
              <p className="cs-tag">After</p>
              <MediaItem m={block.after} />
            </div>
          </div>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "code":
      return (
        <figure className="cs-block cs-code">
          <Md source={"```" + block.lang + "\n" + block.code + "\n```"} />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case "timeline":
      return (
        <section className="cs-block cs-timeline">
          <Heading>{block.heading}</Heading>
          <ol>
            {block.entries.map((e) => (
              <li key={`${e.date}-${e.title}`}>
                <time dateTime={e.date}>{e.date}</time>
                <p className="cs-timeline-title">{e.href ? <a href={e.href}>{e.title}</a> : e.title}</p>
                {e.body && <p className="cs-timeline-body">{e.body}</p>}
              </li>
            ))}
          </ol>
        </section>
      );
    case "callout":
      return (
        <aside className={`cs-block cs-callout cs-callout--${block.tone ?? "note"}`}>
          <Md source={block.body} />
        </aside>
      );
    case "links":
      return (
        <section className="cs-block cs-links">
          <Heading>{block.heading}</Heading>
          <ul>
            {block.items.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </section>
      );
  }
};

export function CaseStudyFacts({
  role,
  period,
  status,
  facts,
  updated,
}: {
  role?: string;
  period?: string;
  status?: string;
  facts?: Array<{ label: string; value: string }>;
  updated: string;
}) {
  const rows = [
    ...(role ? [{ label: "Role", value: role }] : []),
    ...(period ? [{ label: "When", value: period }] : []),
    ...(status ? [{ label: "Status", value: status }] : []),
    ...(facts ?? []),
  ];
  const updatedLabel = new Date(updated).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <aside className="cs-facts" aria-label="At a glance">
      <dl>
        {rows.map((r) => (
          <div key={r.label}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
      <p className="cs-updated">
        Updated <time dateTime={updated}>{updatedLabel}</time>
      </p>
    </aside>
  );
}

export function CaseStudyBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="cs-blocks">
      {blocks.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  );
}
