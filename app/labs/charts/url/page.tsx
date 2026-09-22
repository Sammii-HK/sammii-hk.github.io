import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { UrlWaterfall } from "../../../src/components/charts/UrlWaterfall";
import "../colour-spaces/chart.css";
import "../keypress/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "How a URL becomes a page",
  description: "DNS, the handshakes, the first byte, the HTML, the CSS, the JavaScript and the paint as a waterfall computed from round trips, with knobs for network, protocol, page weight and device.",
  alternates: { canonical: "https://labs.sammii.dev/charts/url/" },
  openGraph: { title: "How a URL becomes a page", description: "The waterfall, from round trips.", url: "https://labs.sammii.dev/charts/url/", type: "article" },
};

export default function UrlChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 11</p>
          <h1 className="chart-title">How a URL becomes a page</h1>
          <p className="chart-lead">
            Between pressing return and seeing a page there is a name to resolve, a connection to open, keys to agree, a request to make, and only then the document, its stylesheet, its script, and the paint. Each step is a bar on one time axis, its length computed from the round-trip time you pick. On a slow link the waiting dwarfs the work; on a cheap phone the JavaScript dwarfs the waiting. This is the network sibling of the keypress chart.
          </p>
        </header>
        <UrlWaterfall />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>A model, not a measurement: DNS is one round trip unless cached; TCP is one; TLS 1.2 is two and TLS 1.3 one (RFC 8446); HTTP/3 over QUIC folds transport and TLS into one (RFC 9000); the first byte is one round trip plus 60 ms of server time; downloads are size over bandwidth; CSS blocks the first paint; JavaScript is parsed, compiled and run at a per-kilobyte cost by device class (0.25, 0.8 and 2.5 ms per KB, in the range Addy Osmani reports in The cost of JavaScript). Congestion windows, priorities, caching, preloading and the HTTP/1.1 connection limit are left out; they change the numbers, not the shape.</p>
          <p>Sources: RFC 8446 (TLS 1.3), RFC 9000 (QUIC), RFC 9114 (HTTP/3); Addy Osmani, The cost of JavaScript (2018 to 2023); Ilya Grigorik, High Performance Browser Networking; HTTP Archive Web Almanac page weight medians.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
