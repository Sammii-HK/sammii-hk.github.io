function percentage(value, total) {
  
  const result = Math.floor((value / total) * 100);
  console.log("value, result", value, result);
  return (result > 75) ? 75
  : (result < 25) ? 25
  // : Math.abs(result);
  : result;
}

function degrees(value, total) {
  const result = Math.floor((value / total) * 360);
  console.log("value, result", value, result);
  // return Math.abs(result)
  return result;
}

export function calculateColour(e, mediaType) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const posY = e.clientY || e.bottom;
  const posX = e.clientX || e.top;
  let x, y, z
  
  // console.log("e.bottom, e.top", e.bottom, e.top);
  // console.log("e", e);

  // window 375 812
  // console.log("window", window.innerWidth, window.innerHeight);
  
  
  
  x = degrees(posX, width)
  y = percentage(posY, height)
  z = percentage((posX + posY), (width + height))

  console.log("x, y, z", x, y, z);
  
  

  const title = document.getElementById(`title-${mediaType}`)
  const subtitle = document.getElementById(`subtitle-${mediaType}`)
  // const color = `rgb(${x}, ${y}, ${x - y})`
  const titleColor = `hsl(${x}, ${y}%, ${z}%)`
  const subtitleColor = `hsl(${x}, ${z}%, ${y}%)`
  // console.log("titleColor", titleColor);
  
  title.style.color = titleColor;
  subtitle.style.color = subtitleColor;
};


function colourTitle(mediaType) {
  document.addEventListener("mousemove", (e) => calculateColour(e, mediaType))
}
colourTitle("desktop")

