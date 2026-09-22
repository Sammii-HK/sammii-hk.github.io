"use client";
import { useRef, useState } from "react";

/**
 * What a byte of JavaScript costs, measured on your machine: the page
 * generates a bundle of the size you pick, gzips it with CompressionStream
 * to get the transfer size, times parse-and-compile with new Function,
 * times the first execution, and lays the three next to the download time
 * on the network you choose. Then the same bytes as an image, for scale.
 */
const NETS: { id: string; name: string; mbps: number; rtt: number }[] = [
  { id: "fast", name: "Fast Wi-Fi", mbps: 100, rtt: 20 },
  { id: "4g", name: "4G", mbps: 9, rtt: 170 },
  { id: "3g", name: "Slow 3G", mbps: 0.4, rtt: 400 },
];
const DEVICES: { id: string; name: string; factor: number }[] = [
  { id: "this", name: "This machine", factor: 1 },
  { id: "mid", name: "Mid-range phone (×4)", factor: 4 },
  { id: "low", name: "Low-end phone (×8)", factor: 8 },
];

// Deterministic, moderately compressible source: many small functions with
// varied identifiers and literals so gzip behaves like it does on real code.
// `nonce` makes every run's source text unique: an identical string would hit
// the engine's compilation cache and report a parse time of nearly zero.
function makeBundle(kb: number, nonce: number): string {
  const parts: string[] = []; let size = 0; let i = 0; let h = (2166136261 ^ Math.imul(nonce, 2654435761)) >>> 0;
  const next = () => { h ^= i; h = Math.imul(h, 16777619) >>> 0; return h; };
  const name = (p: string) => p + next().toString(36).replace(/[^a-z]/g, (d) => String.fromCharCode(103 + Number(d)));
  while (size < kb * 1024) {
    const a = name("a"), b = name("b"), c = name("c");
    const fn = `function f${i}(${a},${b}){var o={k${c}:${a},v:${b},t:"${c}${a}"};if(o.k${c}>${next() % 1000}){o.v+=o.t.length}return o.k${c}+o.v+(o.t.charCodeAt(${i % 7})|0)}\n`;
    parts.push(fn); size += fn.length; i++;
  }
  parts.push(`var total=0;for(var j=0;j<${i};j++){total+=this["f"+j]?0:0}`);
  for (let k = 0; k < i; k += 1) parts.push(`total+=f${k}(${k},${k + 1});`);
  parts.push("return total;");
  return parts.join("");
}

async function gzipBytes(src: string): Promise<number | null> {
  try {
    const cs = new CompressionStream("gzip");
    const w = cs.writable.getWriter(); w.write(new TextEncoder().encode(src)); w.close();
    const buf = await new Response(cs.readable).arrayBuffer(); return buf.byteLength;
  } catch { return null; }
}

type Result = { kb: number; gz: number | null; compile: number; run: number };

