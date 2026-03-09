'use client';
import { useState } from 'react';
import { backgroundGradientCreator } from '../../common/scripts/gradient-creator';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const BlogPageWrapper = ({ children }: { children: React.ReactNode }) => {
  const [xPc, setXPc] = useState(50);
  const [yPc, setYPc] = useState(50);

  return (
    <div
      className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col"
      style={backgroundGradientCreator(xPc, yPc)}
      onPointerMove={(e) => {
        setXPc((e.clientX / window.innerWidth) * 100);
        setYPc((e.clientY / window.innerHeight) * 100);
      }}
    >
      <Navbar xPc={xPc} yPc={yPc} />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
};
