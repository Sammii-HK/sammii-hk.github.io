"use client";
import { useEffect, useState, type ReactNode } from "react";
import { EnvironmentProvider } from "../env/EnvironmentProvider";
import { Footer } from "../Footer";

/**
 * labs.sammii.dev chrome: the same environment as the homepage (design lens,
 * ambient layer, pointer + scroll) under a wordmark that routes back to the
 * main site. No lens nav here: Labs has one mode.
 */
export const LabsShell = ({ children }: { children: ReactNode }) => {
  // ?present=1: no bar, no footer, the chart alone on the ambient ground,
  // for recording clips (the project video lane and long-form B-roll).
  const [present, setPresent] = useState(false);
  // Labs is a real nav link: to / on labs.sammii.dev, to /labs/ on the main
  // site, so it never sends you across hosts unasked.
  const [labsHref, setLabsHref] = useState("/labs/");
  useEffect(() => {
    setPresent(new URLSearchParams(window.location.search).get("present") === "1");
    setLabsHref(window.location.host.startsWith("labs.") ? "/" : "/labs/");
  }, []);
  return (
    <EnvironmentProvider className="min-h-[100dvh] w-full flex flex-col" lens="design">
      <div aria-hidden="true" className="env-ambient" />
      {!present && (
        <>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <header className="labs-bar">
            <a className="labs-bar-mark" href="https://sammii.dev/">
              SAMMII
            </a>
            <a className="labs-bar-link" href={labsHref}>
              Labs
            </a>
          </header>
        </>
      )}
      <main id="main" className="flex-1" data-present={present ? "" : undefined}>
        {children}
      </main>
      {!present && <Footer />}
    </EnvironmentProvider>
  );
};
