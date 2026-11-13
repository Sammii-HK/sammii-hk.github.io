export const EXPLORATION_ACTIONS = ['control', 'adjust', 'select', 'inspect'] as const;
export type ExplorationAction = typeof EXPLORATION_ACTIONS[number];

export function isExplorationAction(value: unknown): value is ExplorationAction {
  return typeof value === 'string' && (EXPLORATION_ACTIONS as readonly string[]).includes(value);
}

/** Return an allowlisted label, never a URL, query, hash value or user-entered text. */
export function explorationDestination(href: string, base: string): string | null {
  let url: URL;
  try { url = new URL(href, base); } catch { return null; }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.hostname === 'sammii.dev') {
    if (url.pathname === '/' && url.hash === '#contact') return 'contact';
    if (/^\/work\/?$/.test(url.pathname)) return 'work';
    if (/^\/blog(?:\/|$)/.test(url.pathname)) return 'writing';
  }
  if (url.hostname === 'studio.sammii.dev') return 'contact';
  if ((url.hostname === 'labs.sammii.dev' || url.origin === new URL(base).origin) && /^\/(?:labs\/)?explorations\/[a-z0-9-]+\/$/.test(url.pathname)) return 'exploration';
  return null;
}
