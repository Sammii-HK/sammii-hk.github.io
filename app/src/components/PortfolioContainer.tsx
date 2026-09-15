"use client";
import { Navbar } from "./Navbar";
import { ProjectGrid } from "./project/ProjectGrid";
import { Footer } from "./Footer";
import { CursorFollower } from "./env/CursorFollower";
import { EnvironmentProvider } from "./env/EnvironmentProvider";

// Layout is unchanged from before the environment refactor: a viewport-high
// grid with the project gallery scrolling inside it. Phase 2C replaces this
// with a normally scrolling document.
export const PortfolioContainer = () => {
  return (
    <EnvironmentProvider className="h-[100dvh] w-full grid grid-rows-[auto_1fr_auto]">
      <CursorFollower />
      <Navbar />

      <main className="overflow-hidden min-h-0">
        <ProjectGrid />
      </main>

      <Footer />
    </EnvironmentProvider>
  );
};
