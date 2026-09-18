import type { VisualProps } from "../Chapter";
import { Screenshot } from "../Chapter";

// Real reference points on Strata's Cosmos axis, positioned by log10 of their
// distance in light-seconds across the axis's own range (0 light-sec to
// 46.5 billion light-years). The clustering is the point the app makes: on a
// log scale the ISS, the Moon and Voyager all sit on one line.
const MIN = -3, MAX = 18.2;
const pos = (log: number) => ((log - MIN) / (MAX - MIN)) * 100;
const MARKERS = [
  { label: "ISS", note: "408 km", log: -2.87 },
  { label: "Moon", note: "1.3 light-sec", log: 0.11 },
  { label: "Voyager 1", note: "165 AU", log: 4.92 },
  { label: "Oort cloud", note: "2,000 AU", log: 6.0 },
  { label: "Observable universe", note: "46.5 billion ly", log: 18.17 },
];

export function StrataVisual({ image, title, priority }: VisualProps) {
  return (
    <div className="strata">
      <div className="strata-field">
        <Screenshot image={image} title={title} priority={priority} />
      </div>
      <figure className="strata-scale" aria-label="Strata's Cosmos axis: distances from the ISS to the edge of the observable universe on one log scale">
        <div className="strata-axis" aria-hidden="true">
          {MARKERS.map((m, i) => (
            <span key={m.label} className="strata-tick" style={{ left: `${pos(m.log)}%`, ["--row" as string]: i % 3 }}>
              <span className="strata-tick-label">{m.label}</span>
              <span className="strata-tick-note">{m.note}</span>
            </span>
          ))}
        </div>
        <figcaption className="strata-caption">One axis, log-scaled. Drag to travel, pinch to zoom, tap two points to measure the gap.</figcaption>
      </figure>
    </div>
  );
}
