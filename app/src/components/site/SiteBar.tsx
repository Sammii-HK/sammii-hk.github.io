"use client";
import { useEffect, useState } from "react";

export type SitePage = "work" | "blog" | "labs";

/**
 * The one navigation bar for every page below the homepage: blog, work, case
 * studies and Labs. It is the homepage's condensed lens nav in every visible
 * respect (same wordmark, type, glass and underline), always shown because
 * there is no hero to scroll past, with the site's sections in place of the
 * lenses. Labs resolves per host so it never moves you across hosts unasked;
 * Work and Blog live on sammii.dev, so from Labs they are absolute.
 */
export function SiteBar({ current }: { current?: SitePage }) {
  const [onLabsHost, setOnLabsHost] = useState(false);
  useEffect(() => { setOnLabsHost(window.location.host.startsWith("labs.")); }, []);
  const main = onLabsHost ? "https://sammii.dev" : "";
  const links: { page: SitePage; label: string; href: string }[] = [
    { page: "work", label: "Work", href: `${main}/work/` },
    { page: "blog", label: "Blog", href: `${main}/blog/` },
    { page: "labs", label: "Labs", href: onLabsHost ? "/" : "/labs/" },
  ];
  return (
    <nav className="lens-nav site-bar" aria-label="Site" data-shown="">
      <a href={`${main}/`} className="lens-nav-wordmark">SAMMII</a>
      <div className="lens-nav-lenses site-bar-links">
        {links.map((l) => (
          <a
            key={l.page}
            href={l.href}
            className="lens-phrase lens-nav-phrase"
            data-state={current === l.page ? "committed" : "idle"}
            aria-current={current === l.page ? "page" : undefined}
          >
            {l.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
