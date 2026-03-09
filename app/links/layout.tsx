import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Links — sammii.dev',
  description: 'Find Sammii on GitHub, LinkedIn, X, Bluesky, Instagram and TikTok.',
  openGraph: {
    title: 'Links — sammii.dev',
    description: 'Find Sammii on GitHub, LinkedIn, X, Bluesky, Instagram and TikTok.',
    type: 'website',
    url: 'https://sammii.dev/links',
  },
  twitter: {
    card: 'summary',
    title: 'Links — sammii.dev',
    description: 'Find Sammii on GitHub, LinkedIn, X, Bluesky, Instagram and TikTok.',
    creator: '@sammiihk',
  },
};

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
