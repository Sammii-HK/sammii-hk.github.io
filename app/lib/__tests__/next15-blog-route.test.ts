import { beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({ getPost: vi.fn() }));
vi.mock('../blog', () => ({ getPostBySlug: fixture.getPost, REVALIDATE: 600 }));
import { GET } from '../../api/blog/[slug]/route';

beforeEach(() => fixture.getPost.mockReset());

describe('public blog route with asynchronous Next params', () => {
  it('awaits and sanitises the slug while retaining the public body and cache headers', async () => {
    fixture.getPost.mockResolvedValue({ slug: 'public-fixture', title: 'Public test fixture', description: 'Synthetic unit fixture', date: '2026-11-20', tags: [], readingTime: '1 min read', content: 'Synthetic test body.', draft: false });
    const response = await GET(new Request('http://localhost/api/blog/public-fixture/'), { params: Promise.resolve({ slug: '../public-fixture' }) });
    expect(fixture.getPost).toHaveBeenCalledWith('public-fixture');
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('public, s-maxage=600, stale-while-revalidate=86400');
    expect(await response.json()).toMatchObject({ slug: 'public-fixture', markdown: 'Synthetic test body.', url: 'https://sammii.dev/blog/public-fixture/' });
  });

  it('still withholds drafts and never resolves an empty sanitised slug', async () => {
    fixture.getPost.mockResolvedValue({ slug: 'draft-fixture', draft: true, content: 'Unpublished fixture.' });
    const draft = await GET(new Request('http://localhost/api/blog/draft-fixture/'), { params: Promise.resolve({ slug: 'draft-fixture' }) });
    expect(draft.status).toBe(404);
    expect(await draft.json()).toEqual({ error: 'not found', slug: 'draft-fixture' });
    fixture.getPost.mockClear();
    const empty = await GET(new Request('http://localhost/api/blog/empty/'), { params: Promise.resolve({ slug: '../' }) });
    expect(empty.status).toBe(404);
    expect(fixture.getPost).not.toHaveBeenCalled();
  });
});
