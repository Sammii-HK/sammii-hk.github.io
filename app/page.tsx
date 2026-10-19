import { HomeShell, Hero, SelectedWork, LabsPortal, About, Experience, Contact } from "./src/components/home";

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
  name: 'Sammii Kellow',
  alternateName: 'Samantha Kellow',
  url: 'https://sammii.dev',
  jobTitle: 'AI Product Engineer & Design Engineer',
  description: 'AI product engineer and design engineer in London. Building AI-native products, design systems, autonomous AI pipelines and creative tools, and writing about design engineering, agents and consciousness.',
  sameAs: [
    'https://github.com/sammii-hk',
    'https://x.com/technicalyblond',
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
    <div className="relative bg-white dark:bg-black text-black dark:text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personLd }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteLd }} />
      <HomeShell>
        <Hero />
        <SelectedWork />
        <LabsPortal />
        <About />
        <Experience />
        <Contact />
      </HomeShell>
    </div>
  );
}
