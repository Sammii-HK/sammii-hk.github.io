const contactOptions = [
  {
    link: "mailto:kellow.sammii@gmail.com",
    icon: "envelope",
    iconType: "fas",
  },
  {
    link: "https://github.com/Sammii-HK/",
    icon: "github",
    iconType: "fab",
  },
  {
    link: "https://www.linkedin.com/in/samantha-kellow/",
    icon: "linkedin-in",
    iconType: "fab",
  },
];

function createContactLink(option) {
  const icon = document.createElement("i")
  icon.classList.add(option.iconType, `fa-${option.icon}`, "fa-lg")
  const span = document.createElement("span")
  span.classList.add("icon", "is-medium")
  span.appendChild(icon)
  const anchor = document.createElement("a")
  anchor.classList.add("has-text-centered", "icon-link")
  anchor.href = option.link
  anchor.setAttribute("target", "_blank")
  anchor.appendChild(span)
  const container = document.createElement("div")
  return container.appendChild(anchor)
};

function createTitle(mediaType) {
  const title = document.createElement("h1");
  title.innerText = "Sammii";
  const subtitle = document.createElement("h3");
  subtitle.innerText = "Software Engineer";

  const container = document.createElement("div");
  container.classList.add("title-container", mediaType)
  container.appendChild(title);
  container.appendChild(subtitle);
  return container
};

export function contactDetails(mediaType) {
  const contactContainer = document.createElement("div")
  // contactContainer.classList.add("contact-details-container")
  contactContainer.setAttribute("id", `contact-details-container-${mediaType}`)
  contactContainer.classList.add("contact-details-container", mediaType)

  const bioContainer = document.createElement("div")

  const title = createTitle(mediaType)
  bioContainer.appendChild(title)
  const iconsContainer = document.createElement("div")
  iconsContainer.classList.add("contact-icons-container")
  iconsContainer.setAttribute("id", `contact-icons-container-${mediaType}`)
  contactOptions.map(option => {
    const contactLinks = createContactLink(option)
    iconsContainer.appendChild(contactLinks)
  });
  bioContainer.appendChild(iconsContainer)

  contactContainer.appendChild(bioContainer)
  return contactContainer; 
};
