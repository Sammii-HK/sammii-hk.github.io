/**
 * Anatomy callouts.
 *
 * Every pointer is FOUND in the rendered glyph rather than typed in as a
 * guess: the component rasterises the letter, then each part names a rule
 * that locates it in the ink. Sammii, 2026-09-23: the hand-placed ear
 * pointer did not land on the ear, which is exactly the failure this
 * removes.
 *
 * Bands are fractions of the glyph's OWN ink box (0 = the lowest ink, 1 = the
 * highest), not of the em, so the same rule works whatever the font does: a
 * first attempt used em heights and searched a band above where any ink
 * existed, which is how the ear ended up floating in white space. Resolved
 * points are snapped onto ink, so a pointer can never sit in the gap.
 */
export type Rule =
  | { kind: "rightmost"; from: number; to: number }   // rightmost ink in a band of the ink box (0 = lowest ink, 1 = highest)
  | { kind: "leftmost"; from: number; to: number }
  | { kind: "topmost"; xFrom: number; xTo: number }   // highest ink between two x fractions of the advance
  | { kind: "bottommost"; xFrom: number; xTo: number }
  | { kind: "centroid"; from: number; to: number; xFrom?: number; xTo?: number }
  | { kind: "hole"; from: number; to: number }        // middle of the largest enclosed white area
  | { kind: "gap"; from: number; to: number };        // the widest opening in the ink on the right side

export type Part = { id: string; name: string; what: string; rule: Rule; fallback: { x: number; y: number } };
export type Specimen = { glyph: string; font: string; note: string; parts: Part[] };

export const SPECIMENS: Specimen[] = [
  {
    glyph: "g", font: "EB Garamond", note: "A double-storey g, the shape most serifs inherited from the Venetian humanists and most geometric sans faces threw away.",
    parts: [
      { id: "ear", name: "Ear", what: "The small stroke off the top right of the bowl. On a double-storey g it is the single most identifying mark in the alphabet.", rule: { kind: "rightmost", from: 0.86, to: 1.0 }, fallback: { x: 0.40, y: 0.40 } },
      { id: "bowl", name: "Bowl", what: "The closed, rounded stroke of the upper storey.", rule: { kind: "leftmost", from: 0.62, to: 0.86 }, fallback: { x: 0.02, y: 0.25 } },
      { id: "counter", name: "Counter", what: "The enclosed white inside the bowl. Its size, not the stroke weight, is what makes a face feel open or tight at small sizes.", rule: { kind: "hole", from: 0.62, to: 0.9 }, fallback: { x: 0.20, y: 0.26 } },
      { id: "link", name: "Link", what: "The neck joining the two storeys.", rule: { kind: "centroid", from: 0.36, to: 0.46 }, fallback: { x: 0.20, y: 0.0 } },
      { id: "loop", name: "Loop", what: "The lower storey, below the baseline. Open in some faces, closed in others.", rule: { kind: "bottommost", xFrom: 0.15, xTo: 0.85 }, fallback: { x: 0.20, y: -0.25 } },
    ],
  },
  {
    glyph: "a", font: "EB Garamond", note: "A double-storey a. The aperture at the bottom right is where a face decides how legible it is at 11px.",
    parts: [
      { id: "stem", name: "Stem", what: "The main vertical stroke.", rule: { kind: "rightmost", from: 0.35, to: 0.75 }, fallback: { x: 0.42, y: 0.20 } },
      { id: "bowl2", name: "Bowl", what: "The closed lower curve.", rule: { kind: "leftmost", from: 0.15, to: 0.5 }, fallback: { x: 0.03, y: 0.12 } },
      { id: "counter2", name: "Counter", what: "The enclosed white inside the bowl.", rule: { kind: "hole", from: 0.1, to: 0.5 }, fallback: { x: 0.20, y: 0.13 } },
      { id: "terminal", name: "Terminal", what: "How a stroke ends where there is no serif: sheared, teardrop, ball. On this a it is the finish at the top of the arch.", rule: { kind: "topmost", xFrom: 0.05, xTo: 0.55 }, fallback: { x: 0.18, y: 0.40 } },
      { id: "tail", name: "Tail", what: "The outstroke at the foot of the stem.", rule: { kind: "bottommost", xFrom: 0.62, xTo: 1.0 }, fallback: { x: 0.42, y: 0.0 } },
    ],
  },
  {
    glyph: "R", font: "EB Garamond", note: "A capital R. The leg is the letter typographers argue about, because it is the one place a serif face shows its temperament.",
    parts: [
      { id: "stemR", name: "Stem", what: "The vertical.", rule: { kind: "leftmost", from: 0.4, to: 0.7 }, fallback: { x: 0.04, y: 0.30 } },
      { id: "bowlR", name: "Bowl", what: "The closed upper curve.", rule: { kind: "rightmost", from: 0.6, to: 0.9 }, fallback: { x: 0.50, y: 0.45 } },
      { id: "counterR", name: "Counter", what: "The white the bowl encloses.", rule: { kind: "hole", from: 0.6, to: 0.95 }, fallback: { x: 0.30, y: 0.48 } },
      { id: "legR", name: "Leg", what: "The diagonal descending stroke. Straight, splayed, or curved with a flick, and that choice is most of the face's character.", rule: { kind: "bottommost", xFrom: 0.55, xTo: 1.0 }, fallback: { x: 0.55, y: 0.0 } },
      { id: "serifR", name: "Serif", what: "The finishing stroke across the end of a stem. Bracketed here: joined to the stem by a curve.", rule: { kind: "bottommost", xFrom: 0.0, xTo: 0.35 }, fallback: { x: 0.08, y: 0.0 } },
    ],
  },
  {
    glyph: "e", font: "EB Garamond", note: "The letter that decides a face's classification: a slanted crossbar is humanist, a level one is a Garalde or later.",
    parts: [
      { id: "crossbar", name: "Crossbar", what: "The horizontal stroke. Slanted in a Venetian, level from the Garaldes on: that one angle is the difference between Jenson and Garamond.", rule: { kind: "centroid", from: 0.45, to: 0.58 }, fallback: { x: 0.22, y: 0.22 } },
      { id: "eye", name: "Eye", what: "The enclosed counter above the crossbar.", rule: { kind: "hole", from: 0.62, to: 0.92 }, fallback: { x: 0.22, y: 0.32 } },
      { id: "apertureE", name: "Aperture", what: "The gap between the terminal and the curve. Close it and the e fills in at small sizes.", rule: { kind: "gap", from: 0.05, to: 0.3 }, fallback: { x: 0.40, y: 0.08 } },
      { id: "terminalE", name: "Terminal", what: "The end of the lower curve.", rule: { kind: "rightmost", from: 0.05, to: 0.28 }, fallback: { x: 0.40, y: 0.06 } },
    ],
  },
];
