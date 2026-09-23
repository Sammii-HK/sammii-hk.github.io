import type { MetadataRoute } from 'next';

/**
 * Everything public is crawlable, and the AI crawlers are named explicitly so
 * there is no doubt: a GPT, Claude or Perplexity answering a question about
 * this work should be able to read it rather than guess. Internal tools stay
 * out of the index.
 */
const AI_AGENTS = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Applebot-Extended'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/ops/', '/hero-lab/', '/api/revalidate'] },
      { userAgent: AI_AGENTS, allow: '/', disallow: ['/ops/', '/hero-lab/', '/api/revalidate'] },
    ],
    sitemap: 'https://sammii.dev/sitemap.xml',
    host: 'https://sammii.dev',
  };
}
