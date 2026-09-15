"use client";
import type { ReactNode } from "react";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import { CursorFollower } from "../env/CursorFollower";
import { EnvironmentProvider } from "../env/EnvironmentProvider";

/**
 * Homepage chrome. Since Phase 2C the document owns vertical scrolling: the
 * provider's root is a min-height column, not a viewport-locked grid, and the
 * scroll wave reads window scroll. Sections are passed in as server-rendered
 * children so this client boundary stays thin.
 */
export const HomeShell = ({ children }: { children: ReactNode }) => {
  return (
    <EnvironmentProvider className="min-h-[100dvh] w-full flex flex-col">
      <div aria-hidden="true" className="env-ambient" />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <CursorFollower />
      <Navbar />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </EnvironmentProvider>
  );
};
