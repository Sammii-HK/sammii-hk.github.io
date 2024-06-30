export const Navbar = ({xPc, yPc}: {xPc: number, yPc: number}) => {

  const colourCreator = (number: number) => {
    const colour = Math.floor((255 / 100) * number)
    return colour < 255 ? Math.floor((255 / 100) * number) : 255;
  };

  const colour1 = colourCreator(xPc);
  const colour2 = colourCreator(yPc);
  const colour3 = 255 - colourCreator(xPc);

  const grandient = {
    background:
      `radial-gradient(
        circle at 50% 0,
        rgb(${colour1} ${colour3} ${colour2} / 50%),
        rgb(${colour1} ${colour3} ${colour2} / 0%) 70.71%
      ),
      radial-gradient(
        circle at 6.7% 75%,
        rgb(${colour3} ${colour2} ${colour1} / 50%),
        rgb(${colour3} ${colour2} ${colour1} / 0%) 70.71%
      ),
      radial-gradient(
        circle at 93.3% 75%,
        rgb(${colour2} ${colour1} ${colour3} / 50%),
        rgb(${colour2} ${colour1} ${colour3} / 0%) 70.71%
      ) white`
  };

  return (
    <nav className="absolute bg-black z-10 w-full flex justify-center p-4">
      <div className="pt-3 logo" style={grandient} aria-label="logo svg" />
    </nav>
  )

};