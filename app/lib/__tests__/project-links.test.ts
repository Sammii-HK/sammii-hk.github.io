import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ProjectItem } from '../../src/components/project/ProjectItem';

const project = {id:'moth',title:'Moth',techStack:'TypeScript',info:'A growing world.',liveUrl:'https://moth.sammii.dev'};
describe('project card link names', () => {
  it('names outbound controls when their visible labels collapse on a phone', () => {
    const html = renderToStaticMarkup(createElement(ProjectItem,{project,index:99}));
    expect(html).toContain('aria-label="Open Moth (opens in a new tab)"');
    expect(html).toContain('aria-label="View code for Moth (opens in a new tab)"');
    const icons = html.match(/<svg[^>]+>/g) ?? [];
    expect(icons.length).toBeGreaterThan(0);
    expect(icons.every(icon => icon.includes('aria-hidden="true"'))).toBe(true);
  });
  it('names the private-source action without exposing a repository link', () => {
    const html = renderToStaticMarkup(createElement(ProjectItem,{project:{...project,privateRepo:true},index:99}));
    expect(html).toContain('aria-label="Request code access for Moth"');
    expect(html).not.toContain('aria-label="View code for Moth');
  });
});
