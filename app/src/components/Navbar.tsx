import { gradientCreator } from "../../common/scripts/gradient-creator";

export const Navbar = ({ xPc, yPc }: { xPc: number; yPc: number }) => {
  return (
    <nav className="absolute bg-white/80 dark:bg-black z-10 w-full flex justify-center p-4 backdrop-blur-sm">
      <div
        className="pt-3 logo"
        style={gradientCreator(xPc, yPc)}
        aria-label="logo svg"
      />
    </nav>
  );
};
