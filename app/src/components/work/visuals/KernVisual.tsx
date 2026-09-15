import type { VisualProps } from "../Chapter";
import { Screenshot } from "../Chapter";

// Typography as the material. The weight run uses the site's own Jost at the
// four weights actually loaded; the scale is a modular scale (ratio 1.25, the
// kind of fluid scale Kern outputs as clamp()). A specimen, not a claim.
const WEIGHTS = [400, 500, 600, 700];
const SCALE = [0.8, 1, 1.25, 1.5625, 1.953];

export function KernVisual({ image, title, priority }: VisualProps) {
  return (
    <div className="kern">
      <div className="kern-specimen" aria-hidden="true">
        <div className="kern-weights">
          {WEIGHTS.map((w) => (
            <span key={w} className="kern-glyph" style={{ fontWeight: w }}>
              Aa<small>{w}</small>
            </span>
          ))}
        </div>
        <div className="kern-scale">
          {SCALE.map((s, i) => (
            <span key={s} className="kern-step" style={{ fontSize: `${s}em` }}>
              <span className="kern-step-text">The quick brown fox</span>
              <small>{(1 * Math.pow(1.25, i - 1)).toFixed(3)}rem</small>
            </span>
          ))}
        </div>
      </div>
      <div className="kern-shot">
        <Screenshot image={image} title={title} priority={priority} />
      </div>
    </div>
  );
}
