import Image from "next/image";
import { ColumnsContainer } from "../ColumnsContainer";
import { CodeXml } from "lucide-react";
import { GITHUB_URL_SAMMII, GITHUB_URL } from "../../../constants";
import { getImagePath } from "../../../common/utils/image-path";

type ProjectItem = {
  id: string,
  title: string,
  techStack: string,
  info: string,
}

type Project = { 
  project: ProjectItem;
  isGrid?: boolean;
}

export const ProjectItem = (projectItem: Project) => {
  const project = projectItem.project;
  const isGrid = projectItem.isGrid || false;
  const githubUrl = project.id.includes('unicorn-poo') ? GITHUB_URL : GITHUB_URL_SAMMII;
  const imagePath = getImagePath(project.id);
  
  if (isGrid) {
    return (
      <div className="p-4 flex flex-col h-full">
        <div className="mb-3 flex-shrink-0">
          <Image 
            src={imagePath}
            alt={project.title} 
            width="1000" 
            height="500"
            className="w-full h-auto rounded object-cover"
          />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="title break-words mb-2 flex-shrink-0">{project.title}</h3>
          <p className="subtitle break-words mb-2 flex-shrink-0">{project.techStack}</p>
          <p className="break-words whitespace-normal text-sm text-white/80 mb-4 flex-1 overflow-hidden">{project.info}</p>
          <a 
            target="_blank" 
            rel="noopener noreferrer"
            href={`${githubUrl}/${project.id}`} 
            className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-white/20 rounded hover:border-white/40 hover:bg-white/5 transition-all text-sm font-medium mt-auto flex-shrink-0"
          >
            <CodeXml size={16} />
            <span>View Code</span>
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <ColumnsContainer id={project.id} key={project.id}>
      <div className="column is-10 flex justify-between items-center">
        <h3 className="title break-words flex-1 min-w-0 pr-4">{project.title}</h3>
        <a 
          target="_blank" 
          rel="noopener noreferrer"
          href={`${githubUrl}/${project.id}`} 
          className="flex-shrink-0 ml-4 inline-flex items-center gap-2 px-4 py-2 border border-white/20 rounded hover:border-white/40 hover:bg-white/5 transition-all"
        >
          <CodeXml size={18} />
          <span className="text-sm font-medium">View Code</span>
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
  )
};
