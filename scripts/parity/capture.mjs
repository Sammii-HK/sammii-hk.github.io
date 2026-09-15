// Parity capture for the environment system (first used as the Phase 2B gate).
// Serve two static exports (before/after), capture the same states, diff the PNGs.
// Usage: node capture.mjs <static-dir> <out-dir>
// Serves the static export, freezes performance.now() so the time-drift term is
// deterministic, then screenshots the homepage in representative states.
import { createRequire } from "module";
import { createServer } from "http";
import { readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";

const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");

const [, , root, outDir] = process.argv;
if (!root || !outDir) { console.error("usage: capture.mjs <static-dir> <out-dir>"); process.exit(2); }
await mkdir(outDir, { recursive: true });

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".json": "application/json", ".woff2": "font/woff2", ".txt": "text/plain" };
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

// Freeze the time-drift input. Cursor lerp still converges because rAF still runs.
const FREEZE = `Object.defineProperty(performance, "now", { value: () => 120000 });`;

const browser = await chromium.launch();
const shots = [];
async function shot(name, { width = 1440, height = 900, colorScheme = "light", reducedMotion = "no-preference", mobile = false, act }) {
  const ctx = await browser.newContext({
    viewport: { width, height }, colorScheme, reducedMotion, deviceScaleFactor: 1,
    hasTouch: mobile, isMobile: mobile,
  });
  await ctx.addInitScript(FREEZE);
  const page = await ctx.newPage();
  await page.goto(`${base}/`, { waitUntil: "load" });
  await page.waitForSelector(".project-card");
  await page.waitForTimeout(600);
  if (act) await act(page);
  await page.waitForTimeout(900); // let lerps settle
  const file = join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  const metrics = await page.evaluate(() => {
    const scroller = document.querySelector("#project-grid-scroll") || document.scrollingElement;
    const cs = (el) => (el ? getComputedStyle(el) : null);
    const bg = document.querySelector("#project-grid-scroll")?.closest("div[style]") ?? document.querySelector("main main")?.parentElement;
    return {
      containerBg: cs(bg)?.backgroundImage?.slice(0, 160),
      logoBg: cs(document.querySelector(".logo"))?.backgroundImage?.slice(0, 120),
      scrollTop: scroller?.scrollTop,
      followerDisplay: cs(document.querySelector('[aria-hidden="true"].pointer-events-none'))?.display,
      hoveredBorder: cs(document.querySelector(".project-card:hover"))?.borderColor,
    };
  });
  shots.push({ name, metrics });
  await ctx.close();
}

const move = (x, y) => async (page) => { await page.mouse.move(x, y, { steps: 12 }); };
await shot("01-cursor-left-top", { act: move(8, 8) });
await shot("02-cursor-centre", { act: move(720, 450) });
await shot("03-cursor-right-bottom", { act: move(1432, 892) });
await shot("04-cursor-moving", { act: async (page) => { await page.mouse.move(100, 100); await page.mouse.move(1300, 800, { steps: 40 }); await page.waitForTimeout(80); } });
await shot("05-grid-scrolled", { act: async (page) => {
  await page.mouse.move(720, 450);
  await page.evaluate(() => { const s = document.querySelector("#project-grid-scroll") || document.scrollingElement; s.scrollTop = 900; s.dispatchEvent(new Event("scroll")); });
  await page.waitForTimeout(700);
} });
await shot("06-card-hover", { act: async (page) => {
  const card = page.locator(".project-card").first();
  const b = await card.boundingBox();
  await page.mouse.move(b.x + b.width * 0.3, b.y + b.height * 0.6, { steps: 8 });
} });
await shot("07-dark-centre", { colorScheme: "dark", act: move(720, 450) });
await shot("08-dark-card-hover", { colorScheme: "dark", act: async (page) => {
  const card = page.locator(".project-card").first();
  const b = await card.boundingBox();
  await page.mouse.move(b.x + b.width * 0.3, b.y + b.height * 0.6, { steps: 8 });
} });
await shot("09-mobile-touch", { width: 390, height: 844, mobile: true, act: async (page) => {
  await page.touchscreen.tap(200, 500);
} });
await shot("10-reduced-motion", { reducedMotion: "reduce", act: move(720, 450) });

await browser.close();
server.close();
await import("fs").then((fs) => fs.writeFileSync(join(outDir, "metrics.json"), JSON.stringify(shots, null, 2)));
console.log(`captured ${shots.length} states → ${outDir}`);
