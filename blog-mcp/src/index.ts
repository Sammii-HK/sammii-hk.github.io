import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { z } from 'zod';
import { execSync } from 'child_process';

// Path to the content/blog directory relative to the repo root
const BLOG_DIR = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '../../content/blog',
);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function listPosts(includeDrafts = true) {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(BLOG_DIR, f), 'utf-8');
      const { data } = matter(raw);
      return {
        slug,
        title: data.title ?? slug,
        date: data.date ?? null,
        draft: data.draft ?? false,
        tags: data.tags ?? [],
        description: data.description ?? '',
      };
    })
    .filter((p) => includeDrafts || !p.draft)
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

const server = new Server(
  { name: 'blog-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'list_posts',
      description: 'List all blog posts (including drafts)',
      inputSchema: {
        type: 'object',
        properties: {
          includeDrafts: {
            type: 'boolean',
            description: 'Include draft posts (default: true)',
          },
        },
      },
    },
    {
      name: 'get_post',
      description: 'Get the full content of a blog post by slug',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Post slug' },
        },
        required: ['slug'],
      },
    },
    {
      name: 'create_post',
      description: 'Create a new blog post as a draft',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Post title' },
          description: { type: 'string', description: 'Short description / meta description' },
          content: { type: 'string', description: 'Post body in Markdown' },
          tags: {
            type: 'array',
            items: { type: 'string' },
            description: 'Tags for the post',
          },
          date: {
            type: 'string',
            description: 'Publish date (YYYY-MM-DD). Defaults to today.',
          },
          draft: {
            type: 'boolean',
            description: 'Whether to save as draft (default: true)',
          },
          slug: {
            type: 'string',
            description: 'Custom slug. Auto-generated from title if omitted.',
          },
        },
        required: ['title', 'content'],
      },
    },
    {
      name: 'update_post',
      description: 'Update an existing blog post',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Post slug to update' },
          title: { type: 'string' },
          description: { type: 'string' },
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          date: { type: 'string' },
          draft: { type: 'boolean' },
        },
        required: ['slug'],
      },
    },
    {
      name: 'publish_post',
      description:
        'Mark a post as published (draft: false), commit it, push to GitHub, and optionally schedule a Spellcast social post',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string', description: 'Post slug to publish' },
          spellcast: {
            type: 'object',
            description: 'Optional: schedule a Spellcast social post on publish',
            properties: {
              content: {
                type: 'string',
                description: 'Social post copy. Defaults to post title + URL.',
              },
              scheduledDate: {
                type: 'string',
                description: 'ISO date string for when to publish the social post',
              },
              platforms: {
                type: 'array',
                items: { type: 'string' },
                description: 'Platforms to post to (e.g. ["twitter", "linkedin"])',
              },
            },
            required: ['scheduledDate'],
          },
        },
        required: ['slug'],
      },
    },
    {
      name: 'delete_post',
      description: 'Delete a blog post by slug',
      inputSchema: {
        type: 'object',
        properties: {
          slug: { type: 'string' },
        },
        required: ['slug'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'list_posts': {
        const { includeDrafts = true } = (args ?? {}) as { includeDrafts?: boolean };
        const posts = listPosts(includeDrafts);
        return { content: [{ type: 'text', text: JSON.stringify(posts, null, 2) }] };
      }

      case 'get_post': {
        const { slug } = z.object({ slug: z.string() }).parse(args);
        const filePath = path.join(BLOG_DIR, `${slug}.md`);
        if (!fs.existsSync(filePath)) {
          return { content: [{ type: 'text', text: `Post "${slug}" not found` }], isError: true };
        }
        return { content: [{ type: 'text', text: fs.readFileSync(filePath, 'utf-8') }] };
      }

      case 'create_post': {
        const parsed = z
          .object({
            title: z.string(),
            description: z.string().optional(),
            content: z.string(),
            tags: z.array(z.string()).optional(),
            date: z.string().optional(),
            draft: z.boolean().optional(),
            slug: z.string().optional(),
          })
          .parse(args);

        const slug = parsed.slug ?? slugify(parsed.title);
        const date = parsed.date ?? new Date().toISOString().split('T')[0];
        const draft = parsed.draft ?? true;

        const filePath = path.join(BLOG_DIR, `${slug}.md`);
        if (fs.existsSync(filePath)) {
          return {
            content: [{ type: 'text', text: `Post "${slug}" already exists. Use update_post.` }],
            isError: true,
          };
        }

        const frontmatter = matter.stringify(parsed.content, {
          title: parsed.title,
          description: parsed.description ?? '',
          date,
          tags: parsed.tags ?? [],
          draft,
        });

        fs.mkdirSync(BLOG_DIR, { recursive: true });
        fs.writeFileSync(filePath, frontmatter, 'utf-8');

        return {
          content: [{ type: 'text', text: `Created ${draft ? 'draft' : 'post'}: ${slug}` }],
        };
      }

      case 'update_post': {
        const parsed = z
          .object({
            slug: z.string(),
            title: z.string().optional(),
            description: z.string().optional(),
            content: z.string().optional(),
            tags: z.array(z.string()).optional(),
            date: z.string().optional(),
            draft: z.boolean().optional(),
          })
          .parse(args);

        const filePath = path.join(BLOG_DIR, `${parsed.slug}.md`);
        if (!fs.existsSync(filePath)) {
          return {
            content: [{ type: 'text', text: `Post "${parsed.slug}" not found` }],
            isError: true,
          };
        }

        const raw = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(raw);

        const newData = {
          ...data,
          ...(parsed.title !== undefined && { title: parsed.title }),
          ...(parsed.description !== undefined && { description: parsed.description }),
          ...(parsed.tags !== undefined && { tags: parsed.tags }),
          ...(parsed.date !== undefined && { date: parsed.date }),
          ...(parsed.draft !== undefined && { draft: parsed.draft }),
        };
        const newContent = parsed.content ?? content;

        fs.writeFileSync(filePath, matter.stringify(newContent, newData), 'utf-8');
        return { content: [{ type: 'text', text: `Updated post: ${parsed.slug}` }] };
      }

      case 'publish_post': {
        const parsed = z
          .object({
            slug: z.string(),
            spellcast: z
              .object({
                content: z.string().optional(),
                scheduledDate: z.string(),
                platforms: z.array(z.string()).optional(),
              })
              .optional(),
          })
          .parse(args);

        const filePath = path.join(BLOG_DIR, `${parsed.slug}.md`);
        if (!fs.existsSync(filePath)) {
          return {
            content: [{ type: 'text', text: `Post "${parsed.slug}" not found` }],
            isError: true,
          };
        }

        // Mark as published
        const raw = fs.readFileSync(filePath, 'utf-8');
        const { data, content } = matter(raw);
        fs.writeFileSync(
          filePath,
          matter.stringify(content, { ...data, draft: false }),
          'utf-8',
        );

        // Commit and push
        const repoRoot = path.join(BLOG_DIR, '../..');
        execSync(`git -C "${repoRoot}" add content/blog/${parsed.slug}.md`, { stdio: 'pipe' });
        execSync(
          `git -C "${repoRoot}" commit -m "Publish post: ${data.title ?? parsed.slug}"`,
          { stdio: 'pipe' },
        );
        execSync(`git -C "${repoRoot}" push origin main`, { stdio: 'pipe' });

        const messages = [`Published and pushed: ${parsed.slug}`];

        // Optionally schedule Spellcast post
        if (parsed.spellcast) {
          const spellcastResult = await scheduleSpellcastPost({
            slug: parsed.slug,
            title: data.title ?? parsed.slug,
            ...parsed.spellcast,
          });
          messages.push(spellcastResult);
        }

        return { content: [{ type: 'text', text: messages.join('\n') }] };
      }

      case 'delete_post': {
        const { slug } = z.object({ slug: z.string() }).parse(args);
        const filePath = path.join(BLOG_DIR, `${slug}.md`);
        if (!fs.existsSync(filePath)) {
          return { content: [{ type: 'text', text: `Post "${slug}" not found` }], isError: true };
        }
        fs.unlinkSync(filePath);
        return { content: [{ type: 'text', text: `Deleted post: ${slug}` }] };
      }

      default:
        return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    }
  } catch (err) {
    return {
      content: [{ type: 'text', text: err instanceof Error ? err.message : String(err) }],
      isError: true,
    };
  }
});

