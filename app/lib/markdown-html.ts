import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { toHtml } from 'hast-util-to-html';

/**
 * Markdown to HTML for machine readers: the RSS feed's full-text body and the
 * blog API. Deliberately plain (no syntax highlighting, no components) since
 * a feed reader or a GPT wants the words, not the styling.
 */
export async function markdownToHtml(md: string): Promise<string> {
  const mdast = unified().use(remarkParse).parse(md);
  const hast = await unified().use(remarkRehype).run(mdast);
  return toHtml(hast);
}
