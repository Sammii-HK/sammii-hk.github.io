document.addEventListener('DOMContentLoaded', () => {
  console.log("JS loaded 🐛");
  
  initializeInterface()
  
  document.querySelectorAll(".project-image-container-desktop").forEach(item => {
    item.addEventListener('mouseenter', event => activeProjectInfo(event.target.id, 'desktop') )
  });

  const projectsContainerMobile = document.getElementById("mobile-projects")
  projectsContainerMobile.addEventListener('scroll', event => mobileActiveProjectScroll(event) );
});

const projects = [
  {
    id: 'crystal-index',
    title: 'Crystal Index',
    info: '',
  },
  {
    id: 'communication-infographic',
    title: 'Communication Infographic',
    info: '',
  },
  {
    id: 'artistry',
    title: 'Artistry',
    info: '',
  },
  {
    id: 'on-set-london',
    title: 'On Set',
    info: '',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    info: '',
  },
  {
    id: 'volcanoVisualisation',
    title: 'Volcano Visualisation',
    info: '',
  },
  {
    id: 'p5-interactive-graphics',
    title: 'P5 Interactive Graphics',
    info: '',
  },
  {
    id: 'three-js-particles',
    title: 'Three.js 3D Model',
    info: '',
  },
  {
    id: 'matter-js-animation',
    title: 'Matter.js',
    info: 'Info',
  },
];

function initializeInterface() {
  // create desktop + mobile views
  initializeMediaSpecificInterface('desktop')
  initializeMediaSpecificInterface('mobile')
}

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
  activeProjectInfo(`${firstProjectId}-${mediaType}`, mediaType);
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
  // append image > figure > link > column
  figure.appendChild(image)
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
  const info = document.createElement("p")
  info.setAttribute("id", `project-info-${mediaType}`)
  // append title + info > project info container
  const projectInfo = document.getElementById(`project-info-container-${mediaType}`)
  projectInfo.appendChild(title)
  projectInfo.appendChild(info)
};

function activeProjectInfo(projectId, mediaType) {
  // find project with matching id
  const project = projects.find(proj => {
    // append mediaType to `const projects: { id }` for reference to work
    const mediaTypeProjId = `${proj.id}-${mediaType}`
    // then match ids to grab project info
    return mediaTypeProjId === projectId
  } );
  // find title + append `project.title`
  const title = document.getElementById(`project-title-${mediaType}`);
  title.innerText = project.title
  // find info + append `project.info`
  const info = document.getElementById(`project-info-${mediaType}`);
  info.innerText = project.info
};

function mobileActiveProjectScroll() {
  const projectContainer = document.querySelectorAll(".project-image-container-mobile")
  const firstVisibleProject = [...projectContainer].find(item => {
    let viewportOffset = item.getBoundingClientRect();
    return viewportOffset.y >= 0
  })
  activeProjectInfo(firstVisibleProject.id, 'mobile')
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
  thumbnailsContainer.classList.add("column", "is-7")
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

// $(function(){})
