'use client';
import { useState } from "react";
import { Navbar } from "./Navbar";

import { ProjectView } from "./project/ProjectView";

export const PortfolioContainer = () => {
  const [yPc, setYPc] = useState(0);
  const [xPc, setXPc] = useState(0);

  const handlePointerMove = (e: PointerEvent) => {
    if (!e.view) return;
    setYPc((e.screenY / e.view.screen.height) * 100);
    setXPc(((e.screenX * 2) / e.view.screen.width) * 100);
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!e.view) return;
    setYPc((e.touches[0].clientY / e.view.screen.height) * 100);
    setXPc(((e.touches[0].clientX * 2) / e.view.screen.width) * 100);
  }

  return (
    <div className="h-[100dvh]" onTouchMove={handleTouchMove as any} onPointerMove={handlePointerMove as any}>
      <Navbar xPc={xPc} yPc={yPc} />
      <ProjectView />
    </div>
  )
};
