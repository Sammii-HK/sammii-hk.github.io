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

export function contactDetails() {
  const contactContainer = document.createElement("div")
  contactContainer.classList.add("contact-details-container")
  contactOptions.map(option => {
    const contactLinks = createContactLink(option)
    contactContainer.appendChild(contactLinks)
  });
  return contactContainer; 
};
