import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Unicode } from "../../../src/components/charts/Unicode";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "The four lengths of a string",
  description: "Why \"family\".length lies: graphemes, code points, UTF-16 units and UTF-8 bytes counted live for anything you type, and what a 20-character limit written with .slice() does to a name, a flag and a family.",
  alternates: { canonical: "https://labs.sammii.dev/charts/unicode/" },
  openGraph: { title: "The four lengths of a string", description: "One family emoji. .length says 11.", url: "https://labs.sammii.dev/charts/unicode/", type: "article" },
};

export default function UnicodeChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 19</p>
          <h1 className="chart-title">The four lengths of a string</h1>
          <p className="chart-lead">
            A username field says &ldquo;20 characters max&rdquo; and rejects a 20-letter Vietnamese name. A preview truncates a tweet and leaves half an emoji. A sort puts two identical caf&eacute;s in different places. All the same bug: a string has four lengths, and <code>.length</code> gives you the one nobody means. Type anything and watch the four counts split apart, then see the three ways to cut it.
          </p>
        </header>
        <Unicode />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>JavaScript strings are sequences of UTF-16 code units, so <code>.length</code>, <code>.slice</code>, <code>.charAt</code> and index access all count in units: anything outside the Basic Multilingual Plane (every emoji, many CJK characters, historic scripts) is two units, a surrogate pair, and slicing between them yields a lone surrogate that renders as a broken box. <code>Array.from</code> and <code>for…of</code> iterate code points, which fixes pairs but not sequences: a flag is two code points, a skin-toned thumb is two, a family can be seven joined by U+200D. What a person calls a character is an extended grapheme cluster, defined by Unicode Standard Annex 29 and exposed as <code>Intl.Segmenter</code>, in every engine since 2024. UTF-8 bytes are what the wire and most databases count; a VARCHAR(20) in MySQL utf8mb4 is 20 characters but 80 bytes. The two caf&eacute;s are normalisation forms NFC and NFD; compare with <code>a.normalize() === b.normalize()</code>, and prefer <code>Intl.Collator</code> for sorting. Sources: ECMAScript specification, String objects; Unicode Standard Annex 15 (Normalization) and 29 (Text Segmentation); ECMA-402, Intl.Segmenter.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
