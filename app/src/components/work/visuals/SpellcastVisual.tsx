import type { VisualProps } from "../Chapter";
import { Screenshot } from "../Chapter";

// One source, many outputs: the project's own description (multiple brands,
// 8+ platforms, Postiz + Temporal workflows, self-hosted on Hetzner). Drawn as
// a branch, no logos, nothing implied about autonomy.
const OUTPUTS = Array.from({ length: 8 }, (_, i) => i + 1);

export function SpellcastVisual({ image, title, priority }: VisualProps) {
  return (
    <div className="spellcast">
      <div className="spellcast-branch" aria-label="One scheduled post fanning out to eight or more platforms">
        <span className="spellcast-source">
          <span className="spellcast-source-head">One post</span>
          <span className="spellcast-source-body">drafted once, scheduled per brand</span>
        </span>
        <span className="spellcast-lines" aria-hidden="true" />
        <ol className="spellcast-outputs" aria-hidden="true">
          {OUTPUTS.map((n) => (
            <li key={n} className="spellcast-output">platform {String(n).padStart(2, "0")}</li>
          ))}
        </ol>
      </div>
      <p className="spellcast-note">Postiz + Temporal workflows do the publishing · Next.js front end, Node BFF, Turborepo · self-hosted on Hetzner via Docker Compose</p>
      <div className="spellcast-shot">
        <Screenshot image={image} title={title} priority={priority} />
      </div>
    </div>
  );
}
