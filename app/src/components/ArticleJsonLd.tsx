interface Props {
  title: string;
  description: string;
  date: string;
  url: string;
  tags?: string[];
}

// Escapes characters that could break out of a <script> tag
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

// The same full name and url as the homepage's Person schema, so search
// engines tie every article to one person rather than a bare first name.
const AUTHOR = {
  '@type': 'Person',
  name: 'Sammii Kellow',
  url: 'https://sammii.dev',
} as const;

export const ArticleJsonLd = ({ title, description, date, url, tags }: Props) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    datePublished: date,
    url,
    author: AUTHOR,
    publisher: AUTHOR,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    ...(tags?.length ? { keywords: tags.join(', ') } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
};
