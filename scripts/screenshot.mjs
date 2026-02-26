/**
 * screenshot.mjs
 *
 * Takes full-page-width screenshots of project websites and saves them to
 * public/assets/images/{id}.png, then regenerates the image map.
 *
 * Usage:
 *   node scripts/screenshot.mjs
 *   node scripts/screenshot.mjs --only lunary,crystal-index
 *
 * Requirements: run `yarn add -D playwright` first, then browsers install automatically.
 */

import { execFileSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'public', 'assets', 'images');

// ---------------------------------------------------------------------------
// Project list — edit URLs here as projects go live
// ---------------------------------------------------------------------------
const projects = [
  // Live production sites
  { id: 'lunary',           url: 'https://lunary.app' },
  { id: 'crystal-index',   url: 'https://www.crystalindex.co.uk' },
  // Local dev servers — skipped gracefully if not running
  { id: 'spellcast',       url: 'http://localhost:3030' },
  { id: 'podify',          url: 'http://localhost:3000' },
  { id: 'artify',          url: 'http://localhost:3002' },
  { id: 'celestial-map',   url: 'http://localhost:5174', waitForCanvas: '#controls' },
  // Other live/deployed sites
  { id: 'day-lite',        url: 'https://day-lite.vercel.app' },
  { id: 'glint',           url: 'https://glint.sammii.dev' },
  { id: 'the-colour-game', url: 'https://the-colour-game.vercel.app' },
  { id: 'balloon-bonanza', url: 'https://sammii-hk.github.io/balloon-bonanza' },
  { id: 'liquidity',       url: 'https://liquidity.sammii.dev' },
  { id: 'scape-squared',   url: 'https://scape-squared.vercel.app' },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const VIEWPORT = { width: 1400, height: 875 };
const DELAY_MS = 1500;      // ms to wait after networkidle before screenshotting
const NAV_TIMEOUT = 30_000; // ms

// ---------------------------------------------------------------------------
// CLI: --only flag
// ---------------------------------------------------------------------------
function getOnlyList() {
  const idx = process.argv.indexOf('--only');
  if (idx === -1) return null;
  const value = process.argv[idx + 1];
  if (!value) {
    console.error('--only flag requires a comma-separated list of project IDs');
    process.exit(1);
  }
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function isLocalhost(url) {
  return url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1');
}

async function isLocalhostReachable(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    await fetch(url, { signal: controller.signal, method: 'HEAD' });
    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Ensure output directory exists
// ---------------------------------------------------------------------------
function ensureOutputDir() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }
}

// ---------------------------------------------------------------------------
// Ensure Playwright Chromium is installed
// ---------------------------------------------------------------------------
function ensurePlaywrightChromium() {
  console.log('Checking Playwright Chromium installation...');
  try {
    execFileSync('npx', ['playwright', 'install', 'chromium', '--with-deps'], {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } catch (err) {
    console.error('Failed to install Playwright Chromium:', err.message);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Screenshot a single project
// ---------------------------------------------------------------------------
async function screenshotProject(browser, project) {
  const outputPath = join(OUTPUT_DIR, `${project.id}.png`);

  // Localhost reachability check
  if (isLocalhost(project.url)) {
    const reachable = await isLocalhostReachable(project.url);
    if (!reachable) {
      console.warn(`  [SKIP] ${project.id} — localhost server not running at ${project.url}`);
      return { id: project.id, status: 'skipped' };
    }
  }

  console.log(`  [SHOT] ${project.id} — ${project.url}`);

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    await page.goto(project.url, {
      waitUntil: 'networkidle',
      timeout: NAV_TIMEOUT,
    });

    // Hide common cookie banners and consent overlays
    await page.evaluate(() => {
      const selectors = [
        '[id*="cookie"]', '[class*="cookie"]',
        '[id*="consent"]', '[class*="consent"]',
        '[id*="gdpr"]', '[class*="gdpr"]',
        '[id*="banner"]', '[class*="banner"]',
        '#onetrust-banner-sdk', '#cookiebanner',
        '.cc-window', '.cookie-notice', '.cookie-popup', '.cookie-bar',
        '#intercom-container', '.drift-widget-welcome-container',
      ];
      selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          el.style.setProperty('display', 'none', 'important');
        });
      });
    });

    // For canvas-based projects, wait for a specific DOM selector to signal render complete
    if (project.waitForCanvas) {
      // Wait for the controls div to have children — populated after star data loads
      await page.waitForFunction(
        (selector) => {
          const el = document.querySelector(selector);
          return el !== null && el.children.length > 0;
        },
        project.waitForCanvas,
        { timeout: 20000 }
      );
      // Small additional settle time after controls appear
      await sleep(500);
    }

    // Wait for CSS transitions and lazy-loaded images to settle
    await sleep(project.delay ?? DELAY_MS);

    await page.screenshot({
      path: outputPath,
      fullPage: false, // viewport-only (1400x875), not the full scrollable page
    });

    console.log(`  [DONE] saved → ${outputPath}`);
    return { id: project.id, status: 'ok' };
  } catch (err) {
    console.error(`  [FAIL] ${project.id} — ${err.message}`);
    return { id: project.id, status: 'error', error: err.message };
  } finally {
    await context.close();
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const onlyList = getOnlyList();

  let targets = projects;
  if (onlyList) {
    targets = projects.filter(p => onlyList.includes(p.id));
    const unknown = onlyList.filter(id => !projects.find(p => p.id === id));
    if (unknown.length) {
      console.warn(`Unknown project IDs in --only list: ${unknown.join(', ')}`);
    }
    if (targets.length === 0) {
      console.error('No matching projects found. Exiting.');
      process.exit(1);
    }
  }

  console.log(`\nScreenshotting ${targets.length} project(s) at ${VIEWPORT.width}x${VIEWPORT.height}...\n`);

  ensureOutputDir();
  ensurePlaywrightChromium();

  // Import playwright (must be installed as a dev dependency)
  let chromium;
  try {
    const pw = await import('playwright');
    chromium = pw.chromium;
  } catch {
    console.error(
      'Could not import playwright.\n' +
      'Install it first: yarn add -D playwright\n' +
      'Then run: yarn screenshot'
    );
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });

  const results = [];
  for (const project of targets) {
    const result = await screenshotProject(browser, project);
    results.push(result);
  }

  await browser.close();

  // Summary
  console.log('\n--- Summary ---');
  const ok      = results.filter(r => r.status === 'ok');
  const skipped = results.filter(r => r.status === 'skipped');
  const failed  = results.filter(r => r.status === 'error');

  if (ok.length)      console.log(`Saved:   ${ok.map(r => r.id).join(', ')}`);
  if (skipped.length) console.log(`Skipped: ${skipped.map(r => r.id).join(', ')}`);
  if (failed.length)  console.log(`Failed:  ${failed.map(r => `${r.id} (${r.error})`).join(', ')}`);

  // Regenerate image map
  console.log('\nRegenerating image map...');
  try {
    execFileSync('node', ['scripts/generate-image-map.mjs'], {
      stdio: 'inherit',
      cwd: ROOT,
    });
  } catch (err) {
    console.error('Failed to regenerate image map:', err.message);
  }

  console.log('\nDone.\n');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