export function JsCost() {
  const [kb, setKb] = useState(500);
  const [net, setNet] = useState(NETS[0]);
  const [dev, setDev] = useState(DEVICES[1]);
  const [res, setRes] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const runs = useRef(0);

  const measure = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 30)); // let the button repaint before we block
    const src = makeBundle(kb, ++runs.current);
    const gz = await gzipBytes(src);
    const t0 = performance.now();
    const fn = new Function(src); // parse + compile (top level eagerly, inner functions lazily)
    const t1 = performance.now();
    fn(); // first run: compiles every inner function and executes it once
    const t2 = performance.now();
    setRes({ kb, gz, compile: t1 - t0, run: t2 - t1 });
    setBusy(false);
  };

  const r = res;
  const transferKb = r ? (r.gz ?? r.kb * 1024) / 1024 : kb / 3.5;
  const download = net.rtt + (transferKb * 8) / (net.mbps * 1000) * 1000;
  const compile = (r?.compile ?? 0) * dev.factor, run = (r?.run ?? 0) * dev.factor;
  const total = download + compile + run;
  // like for like: the SAME bytes on the wire as a JPEG, so the download is
  // identical and the only difference left is the main-thread work
  const imageDownload = download;
  const imageDecode = Math.max(2, transferKb * 0.04) * dev.factor;
  const scale = Math.max(total, imageDownload + imageDecode, 1);
  const pct = (v: number) => `${Math.max(0.5, (v / scale) * 100)}%`;

  return (
    <div className="jc">
      <div className="jc-controls">
        <label className="cst-year"><span className="cst-year-label">Bundle size (before gzip)</span><input type="range" min={50} max={3000} step={50} value={kb} onChange={(e) => setKb(Number(e.target.value))} /><output className="cst-year-value">{kb} KB</output></label>
        <div className="bo-toggle" role="group" aria-label="Network">{NETS.map((n) => <button key={n.id} type="button" aria-pressed={net.id === n.id} onClick={() => setNet(n)}>{n.name}</button>)}</div>
        <div className="bo-toggle" role="group" aria-label="Device">{DEVICES.map((d) => <button key={d.id} type="button" aria-pressed={dev.id === d.id} onClick={() => setDev(d)}>{d.name}</button>)}</div>
        <button type="button" className="jd-btn" onClick={measure} disabled={busy}>{busy ? "Measuring…" : r ? "Measure again" : "Measure on this machine"}</button>
      </div>

      <div className="jc-bars">
        <div className="jc-lane">
          <span className="jc-lane-label">{kb} KB of JavaScript</span>
          <div className="jc-track">
            <span className="jc-seg jc-seg--dl" style={{ width: pct(download) }} title={`download ${download.toFixed(0)} ms`} />
            <span className="jc-seg jc-seg--compile" style={{ width: pct(compile) }} title={`parse + compile ${compile.toFixed(0)} ms`} />
            <span className="jc-seg jc-seg--run" style={{ width: pct(run) }} title={`execute ${run.toFixed(0)} ms`} />
          </div>
          <b className="jc-total">{total.toFixed(0)} ms</b>
        </div>
        <div className="jc-lane">
          <span className="jc-lane-label">{transferKb.toFixed(0)} KB of JPEG</span>
          <div className="jc-track"><span className="jc-seg jc-seg--dl" style={{ width: pct(imageDownload) }} title={`download ${imageDownload.toFixed(0)} ms`} /><span className="jc-seg jc-seg--run" style={{ width: pct(imageDecode) }} title={`decode ${imageDecode.toFixed(0)} ms`} /></div>
          <b className="jc-total">{(imageDownload + imageDecode).toFixed(0)} ms</b>
        </div>
      </div>
      <p className="jd-note"><span className="jc-key jc-key--dl" /> download ({net.name}: {net.rtt} ms round trip then {net.mbps} Mbps, on {r?.gz ? `${(r.gz / 1024).toFixed(0)} KB gzipped, measured` : "an assumed 3.5× gzip"}) · <span className="jc-key jc-key--compile" /> parse and compile · <span className="jc-key jc-key--run" /> first execution{r ? `, measured on this machine (${r.compile.toFixed(1)} ms + ${r.run.toFixed(1)} ms) and scaled ×${dev.factor} for ${dev.name.toLowerCase()}` : ". Press measure for real numbers"}. The JPEG lane is the same bytes on the wire, so the download is identical: the whole difference is the main-thread work, because an image is decoded off-thread and never executed.</p>

      {r && (
        <table className="jc-table">
          <thead><tr><th>Stage</th><th>ms</th><th>per KB</th><th>What it is</th></tr></thead>
          <tbody>
            <tr><td>Download</td><td>{download.toFixed(0)}</td><td>{(download / kb).toFixed(2)}</td><td>Round trip plus bytes over the wire, after gzip. The only stage an image pays.</td></tr>
            <tr><td>Parse + compile</td><td>{compile.toFixed(0)}</td><td>{(compile / kb).toFixed(2)}</td><td>Tokenising, building the AST, generating bytecode. Scales with source size, not gzipped size. On the main thread unless it is a module or streamed.</td></tr>
            <tr><td>Execute</td><td>{run.toFixed(0)}</td><td>{(run / kb).toFixed(2)}</td><td>Running the top level: module scope, framework bootstrap, hydration. Lazy functions compile here the first time they are called.</td></tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
