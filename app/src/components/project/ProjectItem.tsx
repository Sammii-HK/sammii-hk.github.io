import Image from "next/image";
import { CodeXml, ExternalLink, BookOpen, Lock } from "lucide-react";
import { getImagePath } from "../../../common/utils/image-path";
import { getGithubRepoUrl } from "../../../common/utils/github-repo-url";
import { getPrivateRepoMailto } from "../../../common/utils/private-repo-mailto";

type ProjectItem = {
  id: string;
  title: string;
  techStack: string;
  info: string;
  type?: "product" | "experiment";
  liveUrl?: string;
  highlights?: string[];
  caseStudy?: string;
  featured?: boolean;
  privateRepo?: boolean;
  noRepo?: boolean;
};

type Project = {
  project: ProjectItem;
  index?: number;
};

export const ProjectItem = (projectItem: Project) => {
  const project = projectItem.project;
  const index = projectItem.index ?? 99;
  const githubRepoUrl = getGithubRepoUrl(project.id);
  const privateRepoMailto = getPrivateRepoMailto(project.title);
  const imagePath = getImagePath(project.id);

  const isExperiment = project.type === "experiment";
  const hasLiveUrl = !!project.liveUrl;

  const liveLabel = isExperiment ? "Try it" : "Open";

  return (
    <div className="p-2 sm:p-4 flex flex-col h-full">
      <div className="mb-1.5 sm:mb-3 flex-shrink-0">
        <Image
          src={imagePath}
          alt={project.title}
          width={1000}
          height={500}
          className="w-full h-auto rounded object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          quality={80}
          {...(index < 6 ? { priority: true } : { loading: "lazy" as const })}
        />
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-shrink-0">
          <h3 className="text-sm sm:text-base md:text-xl font-semibold break-words line-clamp-2 flex-1 min-w-0">
            {project.title}
          </h3>
          {project.caseStudy && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider text-black/50 dark:text-white/50 border border-black/15 dark:border-white/15 flex-shrink-0"
              aria-label="Case study available"
            >
              <BookOpen size={10} aria-hidden="true" />
              <span>Case study</span>
            </span>
          )}
        </div>
        <p className="font-inter text-[10px] sm:text-xs md:text-sm text-black/60 dark:text-white/60 break-words mb-1 sm:mb-2 flex-shrink-0 line-clamp-2">
          {project.techStack}
        </p>
        <p className="font-inter hidden sm:block break-words whitespace-normal text-xs sm:text-sm text-black/80 dark:text-white/80 mb-2 sm:mb-4 flex-1 overflow-hidden line-clamp-3">
          {project.info}
        </p>
        <div className="flex items-center gap-2 mt-auto flex-shrink-0">
          {hasLiveUrl && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={project.liveUrl}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 border border-black/20 dark:border-white/20 rounded hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs sm:text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{liveLabel}</span>
            </a>
          )}
          {project.privateRepo && (
            <a
              href={privateRepoMailto}
              className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border border-black/20 dark:border-white/20 rounded hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs sm:text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <Lock size={12} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Request access</span>
              <span className="sm:hidden">Private</span>
            </a>
          )}
          {!project.privateRepo && !project.noRepo && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={githubRepoUrl}
              className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border border-black/20 dark:border-white/20 rounded hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs sm:text-sm font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              <CodeXml size={12} className="sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Code</span>
              <span className="sm:hidden">Code</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
