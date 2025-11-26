import Image from "next/image";
import { ColumnsContainer } from "../ColumnsContainer";
import { CodeXml } from "lucide-react";
import { GITHUB_URL_SAMMII, GITHUB_URL } from "../../../constants";
import { getImagePath } from "../../../common/utils/image-path";

type ProjectItem = {
  id: string;
  title: string;
  techStack: string;
  info: string;
};

type Project = {
  project: ProjectItem;
  isGrid?: boolean;
};

export const ProjectItem = (projectItem: Project) => {
  const project = projectItem.project;
  const isGrid = projectItem.isGrid || false;
  const githubUrl = project.id.includes("unicorn-poo")
    ? GITHUB_URL
    : GITHUB_URL_SAMMII;
  const imagePath = getImagePath(project.id);

  if (isGrid) {
    return (
      <div className="p-2 sm:p-4 flex flex-col h-full">
        <div className="mb-1.5 sm:mb-3 flex-shrink-0">
          <Image
            src={imagePath}
            alt={project.title}
            width="1000"
            height="500"
            className="w-full h-auto rounded object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm sm:text-base md:text-xl font-semibold break-words mb-1 sm:mb-2 flex-shrink-0 line-clamp-2">
            {project.title}
          </h3>
          <p className="text-[10px] sm:text-xs md:text-sm text-black/60 dark:text-white/60 break-words mb-1 sm:mb-2 flex-shrink-0 line-clamp-2">
            {project.techStack}
          </p>
          <p className="hidden sm:block break-words whitespace-normal text-xs sm:text-sm text-black/80 dark:text-white/80 mb-2 sm:mb-4 flex-1 overflow-hidden line-clamp-3">
            {project.info}
          </p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${githubUrl}/${project.id}`}
            className="inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border border-black/20 dark:border-white/20 rounded hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs sm:text-sm font-medium mt-auto flex-shrink-0"
          >
            <CodeXml size={12} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">View Code</span>
            <span className="sm:hidden">Code</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <ColumnsContainer id={project.id} key={project.id}>
      <div className="column is-10 flex justify-between items-center">
        <h3 className="title break-words flex-1 min-w-0 pr-4">
          {project.title}
        </h3>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={`${githubUrl}/${project.id}`}
          className="flex-shrink-0 ml-2 sm:ml-4 inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 border border-black/20 dark:border-white/20 rounded hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-xs sm:text-sm"
        >
          <CodeXml size={14} className="sm:w-4 sm:h-4" />
          <span className="font-medium">Code</span>
        </a>
      </div>
      <div className="column is-10">
        <Image
          src={imagePath}
          alt={project.title}
          width="1000"
          height="500"
          className="w-full h-auto"
        />
      </div>
      <div className="column is-10">
        <p className="subtitle break-words">{project.techStack}</p>
        <p className="break-words whitespace-normal">{project.info}</p>
      </div>
    </ColumnsContainer>
  );
};
