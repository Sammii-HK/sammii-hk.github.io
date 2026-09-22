"use client";

import { useRouter } from "next/navigation";
import type { Project } from "../common/data/projects";
import { projectHref } from "../lib/selected-work";
import { ProjectItem } from "../src/components/project/ProjectItem";
import { ArrowRight } from "lucide-react";

/**
 * Client island for the temporary /work index: the existing ProjectItem card
 * carries its own link handlers, so it has to render on the client. A card
 * with a case study is clickable as a whole (the inner links stop
 * propagation, as they did in the old modal grid) and also carries a plain
 * "Case study" link for keyboards and readers.
 */
export function WorkIndexGrid({ label, projects }: { label: string; projects: Project[] }) {
  const router = useRouter();
  return (
    <ul className="work-index-grid" aria-label={label}>
      {projects.map((p, i) => {
        const href = p.caseStudy ? projectHref(p) : null;
        return (
          <li
            key={p.id}
            id={p.id}
            className={href ? "work-index-card work-index-card--linked" : "work-index-card"}
            onClick={href ? () => router.push(href) : undefined}
          >
            <ProjectItem project={p} index={i + 6} />
            {href && (
              <a className="work-index-case" href={href} onClick={(e) => e.stopPropagation()}>
                Read the case study <ArrowRight size={14} className="icon-inline" aria-hidden="true" />
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
