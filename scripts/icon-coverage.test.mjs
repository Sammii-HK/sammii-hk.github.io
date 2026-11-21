import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { interfaceRoots } from './check-ui-icons.mjs';
import { scanProject } from './lint-icons.mjs';

test('normal interface roots catch violations in both directly served studies as well as the app', () => {
  // Keep the disposable fixture in the system temp directory. No user files or
  // shipped studies are changed to demonstrate the previously missed folders.
  const root = mkdtempSync(path.join(tmpdir(), 'portfolio-icon-coverage-'));
  for (const directory of ['app', 'public/experiments/why-this-take-won', 'public/experiments/teaching-a-computer-to-paint']) {
    mkdirSync(path.join(root, directory), { recursive: true });
    writeFileSync(path.join(root, directory, 'index.html'), '<button aria-label="Next">→</button>');
  }
  const blocking = project => project.findings.filter(finding => finding.rule !== 'symbol-review');
  assert.equal(blocking(scanProject(root)).length, 1, 'the app-root scan alone excludes embedded experiments');
  const covered = interfaceRoots(root).flatMap(directory => blocking(scanProject(directory)));
  assert.equal(covered.length, 3, 'each of the three shipped interfaces must be scanned');
});
