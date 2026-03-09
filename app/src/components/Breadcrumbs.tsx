import Link from 'next/link';

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  crumbs: Crumb[];
}

// Escapes characters that could break out of a <script> tag
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

export const Breadcrumbs = ({ crumbs }: Props) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.label,
      ...(crumb.href ? { item: `https://sammii.dev${crumb.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
      />
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
        {crumbs.map((crumb, i) => (
          <span key={crumb.href ?? crumb.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true" className="text-neutral-700">/</span>}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-neutral-400 truncate max-w-[220px] sm:max-w-xs" title={crumb.label}>
                {crumb.label.length > 45 ? crumb.label.slice(0, 45) + '…' : crumb.label}
              </span>
            )}
          </span>
        ))}
      </nav>
    </>
  );
};
