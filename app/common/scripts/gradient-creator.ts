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
