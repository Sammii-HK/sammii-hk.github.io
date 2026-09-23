"use client";
import type { ReactNode } from "react";
import { EnvironmentProvider } from "../env/EnvironmentProvider";
import { Footer } from "../Footer";
import { SiteBar, type SitePage } from "./SiteBar";

/**
 * Chrome for every page below the homepage, so the site is one experience:
 * the same ambient environment as the homepage and Labs, the one SiteBar, and
 * the one footer. Replaces the legacy logo navbar and its separate gradient.
 */
export function SiteShell({ current, children }: { current?: SitePage; children: ReactNode }) {
  return (
    <EnvironmentProvider className="min-h-[100dvh] w-full flex flex-col" lens="design">
      <div aria-hidden="true" className="env-ambient" />
      <a href="#main" className="skip-link">Skip to content</a>
      <SiteBar current={current} />
      <div className="flex-1">{children}</div>
      <Footer />
    </EnvironmentProvider>
  );
}
