import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { GITHUB_URL_SAMMII, EMAIL, LINKEDIN_URL } from "../../constants";

export const Footer = () => {
  return (
    <footer 
      className="w-full py-2 sm:py-4 md:py-6 px-3 md:px-6 border-t border-black/10 dark:border-white/10 mt-auto bg-white/50 dark:bg-black/30 backdrop-blur-sm flex"
      role="contentinfo"
    >
      <div className="max-w-7xl mx-auto flex-row items-center justify-between gap-2 sm:gap-4 flex w-full">
        <nav aria-label="Social links" className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <a
            href={GITHUB_URL_SAMMII}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 sm:gap-2 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded"
          >
            <Github size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
            <span className="text-xs sm:text-sm hidden sm:inline">GitHub</span>
            <span className="sr-only">GitHub profile (opens in new tab)</span>
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 sm:gap-2 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded"
          >
            <Linkedin size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
            <span className="text-xs sm:text-sm hidden sm:inline">LinkedIn</span>
            <span className="sr-only">LinkedIn profile (opens in new tab)</span>
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-1.5 sm:gap-2 text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 rounded"
          >
            <Mail size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
            <span className="text-xs sm:text-sm hidden md:inline">{EMAIL}</span>
            <span className="sr-only">Send email to {EMAIL}</span>
          </a>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/blog"
            className="text-xs sm:text-sm text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors"
          >
            Blog
          </Link>
          <span className="text-xs sm:text-sm text-black/50 dark:text-white/50 whitespace-nowrap">
            © {new Date().getFullYear()} Sammii
          </span>
        </div>
      </div>
    </footer>
  );
};
