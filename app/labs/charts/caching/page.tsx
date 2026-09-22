import type { Metadata } from "next";
import { LabsShell } from "../../../src/components/labs/LabsShell";
import { Caching } from "../../../src/components/charts/Caching";
import "../colour-spaces/chart.css";
import "./chart.css";

export const metadata: Metadata = {
  title: "Why they are still seeing the old version",
  description: "Five sets of caching headers run against the same six visits, including the moment you deploy the fix: which visits hit memory, which send a conditional request, which get a 304, and which users are still looking at yesterday's build.",
  alternates: { canonical: "https://labs.sammii.dev/charts/caching/" },
  openGraph: { title: "Why they are still seeing the old version", description: "You shipped the fix. Their browser did not ask.", url: "https://labs.sammii.dev/charts/caching/", type: "article" },
};

export default function CachingChart() {
  return (
    <LabsShell>
      <article className="chart-page">
        <header className="chart-head">
          <p className="section-eyebrow">Charts · 25</p>
          <h1 className="chart-title">Why they are still seeing the old version</h1>
          <p className="chart-lead">
            You shipped the fix, you can see it, they cannot, and a hard reload fixes it for you and not for them. Nothing is broken: their browser has a stored response it believes is still fresh, so it never asked. Here are five sets of headers run against the same six visits, with the deploy in the middle, so you can see exactly which visit finds out and which one does not.
          </p>
        </header>
        <Caching />
        <footer className="chart-foot">
          <h2 className="section-eyebrow">Notes</h2>
          <p>Freshness is the whole mechanism: a stored response may be reused without contacting the server while its age is under <code>max-age</code>, and only when it is stale does a validator come into play. <code>no-cache</code> does not mean do not store; it means store it but always revalidate before use, which is what you want on HTML. <code>no-store</code> is the one that means do not keep it. <code>immutable</code> tells the browser not to revalidate even on an explicit reload, and it is safe only on a URL whose content genuinely cannot change, which is what a build hash guarantees: a new build is a new URL, so the old one never needs invalidating. A conditional request carries <code>If-None-Match</code> (from the <code>ETag</code>) or <code>If-Modified-Since</code> (from <code>Last-Modified</code>) and can come back as a 304 with no body, which costs a round trip and nothing else. <code>stale-while-revalidate</code> lets the browser serve the stale copy immediately and refresh in the background, so the user sees the previous version exactly once. <code>Vary</code> is the fourth header and the one that silently breaks things: it lists the request headers that form part of the cache key, so a response that varies on <code>Accept-Encoding</code> is stored separately per encoding, and one that varies on <code>Cookie</code> is effectively uncacheable. A hard reload sends <code>Cache-Control: no-cache</code> on the request, which is why it always works for you and never for anyone else. Sources: RFC 9111 (HTTP Caching), sections 4 and 5; RFC 5861 (stale-while-revalidate); Chrome DevTools network documentation.</p>
        </footer>
      </article>
    </LabsShell>
  );
}
