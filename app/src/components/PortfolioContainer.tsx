'use client';
import { useState } from "react";

import { Navbar } from "./Navbar";
import { ProjectView } from "./project/ProjectView";

export const PortfolioContainer = () => {
  const [yPc, setYPc] = useState(0);
  const [xPc, setXPc] = useState(0);

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    setYPc((relativeY / rect.height) * 100);
    setXPc(((relativeX * 2) / rect.width) * 100);
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const relativeX = touch.clientX - rect.left;
      const relativeY = touch.clientY - rect.top;
      setYPc((relativeY / rect.height) * 100);
      setXPc(((relativeX * 2) / rect.width) * 100);
    }
  }

  return (
    <div className="h-[100dvh]" onTouchMove={handleTouchMove} onPointerMove={handlePointerMove}>
      <Navbar xPc={xPc} yPc={yPc} />
      <ProjectView />
    </div>
  )
};
