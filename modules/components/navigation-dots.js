export function createNavigationDots() {
  let viewportOffset
  const navContainer = document.createElement("div")
  navContainer.setAttribute("id", "nav-dots-container")
  const projectImageContainers = document.querySelectorAll(".project-image-container")
  projectImageContainers.forEach(projectImageContainer => {
    viewportOffset = projectImageContainer.getBoundingClientRect();
    const offsetTop = projectImageContainer.offsetTop;
    console.log("offsetTop", offsetTop);    
    
    const navDot = document.createElement("div")
    navDot.setAttribute("id", `${projectImageContainer.id}-nav-dot`)
    navDot.setAttribute("top", offsetTop)
    navDot.classList.add("navigation-dots", "is-clickable")
    navContainer.appendChild(navDot)
    navDot.addEventListener('click', onNavButtonClick)
  })
  const projectContainer = document.getElementById("projects-container")
  projectContainer.appendChild(navContainer)
  const firstNavDot = document.getElementById(projectImageContainers[0].id)
  firstNavDot.classList.add('is-active')
}

function onNavButtonClick(e) {
  const projectTop = e.target.getAttribute("top")
  const projects = document.getElementById("projects")
  projects.scrollTo({
    top: projectTop,
    behavior: 'smooth'
  })
}

export function getActiveNavAnchor() {
  const projects = document.getElementById("projects")
  const projectsScrollTop = projects.scrollTop
    const navDots = document.querySelectorAll('.navigation-dots')

    navDots.forEach(dot => dot.classList.remove("is-active"));

    const activeDot = [...navDots].find(navDot => {
      console.log("checking", navDot.getAttribute("top"), projectsScrollTop);
      
      return navDot.getAttribute("top") >= Math.floor(projectsScrollTop);
    });

    activeDot?.classList.add("is-active")
}
