import type { VisualProps } from "../Chapter";
import { Screenshot } from "../Chapter";

// One composition, three emphases. Every line below is from the project data
// or case study: Astronomy Engine positions, the 2,000+ page generated
// grimoire, the sky check on every AI reply, the 97-tool MCP server, Stripe subscriptions, Next.js 15,
// Prisma + PostgreSQL, a PWA.
const FRAMES = {
  ai: {
    label: "compute, ground, check",
    cols: [
      { head: "Compute", body: "Planetary and lunar positions from the ephemeris, within 0.3 arcminutes of Swiss Ephemeris. Nothing is guessed." },
      { head: "Ground", body: "The AI guide gets the computed sky as the only valid source for where anything is now." },
      { head: "Check", body: "Every reply is parsed back into sky claims and checked. A false sentence never stands." },
    ],
  },
  product: {
    label: "one founder-built system",
    cols: [
      { head: "Compute", body: "Real-time astronomical positions in a Next.js 15 progressive web app." },
      { head: "Content", body: "A generated 2,000+ page library, indexed and served as the product's core." },
      { head: "Commerce", body: "Stripe-billed subscriptions on Prisma + PostgreSQL, with an MCP server for operations." },
    ],
  },
  design: {
    label: "a moving system, read daily",
    cols: [
      { head: "Positions", body: "Live planetary and lunar data, rendered as an interface people check every day." },
      { head: "Information design", body: "Astronomical complexity translated into a visual system that stays legible." },
      { head: "Surface", body: "A progressive web app, so the same system reads the same on every device." },
    ],
  },
} as const;

export function LunaryVisual({ lens, image, title, priority }: VisualProps) {
  const f = FRAMES[lens];
  return (
    <div className="lunary" data-frame={lens}>
      <p className="lunary-label" aria-hidden="true">{f.label}</p>
      <ol className="lunary-cols">
        {f.cols.map((c) => (
          <li key={c.head} className="lunary-col">
            <span className="lunary-col-head">{c.head}</span>
            <span className="lunary-col-body">{c.body}</span>
          </li>
        ))}
      </ol>
      <div className="lunary-shot">
        <Screenshot image={image} title={title} priority={priority} />
      </div>
    </div>
  );
}
