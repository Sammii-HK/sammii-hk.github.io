import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { KeypressFlow } from "../../../src/components/charts/KeypressFlow";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "How a keypress becomes a pixel",
  description: "Twelve hops between a finger and the glass, each drawn to its share of the latency, with knobs for polling rate, refresh rate, page work and panel type.",
  alternates: { canonical: "https://labs.sammii.dev/charts/keypress/" },
  openGraph: { title: "How a keypress becomes a pixel", description: "Finger to glass in twelve hops, to scale.", url: "https://labs.sammii.dev/charts/keypress/", type: "article" },
};

export default function KeypressChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 05</p>
          <h1 className="chart-title">How a keypress becomes a pixel</h1>
          <p className="chart-lead">
            Between your finger and the letter appearing there are twelve hops through the keyboard, the operating system, the browser, the renderer and the display. This draws each one to its share of the time. The knobs change the hardware; the page-work knob is the only part an app controls, and it is rarely the biggest bar.
          </p>
        </header>
        <KeypressFlow />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Values are typical figures for a modern laptop, not measurements of any one machine: a mechanical switch and its firmware debounce at about 5 ms; USB HID polling at 125 Hz by default (an 8 ms interval, so a 4 ms average wait) or 1000 Hz on gaming hardware; the compositor waiting on average half a refresh interval for vsync and the panel taking another half to scan the frame out; liquid crystal response between 1 ms (OLED, near zero) and 12 ms or more (older LCDs). Browser stages follow the pipeline in Chromium&rsquo;s rendering documentation: input dispatch, script, style, layout, paint, composite.</p>
          <p>Sources: Dan Luu, Computer latency 1977 to 2017 (measured end-to-end keyboard-to-screen latencies of 30 ms on an Apple IIe and 60 to 170 ms on modern machines); Chromium, Life of a Pixel and RenderingNG; the USB HID specification; Microsoft, Keyboard latency; RTINGS input lag methodology.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
