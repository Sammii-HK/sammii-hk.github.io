import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { TouchTargets } from "../../../src/components/charts/TouchTargets";
import { SCREENS, mmOf } from "./data";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Touch targets, to scale",
  description: "WCAG 2.2's 24 and 44 CSS pixels, Apple's 44 points and Material's 48 dp drawn at their physical size on the screen you pick, next to a fingertip. Calibrate with a bank card and it is life-size.",
  alternates: { canonical: "https://labs.sammii.dev/charts/touch-targets/" },
  openGraph: { title: "Touch targets, to scale", description: "The guidelines are in pixels. Your finger is in millimetres.", url: "https://labs.sammii.dev/charts/touch-targets/", type: "article" },
};

const iphone = SCREENS.find((s) => s.id === "iphone")!, monitor = SCREENS.find((s) => s.id === "monitor")!;

export default function TouchTargetsChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 37</p>
          <h1 className="chart-title">Touch targets, to scale</h1>
          <p className="chart-lead">
            A 24 by 24 pixel button passes WCAG 2.2, and on an iPhone 16 it is {mmOf(24, iphone.cssPerIn).toFixed(1)} mm across: under half the patch of fingertip that lands on it. The guidelines are written in CSS pixels, points and dp, and a finger is measured in millimetres, so the same rule is a different size on every screen. Here are the common targets at their physical size on the screen you pick, next to the finger that has to hit them. Calibrate with a bank card and they are life-size.
          </p>
        </header>
        <TouchTargets />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Physical size is 25.4 mm divided by the CSS pixels a screen shows per inch, which is its pixel density divided by its device pixel ratio. The same 44 CSS px is {mmOf(44, iphone.cssPerIn).toFixed(1)} mm on an iPhone 16 and {mmOf(44, monitor.cssPerIn).toFixed(1)} mm on a 24-inch 1080p monitor, where the pointer is a one-pixel arrow. Screen densities are from Apple&rsquo;s and Google&rsquo;s published specs (iPhone 16: 2556 × 1179 at 460 ppi; Pixel 8: 1080 × 2400 at 428 ppi, a 412 px wide viewport; MacBook Air 13-inch: 2560 × 1664 at 224 ppi, shown at 1470 × 956 by default). Android defines a dp as one pixel at 160 dpi and rounds real screens into density buckets, so a dp on a given phone is close to 1/160 inch, not exactly; Google gives 48 dp as about 9 mm, while 48 dp at the 160 dpi baseline works out to {mmOf(48, 160).toFixed(1)}. Physical size always depends on the device, the zoom and the user&rsquo;s text-size setting; without calibration, this screen&rsquo;s figure is a guess from its input type and pixel ratio.</p>
          <p>Fingers: the MIT Touch Lab&rsquo;s widely cited figure puts the average adult index fingertip at 1.6 to 2 cm wide; the 8 to 10 mm contact patch and the 25 mm thumb are the figures design guides give alongside it (Ubuntu&rsquo;s finger-UI guide and Smashing Magazine respectively), and are less directly sourced. Accuracy matters more than the finger&rsquo;s size: Parhi, Karlson and Bederson measured one-handed thumb use and found 9.2 mm targets enough for single taps and 9.6 mm for runs of taps, which is where Nielsen Norman Group&rsquo;s 1 cm minimum comes from. A target can be larger than what is drawn: padding counts, which is how a 24 dp icon carries a 48 dp target.</p>
          <p>Sources: W3C, WCAG 2.2, Understanding 2.5.8 Target Size (Minimum) and 2.5.5 Target Size (Enhanced); Apple, Human Interface Guidelines, Buttons; Google, Android Accessibility Help, Touch target size; Dandekar, Raju and Srinivasan, 3-D finite-element models of human and monkey fingertips to investigate the mechanics of tactile sense, Journal of Biomechanical Engineering 125 (2003), MIT Touch Lab; Aurora Harley, Touch targets on touchscreens, Nielsen Norman Group (2019); Anthony T, Finger-friendly design: ideal mobile touchscreen target sizes, Smashing Magazine (2012); Pekka Parhi, Amy Karlson and Benjamin Bederson, Target size study for one-handed thumb use on small touchscreen devices, MobileHCI 2006; ISO/IEC 7810, ID-1 card size (85.60 × 53.98 mm); CSS Values and Units Level 4 (1in = 96px).</p>
        </footer>
      </article>
    </LabsShell>
  );
}
