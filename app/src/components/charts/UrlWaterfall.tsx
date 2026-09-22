"use client";
import { useEffect, useMemo, useState } from "react";

/**
 * From typing a URL to a painted page, as a waterfall computed from round
 * trips. Every bar's length comes from the knobs: the network's round-trip
 * time and bandwidth, the protocol (how many round trips before the first
 * byte), the page's weight, and the device (how fast it parses JavaScript).
 * The maths is deliberately simple and stated in the notes; the shape it
 * produces is the real one: on a slow link the waiting dwarfs the work, and
 * JavaScript costs more on a phone than everything else combined.
 */
type Knobs = { net: "fibre" | "4g" | "3g"; proto: "h1-tls12" | "h2-tls13" | "h3"; js: 0 | 100 | 400 | 1200; css: 20 | 80 | 200; device: "laptop" | "phone" | "cheap"; dns: "cached" | "cold" };
const NET = { fibre: { rtt: 10, mbps: 100, label: "fibre, 10 ms RTT" }, "4g": { rtt: 50, mbps: 20, label: "4G, 50 ms RTT" }, "3g": { rtt: 200, mbps: 1.6, label: "3G, 200 ms RTT" } };
const DEVICE = { laptop: { msPerKb: 0.25, label: "laptop" }, phone: { msPerKb: 0.8, label: "mid phone" }, cheap: { msPerKb: 2.5, label: "cheap phone" } };
const HTML_KB = 40, SERVER_MS = 60, LAYOUT_MS = { laptop: 20, phone: 45, cheap: 90 };

type Bar = { id: string; stage: "connect" | "fetch" | "render"; name: string; start: number; ms: number; note: string };

function build(k: Knobs): { bars: Bar[]; firstPaint: number; interactive: number } {
  const { rtt, mbps } = NET[k.net];
  const dl = (kb: number) => (kb * 8) / (mbps * 1000) * 1000; // ms to download kb at mbps
  const bars: Bar[] = [];
  let t = 0;
  const push = (id: string, stage: Bar["stage"], name: string, ms: number, note: string, at = t) => { bars.push({ id, stage, name, start: at, ms, note }); return at + ms; };
  t = push("dns", "connect", "DNS lookup", k.dns === "cached" ? 1 : rtt, k.dns === "cached" ? "Already in the OS or browser cache." : "One round trip to a resolver to turn the name into an address.");
  if (k.proto === "h3") t = push("quic", "connect", "QUIC handshake (transport + TLS 1.3)", rtt, "HTTP/3 runs on QUIC, which folds the transport and TLS handshakes into one round trip.");
  else {
    t = push("tcp", "connect", "TCP handshake", rtt, "SYN, SYN-ACK, ACK: one round trip before any data.");
    t = push("tls", "connect", k.proto === "h1-tls12" ? "TLS 1.2 handshake" : "TLS 1.3 handshake", k.proto === "h1-tls12" ? 2 * rtt : rtt, k.proto === "h1-tls12" ? "TLS 1.2 needs two round trips to agree keys." : "TLS 1.3 agrees keys in one round trip (RFC 8446).");
  }
  t = push("ttfb", "fetch", "Request to first byte", rtt + SERVER_MS, `One round trip plus the server's own time (${SERVER_MS} ms here).`);
  t = push("html", "fetch", `HTML download (${HTML_KB} KB)`, dl(HTML_KB), "The document itself, streamed and parsed as it arrives.");
  const parseStart = t;
  // CSS and JS discovered early in the document; fetched in parallel over the warm connection (h1 would serialise more, simplified here)
  const cssEnd = push("css", "fetch", `CSS (${k.css} KB)`, rtt + dl(k.css), "Render-blocking: nothing paints until the stylesheet is in.", parseStart);
  const jsFetchEnd = k.js ? push("js", "fetch", `JavaScript (${k.js} KB)`, rtt + dl(k.js), "Downloaded in parallel with the CSS over the same connection.", parseStart) : parseStart;
  const paintAt = push("paint", "render", "Style, layout, first paint", LAYOUT_MS[k.device], "Style resolution and layout of the document, then the first pixels.", cssEnd);
  let interactive = paintAt;
  if (k.js) {
    const cost = k.js * DEVICE[k.device].msPerKb;
    interactive = push("exec", "render", "Parse, compile, run JavaScript", cost, `${DEVICE[k.device].msPerKb} ms per KB on this device: parse, compile and execute. This is the cost a phone feels.`, Math.max(jsFetchEnd, paintAt));
  }
  return { bars, firstPaint: paintAt, interactive };
}

