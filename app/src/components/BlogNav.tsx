import Link from 'next/link';
import { gradientCreator } from '../../common/scripts/gradient-creator';

interface Props {
  xPc: number;
  yPc: number;
}

export const BlogNav = ({ xPc, yPc }: Props) => {
  return (
    <nav
      className="sticky top-0 z-10 w-full flex items-center justify-between px-6 py-3 backdrop-blur-sm border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/70"
      aria-label="Site navigation"
    >
      <Link href="/" aria-label="Back to sammii.dev">
        <div className="pt-3 logo" style={gradientCreator(xPc, yPc)} aria-hidden="true" />
      </Link>
      <div className="flex items-center gap-6">
        <Link
          href="/blog"
          className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          Blog
        </Link>
        <Link
          href="/"
          className="text-sm text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
        >
          sammii.dev
        </Link>
      </div>
    </nav>
  );
};
