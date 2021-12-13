document.addEventListener('DOMContentLoaded', () => {
  console.log("JS loaded 🐛");
  createInfoPanel()

  projects.map(project => {
    createImage(project);
  });

  activeProjectInfo(projects[0].id);
  
  document.querySelectorAll(".project-image-container").forEach(item => {
    item.addEventListener('mouseenter', event => activeProjectInfo(event.target.id) )
  });
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

function createImage(project) {
  const image = document.createElement("img")
  image.setAttribute("src", `./src/assets/images/${project.id}.png`)
  const figure = document.createElement("figure")//.classList.add("image", "is-128x128")
  figure.classList.add("image", "is-1x1", "is-clickable")
  const link = document.createElement("a")
  link.setAttribute("href", `https://github.com/Sammii-HK/${project.id}`)
  link.setAttribute("target", "_blank")
  const column = document.createElement("div")
  column.classList.add("column", "is-4", "project-image-container")
  figure.appendChild(image)
  link.appendChild(figure)
  column.appendChild(link)
  column.setAttribute("id", project.id)
  const projectsContainer = document.getElementById("projects")
  return projectsContainer.appendChild(column)
};

function createInfoPanel() {
  const title = document.createElement("h3")
  title.setAttribute("id", "project-title")
  const info = document.createElement("p")
  info.setAttribute("id", "project-info")
  
  const projectInfo = document.getElementById("project-info-container")
  projectInfo.appendChild(title)
  projectInfo.appendChild(info)
};

function activeProjectInfo(projectId) {
  const project = projects.find(proj => proj.id === projectId );
  const title = document.getElementById("project-title");
  title.innerText = project.title
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
