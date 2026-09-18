import Image from "next/image";
import { CodeXml, ExternalLink, Lock } from "lucide-react";
import type { Project } from "../../../common/data/projects";
import { WORK_GROUPS } from "../../../lib/lenses";
import { getImagePath } from "../../../common/utils/image-path";
import { getGithubRepoUrl } from "../../../common/utils/github-repo-url";
import { getPrivateRepoMailto } from "../../../common/utils/private-repo-mailto";

type Props = {
  title: string;
  description: string;
  techStack: string;
  readingTime: string;
  /** The catalogue entry, when the case study belongs to a listed project. */
  project: Project | null;
};

/**
 * Case-study hero (Phase 2I): kicker, title, description, the project's
 * screenshot and its outbound links. Everything comes from frontmatter
 * plus the project catalogue; the Markdown body below stays untouched.
 */
export function CaseStudyHero({ title, description, techStack, readingTime, project }: Props) {
  const group = project ? WORK_GROUPS.find((g) => g.id === project.group)?.label : undefined;
  const liveLabel = project?.type === "experiment" ? "Try it" : "Open";
  const showRepo = project && !project.privateRepo && !project.noRepo;
  return (
    <header className="case-hero">
      <p className="section-eyebrow case-hero-kicker">
        {group ?? "Case study"}
        <span aria-hidden="true"> · </span>
        <span className="case-hero-time">{readingTime}</span>
      </p>
      <h1 className="case-hero-title">{title}</h1>
      {description && <p className="case-hero-lead">{description}</p>}
      {techStack && (
        <p className="case-hero-stack">
          <span className="sr-only">Built with </span>
          {techStack}
        </p>
      )}
      {project && (
        <ul className="case-hero-links" aria-label="Project links">
          {project.liveUrl && (
            <li>
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={13} aria-hidden="true" /> {liveLabel}
              </a>
            </li>
          )}
          {showRepo && (
            <li>
              <a href={getGithubRepoUrl(project.id)} target="_blank" rel="noopener noreferrer">
                <CodeXml size={13} aria-hidden="true" /> View code
              </a>
            </li>
          )}
          {project.privateRepo && (
            <li>
              <a href={getPrivateRepoMailto(project.title)}>
                <Lock size={13} aria-hidden="true" /> Request code access
              </a>
            </li>
          )}
        </ul>
      )}
      {project && (
        <figure className="case-hero-shot">
          <Image src={getImagePath(project.id)} alt={`${project.title} screenshot`} width={1600} height={900} priority sizes="(max-width: 900px) 100vw, 880px" />
        </figure>
      )}
    </header>
  );
}
