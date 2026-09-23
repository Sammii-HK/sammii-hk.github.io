import { SiteShell } from '../src/components/site/SiteShell';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell current="blog">{children}</SiteShell>;
}
