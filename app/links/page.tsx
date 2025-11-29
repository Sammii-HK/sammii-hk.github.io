"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { gradientCreator } from "../common/scripts/gradient-creator";

// SVG Icons for each platform
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
);

const BlueskyIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.757-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

// Link data configuration
interface LinkItem {
  name: string;
  url: string;
  icon: React.FC;
  personalOnly?: boolean;
}

const links: LinkItem[] = [
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
    url: "https://x.com/sammiihaylock",
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

  const filteredLinks = links.filter(
    (link) => !link.personalOnly || isPersonalMode
  );

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

      {/* Links Section */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {filteredLinks.map((link, index) => {
          const Icon = link.icon;
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Icon />
              <span className="font-medium">{link.name}</span>
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-xs text-black/40 dark:text-white/40">
        <a
          href="/"
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
