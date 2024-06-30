'use client';
import { useState } from "react";
import { Navbar } from "./Navbar";

import { ProjectView } from "./project/ProjectView";

export const PortfolioContainer = () => {
  const [yPc, setYPc] = useState(0);
  const [xPc, setXPc] = useState(0);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    setYPc((e.screenY / e.view.screen.height) * 100);
    setXPc(((e.screenX * 2) / e.view.screen.width) * 100);
  }

  return (
    <div className="h-[100vh]" onPointerMove={handlePointerMove}>
      <Navbar xPc={xPc} yPc={yPc} />
      <ProjectView />
    </div>
  )
};
