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

function createTitle() {
  const title = document.createElement("h1");
  title.innerText = "Sammii";
  title.setAttribute("id", "title")
  const subtitle = document.createElement("h3");
  subtitle.setAttribute("id", "subtitle")
  subtitle.classList.add("is-hidden-mobile")
  subtitle.innerText = "Full-Stack Software Engineer";

  const container = document.createElement("div");
  container.classList.add("name-title-container", "column", "is-6-mobile", "is-12", "py-0")
  container.appendChild(title);
  container.appendChild(subtitle);
  return container
};

export function contactDetails() {
  const contactContainer = document.createElement("div")
  contactContainer.setAttribute("id", "contact-details-container")
  contactContainer.classList.add("contact-details-container", "columns", "is-multiline", "is-flex")

  const title = createTitle()
  contactContainer.appendChild(title)
  const iconsContainer = document.createElement("div")
  iconsContainer.classList.add("contact-icons-container", "column", "is-6-mobile", "is-12")
  iconsContainer.setAttribute("id", "contact-icons-container")
  contactOptions.map(option => {
    const contactLinks = createContactLink(option)
    iconsContainer.appendChild(contactLinks)
  });
  contactContainer.appendChild(iconsContainer)

  return contactContainer; 
};
