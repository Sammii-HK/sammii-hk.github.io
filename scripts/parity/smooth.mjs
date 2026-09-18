// Frame-timing gate: pointer movement (ambient response) and a lens-switch travel.
// Usage: node scripts/parity/smooth.mjs [base]   (default http://localhost:3020)
import { createRequire } from "module";
const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");
const base = process.argv[2] || "http://localhost:3020";
const browser = await chromium.launch({ timeout: 300000 });
const R = {};
const stats = (f) => { const s = [...f].sort((a, b) => a - b); return { frames: f.length, p50: +s[Math.floor(s.length * 0.5)].toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), max: +s.at(-1).toFixed(1), over33: f.filter((d) => d > 33).length }; };
for (const lens of ["design", "product"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.__f = []; const raf = window.requestAnimationFrame.bind(window); let last = performance.now(); window.requestAnimationFrame = (cb) => raf((ts) => { window.__f.push(ts - last); last = ts; cb(ts); }); });
  await page.goto(`${base}/?focus=${lens}`, { waitUntil: "load", timeout: 240000 });
  await page.waitForSelector(".chapter"); await page.waitForTimeout(1200);
  await page.evaluate(() => { window.__f = []; });
  const t0 = Date.now(); while (Date.now() - t0 < 2000) { await page.mouse.move(200 + Math.random() * 1000, 100 + Math.random() * 600, { steps: 4 }); }
  const pointer = await page.evaluate(() => window.__f.filter((d) => d > 0 && d < 500));
  await page.evaluate(() => document.querySelector(".work-item:nth-child(2)").scrollIntoView({ block: "start" })); await page.waitForTimeout(500);
  await page.evaluate(() => { window.__f = []; });
  await page.locator(`.lens-nav .lens-phrase[data-lens="${lens === "design" ? "ai" : "design"}"]`).click();
  await page.waitForTimeout(750);
  const travel = await page.evaluate(() => window.__f.filter((d) => d > 0 && d < 2000));
  R[lens] = { pointer: stats(pointer), travel: stats(travel) };
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(R, null, 1));
