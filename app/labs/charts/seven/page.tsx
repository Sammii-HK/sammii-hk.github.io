import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Seven } from "../../../src/components/charts/Seven";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Seven, and why the week is in that order",
  description: "Step the hours of the week and the seven-pointed star draws itself: 24 mod 7 = 3 is why the days go Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn. Then the sevens in columns, from Newton's spectrum to the seven spheres of my MA installation.",
  alternates: { canonical: "https://labs.sammii.dev/charts/seven/" },
  openGraph: { title: "Seven, and why the week is in that order", description: "24 hours, seven rulers, 24 mod 7 = 3. The week is a heptagram.", url: "https://labs.sammii.dev/charts/seven/", type: "article" },
};

export default function SevenChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 16</p>
          <h1 className="chart-title">Seven, and why the week is in that order</h1>
          <p className="chart-lead">
            Seven is the number a culture reaches for when it wants a set to feel complete: heavens, chakras, notes, colours, wonders, sins. Most of those are seven by choice. One of them is seven by arithmetic, and it is the one you use every day. The days of the week are named for the seven classical planets, but not in the planets&rsquo; own order. Step the hours and watch why.
          </p>
        </header>
        <Seven />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The planetary-hours explanation of the week is ancient and documented: Cassius Dio, writing around 230 CE (Roman History 37.18&ndash;19), gives exactly this account, the Egyptians assigning each hour to a planet in the order of their spheres and the day taking the name of its first hour. The Chaldean order is by apparent speed against the stars, which the ancients read as distance: Saturn slowest and outermost, the Moon fastest and nearest. Newton&rsquo;s seven colours are from Opticks (1704), Book I, where he divides the spectrum in proportion to the intervals of the musical octave; he had earlier used five, and added orange and indigo. Miller&rsquo;s 7 ± 2 is from The Magical Number Seven, Plus or Minus Two (1956), and later work puts the honest figure nearer four. Bellos&rsquo;s favourite-number survey is in Alex Through the Looking-Glass (2014). The cultural sevens and the seven spheres are from my MA research, VIC708, A Journey Through Light (2018), in which the audience walks from darkness through the seven colours of the spectrum into ultraviolet, where quotes painted in UV-reactive paint become readable. The table rows count; only the ones the text says correspond are claimed to.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
