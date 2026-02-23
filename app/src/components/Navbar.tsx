import Link from "next/link";
import { gradientCreator } from "../../common/scripts/gradient-creator";

export const Navbar = ({xPc, yPc}: {xPc: number, yPc: number}) => {
  return (
    <nav className="bg-white/80 dark:bg-black z-10 w-full flex items-center justify-between px-6 py-4 backdrop-blur-sm">
      <div className="pt-3 logo" style={gradientCreator(xPc, yPc)} aria-label="logo svg" />
      <Link
        href="/blog"
        className="text-sm text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors"
      >
        Blog
      </Link>
    </nav>
  )
};
