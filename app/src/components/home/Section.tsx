import type { ReactNode } from "react";

/**
 * Structural homepage section. One landmark per section, labelled by its own
 * heading, sharing the container width the old grid used. Purely structural:
 * the designed treatment of each section arrives in its own phase.
 */
export const Section = ({
  id,
  title,
  children,
  headingClassName = "",
}: {
  id: string;
  title: string;
  children: ReactNode;
  headingClassName?: string;
}) => {
  const headingId = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className="px-2 sm:px-4 md:px-6 py-8 sm:py-10">
      <div className="max-w-7xl mx-auto">
        <h2
          id={headingId}
          className={`text-[10px] tracking-[0.2em] text-black/30 dark:text-white/25 uppercase mb-3 px-1 select-none ${headingClassName}`}
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
};
