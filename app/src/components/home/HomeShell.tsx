"use client";
import type { ReactNode } from "react";
import { EnvironmentProvider } from "../env/EnvironmentProvider";
import { LensProvider, useLens } from "../lens/LensProvider";
import { LensNav } from "../lens/LensNav";

/**
 * Homepage chrome. The document owns vertical scrolling (Phase 2C); the lens
 * state (Phase 2D) wraps everything so the hero, the condensed nav and, from
 * 2E, Selected Work read one committed lens. data-lens on the environment
 * root reflects that lens; no CSS reacts to it yet. The old logo navbar is
 * gone from the homepage: the condensed lens nav carries the wordmark, and
 * Contact is the footer (the shared Footer repeated its links, so it is not
 * rendered here).
 */
export const HomeShell = ({ children }: { children: ReactNode }) => (
  <LensProvider>
    <Chrome>{children}</Chrome>
  </LensProvider>
);

const Chrome = ({ children }: { children: ReactNode }) => {
  const { committed } = useLens();
  return (
    <EnvironmentProvider className="min-h-[100dvh] w-full flex flex-col" lens={committed}>
      <div aria-hidden="true" className="env-ambient" />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <LensNav />
      <main id="main" className="flex-1">
        {children}
      </main>
    </EnvironmentProvider>
  );
};
