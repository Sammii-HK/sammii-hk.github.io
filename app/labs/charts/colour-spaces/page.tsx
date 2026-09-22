import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { ColourSpacesTree } from "../../../src/components/charts/ColourSpacesTree";
import { LANES, SPACES } from "./data";
import "./chart.css";

export const metadata: Metadata = {
  title: "The family tree of colour spaces",
  description: "An interactive timeline of colour spaces from Munsell and CIE XYZ to OKLCH and CSS Color 4: what each was for, who made it, and what it descends from.",
  alternates: { canonical: "https://labs.sammii.dev/charts/colour-spaces/" },
  openGraph: { title: "The family tree of colour spaces", description: "From CIE XYZ to OKLCH: what descends from what, and why.", url: "https://labs.sammii.dev/charts/colour-spaces/", type: "article" },
};

export default function ColourSpacesChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 01</p>
          <h1 className="chart-title">The family tree of colour spaces</h1>
          <p className="chart-lead">
            {SPACES.length} ways of writing a colour down as numbers, {YEARS(SPACES)}, in {LANES.length} lanes by purpose. Solid lines are derivations, dotted lines are influence. The ramps in the side panel are drawn with the real CSS colour functions, so what you see is the space itself.
          </p>
        </header>
        <ColourSpacesTree />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Dates are the year of the defining paper or standard. CIE RGB and XYZ share 1931 because XYZ is a linear transform of the matching experiments published that year. HSL and HSV are dated to the 1978 papers by Alvy Ray Smith and by Joblove and Greenberg. Display P3 is dated to DCI-P3 (2007); Apple shipped the Display variant in 2015. CSS Color Level 4 is dated to the year all three engines shipped lab(), lch(), oklab() and oklch().</p>
          <p>Sources: CIE publications 15:2004 and 159:2004; Ottosson, A perceptual color space for image processing (2020); Ebner and Fairchild, Development and testing of a color space (IPT) (1998); Li et al., Comprehensive color solutions: CAM16, CAT16 and CAM16-UCS (2017); ITU-R BT.709, BT.2020, BT.2100; IEC 61966-2-1 (sRGB); W3C CSS Color Module Level 4.</p>
          <p>Part of a series of information-design pieces on the things design engineers work with. Built with SVG, React and CSS Color 4. <a href="https://gamut.sammii.dev">Gamut</a> is the tool that made me want to draw this.</p>
        </footer>
      </article>
    </LabsShell>
  );
}

function YEARS(list: { year: number }[]) {
  const ys = list.map((s) => s.year);
  return `${Math.min(...ys)} to ${Math.max(...ys)}`;
}
