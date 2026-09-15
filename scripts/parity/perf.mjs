// Performance / render probe for the Phase 2B refactor.
// Usage: node perf.mjs <static-dir> <label>
// Measures: JS transferred on the homepage, LCP, CLS, INP-ish (click→paint),
// React commits during 2s of pointer movement, and rAF frame stability.
import { createRequire } from "module";
import { createServer } from "http";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";

const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");
const [, , root, label] = process.argv;

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2" };
const server = createServer(async (req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (p.endsWith("/")) p += "index.html";
  let file = join(root, p);
  if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
  try { const buf = await readFile(file); res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" }); res.end(buf); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// Count React commits by hooking the DOM mutation stream of the homepage root.
// A React state re-render of PortfolioContainer rewrites the container's inline
// `style` attribute (old) — with the refactor only custom properties change.
// We count BOTH: attribute mutations on the container, and React's own commit
// count via the scheduler's MessageChannel activity (approximated by counting
// `setState`-driven renders through a React DevTools-style hook).
await page.addInitScript(() => {
  window.__reactCommits = 0;
  window.__rafFrames = [];
  window.__hook = { renderers: new Map(), supportsFiber: true, inject() { return 1; }, onCommitFiberRoot() { window.__reactCommits++; }, onCommitFiberUnmount() {}, on() {}, emit() {}, sub() {} };
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__hook;
  const raf = window.requestAnimationFrame.bind(window);
  let last = performance.now();
  window.requestAnimationFrame = (cb) => raf((ts) => { window.__rafFrames.push(ts - last); last = ts; cb(ts); });
});

let jsBytes = 0, jsCount = 0;
page.on("response", async (r) => { if (r.request().resourceType() === "script") { try { const b = await r.body(); jsBytes += b.length; jsCount++; } catch {} } });

await page.goto(`${base}/`, { waitUntil: "load" });
await page.waitForSelector(".project-card");
await page.waitForTimeout(1500);

const vitals = await page.evaluate(() => new Promise((resolve) => {
  const out = { lcp: null, cls: 0 };
  try {
    new PerformanceObserver((l) => { for (const e of l.getEntries()) out.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) out.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  } catch {}
  setTimeout(() => resolve(out), 300);
}));

// Pointer movement: 2 seconds of continuous motion.
await page.evaluate(() => { window.__reactCommits = 0; window.__rafFrames = []; });
const t0 = Date.now();
while (Date.now() - t0 < 2000) {
  const x = 100 + Math.random() * 1200, y = 100 + Math.random() * 700;
  await page.mouse.move(x, y, { steps: 5 });
}
const during = await page.evaluate(() => {
  const f = window.__rafFrames.filter((d) => d > 0 && d < 200);
  const sorted = [...f].sort((a, b) => a - b);
  const p = (q) => sorted[Math.floor(sorted.length * q)] ?? null;
  const long = f.filter((d) => d > 33).length;
  return { reactCommits: window.__reactCommits, frames: f.length, p50: p(0.5), p95: p(0.95), max: sorted.at(-1), longFrames: long };
});

// Interaction responsiveness: open the first project modal, time to dialog paint.
const tClick = await page.evaluate(() => performance.now());
await page.locator(".project-card").first().click();
await page.waitForSelector('[role="dialog"]');
const tDialog = await page.evaluate(() => performance.now());
await page.keyboard.press("Escape");

// Container style churn: count inline style writes on the env/container element for 1s of movement.
const styleWrites = await page.evaluate(async () => {
  const el = document.querySelector("[data-env]") || document.querySelector("#project-grid-scroll").closest("div[style]");
  let n = 0;
  const mo = new MutationObserver((ms) => { n += ms.length; });
  mo.observe(el, { attributes: true, attributeFilter: ["style"] });
  await new Promise((r) => setTimeout(r, 1000));
  mo.disconnect();
  return n;
});

console.log(JSON.stringify({
  label,
  homepageJs: { files: jsCount, bytes: jsBytes, kb: +(jsBytes / 1024).toFixed(1) },
  lcpMs: vitals.lcp && +vitals.lcp.toFixed(0),
  cls: +vitals.cls.toFixed(4),
  clickToDialogMs: +(tDialog - tClick).toFixed(1),
  pointerMove2s: during,
  inlineStyleWritesPerSecond: styleWrites,
}, null, 2));

await browser.close();
server.close();
