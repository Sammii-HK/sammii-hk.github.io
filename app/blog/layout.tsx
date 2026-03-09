import { BlogPageWrapper } from '../src/components/BlogPageWrapper';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <BlogPageWrapper>{children}</BlogPageWrapper>;
}
