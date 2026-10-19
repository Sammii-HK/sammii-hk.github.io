import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Now } from "../../../src/components/charts/Now";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "How long “now” takes",
  description: "The brain settles what just happened over at least 80 ms. Against that, a 16.7 ms frame, a 44 ms keypress, the 100 ms that feels instant, your own reaction time measured, and a flash-lag demo to see the delay for yourself.",
  alternates: { canonical: "https://labs.sammii.dev/charts/now/" },
  openGraph: { title: "How long “now” takes", description: "Your present is assembled after the fact. Here is the timing, next to your screen's.", url: "https://labs.sammii.dev/charts/now/", type: "article" },
};

export default function NowChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 27</p>
          <h1 className="chart-title">How long &ldquo;now&rdquo; takes</h1>
          <p className="chart-lead">
            Light from this screen reaches you in a nanosecond. Turning it into an experience takes much longer: tens of milliseconds for the signal to climb from the eye to the cortex, and the brain appears to wait a little longer still before it settles on what happened. David Eagleman calls perception a beautifully rendered simulation; this is how late the render runs, set against the frames, keypresses and thresholds design engineers work with. See the delay first, then the timings, then measure your own.
          </p>
        </header>
        <Now />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Every bar shares one linear axis, so the proportions are true. Machine timings are computed: a frame is 1000 ms over the refresh rate, and the keypress row is the sum of the twelve hops in <a href="https://labs.sammii.dev/charts/keypress/">How a keypress becomes a pixel</a> at its default settings and the refresh rate chosen here. Brain timings are averages from the studies named in each row, with wide spreads between people, tasks and methods; the macaque latencies are from anaesthetised animals shown flashes, and human ones run longer. Where a row says person, it is the whole loop: seeing, deciding and moving.</p>
          <p>The flash-lag effect was first described by MacKay (Nature 181:507, 1958) and revived by Nijhawan (Motion extrapolation in catching, Nature 370:256, 1994), who argued the brain extrapolates moving things forward. Others proposed that moving objects are simply processed faster than flashes. Eagleman and Sejnowski (Motion integration and postdiction in visual awareness, Science 287:2036, 2000) showed that what is seen at the flash depends on what happens in the next 80 ms or so, and called it postdiction; Krekelberg and Lappe (Trends in Neurosciences 24:335, 2001) review the debate, which is not settled. Michael Bach&rsquo;s Optical Illusions and Visual Phenomena has a fuller demo. The demo here draws the flash on exactly the frame the dot passes the middle, so the two are aligned to within one frame.</p>
          <p>The reaction test starts its clock in the animation frame where the panel changes and stops it at the input event&rsquo;s timestamp, so your number includes part of your display&rsquo;s latency and all of your input device&rsquo;s. That is deliberate. Nothing is stored or sent; the result stays in the page. Sources in each row: Schmolesky et al. 1998; Culham 1998; Eagleman and Sejnowski 2000; Eagleman 2010; ISCEV 2025; Nielsen 1993; Miller 1968; Card, Moran and Newell 1983; Thorpe, Fize and Marlot 1996; Luu 2017; Woods et al. 2015; Human Benchmark; Ng et al. 2012; Jota et al. 2013.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
