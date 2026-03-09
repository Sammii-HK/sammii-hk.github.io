import { PortfolioContainer } from "./src/components/PortfolioContainer";

// safeJsonLd escapes </> and & so they cannot break out of a <script> tag
function safeJsonLd(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Sammii',
  url: 'https://sammii.dev',
  jobTitle: 'Design Engineer',
  description: 'Design engineer and full-stack builder. Building products, autonomous AI pipelines, and creative tools.',
  sameAs: [
    'https://github.com/sammii-hk',
    'https://x.com/sammiihk',
    'https://www.linkedin.com/in/sammii',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'sammii.dev',
  url: 'https://sammii.dev',
  description: 'Design engineer and full-stack builder. Building products, autonomous AI pipelines, and creative tools.',
};

export default function Home() {
  const personLd = safeJsonLd(personSchema);
  const websiteLd = safeJsonLd(websiteSchema);
  return (
    <main className="flex flex-col items-center relative overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteLd }} />
      <PortfolioContainer />
    </main>
  );
}
