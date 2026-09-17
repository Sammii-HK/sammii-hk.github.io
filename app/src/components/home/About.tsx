/**
 * About (Phase 2G). The career narrative the portfolio spans: graphic design
 * and visual communication → engineering → founder and product builder. Every
 * line is from her own LinkedIn summary and experience; nothing invented.
 * Same grammar as the rest of the page: eyebrow, editorial measure, quiet.
 */
export const About = () => (
  <section id="about" aria-labelledby="about-heading" className="about">
    <h2 id="about-heading" className="section-eyebrow">
      About
    </h2>
    <div className="about-grid">
      <p className="about-lead">
        I started in graphic design and visual communication. I moved into engineering to build the things I was designing, and I
        now build products end to end: the interface, the system underneath it, and the AI that has to be made usable.
      </p>
      <div className="about-body">
        <p>
          The through-line is the seam between design and code. At Garden Computing I built the design system and component
          library from scratch: a Radix-based headless layer, design tokens, shared primitives, and I owned brand, marketing
          and component architecture at once. At ASOS I built a date-based seasonal theming system that activates and
          deactivates itself, which removed the manual release cycle entirely. Gamut is my OKLCH colour engine, implemented
          from first principles because I wanted to understand the colour space well enough to make decisions in it.
        </p>
        <p>
          Lunary is the product I run on my own: design, engineering, AI orchestration, analytics and marketing. It is live and
          it has paying subscribers, and it is where I learned what a design system has to do when one person ships every
          surface.
        </p>
        <p>
          Trained as a designer (MA Visual Communication), then an immersive software engineering course at General Assembly.
          The instinct is still the same one: build things that look and feel right, and now applied AI is where that has
          the most room.
        </p>
      </div>
    </div>
  </section>
);
