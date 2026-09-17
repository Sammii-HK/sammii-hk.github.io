/**
 * Experience (Phase 2G). Conventional professional credibility under the
 * narrative: roles as listed on her LinkedIn, one line each, newest first.
 * Typographic rows, tabular dates, no logos.
 */
const ROLES = [
  { role: "Founder", org: "Lunar Computing, Inc", from: "2026", to: "now", note: "Lunary: design, engineering, AI orchestration and infrastructure, owned solo." },
  { role: "Founding Design Engineer", org: "Garden Computing", from: "2025", to: "2026", note: "Component library and design system from scratch: shared primitives, design tokens, a Radix-based headless layer." },
  { role: "Senior Front-end Engineer", org: "Bots (Bond Origination Technologies)", from: "2024", to: "2025", note: "Search and analytics layers; features from concept to launch." },
  { role: "Web Engineer", org: "ASOS.com", from: "2022", to: "2024", note: "Date-based seasonal theming system, site-wide accessibility, the typography system in the shared component library." },
  { role: "Full Stack Engineer", org: "Rare: Group", from: "2020", to: "2022", note: "Atomic design system of reusable Vue components; UI for data-visualisation apps." },
  { role: "Software Engineer, immersive programme", org: "General Assembly", from: "2019", to: "2019", note: "The move from design into engineering." },
  { role: "Graphic Designer", org: "SITA", from: "2018", to: "2019", note: "Print and digital design across exhibition, web, email and advertising." },
];

export const Experience = () => (
  <section id="experience" aria-labelledby="experience-heading" className="experience">
    <h2 id="experience-heading" className="section-eyebrow">
      Experience
    </h2>
    <ol className="experience-list">
      {ROLES.map((r) => (
        <li key={`${r.org}-${r.from}`} className="experience-row">
          <span className="experience-when">
            <span>{r.from}</span>
            <span aria-hidden="true">–</span>
            <span>{r.to}</span>
          </span>
          <span className="experience-main">
            <span className="experience-role">{r.role}</span>
            <span className="experience-org">{r.org}</span>
            <span className="experience-note">{r.note}</span>
          </span>
        </li>
      ))}
    </ol>
  </section>
);
