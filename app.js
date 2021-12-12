

document.addEventListener('DOMContentLoaded', () => {
  console.log("JS loaded 🐛");
  createInfoPanel()

  projects.map(project => {
    createImage(project);
  });
  
  document.querySelectorAll(".project-image-container").forEach(item => {
    item.addEventListener('mouseenter', event => activeProjectInfo(event.target.id) )
  })
});

const projects = [
  {
    id: 'crystal-index',
    title: 'Crystal Index',
    github: '',
    liveDemo: '',
    info: '',
  },
  {
    id: 'communication-infographic',
    title: 'Communication Infographic',
    github: '',
    liveDemo: '',
    info: '',
  },
  {
    id: 'artistry',
    title: 'Artistry',
    github: '',
    liveDemo: '',
    info: '',
  },
  {
    id: 'on-set',
    title: 'On Set',
    github: '',
    liveDemo: '',
    info: '',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    github: '',
    liveDemo: '',
    info: '',
  },
  {
    id: 'volcano-visualisation',
    title: 'Volcano Visualisation',
    github: '',
    liveDemo: '',
    info: '',
  },
  {
    id: 'p5-interactive-graphics',
    title: 'P5 Interactive Graphics',
    github: '',
    liveDemo: '',
    info: '',
  },
  {
    id: 'three-js',
    title: 'Three.js 3D Model',
    github: '',
    liveDemo: '',
    info: '',
  },
  {
    id: 'final-project',
    title: 'Final Project',
    github: 'github',
    liveDemo: '',
    info: 'Info',
  },
];

function createImage(project) {
  const image = document.createElement("img")
  image.setAttribute("src", "https://bulma.io/images/placeholders/128x128.png")
  const figure = document.createElement("figure")//.classList.add("image", "is-128x128")
  figure.classList.add("image", "is-1x1", "is-clickable")
  const column = document.createElement("div")
  column.classList.add("column", "is-4", "project-image-container")
  figure.appendChild(image)
  column.appendChild(figure)
  column.setAttribute("id", project.id)
  const projectsContainer = document.getElementById("projects")
  return projectsContainer.appendChild(column)
};

function createInfoPanel() {
  const title = document.createElement("h3")
  title.setAttribute("id", "project-title")
  const github = document.createElement("a")
  github.setAttribute("id", "project-github")
  const info = document.createElement("p")
  info.setAttribute("id", "project-info")
  
  const projectInfo = document.getElementById("project-info-container")
  projectInfo.appendChild(title)
  projectInfo.appendChild(github)
  projectInfo.appendChild(info)
};

function activeProjectInfo(projectId) {
  const project = projects.find(proj => proj.id === projectId );
  const title = document.getElementById("project-title");
  title.innerText = project.title
  const github = document.getElementById("project-github");
  github.innerText = project.github
  const info = document.getElementById("project-info");
  info.innerText = project.info
};

// $(function(){
//   projects.map(project => {
//     // console.log("project.title", project.title);
//     console.log("`#${project.id}`", `#${project.id}`);
    
//     $( `#${project.id}` ).hover( activeProjectInfo(project) );
//   })
// })
