import { Github, Linkedin, Mail } from "lucide-react";
import { GITHUB_URL_SAMMII, EMAIL, LINKEDIN_URL } from "../../constants";

export const Footer = () => {
  return (
    <footer className="w-full py-6 px-4 md:px-6 border-t border-white/10 mt-auto bg-black/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <a
            href={GITHUB_URL_SAMMII}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
            <span className="text-sm">GitHub</span>
          </a>
          <a
            href={LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
            <span className="text-sm">LinkedIn</span>
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
            aria-label="Email"
          >
            <Mail size={18} />
            <span className="text-sm hidden sm:inline">{EMAIL}</span>
            <span className="text-sm sm:hidden">Email</span>
          </a>
        </div>
        <div className="text-sm text-white/50">
          © {new Date().getFullYear()} Sammii
        </div>
      </div>
    </footer>
  );
};

