export function createThumbnail(project, mediaType) {
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
  column.setAttribute("id", `${project.id}-${mediaType}`)
  // append image + overlay > figure > link > column
  link.appendChild(image)
  figure.appendChild(link)
  figure.appendChild(infoContainer)
  column.appendChild(figure)
  // append column > projects container
  const projectsContainer = document.getElementById(`${mediaType}-projects`)
  return projectsContainer.appendChild(column)
};