function percentage(value, total) {
  
  const result = Math.floor((value / total) * 100);
  return (result > 75) ? 75
  : (result < 25) ? 25
  : result;
}

function degrees(value, total) {
  const result = Math.floor((value / total) * 360);
  return result;
}

export function calculateColour(e) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const posY = e.clientY || (e.bottom + 200);
  const posX = e.clientX || (e.top + 200);
  let x, y, z

  x = degrees(posX, width)
  y = percentage(posY, height)
  z = percentage((posX + posY), (width + height))

  const title = document.getElementById("title")
  const subtitle = document.getElementById("subtitle")
  const titleColor = `hsl(${(x + y)}, ${y}%, ${z}%)`
  const subtitleColor = `hsl(${x}, ${z}%, ${y}%)`

  title.style.color = titleColor;
  subtitle.style.color = subtitleColor;
};


function colourTitle() {
  document.addEventListener("mousemove", (e) => calculateColour(e))
}
colourTitle()

