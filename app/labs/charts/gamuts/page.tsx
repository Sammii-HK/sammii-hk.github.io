import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { GamutDiagram } from "../../../src/components/charts/GamutDiagram";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "The gamuts",
  description: "sRGB, Display P3, Adobe RGB and Rec. 2020 drawn on the CIE 1931 chromaticity diagram, with a per-pixel fill and a check of what your own screen can show.",
  alternates: { canonical: "https://labs.sammii.dev/charts/gamuts/" },
  openGraph: { title: "The gamuts", description: "Every colour you can see, and the triangles of what screens can show.", url: "https://labs.sammii.dev/charts/gamuts/", type: "article" },
};

export default function GamutsChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 06</p>
          <h1 className="chart-title">The gamuts</h1>
          <p className="chart-lead">
            The horseshoe is every colour a human can see, mapped by the CIE in 1931. Each triangle is what a display standard can reproduce, its corners the three primaries. sRGB, the web&rsquo;s default, covers about a third of it. Your screen is probably Display P3; the page asks it. Rec. 2020 puts its corners on the spectral edge itself, and nothing you can buy reaches them.
          </p>
        </header>
        <GamutDiagram />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Chromaticity coordinates of the spectral locus are from the CIE 1931 2° standard observer at 5 nm steps. Primaries and white points: IEC 61966-2-1 (sRGB), SMPTE RP 431-2 and Apple (Display P3), Adobe RGB (1998), ITU-R BT.2020. Areas are the triangle areas in xy space relative to sRGB, the usual rough measure; a CIELAB volume comparison would differ. The fill maps each xy to XYZ at unit luminance, converts to linear sRGB, normalises so the brightest channel is one, and clips: honest inside sRGB, nearest-displayable outside. The screen check uses the CSS color-gamut media query.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
