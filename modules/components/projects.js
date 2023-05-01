import { projects } from '../common/data/projects.js';
import { calculateColour } from '../common/scripts/colour-creator.js';
import { contactDetails } from './contact-info.js';
import { createThumbnail } from './thumbnails.js';
import { createProjectInfo } from './project-info.js';
import { createNavigationDots } from './navigation-dots.js';
import { getActiveNavAnchor } from './navigation-dots.js';

export function initializeInterface() {
  console.log("JS loaded 🐛");
  // create desktop + mobile views
  initializeMediaSpecificInterface()
  // create mouse over and scroll events for desktop + mobile project views
  createEvents();
}

function createEvents() {
  // create mobile scroll event
  const projectsContainer = document.getElementById("projects")
  projectsContainer.addEventListener('scroll', onProjectsScroll);
};

function initializeMediaSpecificInterface() {
  // create main containers
  projectsContainer()
  // create info panel instance
  createInfoPanel()
  // create thumbnails
  projects.map(project => {
    createThumbnail(project);
    createProjectInfo(project.id);
  });
  
  // create navigation Dots
  createNavigationDots()
};

function createInfoPanel() {
  // create contactInfo
  const contact = contactDetails()
  // append title + info > project info container
  const projectInfo = document.getElementById("name-title-container")
  projectInfo.appendChild(contact)
};

function onProjectsScroll() {
  const projectImageContainers = document.querySelectorAll(".project-image-container")
  return [...projectImageContainers].find(projectImageContainer => {
    let viewportOffset = projectImageContainer.getBoundingClientRect();
    getActiveNavAnchor(viewportOffset)
    calculateColour(viewportOffset)
    return viewportOffset.y >= 0
  })
};

function projectsContainer() {
  // create + style project info container
  const infoContainer = document.createElement("div")
  infoContainer.classList.add("column", "is-4-tablet", "is-3-desktop", "is-10-mobile")
  infoContainer.setAttribute("id", "name-title-container")
  // create + style project thumbnails
  const thumbnailsContainer = document.createElement("div")
  thumbnailsContainer.classList.add("column", "is-5-tablet", "is-10-mobile", "is-offset-1-tablet")
  thumbnailsContainer.setAttribute("id", "projects")
  // create + style columns container
  const columns = document.createElement("div")
  columns.classList.add("columns", "is-centered", "is-mobile", "is-multiline")
  // append info container + thumbnails container > columns
  columns.appendChild(infoContainer)
  columns.appendChild(thumbnailsContainer)
  // append columns > container
  const container = document.getElementById("projects-container")
  container.classList.add("landing-section")
  container.appendChild(columns)
};
