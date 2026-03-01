// Muted ambient background — radials drift with sin waves, colours respond to cursor
export const backgroundGradientCreator = (xPc: number, yPc: number, t: number = 0) => {
  const c = (n: number) => Math.min(255, Math.floor((255 / 100) * Math.max(0, Math.min(100, n))));

  // Cursor-driven base colours, same palette as the logo
  const r1 = c(xPc + Math.sin(t * 0.41) * 20);
  const g1 = c(yPc + Math.cos(t * 0.33) * 18);
  const b1 = 255 - c(xPc);

  const r2 = 255 - c(xPc + Math.cos(t * 0.37) * 18);
  const g2 = c(yPc + Math.sin(t * 0.29) * 15);
  const b2 = c(xPc);

  const r3 = c(yPc + Math.sin(t * 0.43) * 20);
  const g3 = c(xPc + Math.cos(t * 0.31) * 16);
  const b3 = 255 - c(yPc);

  // 4th roaming blob — complementary, slower drift
  const r4 = c(100 - xPc + Math.sin(t * 0.22) * 25);
  const g4 = c(100 - yPc + Math.cos(t * 0.18) * 20);
  const b4 = c(xPc + Math.sin(t * 0.27) * 20);

  // Radial positions oscillate around their base positions
  const x1 = (50 + Math.sin(t * 0.31) * 16).toFixed(1);
  const y1 = (0  + Math.abs(Math.sin(t * 0.23)) * 22).toFixed(1);

  const x2 = (8  + Math.cos(t * 0.41) * 12).toFixed(1);
  const y2 = (75 + Math.sin(t * 0.29) * 10).toFixed(1);

  const x3 = (92 + Math.sin(t * 0.37) * 12).toFixed(1);
  const y3 = (75 + Math.cos(t * 0.43) * 10).toFixed(1);

  const x4 = (50 + Math.cos(t * 0.19) * 32).toFixed(1);
  const y4 = (50 + Math.sin(t * 0.27) * 28).toFixed(1);

  const op = 15;
  const op4 = 11;

  return {
    background: `
      radial-gradient(ellipse at ${x1}% ${y1}%, rgb(${r1} ${g1} ${b1} / ${op}%), transparent 65%),
      radial-gradient(ellipse at ${x2}% ${y2}%, rgb(${r2} ${g2} ${b2} / ${op}%), transparent 65%),
      radial-gradient(ellipse at ${x3}% ${y3}%, rgb(${r3} ${g3} ${b3} / ${op}%), transparent 65%),
      radial-gradient(ellipse at ${x4}% ${y4}%, rgb(${r4} ${g4} ${b4} / ${op4}%), transparent 55%)
    `.trim(),
  };
};

export const gradientCreator = (xPc: number, yPc: number) => {
  const colourCreator = (number: number) => {
    const colour = Math.floor((255 / 100) * number);
    return colour < 255 ? Math.floor((255 / 100) * number) : 255;
  };

  const colour1 = colourCreator(xPc);
  const colour2 = colourCreator(yPc);
  const colour3 = 255 - colourCreator(xPc);

  const opacity = 70;

  return {
    background: `radial-gradient(
        circle at 50% 0,
        rgb(${colour1} ${colour3} ${colour2} / ${opacity}%),
        rgb(${colour1} ${colour3} ${colour2} / 0%) 70.71%
      ),
      radial-gradient(
        circle at 6.7% 75%,
        rgb(${colour3} ${colour2} ${colour1} / ${opacity}%),
        rgb(${colour3} ${colour2} ${colour1} / 0%) 70.71%
      ),
      radial-gradient(
        circle at 93.3% 75%,
        rgb(${colour2} ${colour1} ${colour3} / ${opacity}%),
        rgb(${colour2} ${colour1} ${colour3} / 0%) 70.71%
      ) lavender`,
  };
};
