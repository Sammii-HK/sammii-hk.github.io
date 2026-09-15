import { Section } from "./Section";

/**
 * Temporary about copy, reused from Sammii's own LinkedIn summary with em
 * dashes removed and the Garden Computing tense corrected. Phase 2G writes
 * the designed career narrative.
 */
export const About = () => (
  <Section id="about" title="About">
    <div className="font-inter text-sm sm:text-base text-black/70 dark:text-white/70 leading-relaxed max-w-2xl px-1 space-y-4">
      <p>
        I build AI-native products end to end. The agent systems and LLM tooling underneath, and the interface that makes
        them usable. Most engineers pick one side; I do both, and the interesting work lives in the seam between them.
      </p>
      <p>
        As founding design engineer at Garden Computing I built the component library and design system from scratch and
        owned brand, marketing and component architecture at once, a scope usually split across separate hires. Earlier,
        at ASOS, I shipped a date-based seasonal theming system that activates and deactivates itself, removing manual
        release cycles entirely; at Bots I built the search and analytics layer and the demo that opened the company&apos;s
        expansion into Asia.
      </p>
      <p>
        My background is design first: an MA in Visual Communication, then an immersive software engineering course at
        General Assembly. I came into engineering to build things that look and feel right, and applied AI is where that
        instinct has the most room now.
      </p>
    </div>
  </Section>
);
