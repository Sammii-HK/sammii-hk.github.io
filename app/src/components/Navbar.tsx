import { gradientCreator } from "../../common/scripts/gradient-creator";

/**
 * On the homepage the logo takes its fill from the environment custom
 * properties (--env-logo-*, see globals.css) and needs no props.
 * The blog wrapper still drives it from its own pointer state; passing
 * xPc/yPc keeps that path exactly as it was.
 */
export const Navbar = ({ xPc, yPc }: { xPc?: number; yPc?: number } = {}) => {
  const legacyStyle = xPc !== undefined && yPc !== undefined ? gradientCreator(xPc, yPc) : undefined;
  return (
    <nav className="bg-white/80 dark:bg-black z-10 w-full flex items-center justify-center px-6 py-4 backdrop-blur-sm">
      <div className="pt-3 logo" style={legacyStyle} aria-label="logo svg" />
    </nav>
  );
};