async function scheduleSpellcastPost(params: {
  slug: string;
  title: string;
  content?: string;
  scheduledDate: string;
  platforms?: string[];
}): Promise<string> {
  const apiUrl = process.env.SPELLCAST_API_URL;
  const apiKey = process.env.SPELLCAST_API_KEY;
  const accountSetId = process.env.SPELLCAST_ACCOUNT_SET_ID;
  const siteUrl = process.env.SITE_URL ?? 'https://sammii-hk.github.io';

  if (!apiUrl || !apiKey || !accountSetId) {
    return 'Spellcast not configured (missing SPELLCAST_API_URL, SPELLCAST_API_KEY, or SPELLCAST_ACCOUNT_SET_ID) — skipping social post';
  }

  const postUrl = `${siteUrl}/blog/${params.slug}`;
  const socialContent = params.content ?? `${params.title}\n\n${postUrl}`;

  try {
    const createRes = await fetch(`${apiUrl}/api/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        content: socialContent,
        scheduledFor: params.scheduledDate,
        accountSetId,
        postType: 'post',
      }),
    });

    if (!createRes.ok) {
      return `Spellcast create failed (${createRes.status}): ${await createRes.text()}`;
    }

    const draft = await createRes.json();

    const scheduleRes = await fetch(`${apiUrl}/api/posts/${draft.id}/schedule`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!scheduleRes.ok) {
      return `Spellcast schedule failed (${scheduleRes.status}): ${await scheduleRes.text()}`;
    }

    return `Spellcast social post scheduled for ${params.scheduledDate}`;
  } catch (err) {
    return `Spellcast error: ${err instanceof Error ? err.message : String(err)}`;
  }
}

const transport = new StdioServerTransport();
await server.connect(transport);