export function UrlWaterfall() {
  const [k, setK] = useState<Knobs>({ net: "4g", proto: "h2-tls13", js: 400, css: 80, device: "phone", dns: "cold" });
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { const f = new URLSearchParams(window.location.search).get("focus"); if (f) setOpen(f); }, []);
  const { bars, firstPaint, interactive } = useMemo(() => build(k), [k]);
  const total = Math.max(...bars.map((b) => b.start + b.ms));
  const set = <K extends keyof Knobs>(key: K, v: Knobs[K]) => setK((s) => ({ ...s, [key]: v }));
  const sel = bars.find((b) => b.id === open) ?? null;
  const Knob = <T extends string | number>({ label, k: key, options, fmt }: { label: string; k: keyof Knobs; options: readonly T[]; fmt: (v: T) => string }) => (
    <div className="kp-knob" role="group" aria-label={label}>
      <span className="kp-knob-label">{label}</span>
      <div className="kp-knob-opts">{options.map((o) => <button key={String(o)} type="button" aria-pressed={k[key] === o} onClick={() => set(key, o as never)}>{fmt(o)}</button>)}</div>
    </div>
  );
  return (
    <div className="kp uw">
      <div className="kp-knobs">
        <Knob label="Network" k="net" options={["fibre", "4g", "3g"] as const} fmt={(v) => NET[v].label} />
        <Knob label="Protocol" k="proto" options={["h1-tls12", "h2-tls13", "h3"] as const} fmt={(v) => ({ "h1-tls12": "HTTP/1.1 + TLS 1.2", "h2-tls13": "HTTP/2 + TLS 1.3", h3: "HTTP/3 (QUIC)" })[v]} />
        <Knob label="DNS" k="dns" options={["cached", "cold"] as const} fmt={(v) => v} />
        <Knob label="JavaScript" k="js" options={[0, 100, 400, 1200] as const} fmt={(v) => `${v} KB`} />
        <Knob label="CSS" k="css" options={[20, 80, 200] as const} fmt={(v) => `${v} KB`} />
        <Knob label="Device" k="device" options={["laptop", "phone", "cheap"] as const} fmt={(v) => DEVICE[v].label} />
      </div>
      <p className="kp-total">
        First paint at <strong>{Math.round(firstPaint)} ms</strong>, usable at <strong>{Math.round(interactive)} ms</strong>. Before the first byte of HTML arrives: <strong>{Math.round(bars.find((b) => b.id === "ttfb")!.start + bars.find((b) => b.id === "ttfb")!.ms)} ms</strong>, all of it waiting.
      </p>
      <ol className="uw-rows" aria-label="Waterfall, one bar per step, to scale">
        {bars.map((b) => (
          <li key={b.id} className={`uw-row is-${b.stage}${open === b.id ? " is-open" : ""}`}>
            <span className="uw-name">{b.name}</span>
            <button type="button" className="uw-track" onMouseEnter={() => setOpen(b.id)} onClick={() => setOpen(open === b.id ? null : b.id)} aria-label={`${b.name}, ${Math.round(b.ms)} ms, starting at ${Math.round(b.start)} ms`}>
              <span className="uw-bar" style={{ left: `${(b.start / total) * 100}%`, width: `${Math.max(0.4, (b.ms / total) * 100)}%` }} />
            </button>
            <span className="uw-ms">{Math.round(b.ms)}</span>
          </li>
        ))}
        <li className="uw-marker" style={{ left: `${(firstPaint / total) * 100}%` }} aria-hidden="true"><span>first paint</span></li>
      </ol>
      <div className="kp-panel" aria-live="polite">
        {sel ? (<><p className="cst-panel-kicker">{sel.stage} · starts at {Math.round(sel.start)} ms</p><h2 className="cst-panel-title">{sel.name} · {Math.round(sel.ms)} ms</h2><p className="cst-panel-what">{sel.note}</p></>) : (<><h2 className="cst-panel-title">Hover a bar</h2><p className="cst-panel-what">Bars start where their step starts and run for as long as it takes, on one time axis. Change the network and watch the connect steps stretch; change the device and watch the JavaScript bar stretch instead.</p></>)}
      </div>
    </div>
  );
}
