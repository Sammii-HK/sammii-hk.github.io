import Image from "next/image";
import { ColumnsContainer } from "./ColumnsContainer";

type ProjectItem = {
  id: string,
  title: string,
  techStack: string,
  info: string,
}

type Project = { project: ProjectItem }

export const ProjectItem = (projectItem: Project) => {
  // console.log("projectItem", projectItem.project);

  const project = projectItem.project
  
  return (
    <ColumnsContainer id={project.id} key={project.id}>
      <h3 className="column is-10 title">{project.title}</h3>
      <Image 
        src={`/assets/images/${project.id}.jpeg`} 
        alt={project.title} 
        width="1000" 
        height="500"
        className="column is-10 justify-self-center"
      />
      <div className="column is-10">
        <p className="subtitle">{project.techStack}</p>
        <p>{project.info}</p>
      </div>
    </ColumnsContainer>
  )
};
