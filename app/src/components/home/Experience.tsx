import { Section } from "./Section";

// Roles as listed on Sammii's LinkedIn profile. Structural list only; Phase 2G designs it.
const ROLES = [
  { role: "Founder", org: "Lunar Computing, Inc", when: "Jan 2026 to present", note: "Lunary: design, engineering, AI orchestration and infrastructure, owned solo." },
  { role: "Founding Design Engineer", org: "Garden Computing", when: "Apr 2025 to Jun 2026", note: "Component library and design system from scratch: shared primitives, design tokens, a Radix-based headless layer." },
  { role: "Senior Front-end Engineer", org: "Bots (Bond Origination Technologies)", when: "Sep 2024 to Apr 2025", note: "Search and analytics layers, features from concept to launch." },
  { role: "Web Engineer", org: "ASOS.com", when: "May 2022 to Sep 2024", note: "Date-based seasonal theming system, site-wide accessibility, typography system in the shared component library." },
  { role: "Full Stack Engineer", org: "Rare: Group", when: "Mar 2020 to Apr 2022", note: "Atomic design system of reusable Vue components; UI for data-visualisation apps." },
  { role: "Software Engineer (immersive programme)", org: "General Assembly", when: "Mar 2019 to Jul 2019", note: "The move from design into engineering." },
  { role: "Graphic Designer", org: "SITA", when: "May 2018 to Mar 2019", note: "Print and digital design across exhibition, web, email and advertising." },
];

export const Experience = () => (
  <Section id="experience" title="Experience">
    <ol className="max-w-2xl px-1 divide-y divide-black/10 dark:divide-white/10">
      {ROLES.map((r) => (
        <li key={`${r.org}-${r.when}`} className="py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
            <span className="text-sm sm:text-base font-semibold text-black dark:text-white">
              {r.role}, {r.org}
            </span>
            <span className="text-xs text-black/50 dark:text-white/50">{r.when}</span>
          </div>
          <p className="font-inter text-xs sm:text-sm text-black/60 dark:text-white/60 mt-1">{r.note}</p>
        </li>
      ))}
    </ol>
  </Section>
);
