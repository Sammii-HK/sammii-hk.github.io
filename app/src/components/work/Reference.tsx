import type { Reference as ReferenceModel } from "../../../lib/selected-work";

/**
 * A supporting reference: indexed, typographic, one line of lens-specific
 * framing and the emphasis tokens. Deliberately a different system from the
 * chapters: no media, no card, dense enough to scan on a phone.
 */
export function Reference({ reference }: { reference: ReferenceModel }) {
  const { project, index, summary, emphasis, href } = reference;
  return (
    <a href={href} className="reference" aria-labelledby={`reference-${project.id}`}>
      <span className="reference-index" aria-hidden="true">
        {String(index).padStart(2, "0")}
      </span>
      <span className="reference-main">
        <span id={`reference-${project.id}`} className="reference-title">
          {project.title}
        </span>
        <span className="reference-summary">{summary}</span>
        {emphasis.length > 0 && <span className="reference-meta">{emphasis.join(" · ")}</span>}
      </span>
      <span className="reference-arrow" aria-hidden="true">
        →
      </span>
    </a>
  );
}
