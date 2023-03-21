import { contactDetails } from './contact-info.js';
import { calculateColour } from '../common/scripts/colour-creator.js';

const projects = [
  {
    id: 'crystal-index',
    title: 'Crystal Index',
    techStack: 'Vue, Sequelize',
    info: 'A full-stack app, which is an index to record crystals, with a Vue front-end, running an Express server which is serving a Sequelize API.',
  },
  {
    id: 'communication-infographic',
    title: 'Communication Infographic',
    techStack: 'React, Javascript',
    info: 'A full-stack app, which is a rework of my Dissertation on the History of Communication. With a React front-end running an Express server loading data stored as JSON.',
  },
  {
    id: 'artistry',
    title: 'Artistry',
    techStack: 'React, Python',
    info: 'A full-stack application, which users can search the Rijksmuseum API, with a React front-end and SQL database. The application includes data schemaa and a RESTful api framework built with Python.',
  },
  {
    id: 'on-set-london',
    title: 'On Set',
    techStack: 'React, MongoDB',
    info: 'A full-stack application which indexes film set locations, with a React front-end and noSQL database using MongoDB. The application includes data schemas and a RESTful API framework.',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    techStack: 'Javascript',
    info: 'A faithful recreation of the original arcade game Space Invaders, built with Javascript. The game features include, keyboard controls, numbered lives, sounds and even progressively difficult levels.',
  },
  {
    id: 'volcanoVisualisation',
    title: 'Volcano Visualisation',
    techStack: 'Javascript, d3.js',
    info: 'A full-stack app, which plots volcano eruptions on a Orthographic projection map, using d3.js to visualise the data, running an Express server loading data stored as JSON.',
  },
  {
    id: 'p5-interactive-graphics',
    title: 'P5 Interactive Graphics',
    techStack: 'Javascript, p5.js',
    info: 'A front-end app, which renders an interactive graphic visualisation which reacts to the users cursor movement and position, created with P5.js and Javascript.',
  },
  {
    id: 'matter-js-animation',
    title: 'Matter.js',
    techStack: 'Javascript, matter.js',
    info: 'A front-end app, which renders an interactive physics based graphic, with gravity applied to rendered shapes, which are interactive to the users cursor, created with Matter.js and Javascript.',
  },
  {
    id: 'three-js-particles',
    title: 'Three.js 3D Model',
    techStack: 'Javascript, three.js',
    info: 'A front-end app, which renders a 3D model of a butterfly within a 360 degree scene, with moving geometric particles, created with Three.js and Javascript.',
  },
];

export function initializeInterface() {
  console.log("JS loaded 🐛");
  // create desktop + mobile views
  initializeMediaSpecificInterface('desktop')
  initializeMediaSpecificInterface('mobile')
  // create mouse over and scroll events for desktop + mobile project views
  createEvents();
}

function createEvents() {
  // create desktop mouse enter events
  // document.querySelectorAll(".project-image-container-desktop").forEach(item => {
  //   item.addEventListener('mouseenter', event => setActiveProjectInfo(event.target.id, 'desktop') )
  // });
  // create mobile scroll event
  const projectsContainerMobile = document.getElementById("mobile-projects")
  projectsContainerMobile.addEventListener('scroll', onMobileProjectsScroll);
};

function initializeMediaSpecificInterface(mediaType) {
  // create main containers
  mediaType === 'mobile' ? projectsContainerMobile() : projectsContainerDesktop();
  // create info panel instance
  createInfoPanel(mediaType)
  // create thumbnails
  projects.map(project => {
    createThumbnail(project, mediaType);
    setActiveProjectInfo(project.id, mediaType);
  });
};

