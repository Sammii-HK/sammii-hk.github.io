import type { VisualProps } from "../Chapter";
import { Screenshot } from "../Chapter";

// The real pipeline, from the project's own description: fourteen agents with
// single responsibilities, run in stages. Drawn as stages and hand-offs, not
// as a network. The moving dash is the only motion and it stops under
// reduced motion.
const STAGES = ["scriptwriting", "editing", "optimisation", "scheduling", "engagement", "SEO", "performance analysis"];

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
      <p className="orbit-note">14 agents · one responsibility each · JSON-defined: a system prompt, the tools it may call, an input and output contract</p>
      <div className="orbit-shot">
        <Screenshot image={image} title={title} priority={priority} />
      </div>
    </div>
  );
}
