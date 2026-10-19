import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Spectrum } from "../../../src/components/charts/Spectrum";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "The visible spectrum is a sliver",
  description: "The electromagnetic spectrum to scale on a log axis with the band we see at its true width, what bees, birds, mantis shrimp and pit vipers pick up beyond it, and Eagleman's one ten-trillionth worked out.",
  alternates: { canonical: "https://labs.sammii.dev/charts/spectrum/" },
  openGraph: { title: "The visible spectrum is a sliver", description: "Everything you can see, to scale against everything there is.", url: "https://labs.sammii.dev/charts/spectrum/", type: "article" },
};

export default function SpectrumChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 26</p>
          <h1 className="chart-title">The visible spectrum is a sliver</h1>
          <p className="chart-lead">
            My MA, A Journey Through Light, was a cube whose quotes could only be read under ultraviolet light. Nothing in the cube changed when the light did; only what you could perceive. The argument was that what we see is a sliver of what is there. This is the sliver, to scale: the whole electromagnetic spectrum on one axis, the band your eyes respond to drawn at its true width, and what other animals pick up either side of it.
          </p>
        </header>
        <Spectrum />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Both axes are logarithmic in wavelength, which is how the spectrum is always drawn, because nothing else fits. Band edges are from ISO 21348:2007, Space environment: process for determining solar irradiances: gamma rays 10 fm to 1 pm, X-rays 1 pm to 10 nm, ultraviolet to 400 nm (ISO&rsquo;s extreme and vacuum ultraviolet cover 10 to 200 nm), visible 380 to 760 nm, infrared 760 nm to 1 mm, with UV-A, B and C and IR-A, B and C as ISO divides them. ISO&rsquo;s own microwave and radio bands are specific to the Sun, so those follow the engineering convention, microwave 1 mm to 1 m (300 MHz to 300 GHz) and radio beyond; the ITU counts everything below 3,000 GHz as radio. The CIE (S 017:2020) gives no single edge for the visible: 360 to 400 nm at the short end, 760 to 830 nm at the long. The spectral colours in the bar are approximate; a screen cannot show them.</p>
          <p>Animals: human cones from Bowmaker and Dartnall (1980), microspectrophotometry of one retina, peaks 420, 534 and 563 nm; without a lens, Griswold and Stark (1992); honeybee peaks after Menzel and Backhaus (1991) as given by Hempel de Ibarra, Vorobyev and Menzel (2014), range after Peitsch et al. (1992) as given by Garcia et al. (2020); birds from Hart and Hunt (2007), Ödeen and Håstad (2013) and Lind et al. (2014); mantis shrimp from Thoen et al. (2014) and Chiou et al. (2008); pit organs from Gracheva et al. (2010), Grace et al. (1999), Goris (2011) and Ebert and Westhoff (2006). Each row&rsquo;s panel gives its own sources and how firm they are. The pit organ&rsquo;s wavelength range is the least certain number here: it is a heat sense with no pigment, and the 3 to 15 µm figure comes from a review rather than a measurement I could check.</p>
          <p>The fraction: David Eagleman, Can we create new senses for humans?, TED2015. Visible light is 394 THz wide (380 to 760 nm). On a linear frequency scale that is less than one ten-trillionth of everything up to any photon above about 16 TeV; LHAASO&rsquo;s 1.4 PeV photons are from Cao et al., Nature 594:33 (2021). On the log axis the same band is a little over 1.5% of the width. The number changes with the scale; the sliver does not.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
