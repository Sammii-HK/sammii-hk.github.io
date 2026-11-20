"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, Linkedin, Github, AtSign, Cloud, Instagram, Music2, Moon, ArrowRight } from "lucide-react";
import { personaHubs } from "../common/data/persona-hubs";
import { gradientCreator } from "../common/scripts/gradient-creator";

// SVG Icons for each platform
const LinkedInIcon = () => (
  <Linkedin   className="w-5 h-5" />
);

const GitHubIcon = () => (
  <Github   className="w-5 h-5" />
);

const XIcon = () => (
  <AtSign   className="w-5 h-5" />
);

const BlueskyIcon = () => (
  <Cloud   className="w-5 h-5" />
);

const InstagramIcon = () => (
  <Instagram   className="w-5 h-5" />
);

const TikTokIcon = () => (
  <Music2   className="w-5 h-5" />
);

// Link data configuration
interface LinkItem {
  name: string;
  url: string;
  icon?: React.FC;
  personalOnly?: boolean;
  businessOnly?: boolean;
}

const LunaryIcon = () => (
  <Moon   className="w-5 h-5" />
);

const links: LinkItem[] = [
  {
    name: "Lunar Computing",
    url: "https://lunarcomputing.org",
  },
  {
    name: "Lunary",
    url: "https://lunary.app",
    icon: LunaryIcon,
    businessOnly: true,
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/sammii",
    icon: LinkedInIcon,
  },
  {
    name: "GitHub",
    url: "https://github.com/sammii-hk",
    icon: GitHubIcon,
  },
  {
    name: "X / Twitter",
    url: "https://x.com/technicalyblond",
    icon: XIcon,
  },
  {
    name: "Bluesky",
    url: "https://bsky.app/profile/sammiisparkle.bsky.social",
    icon: BlueskyIcon,
  },
  {
    name: "Instagram",
    url: "https://instagram.com/sammiisparkle",
    icon: InstagramIcon,
    personalOnly: true,
  },
  {
    name: "TikTok",
    url: "https://tiktok.com/@sammiisparkle",
    icon: TikTokIcon,
    personalOnly: true,
  },
];

