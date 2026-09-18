"use client";
import type { ReactNode } from "react";
import { EnvironmentProvider } from "../env/EnvironmentProvider";
import { Footer } from "../Footer";

/**
 * labs.sammii.dev chrome: the same environment as the homepage (design lens,
 * ambient layer, pointer + scroll) under a wordmark that routes back to the
 * main site. No lens nav here: Labs has one mode.
 */
export const LabsShell = ({ children }: { children: ReactNode }) => (
  <EnvironmentProvider className="min-h-[100dvh] w-full flex flex-col" lens="design">
    <div aria-hidden="true" className="env-ambient" />
    <a href="#main" className="skip-link">
      Skip to content
    </a>
    <header className="labs-bar">
      <a className="labs-bar-mark" href="https://sammii.dev/">
        SAMMII
      </a>
      <span className="labs-bar-here" aria-current="page">
        Labs
      </span>
    </header>
    <main id="main" className="flex-1">
      {children}
    </main>
    <Footer />
  </EnvironmentProvider>
);
