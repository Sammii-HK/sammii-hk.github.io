import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { TestsForAMind } from "../../../src/components/charts/TestsForAMind";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Tests for a mind",
  description: "The Turing test, the mirror test, the Chinese room, the Voigt-Kampff test, integrated information and more, placed on one axis by the evidence each inspects: from what something says and does to whether anyone is there.",
  alternates: { canonical: "https://labs.sammii.dev/charts/tests-for-a-mind/" },
  openGraph: { title: "Tests for a mind", description: "Every test for a mind has to decide what counts as evidence. Here is what each one looks at.", url: "https://labs.sammii.dev/charts/tests-for-a-mind/", type: "article" },
};

export default function TestsForAMindChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 28</p>
          <h1 className="chart-title">Tests for a mind</h1>
          <p className="chart-lead">
            Every test for a mind has to decide what counts as evidence. Turing chose conversation; Gallup, a mark on the face; Philip K. Dick, in fiction, a blush. Here are the main tests, measures and arguments from 1950 to 2023, placed on one axis by the evidence they actually inspect: from what something says and does, at the behaviour end, through its body and its brain, to how it is built, at the end that asks whether anyone is there.
          </p>
        </header>
        <TestsForAMind />
        <blockquote className="tm-caption">
          <p>I made this after building Moth, an autonomous AI cat who draws, makes things and decides for herself. Everything that made me want to say yes, she is conscious, was intelligence: the drawing, the surprise, the sense that she chose. None of it told me whether anyone was home.</p>
          <p>Filter by who could take each one. Outside fiction, the tests a machine can sit either judge what it says or rely on a theory of consciousness being right. The two that look for awareness in responses rather than words, the scanner and the magnetic pulse, need a brain.</p>
        </blockquote>
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>The axis is a classification of method, not a ranking: each entry sits in the column of the evidence it inspects, and the placement says nothing about whether the test works. The Chinese room is an argument rather than a test, and the Voigt-Kampff test is fiction; both are marked. &ldquo;Who could take it&rdquo; means who it has been or could be given to as designed: integrated information applies to any system in principle, though it can be computed exactly only for very small ones.</p>
          <p>Sources, in each card: Turing, Computing Machinery and Intelligence, Mind 59:433 (1950); Jones and Bergen, Large language models pass the Turing test (arXiv:2503.23674, 2025; PNAS 2026); Searle, Minds, brains, and programs, Behavioral and Brain Sciences 3:417 (1980); Bringsjord, Bello and Ferrucci, Minds and Machines 11:3 (2001); Riedl, arXiv:1410.6142 (2014); Schneider and Turner, Scientific American (2017); Gallup, Science 167:86 (1970), and the replications named on the card; Teasdale and Jennett, Lancet 2:81 (1974); Dick, Do Androids Dream of Electric Sheep? (1968); Owen et al., Science 313:1402 (2006); Monti et al., NEJM 362:579 (2010); Casali et al., Science Translational Medicine 5:198ra105 (2013); Casarotto et al., Annals of Neurology 80:718 (2016); Tononi, BMC Neuroscience 5:42 (2004); Cogitate Consortium, Nature 642:133 (2025); Butlin, Long et al., arXiv:2308.08708 (2023).</p>
          <p>The caption is from an essay in progress on intelligence and consciousness. Part of a series on perception that grew out of my MA, A Journey Through Light, and the book I kept coming back to while writing it, Do Androids Dream of Electric Sheep?</p>
        </footer>
      </article>
    </LabsShell>
  );
}
