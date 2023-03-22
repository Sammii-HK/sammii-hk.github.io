import { projects } from "../common/data/projects.js";

export function createProjectInfo(projectId) {
  // find project with matching id
  const project = projects.find(proj => proj.id === projectId);
  // find title + append `project.title`
  const title = document.getElementById(`${project.id}-title`);
  title.classList.add("title", "is-7-mobile", "is-4",)
  title.innerText = project.title
  // find info + append `project.info`
  const infoContainer = document.getElementById(`${project.id}-info`);
  infoContainer.innerHTML = '';
  // project details
  const techStack = document.createElement("h5");
  techStack.classList.add("subtitle", "is-5", "is-7-mobile")
  techStack.innerText = project.techStack
  const projectInfo = document.createElement("p");
  techStack.classList.add("body")
  projectInfo.innerText = project.info
  
  infoContainer.appendChild(techStack)
  infoContainer.appendChild(projectInfo)

  const projectLink = createProjectLink(project)
  projectLink.innerText = "Github"
  const linkContainer = document.createElement("div")
  linkContainer.classList.add('github-link')
  
  linkContainer.appendChild(projectLink)
  infoContainer.appendChild(linkContainer)
};

function createProjectLink(project) {
  const link = document.createElement("a")
  link.setAttribute("href", `https://github.com/Sammii-HK/${project.id}`)
  link.setAttribute("target", "_blank")
  return link
};
