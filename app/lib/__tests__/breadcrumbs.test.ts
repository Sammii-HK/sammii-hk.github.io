import { describe, it, expect } from 'vitest';
import { routeBreadcrumbs } from '../../src/components/site/breadcrumb-model';

describe('shared navigation hierarchy', () => {
  it('uses published chart titles and a real charts collection route', () => {
    const crumbs = routeBreadcrumbs('/labs/charts/big-o/', true);
    expect(crumbs.map(c => c.label)).toEqual(['Home', 'Labs', 'Charts', 'Big O, in the keystroke']);
    expect(crumbs[2].href).toBe('https://labs.sammii.dev/charts/');
    expect(crumbs.at(-1)?.href).toBeUndefined();
  });
  it('works with both the public Labs host and the local route prefix', () => {
    expect(routeBreadcrumbs('/charts/big-o/', true)).toEqual(routeBreadcrumbs('/labs/charts/big-o/', true));
    expect(routeBreadcrumbs('/explorations/plate-tectonics/', true).at(-1)?.label).toBe('A planet reshaping itself');
  });
  it('keeps writing and project parents consistent', () => {
    expect(routeBreadcrumbs('/blog/')[1]).toEqual({label:'Writing',href:undefined});
    expect(routeBreadcrumbs('/projects/prism/')[1]).toEqual({label:'Work',href:'https://sammii.dev/work/'});
  });
});
