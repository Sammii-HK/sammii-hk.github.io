import { contactDetails } from './contact-info.js';
import { calculateColour } from '../common/scripts/colour-creator.js';
import { createThumbnail } from './thumbnails.js';
import { createProjectInfo } from './project-info.js';
import { projects } from '../common/data/projects.js';

export function initializeInterface() {
  console.log("JS loaded 🐛");
  // create desktop + mobile views
  initializeMediaSpecificInterface('mobile')
  // create mouse over and scroll events for desktop + mobile project views
  createEvents();
}

function createEvents() {
  // create desktop mouse enter events
  // create mobile scroll event
  const projectsContainerMobile = document.getElementById("mobile-projects")
  projectsContainerMobile.addEventListener('scroll', onProjectsScroll);
};

function initializeMediaSpecificInterface(mediaType) {
  // create main containers
  // mediaType === 'mobile' ? projectsContainerMobile() : projectsContainerDesktop();
  projectsContainer()
  // create info panel instance
  createInfoPanel(mediaType)
  // create thumbnails
  projects.map(project => {
    createThumbnail(project, mediaType);
    createProjectInfo(project.id, mediaType);
  });
};

function createInfoPanel() {
  // create contactInfo
  const contact = contactDetails()
  // append title + info > project info container
  const projectInfo = document.getElementById("name-title-container")
  projectInfo.appendChild(contact)
};

function onProjectsScroll() {
  const projectImageContainers = document.querySelectorAll(".project-image-container-mobile")
  const firstVisibleProject = [...projectImageContainers].find(projectImageContainer => {
    let viewportOffset = projectImageContainer.getBoundingClientRect();
    calculateColour(viewportOffset, "mobile")
    return viewportOffset.y >= 0
  })
  
  // if (firstVisibleProject) setActiveProjectInfo(firstVisibleProject.id, 'mobile')
};

function projectsContainer() {
  // create + style project info container
  const infoContainer = document.createElement("div")
  infoContainer.classList.add("column", "is-4-tablet", "is-3-desktop", "is-10-mobile")
  infoContainer.setAttribute("id", "name-title-container")
  // create + style project thumbnails
  const thumbnailsContainer = document.createElement("div")
  thumbnailsContainer.classList.add("column", "is-5-tablet", "is-10-mobile", "is-offset-1-tablet")
  thumbnailsContainer.setAttribute("id", "mobile-projects")
  // create + style columns container
  const columns = document.createElement("div")
  columns.classList.add("columns", "is-centered", "is-mobile", "is-multiline")
  // append info container + thumbnails container > columns
  columns.appendChild(infoContainer)
  columns.appendChild(thumbnailsContainer)
  // append columns > container
  const container = document.getElementById("projects-container-mobile")
  container.classList.add("landing-section")
  container.appendChild(columns)
};
