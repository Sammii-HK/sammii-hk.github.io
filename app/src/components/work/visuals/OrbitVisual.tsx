import type { VisualProps } from "../Chapter";
import { Screenshot } from "../Chapter";

// A high-level map of the full orchestration path, not a live activity feed.
const STAGES = ["context", "research", "optimisation", "drafting", "review", "handoff"];

export function OrbitVisual({ image, title, priority }: VisualProps) {
  return (
    <div className="orbit">
      <ol className="orbit-pipeline" aria-label="Orbit pipeline stages">
        {STAGES.map((s, i) => (
          <li key={s} className="orbit-stage">
            <span className="orbit-stage-index" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <span className="orbit-stage-name">{s}</span>
          </li>
        ))}
      </ol>
      <p className="orbit-note">Model-backed jobs and deterministic scripts · separate content and research modes · publishing is a distinct boundary</p>
      <div className="orbit-shot">
        <Screenshot image={image} title={title} priority={priority} />
      </div>
    </div>
  );
}
