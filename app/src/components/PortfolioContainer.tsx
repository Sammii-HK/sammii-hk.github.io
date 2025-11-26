"use client";
import { useState, useEffect, useRef } from "react";

import { Navbar } from "./Navbar";
import { ProjectView } from "./project/ProjectView";
import { ProjectGrid } from "./project/ProjectGrid";
import { ViewToggle } from "./ViewToggle";
import { Footer } from "./Footer";

export const PortfolioContainer = () => {
  const [yPc, setYPc] = useState(0);
  const [xPc, setXPc] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "carousel">(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("portfolioView") as
        | "grid"
        | "carousel"
        | null;
      if (savedView === "grid" || savedView === "carousel") {
        return savedView;
      }
    }
    return "grid";
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollHandlerRef = useRef<(() => void) | null>(null);
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);
  
  const targetYPcRef = useRef(0);
  const targetXPcRef = useRef(0);
  const currentYPcRef = useRef(0);
  const currentXPcRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  const lerp = (current: number, target: number, factor: number): number => {
    return current + (target - current) * factor;
  };

  useEffect(() => {
    currentYPcRef.current = targetYPcRef.current;
    currentXPcRef.current = targetXPcRef.current;
    
    const animate = () => {
      const factor = 0.2;
      
      currentYPcRef.current = lerp(currentYPcRef.current, targetYPcRef.current, factor);
      currentXPcRef.current = lerp(currentXPcRef.current, targetXPcRef.current, factor);
      
      setYPc(currentYPcRef.current);
      setXPc(currentXPcRef.current);
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent) => {
    const viewportWidth = window.innerWidth;
    const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
    if (!isScrollingRef.current && timeSinceScroll > 500) {
      const viewportHeight = window.innerHeight;
      targetYPcRef.current = (e.clientY / viewportHeight) * 100;
      targetXPcRef.current = ((e.clientX * 2) / viewportWidth) * 100;
    }
    if (!isScrollingRef.current || timeSinceScroll < 100) {
      targetXPcRef.current = ((e.clientX * 2) / viewportWidth) * 100;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const viewportWidth = window.innerWidth;
      const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
      if (!isScrollingRef.current && timeSinceScroll > 500) {
        const viewportHeight = window.innerHeight;
        targetYPcRef.current = (touch.clientY / viewportHeight) * 100;
        targetXPcRef.current = ((touch.clientX * 2) / viewportWidth) * 100;
      }
      if (!isScrollingRef.current || timeSinceScroll < 100) {
        targetXPcRef.current = ((touch.clientX * 2) / viewportWidth) * 100;
      }
    }
  };

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    let attachedElement: HTMLElement | null = null;
    let rafId: number | null = null;
    
    const findScrollableElement = (): HTMLElement | null => {
      if (!containerRef.current) return null;
      
      if (viewMode === "carousel") {
        const allUls = containerRef.current.querySelectorAll("ul");
        for (const ul of Array.from(allUls)) {
          const element = ul as HTMLElement;
          const style = window.getComputedStyle(element);
          if (
            (style.overflow === "auto" || style.overflowY === "auto" ||
              style.overflow === "scroll" || style.overflowY === "scroll") &&
            element.scrollHeight > element.clientHeight
          ) {
            return element;
          }
        }
      } else {
        const gridScroll = containerRef.current.querySelector("#project-grid-scroll");
        if (gridScroll) {
          const element = gridScroll as HTMLElement;
          const style = window.getComputedStyle(element);
          if (
            (style.overflow === "auto" || style.overflowY === "auto" ||
              style.overflow === "scroll" || style.overflowY === "scroll") &&
            element.scrollHeight > element.clientHeight
          ) {
            return element;
          }
        }
      }
      
      return null;
    };
    
    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      
      rafId = requestAnimationFrame(() => {
        isScrollingRef.current = true;
        lastScrollTimeRef.current = Date.now();
        
        const scrollableElement = attachedElement || findScrollableElement();
        
        if (scrollableElement) {
          const scrollTop = scrollableElement.scrollTop;
          const scrollHeight = scrollableElement.scrollHeight;
          const clientHeight = scrollableElement.clientHeight;
          const maxScroll = scrollHeight - clientHeight;
          
          if (maxScroll > 0) {
            const scrollPercent = (scrollTop / maxScroll) * 100;
            const wave1 = Math.sin((scrollPercent / 100) * Math.PI * 6) * 50 + 50;
            const wave2 = Math.cos((scrollPercent / 100) * Math.PI * 4) * 30;
            const amplified = Math.max(0, Math.min(100, wave1 + wave2));
            targetYPcRef.current = amplified;
            
            const xWave = Math.sin((scrollPercent / 100) * Math.PI * 2) * 25 + 50;
            targetXPcRef.current = xWave;
          } else {
            targetYPcRef.current = 0;
          }
        }
        
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }
        
        scrollTimeout = setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      });
    };

    scrollHandlerRef.current = handleScroll;

    const attachScrollListener = () => {
      const scrollableElement = findScrollableElement();
      
      if (scrollableElement && scrollableElement !== attachedElement) {
        if (attachedElement && scrollHandlerRef.current) {
          attachedElement.removeEventListener("scroll", scrollHandlerRef.current);
        }
        
        attachedElement = scrollableElement;
        scrollableElement.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
      }
    };

    const tryAttach = () => {
      attachScrollListener();
      if (!attachedElement) {
        setTimeout(tryAttach, 200);
      }
    };

    setTimeout(tryAttach, 100);

    const observer = new MutationObserver(() => {
      if (!attachedElement) {
        tryAttach();
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      observer.disconnect();
      if (attachedElement && scrollHandlerRef.current) {
        attachedElement.removeEventListener("scroll", scrollHandlerRef.current);
      }
    };
  }, [viewMode]);

  return (
    <div
      ref={containerRef}
      className="h-[100dvh] grid grid-rows-[auto_auto_1fr_auto]"
      onTouchMove={handleTouchMove}
      onPointerMove={handlePointerMove}
    >
      <Navbar xPc={xPc} yPc={yPc} />
      
      <div className="flex justify-center py-2 sm:py-3 bg-white/50 dark:bg-black/30 backdrop-blur-sm border-b border-black/5 dark:border-white/5">
        <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      </div>
      
      <main className="overflow-hidden min-h-0">
        {viewMode === "grid" ? <ProjectGrid /> : <ProjectView />}
      </main>
      
      <Footer />
    </div>
  );
};
