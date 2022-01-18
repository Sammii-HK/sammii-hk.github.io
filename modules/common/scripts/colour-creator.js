function percentage(value, total) {
  return Math.floor((value / total) * 100);
}

function degrees(value, total) {
  return Math.floor((value / total) * 360);
}

function calculateColour(e, mediaType) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const posY = e.clientY;
  const posX = e.clientX;
  let x, y, z
  
  x = degrees(posX, width)
  y = percentage(posY, height)
  z = percentage((posX + posY), (width + height))
  

  const title = document.getElementById(`title-${mediaType}`)
  const subtitle = document.getElementById(`subtitle-${mediaType}`)
  // const color = `rgb(${x}, ${y}, ${x - y})`
  const titleColor = `hsl(${x}, ${y}%, ${z}%)`
  const subtitleColor = `hsl(${x}, ${z}%, ${y}%)`
  // console.log("color", color);
  
  title.style.color = titleColor;
  subtitle.style.color = subtitleColor;
};


function colourTitle(mediaType) {
  document.addEventListener("mousemove", (e) => calculateColour(e, mediaType))
}

colourTitle("mobile")
colourTitle("desktop")

