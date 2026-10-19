import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Retina } from "../../../src/components/charts/Retina";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "What your eye actually renders",
  description: "Cone and rod density across the human retina from Curcio's own data, the optic disc where there is nothing to count, and your blind spot found by hand, with the three things the brain fills it with.",
  alternates: { canonical: "https://labs.sammii.dev/charts/retina/" },
  openGraph: { title: "What your eye actually renders", description: "Sharp in a pit, coarse at the edges, a hole in each eye. Find yours.", url: "https://labs.sammii.dev/charts/retina/", type: "article" },
};

export default function RetinaChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 29</p>
          <h1 className="chart-title">What your eye actually renders</h1>
          <p className="chart-lead">
            Hold your gaze still and the scene seems sharp and complete from edge to edge. The retina disagrees. Cones, which give you detail and colour, are packed into a pit at the centre and thin out tenfold within a millimetre of it. Rods, which work in dim light, are missing from the very centre. And where the optic nerve leaves the eye there is nothing to detect light at all. Find that hole in your own eye first, then see the counts it sits in.
          </p>
        </header>
        <Retina />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The curves are the authors&rsquo; own numbers: the spreadsheet behind Figures 6 and 9 of Curcio, Sloan, Kalina and Hendrickson, Human photoreceptor topography (Journal of Comparative Neurology 292:497, 1990), published by Christine Curcio with the paper. It averages whole retinas from donors aged 27 to 44, counted under the microscope; the dots on the chart are the measured points and the lines join them. Degrees are the authors&rsquo; conversion from millimetres using the Drasdo and Fowler (1974) schematic eye, 275 µm per degree near the centre. Individual eyes vary a great deal, most of all at the fovea, where peak cone density ran from 100,000 to 324,000 per mm². The composite reads 196,890 at the very centre; the paper&rsquo;s abstract gives 199,000 as the average of the individual peaks. The first full count was Østerberg&rsquo;s, of a single eye, in 1935 (Acta Ophthalmologica supplement 6); the shapes agree, the numbers do not exactly, which is the point of counting more than one eye.</p>
          <p>The optic disc is drawn where the composite has no value, 3.98 mm on the nasal side, at the average disc size of 1.76 by 1.92 mm (Jonas, Gusek and Naumann, Investigative Ophthalmology and Visual Science 29:1151, 1988). In the visual field, the blind spot&rsquo;s centre is 15.5° ± 1.1° from fixation and 1.5° below it (Rohrschneider, Investigative Ophthalmology and Visual Science 45:3257, 2004); the demo uses that angle, so the distances it gives are a guide, not a measurement of your eye. Filling-in: Ramachandran, Blind spots, Scientific American 266(5), 1992; Komatsu, The neural mechanisms of perceptual filling-in, Nature Reviews Neuroscience 7:220, 2006; Dennett, Consciousness Explained, 1991; Pessoa, Thompson and Noë, Finding out about filling-in, Behavioral and Brain Sciences 21:723, 1998.</p>
          <p>Part of a series on perception that grew out of my MA, A Journey Through Light, a cube whose quotes could only be read under ultraviolet light. One of them was from The Little Prince: what is essential is invisible to the eye. The chart is the literal version.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