function LinksContent() {
  const searchParams = useSearchParams();
  const isPersonalMode = searchParams.get("mode") === "personal";

  const [xPc, setXPc] = useState(30);
  const [yPc, setYPc] = useState(70);

  const targetXPcRef = useRef(30);
  const targetYPcRef = useRef(70);
  const currentXPcRef = useRef(30);
  const currentYPcRef = useRef(70);
  const animationRef = useRef<number | null>(null);

  const lerp = (current: number, target: number, factor: number): number => {
    return current + (target - current) * factor;
  };

  useEffect(() => {
    const animate = () => {
      const factor = 0.15;

      currentXPcRef.current = lerp(
        currentXPcRef.current,
        targetXPcRef.current,
        factor
      );
      currentYPcRef.current = lerp(
        currentYPcRef.current,
        targetYPcRef.current,
        factor
      );

      setXPc(currentXPcRef.current);
      setYPc(currentYPcRef.current);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    targetYPcRef.current = (e.clientY / viewportHeight) * 100;
    targetXPcRef.current = ((e.clientX * 2) / viewportWidth) * 100;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      targetYPcRef.current = (touch.clientY / viewportHeight) * 100;
      targetXPcRef.current = ((touch.clientX * 2) / viewportWidth) * 100;
    }
  };

  const filteredLinks = links.filter((link) => {
    if (link.businessOnly && isPersonalMode) return false;
    if (link.personalOnly && !isPersonalMode) return false;
    return true;
  });
  const hubLinks = isPersonalMode ? personaHubs : [];

  return (
    <main
      className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12 bg-white dark:bg-black text-black dark:text-white transition-colors"
      onPointerMove={handlePointerMove}
      onTouchMove={handleTouchMove}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-10">
        <div
          className="logo w-32 h-32 mb-6"
          style={{
            ...gradientCreator(xPc, yPc),
            maskSize: "128px",
            WebkitMaskSize: "128px",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
          aria-label="Sammii profile image"
        />
      </div>

      {/* Persona hubs */}
      {hubLinks.length > 0 && (
      <div className="w-full max-w-md mb-8">
        <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-[0.12em] text-black/45 dark:text-white/45">
          <span>Persona hubs</span>
          <span>{hubLinks.length} hubs</span>
        </div>
        <div className="grid gap-2">
          {hubLinks.map((hub, index) => (
            <a
              key={hub.slug}
              href={`/${hub.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-16 min-w-0 w-full items-center justify-between gap-4 rounded-lg border border-black/10 bg-white/60 px-4 py-3 text-left backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.01] hover:border-black/25 hover:bg-black hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:bg-white/5 dark:hover:border-white/30 dark:hover:bg-white dark:hover:text-black dark:focus-visible:ring-white dark:focus-visible:ring-offset-black"
              style={{
                animationDelay: `${index * 40}ms`,
              }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-black/10 text-sm font-semibold dark:border-white/10">
                  {hub.label.slice(0, 2)}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {hub.label}
                  </span>
                  <span className="block truncate text-xs text-black/50 group-hover:text-white/70 dark:text-white/45 dark:group-hover:text-black/55">
                    {hub.products.length} products
                  </span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 shrink-0 opacity-55 transition group-hover:opacity-100" />
            </a>
          ))}
        </div>
      </div>
      )}

      {/* Links Section - Lunary + Founder + Socials */}
      <div className="w-full max-w-md flex flex-col gap-3">
        {filteredLinks.map((link, index) => {
          const Icon = link.icon;
          const isLunary = link.name === "Lunary";
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex items-center justify-center gap-3 w-full rounded-xl transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                isLunary
                  ? "py-4 px-6 border border-purple-400/30 dark:border-purple-500/30 bg-gradient-to-r from-purple-50/80 to-purple-100/50 dark:from-purple-950/40 dark:to-purple-900/40 backdrop-blur-sm hover:from-purple-900 hover:to-purple-800 hover:text-white dark:hover:from-purple-100 dark:hover:to-purple-200 dark:hover:text-black hover:scale-[1.03] hover:shadow-lg font-semibold focus-visible:ring-purple-600 dark:focus-visible:ring-purple-400 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
                  : "py-3.5 px-6 border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:scale-[1.02] hover:shadow-lg font-medium focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
              }`}
              style={{
                animationDelay: `${isLunary ? "0ms" : index * 50}ms`,
              }}
            >
              {Icon && <Icon />}
              <span>{link.name}</span>
            </a>
          );
        })}

        {/* Founder Page - appears after Lunary */}
        {filteredLinks.some(link => link.name === "Lunary") && (
          <a
            href="/founder"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-3 w-full py-4 px-6 rounded-xl border border-emerald-400/30 dark:border-emerald-500/30 bg-gradient-to-r from-emerald-50/80 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/40 backdrop-blur-sm hover:from-emerald-900 hover:to-emerald-800 hover:text-white dark:hover:from-emerald-100 dark:hover:to-emerald-200 dark:hover:text-black transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black font-semibold"
            style={{
              animationDelay: `${50}ms`,
            }}
          >
            <span>Founder Story & Fundraising</span>
            <ArrowRight   stroke="currentColor" strokeWidth="2" className="w-4 h-4" />
          </a>
        )}

        {/* Portfolio - appears last */}
        <a
          href="https://sammii.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:scale-[1.02] hover:shadow-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-white dark:focus-visible:ring-offset-black transition-all duration-300 ease-out"
          style={{
            animationDelay: `${150}ms`,
          }}
        >
          Portfolio
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-xs text-black/40 dark:text-white/40">
        <a
          href="https://sammii.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-black dark:hover:text-white transition-colors"
        >
          sammii.dev
        </a>
      </footer>
    </main>
  );
}

export default function LinksPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[100dvh] flex items-center justify-center bg-white dark:bg-black">
          <div className="animate-pulse text-black/40 dark:text-white/40">
            Loading...
          </div>
        </main>
      }
    >
      <LinksContent />
    </Suspense>
  );
}
