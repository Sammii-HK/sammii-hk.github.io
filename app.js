document.addEventListener('DOMContentLoaded', initializeInterface);

const projects = [
  {
    id: 'crystal-index',
    title: 'Crystal Index',
    techStack: 'Vue, Sequelize',
    info: 'A database to index my crystals',
  },
  {
    id: 'communication-infographic',
    title: 'Communication Infographic',
    techStack: 'React, Javascript',
    info: '',
  },
  {
    id: 'artistry',
    title: 'Artistry',
    techStack: 'React, Python',
    info: 'Damn that dog stare at guinea pigs so avoid the new toy and just play with the box it came in have secret plans pushes butt to face for the door is opening! how exciting oh, it\'s you, meh pooping rainbow while flying in a toasted bread costume in space.',
  },
  {
    id: 'on-set-london',
    title: 'On Set',
    techStack: 'React, MongoDB',
    info: '',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    techStack: 'Javascript',
    info: '',
  },
  {
    id: 'volcanoVisualisation',
    title: 'Volcano Visualisation',
    techStack: 'Javascript, d3.js',
    info: '',
  },
  {
    id: 'p5-interactive-graphics',
    title: 'P5 Interactive Graphics',
    techStack: 'Javascript, p5.js',
    info: '',
  },
  {
    id: 'three-js-particles',
    title: 'Three.js 3D Model',
    techStack: 'Javascript, three.js',
    info: '',
  },
  {
    id: 'matter-js-animation',
    title: 'Matter.js',
    techStack: 'Javascript, matter.js',
    info: 'Info',
  },
];

function initializeInterface() {
  console.log("JS loaded 🐛");
  // create desktop + mobile views
  initializeMediaSpecificInterface('desktop')
  initializeMediaSpecificInterface('mobile')
  // create mouse over and scroll events for desktop + mobile project views
  createEvents();
}

function createEvents() {
  // create desktop mouse enter events
  document.querySelectorAll(".project-image-container-desktop").forEach(item => {
    item.addEventListener('mouseenter', event => setActiveProjectInfo(event.target.id, 'desktop') )
  });
  // create mobile scroll event
  const projectsContainerMobile = document.getElementById("mobile-projects")
  projectsContainerMobile.addEventListener('scroll', event => onMobileProjectsScroll(event) );
  // remove overlay from first project thumbnail on desktop
  const firstProjectId = projects[0].id
  document.getElementById(`${firstProjectId}-desktop-overlay`).classList.remove("thumbnail-overlay")
};

function initializeMediaSpecificInterface(mediaType) {
  // create main containers
  mediaType === 'mobile' ? projectsContainerMobile() : projectsContainerDesktop();
  // create info panel instance
  createInfoPanel(mediaType)
  // create thumbnails
  projects.map(project => {
    createThumbnail(project, mediaType);
  });
  // set base active project on page load
  const firstProjectId = projects[0].id
  setActiveProjectInfo(`${firstProjectId}-${mediaType}`, mediaType);
};

function createThumbnail(project, mediaType) {
  // create image
  const image = document.createElement("img")
  image.setAttribute("src", `./src/assets/images/${project.id}.png`)
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
  column.classList.add(mediaType === 'mobile' ? 'is-12' : 'is-4')
  column.setAttribute("id", `${project.id}-${mediaType}`)
  // create overlay
  const overlay = document.createElement("div")
  overlay.setAttribute("id", `${project.id}-${mediaType}-overlay`)
  overlay.classList.add("thumbnail-overlay", "overlay")
  // append image + overlay > figure > link > column
  figure.appendChild(image)
  figure.appendChild(overlay)
  link.appendChild(figure)
  column.appendChild(link)
  // append column > projects container
  const projectsContainer = document.getElementById(`${mediaType}-projects`)
  return projectsContainer.appendChild(column)
};

function createInfoPanel(mediaType) {
  // create title
  const title = document.createElement("h3")
  title.setAttribute("id", `project-title-${mediaType}`)
  // create info paragraph
  const info = document.createElement("div")
  info.setAttribute("id", `project-info-${mediaType}`)
  // append title + info > project info container
  const projectInfo = document.getElementById(`project-info-container-${mediaType}`)
  projectInfo.appendChild(title)
  projectInfo.appendChild(info)
};

function setActiveProjectInfo(projectId, mediaType) {
  // find project with matching id
  const project = projects.find(proj => {
    // append mediaType to `const projects: { id }` for reference to work
    const mediaTypeProjId = `${proj.id}-${mediaType}`
    // then match ids to grab project info
    return mediaTypeProjId === projectId
  });

  document.querySelectorAll(".overlay").forEach(item => item.classList.add("thumbnail-overlay"));
  document.getElementById(`${projectId}-overlay`).classList.remove("thumbnail-overlay")
  
  // find title + append `project.title`
  const title = document.getElementById(`project-title-${mediaType}`);
  title.classList.add("title", "is-7-mobile", "is-4",)
  title.innerText = project.title
  // find info + append `project.info`
  const infoContainer = document.getElementById(`project-info-${mediaType}`);
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
};

function onMobileProjectsScroll() {
  const projectImageContainers = document.querySelectorAll(".project-image-container-mobile")
  const firstVisibleProject = [...projectImageContainers].find(projectImageContainer => {
    let viewportOffset = projectImageContainer.getBoundingClientRect();
    return viewportOffset.y >= 0
  })
  if (firstVisibleProject) setActiveProjectInfo(firstVisibleProject.id, 'mobile')
};

function projectsContainerDesktop() {
  // create + style project info container
  const infoContainer = document.createElement("div")
  infoContainer.classList.add("column", "is-3")
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
  infoContainer.classList.add("column", "is-6")
  infoContainer.setAttribute("id", "project-info-container-mobile")
  // create + style project thumbnails
  const thumbnailsContainer = document.createElement("div")
  thumbnailsContainer.classList.add("column", "is-5")
  thumbnailsContainer.setAttribute("id", "mobile-projects")
  // create + style columns container
  const columns = document.createElement("div")
  columns.classList.add("columns", "is-centered", "is-mobile")
  // append info container + thumbnails container > columns
  columns.appendChild(infoContainer)
  columns.appendChild(thumbnailsContainer)
  // append columns > container
  const container = document.getElementById("projects-container-mobile")
  container.classList.add("landing-section")
  container.appendChild(columns)
};

