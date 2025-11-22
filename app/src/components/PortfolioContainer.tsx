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

  // Target values for smooth interpolation
  const targetYPcRef = useRef(0);
  const targetXPcRef = useRef(0);
  const currentYPcRef = useRef(0);
  const currentXPcRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // Smooth interpolation function (lerp)
  const lerp = (current: number, target: number, factor: number): number => {
    return current + (target - current) * factor;
  };

  // Animation loop for smooth transitions
  useEffect(() => {
    // Initialize current values to match targets
    currentYPcRef.current = targetYPcRef.current;
    currentXPcRef.current = targetXPcRef.current;

    const animate = () => {
      // Smooth interpolation factor (0.2 = fluid, responsive transition)
      const factor = 0.2;

      currentYPcRef.current = lerp(
        currentYPcRef.current,
        targetYPcRef.current,
        factor
      );
      currentXPcRef.current = lerp(
        currentXPcRef.current,
        targetXPcRef.current,
        factor
      );

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
    // Never update Y from cursor when scrolling - scroll takes priority
    // Only update Y if we haven't scrolled in the last 500ms
    const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
    if (!isScrollingRef.current && timeSinceScroll > 500) {
      const viewportHeight = window.innerHeight;
      targetYPcRef.current = (e.clientY / viewportHeight) * 100;
      // Also update X from cursor when not scrolling
      targetXPcRef.current = ((e.clientX * 2) / viewportWidth) * 100;
    }
    // Always update X from cursor even when scrolling (for combined effect)
    if (!isScrollingRef.current || timeSinceScroll < 100) {
      targetXPcRef.current = ((e.clientX * 2) / viewportWidth) * 100;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const viewportWidth = window.innerWidth;
      // Never update Y from touch when scrolling - scroll takes priority
      // Only update Y if we haven't scrolled in the last 500ms
      const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
      if (!isScrollingRef.current && timeSinceScroll > 500) {
        const viewportHeight = window.innerHeight;
        targetYPcRef.current = (touch.clientY / viewportHeight) * 100;
        targetXPcRef.current = ((touch.clientX * 2) / viewportWidth) * 100;
      }
      // Always update X from touch even when scrolling (for combined effect)
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
        // Find ul element for carousel
        const allUls = containerRef.current.querySelectorAll("ul");
        for (const ul of Array.from(allUls)) {
          const element = ul as HTMLElement;
          const style = window.getComputedStyle(element);
          if (
            (style.overflow === "auto" ||
              style.overflowY === "auto" ||
              style.overflow === "scroll" ||
              style.overflowY === "scroll") &&
            element.scrollHeight > element.clientHeight
          ) {
            return element;
          }
        }
      } else {
        // Find the grid scroll container
        const gridScroll = containerRef.current.querySelector(
          "#project-grid-scroll"
        );
        if (gridScroll) {
          const element = gridScroll as HTMLElement;
          const style = window.getComputedStyle(element);
          if (
            (style.overflow === "auto" ||
              style.overflowY === "auto" ||
              style.overflow === "scroll" ||
              style.overflowY === "scroll") &&
            element.scrollHeight > element.clientHeight
          ) {
            return element;
          }
        }
      }

      return null;
    };

    const handleScroll = () => {
      // Cancel any pending animation frame
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      // Use requestAnimationFrame for smooth updates
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
            // Calculate scroll percentage (0-100)
            const scrollPercent = (scrollTop / maxScroll) * 100;

            // Create MASSIVE dramatic color changes
            // Use multiple sine waves with different frequencies for rich color transitions
            // This creates 6 full color cycles as you scroll with smooth transitions
            const wave1 =
              Math.sin((scrollPercent / 100) * Math.PI * 6) * 50 + 50;
            // Add a second wave for even more variation
            const wave2 = Math.cos((scrollPercent / 100) * Math.PI * 4) * 30;
            // Combine waves for rich, dramatic color transitions
            const amplified = Math.max(0, Math.min(100, wave1 + wave2));
            targetYPcRef.current = amplified;

            // Also vary X position slightly based on scroll for even more dynamism
            const xWave =
              Math.sin((scrollPercent / 100) * Math.PI * 2) * 25 + 50;
            targetXPcRef.current = xWave;
          } else {
            // If no scroll, set to 0
            targetYPcRef.current = 0;
          }
        }

        // Clear existing timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // Reset scrolling flag after scroll stops (use longer delay to prevent cursor override)
        scrollTimeout = setTimeout(() => {
          isScrollingRef.current = false;
        }, 500);
      });
    };

    scrollHandlerRef.current = handleScroll;

    const attachScrollListener = () => {
      const scrollableElement = findScrollableElement();

      if (scrollableElement && scrollableElement !== attachedElement) {
        // Remove from previous element if exists
        if (attachedElement && scrollHandlerRef.current) {
          attachedElement.removeEventListener(
            "scroll",
            scrollHandlerRef.current
          );
        }

        attachedElement = scrollableElement;
        scrollableElement.addEventListener("scroll", handleScroll, {
          passive: true,
        });
        handleScroll(); // Set initial position
      }
    };

    // Try multiple times to find the scrollable element
    const tryAttach = () => {
      attachScrollListener();
      // If not found, try again after a delay
      if (!attachedElement) {
        setTimeout(tryAttach, 200);
      }
    };

    // Initial attempt
    setTimeout(tryAttach, 100);

    // Also set up a MutationObserver to catch when the carousel is added
    const observer = new MutationObserver(() => {
      if (!attachedElement) {
        tryAttach();
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true,
      });
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
      className="h-[100dvh] flex flex-col"
      onTouchMove={handleTouchMove}
      onPointerMove={handlePointerMove}
    >
      <Navbar xPc={xPc} yPc={yPc} />
      <ViewToggle currentView={viewMode} onViewChange={setViewMode} />
      <div className="flex-1 overflow-hidden">
        {viewMode === "grid" ? <ProjectGrid /> : <ProjectView />}
      </div>
      <Footer />
    </div>
  );
};
