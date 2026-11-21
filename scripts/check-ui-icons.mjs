import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from './lint-icons.mjs';

// These studies ship directly from public/experiments. The shared scanner
// excludes experiments under the app root, so scan their interfaces explicitly.
export function interfaceRoots(workspace = process.cwd()) {
  return ['.', 'public/experiments/why-this-take-won', 'public/experiments/teaching-a-computer-to-paint']
    .map(root => path.resolve(workspace, root));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let failed = 0;
  for (const root of interfaceRoots()) failed = Math.max(failed, main(['--root', root]));
  process.exitCode = failed;
}
