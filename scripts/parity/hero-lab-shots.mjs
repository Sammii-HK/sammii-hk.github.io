import { createRequire } from "module";
import { mkdirSync } from "fs";
const require = createRequire(new URL("../../package.json", import.meta.url));
const { chromium } = require("playwright");
const OUT = process.env.HERO_LAB_OUT || "/tmp/hero-lab-shots";
mkdirSync(OUT, { recursive: true });
const base = "http://localhost:3020/hero-lab/";
const HIDE = ".lab-controls{display:none!important}";
const browser = await chromium.launch();

async function shot(name, params, { width = 1440, height = 900, dark = false, hoverPhrase = null, clip = true } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, colorScheme: dark ? "dark" : "light", deviceScaleFactor: 1 });
  await ctx.addInitScript(`Object.defineProperty(performance, "now", { value: () => 120000 });`);
  const page = await ctx.newPage();
  await page.goto(base + "?" + new URLSearchParams(params).toString(), { waitUntil: "load" });
  await page.waitForSelector(".lab-hero");
  await page.addStyleTag({ content: HIDE });
  await page.mouse.move(width * 0.62, height * 0.55, { steps: 6 });
  if (hoverPhrase) {
    const el = page.locator(`.lab-hero .lab-phrase[data-lens="${hoverPhrase}"]`).first();
    const b = await el.boundingBox();
    await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5, { steps: 8 });
  }
  await page.waitForTimeout(900);
  const hero = await page.locator(".lab-page").boundingBox();
  await page.screenshot({ path: `${OUT}/${name}.png`, clip: clip ? { x: 0, y: 0, width, height: Math.min(height, hero.height + 80) } : undefined });
  await ctx.close();
  console.log("shot", name);
}

// compositions, both widths, candidate headline, committed = design
for (const c of ["a", "b", "c"]) {
  await shot(`comp-${c}-1440`, { comp: c });
  await shot(`comp-${c}-390`, { comp: c }, { width: 390, height: 844 });
}
// alt headlines in A
await shot("comp-a-alt1-1440", { comp: "a", h1: "alt1" });
await shot("comp-a-alt2-1440", { comp: "a", h1: "alt2" });
// previews (full H1) in A, and partial treatment
await shot("preview-design-full", { comp: "a", hover: "design" }, { hoverPhrase: "design" });
await shot("preview-ai-full", { comp: "a", hover: "ai" }, { hoverPhrase: "ai" });
await shot("preview-product-full", { comp: "a", hover: "product" }, { hoverPhrase: "product" });
await shot("preview-ai-partial", { comp: "a", hover: "ai", preview: "partial" }, { hoverPhrase: "ai" });
await shot("preview-product-partial-b", { comp: "b", hover: "product", preview: "partial" }, { hoverPhrase: "product" });
// committed states, four treatments, lens = ai so it differs from default
for (const t of ["underline", "weight", "marker", "env"]) await shot(`committed-${t}`, { comp: "a", lens: "ai", commit: t });
await shot("committed-b-product", { comp: "b", lens: "product" });
await shot("committed-c-ai-dark", { comp: "c", lens: "ai" }, { dark: true });
// condensed nav
await shot("nav-desktop", { comp: "a", nav: "1", lens: "ai" }, { height: 400 });
await shot("nav-mobile", { comp: "a", nav: "1", lens: "ai" }, { width: 390, height: 500 });
// composition C with pointer near a phrase (proximity), no hover
await shot("comp-c-proximity", { comp: "c" }, { hoverPhrase: null, clip: true });
await browser.close();
