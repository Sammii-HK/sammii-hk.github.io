/**
 * Anatomy callouts. The METRIC lines in the chart are measured from the
 * font in the browser; these names are hand-placed on the specimen, as
 * percentages of the em box from the glyph's own left edge and baseline,
 * because where a bowl sits is a fact about the drawing, not a metric the
 * font exposes.
 */
export type Part = { id: string; name: string; what: string; x: number; y: number; side?: "left" | "right" };
export type Specimen = { glyph: string; font: string; note: string; parts: Part[] };

export const SPECIMENS: Specimen[] = [
  {
    glyph: "g", font: "EB Garamond", note: "A double-storey g, the shape most serifs inherited from the Venetian humanists and most geometric sans faces threw away.",
    parts: [
      { id: "bowl", name: "Bowl", what: "The closed, rounded stroke of the upper storey.", x: 0.30, y: 0.32 },
      { id: "counter", name: "Counter", what: "The enclosed white inside the bowl. Its size, not the stroke weight, is what makes a face feel open or tight at small sizes.", x: 0.44, y: 0.30, side: "right" },
      { id: "ear", name: "Ear", what: "The small stroke off the top right of the bowl. On a double-storey g it is the single most identifying mark in the alphabet.", x: 0.66, y: 0.46, side: "right" },
      { id: "link", name: "Link", what: "The neck joining the two storeys.", x: 0.40, y: 0.06 },
      { id: "loop", name: "Loop", what: "The lower storey, below the baseline. Open in some faces, closed in others.", x: 0.36, y: -0.20 },
    ],
  },
  {
    glyph: "a", font: "EB Garamond", note: "A double-storey a. The aperture at the bottom right is where a face decides how legible it is at 11px.",
    parts: [
      { id: "stem", name: "Stem", what: "The main vertical stroke.", x: 0.62, y: 0.24, side: "right" },
      { id: "bowl2", name: "Bowl", what: "The closed lower curve.", x: 0.26, y: 0.12 },
      { id: "aperture", name: "Aperture", what: "The opening between the terminal and the stem. Wide apertures survive small sizes and low contrast; closed ones turn to blobs.", x: 0.46, y: 0.06, side: "right" },
      { id: "terminal", name: "Terminal", what: "How a stroke ends where there is no serif: sheared, teardrop, ball.", x: 0.40, y: 0.50 },
      { id: "spur", name: "Tail", what: "The outstroke at the foot of the stem.", x: 0.70, y: 0.02, side: "right" },
    ],
  },
  {
    glyph: "R", font: "EB Garamond", note: "A capital R. The leg is the letter typographers argue about, because it is the one place a serif face shows its temperament.",
    parts: [
      { id: "stemR", name: "Stem", what: "The vertical.", x: 0.16, y: 0.35 },
      { id: "bowlR", name: "Bowl", what: "The closed upper curve.", x: 0.46, y: 0.52, side: "right" },
      { id: "legR", name: "Leg", what: "The diagonal descending stroke. Straight, splayed, or curved with a flick, and that choice is most of the face's character.", x: 0.60, y: 0.10, side: "right" },
      { id: "serifR", name: "Serif", what: "The finishing stroke across the end of a stem. Bracketed here: joined to the stem by a curve.", x: 0.10, y: 0.02 },
      { id: "shoulderR", name: "Shoulder", what: "Where the bowl springs from the stem.", x: 0.26, y: 0.62 },
    ],
  },
  {
    glyph: "e", font: "EB Garamond", note: "The letter that decides a face's classification: a slanted crossbar is humanist, a level one is a Garalde or later.",
    parts: [
      { id: "crossbar", name: "Crossbar", what: "The horizontal stroke. Slanted in a Venetian, level from the Garaldes on: that one angle is the difference between Jenson and Garamond.", x: 0.40, y: 0.28 },
      { id: "eye", name: "Eye", what: "The enclosed counter above the crossbar.", x: 0.38, y: 0.40 },
      { id: "apertureE", name: "Aperture", what: "The gap between the terminal and the curve. Close it and the e fills in at small sizes.", x: 0.62, y: 0.10, side: "right" },
      { id: "terminalE", name: "Terminal", what: "The end of the lower curve.", x: 0.50, y: 0.03, side: "right" },
    ],
  },
];
