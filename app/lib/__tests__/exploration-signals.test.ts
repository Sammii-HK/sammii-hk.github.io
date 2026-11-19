import { describe, expect, it } from 'vitest';
import { explorationDestination, isExplorationAction } from '../../labs/explorations/signals';

describe('bounded exploration measurement', () => {
  const base = 'https://labs.sammii.dev/explorations/black-hole-light-paths/';
  it('accepts only four anonymous interaction categories', () => {
    for (const action of ['control', 'adjust', 'select', 'inspect']) expect(isExplorationAction(action)).toBe(true);
    for (const action of ['', 'typed private text', { action: 'control' }, 1, null]) expect(isExplorationAction(action)).toBe(false);
  });
  it('measures allowed destinations without forwarding URL parameters or contact details', () => {
    expect(explorationDestination('https://sammii.dev/work/?private=value', base)).toBe('work');
    expect(explorationDestination('https://sammii.dev/#contact', base)).toBe('contact');
    expect(explorationDestination('https://sammii.dev/blog/where-light-can-go/', base)).toBe('writing');
    expect(explorationDestination('../double-slit-experiment/', base)).toBe('exploration');
    expect(explorationDestination('mailto:person@example.com', base)).toBeNull();
    expect(explorationDestination('https://example.com/?query=private', base)).toBeNull();
    expect(explorationDestination('https://sammii.dev.attacker.example/work/', base)).toBeNull();
  });
});
