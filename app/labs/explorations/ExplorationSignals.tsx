"use client";

import { useEffect } from 'react';
import { track } from '@vercel/analytics';
import { getExploration } from './registry';
import { explorationDestination, isExplorationAction } from './signals';

/** Bounded anonymous events through the site's existing analytics provider. */
export function ExplorationSignals({ slug }: { slug: string }) {
  useEffect(() => {
    if (!getExploration(slug)) return;
    const seen = new Set<string>();
    const record = (key: string, name: string, properties: Record<string, string>) => {
      if (seen.has(key)) return;
      seen.add(key);
      try { track(name, { slug, ...properties }); } catch { /* Analytics never blocks the experience. */ }
    };
    const receive = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || !event.data || event.data.slug !== slug) return;
      const frame = document.querySelector<HTMLIFrameElement>(`iframe[src^="/exploration-runtime/${slug}/"]`);
      if (!frame || event.source !== frame.contentWindow) return;
      if (event.data.type === 'exploration:ready') record('ready', 'Exploration ready', {});
      if (event.data.type === 'exploration:interaction' && isExplorationAction(event.data.action)) {
        record('interaction', 'Exploration interaction', { action: event.data.action });
      }
    };
    const click = (event: MouseEvent) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!link || !link.closest('.exploration-page, [data-exploration-slug]')) return;
      const scoped = link.closest<HTMLElement>('[data-exploration-slug]');
      if (scoped && scoped.dataset.explorationSlug !== slug) return;
      const destination = explorationDestination(link.href, window.location.href);
      if (destination) record(`onward:${destination}`, 'Exploration onward', { destination });
    };
    window.addEventListener('message', receive);
    document.addEventListener('click', click, true);
    return () => {
      window.removeEventListener('message', receive);
      document.removeEventListener('click', click, true);
    };
  }, [slug]);
  return null;
}
