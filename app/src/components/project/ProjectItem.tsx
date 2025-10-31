import Image from "next/image";
import { ColumnsContainer } from "../ColumnsContainer";
import { CodeXml } from "lucide-react";
import { GITHUB_URL_SAMMII, GITHUB_URL } from "../../../constants";

type ProjectItem = {
  id: string,
  title: string,
  techStack: string,
  info: string,
}

type Project = { project: ProjectItem }

export const ProjectItem = (projectItem: Project) => {
  const project = projectItem.project

  const githubUrl = project.id.includes('unicorn-poo') ? GITHUB_URL : GITHUB_URL_SAMMII;
  
  return (
    <ColumnsContainer id={project.id} key={project.id}>
      <div className="column is-10 flex justify-between">
        <h3 className="title break-words flex-1 min-w-0">{project.title}</h3>
        <a target="_blank" href={`${githubUrl}/${project.id}`} className="flex-shrink-0 ml-4">
          <CodeXml />
        </a>
      </div>
      <div className="column is-10">
        <Image 
          src={`/assets/images/${project.id}.jpg`}
          alt={project.title} 
          width="1000" 
          height="500"
          className="w-full h-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `/assets/images/${project.id}.png`;
          }}
        />
      </div>
      <div className="column is-10">
        <p className="subtitle break-words">{project.techStack}</p>
        <p className="break-words whitespace-normal">{project.info}</p>
      </div>
    </ColumnsContainer>
  )
};
