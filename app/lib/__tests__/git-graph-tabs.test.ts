import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GitGraph } from '../../src/components/charts/GitGraph';
describe('Git command navigation',()=>{
  it('provides one tab stop and a labelled panel connected to the selected command',()=>{
    const html=renderToStaticMarkup(createElement(GitGraph));
    const tabs=html.match(/<button[^>]+role="tab"[^>]+>/g) ?? [];
    expect(tabs.length).toBeGreaterThan(1);
    expect(tabs.filter(tab=>tab.includes('tabindex="0"'))).toHaveLength(1);
    expect(tabs.filter(tab=>tab.includes('aria-selected="true"'))).toHaveLength(1);
    const panel=html.match(/<div[^>]+role="tabpanel"[^>]+>/)?.[0] ?? '';
    const selected=tabs.find(tab=>tab.includes('aria-selected="true"')) ?? '';
    const panelId=panel.match(/ id="([^"]+)"/)?.[1];
    const tabId=selected.match(/ id="([^"]+)"/)?.[1];
    expect(selected).toContain(`aria-controls="${panelId}"`);
    expect(panel).toContain(`aria-labelledby="${tabId}"`);
  });
});
