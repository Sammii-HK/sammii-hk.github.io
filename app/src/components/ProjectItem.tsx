import Image from "next/image";

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
    <div id={project.id} key={project.id} className="container my-6 columns h-screen">
      <h3 className="column is-12 title">{project.title}</h3>
      <Image 
        src={`/assets/images/${project.id}.jpeg`} 
        alt={project.title} 
        width="500" 
        height="500"
        className="column is-6"
      />
      <div className="column is-6">
        <p className="subtitle">{project.techStack}</p>
        <p>{project.info}</p>
      </div>
    </div>
  )
};
