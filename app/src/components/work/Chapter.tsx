import { memo } from "react";
import Image from "next/image";
import type { Lens } from "../../../common/data/projects";
import type { Chapter as ChapterModel } from "../../../lib/selected-work";
import { getImagePath } from "../../../common/utils/image-path";
import { StrataVisual } from "./visuals/StrataVisual";
import { KernVisual } from "./visuals/KernVisual";
import { GamutVisual } from "./visuals/GamutVisual";
import { OrbitVisual } from "./visuals/OrbitVisual";
import { LunaryVisual } from "./visuals/LunaryVisual";
import { SpellcastVisual } from "./visuals/SpellcastVisual";
import { LattiqVisual } from "./visuals/LattiqVisual";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export type VisualProps = { lens: Lens; image: string; title: string; priority: boolean; fragment?: boolean };

// Shared grammar, project-specific composition. Anything without a bespoke
// visual falls back to the plain screenshot so the system never breaks.
const VISUALS: Record<string, (p: VisualProps) => JSX.Element> = {
  strata: StrataVisual,
  kern: KernVisual,
  gamut: GamutVisual,
  orbit: OrbitVisual,
  lunary: LunaryVisual,
  spellcast: SpellcastVisual,
  lattiq: LattiqVisual,
};

export const Screenshot = ({ image, title, priority }: Pick<VisualProps, "image" | "title" | "priority">) => (
  <Image
    src={image}
    alt={`${title} interface`}
    width={1400}
    height={700}
    sizes="(max-width: 900px) 100vw, 60vw"
    priority={priority}
    loading={priority ? undefined : "lazy"}
    className="chapter-shot"
  />
);

/** "iOS app · React Native, Expo" from the data, so the kicker is never invented. */
function kicker(chapter: ChapterModel): string {
  const p = chapter.project;
  const stack = p.techStack.split(",").map((s) => s.trim()).slice(0, 2).join(", ");
  const kind = p.id === "strata" ? "Native app" : p.type === "product" ? "Product" : "Experiment";
  return `${kind} · ${stack}`;
}

function ChapterInner({ chapter, lens }: { chapter: ChapterModel; lens: Lens }) {
  const { project, index, layout, summary, emphasis, href, liveUrl } = chapter;
  const Visual = VISUALS[project.id] ?? (({ image, title, priority }: VisualProps) => <Screenshot image={image} title={title} priority={priority} />);
  const image = getImagePath(project.id);
  return (
    <article className={`chapter chapter-${layout}`} aria-labelledby={`chapter-${project.id}`} data-project={project.id}>
      <header className="chapter-head">
        <span className="chapter-index" aria-hidden="true">
          {String(index).padStart(2, "0")}
        </span>
        <p className="chapter-kicker">{kicker(chapter)}</p>
        <h3 id={`chapter-${project.id}`} className="chapter-title">
          <a href={href}>{project.title}</a>
        </h3>
      </header>
      <div className="chapter-visual">
        <Visual lens={lens} image={image} title={project.title} priority={index === 1} fragment={chapter.fragment} />
      </div>
      <div className="chapter-body">
        <p className="chapter-summary">{summary}</p>
        {emphasis.length > 0 && (
          <ul className="chapter-emphasis" aria-label="Notable">
            {emphasis.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
        <p className="chapter-links">
          <a href={href} className="chapter-link">
            Case study <ArrowRight size={13} className="icon-inline" aria-hidden="true" />
          </a>
          {liveUrl && (
            <a href={liveUrl} className="chapter-link chapter-link-quiet" target="_blank" rel="noopener noreferrer">
              Open {project.title} <ArrowUpRight size={13} className="icon-inline" aria-hidden="true" />
            </a>
          )}
        </p>
      </div>
    </article>
  );
}

// Memoised: hover previews change the lens context every enter/leave; the
// chapters only change when the committed lens does.
export const Chapter = memo(ChapterInner, (a, b) => a.lens === b.lens && a.chapter.project.id === b.chapter.project.id && a.chapter.index === b.chapter.index);
