export const Navbar = () => {
  // const [red. setRed =]
  const grandient = {
    background:
      `radial-gradient(
        circle at 50% 0,
        rgb(255 0 0 / 50%),
        rgb(255 0 0 / 0%) 70.71%
      ),
      radial-gradient(
        circle at 6.7% 75%,
        rgb(0 0 255 / 50%),
        rgb(0 0 255 / 0%) 70.71%
      ),
      radial-gradient(
        circle at 93.3% 75%,
        rgb(0 255 0 / 50%),
        rgb(0 255 0 / 0%) 70.71%
      ) white`
  }; 

  const createGradiant = () => {
    return <p>hi</p>
  }

  return (
    <nav className="absolute bg-black z-10 w-full flex justify-center p-4">
      <div className="pt-3 logo stacked-radial" style={grandient} aria-label="logo svg" />
    </nav>
  )

};