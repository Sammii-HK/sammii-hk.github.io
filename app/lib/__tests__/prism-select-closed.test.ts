import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Select } from '../../src/components/prism/Select';

describe('closed topic selector', () => {
  it('removes a fading closed popup from pointer hit testing immediately', () => {
    // Opacity/visibility are animated. Pointer hit testing must not wait for
    // their transition, or a click on Clear filters can choose an old option.
    const html = renderToStaticMarkup(createElement(Select, {
      label: 'Topic', value: 'all', onChange: () => {},
      options: [{value:'all',label:'All topics'},{value:'worlds',label:'Worlds'}],
    }));
    const popup = html.match(/<ul[^>]+>/)?.[0];
    expect(popup).toContain('aria-hidden="true"');
    expect(popup).toContain('pointer-events:none');
  });
});