async function createThumbnail(project, mediaType) {
  // create title
  const title = document.createElement("h3")
  title.setAttribute("id", `${project.id}-title`)
  // create info paragraph
  const info = document.createElement("div")
  info.setAttribute("id", `${project.id}-info`)
  // create info container and append info
  const infoContainer = document.createElement("div")
  infoContainer.appendChild(title)
  infoContainer.appendChild(info)
  infoContainer.classList.add("project-info-container")
  // create image
  const image = document.createElement("img")
  image.setAttribute("src", `./src/assets/images/${project.id}.jpeg`)
  // create figure container for image
  const figure = document.createElement("figure")
  figure.classList.add("image", "is-1x1", "is-clickable")
  // create github hyperlink
  const link = document.createElement("a")
  link.setAttribute("href", `https://github.com/Sammii-HK/${project.id}`)
  link.setAttribute("target", "_blank")
  // mediaType dependant column
  const column = document.createElement("div")
  column.classList.add("column", `project-image-container-${mediaType}`)
  column.classList.add('is-12')
  // column.classList.add(mediaType === 'mobile' ? 'is-12' : 'is-4')
  column.setAttribute("id", `${project.id}-${mediaType}`)
  // append image + overlay > figure > link > column
  link.appendChild(image)
  figure.appendChild(link)
  figure.appendChild(infoContainer)
  // figure.appendChild(overlay)
  // link.appendChild(figure)
  column.appendChild(figure)
  // append column > projects container
  const projectsContainer = document.getElementById(`${mediaType}-projects`)
  return projectsContainer.appendChild(column)
};

function createInfoPanel(mediaType) {
  // create contactInfo
  const contact = contactDetails(mediaType)
  // append title + info > project info container
  const projectInfo = document.getElementById(`project-info-container-${mediaType}`)
  projectInfo.appendChild(contact)

  // const desktopColumnsContainer = document.getElemmentById("desktop-columns-container")
  // projectInfo.appendChild(contact)
  // mediaType === "mobile" ? projectInfo.appendChild(contact) : document.getElementById("projects-container-desktop").appendChild(contact);
};

function createProjectLink(project) {
  const link = document.createElement("a")
  link.setAttribute("href", `https://github.com/Sammii-HK/${project.id}`)
  link.setAttribute("target", "_blank")
  return link
};

function setActiveProjectInfo(projectId) {
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

function onMobileProjectsScroll() {
  const projectImageContainers = document.querySelectorAll(".project-image-container-mobile")
  const firstVisibleProject = [...projectImageContainers].find(projectImageContainer => {
    let viewportOffset = projectImageContainer.getBoundingClientRect();
    calculateColour(viewportOffset, "mobile")
    return viewportOffset.y >= 0
  })
  
  // if (firstVisibleProject) setActiveProjectInfo(firstVisibleProject.id, 'mobile')
};

function projectsContainerDesktop() {
  // create + style project info container
  const infoContainer = document.createElement("div")
  infoContainer.classList.add("column", "is-3-desktop")
  infoContainer.setAttribute("id", "project-info-container-desktop")
  // create + style project thumbnails
  const thumbnails = document.createElement("div")
  thumbnails.classList.add("columns", "is-multiline")
  thumbnails.setAttribute("id", "desktop-projects")
  const thumbnailsContainer = document.createElement("div")
  thumbnailsContainer.classList.add("column", "is-7", "is-offset-1")
  thumbnailsContainer.appendChild(thumbnails)
  // create + style columns container
  const columns = document.createElement("div")
  columns.classList.add("columns", "is-centered")
  columns.setAttribute("id", "desktop-columns-container")
  // append info container + thumbnails container > columns
  columns.appendChild(infoContainer)
  columns.appendChild(thumbnailsContainer)
  // append columns > container
  const container = document.getElementById("projects-container-desktop")
  container.classList.add("landing-section")
  container.appendChild(columns)
};

function projectsContainerMobile() {
  // create + style project info container
  const infoContainer = document.createElement("div")
  infoContainer.classList.add("column", "is-6-desktop", "is-10")
  infoContainer.setAttribute("id", "project-info-container-mobile")
  // create + style project thumbnails
  const thumbnailsContainer = document.createElement("div")
  thumbnailsContainer.classList.add("column", "is-5-desktop", "is-10")
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
