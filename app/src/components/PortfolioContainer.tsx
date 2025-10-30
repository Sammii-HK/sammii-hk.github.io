'use client';
import { useState, useEffect, useRef } from "react";

import { Navbar } from "./Navbar";
import { ProjectView } from "./project/ProjectView";

export const PortfolioContainer = () => {
  const [yPc, setYPc] = useState(0);
  const [xPc, setXPc] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollHandlerRef = useRef<(() => void) | null>(null);
  const isScrollingRef = useRef(false);
  const lastScrollTimeRef = useRef(0);

  const handlePointerMove = (e: React.PointerEvent) => {
    const viewportWidth = window.innerWidth;
    // Never update Y from cursor when scrolling - scroll takes priority
    // Only update Y if we haven't scrolled in the last 500ms
    const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
    if (!isScrollingRef.current && timeSinceScroll > 500) {
      const viewportHeight = window.innerHeight;
      setYPc((e.clientY / viewportHeight) * 100);
      // Also update X from cursor when not scrolling
      setXPc(((e.clientX * 2) / viewportWidth) * 100);
    }
    // Always update X from cursor even when scrolling (for combined effect)
    if (!isScrollingRef.current || timeSinceScroll < 100) {
      setXPc(((e.clientX * 2) / viewportWidth) * 100);
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const viewportWidth = window.innerWidth;
      // Never update Y from touch when scrolling - scroll takes priority
      // Only update Y if we haven't scrolled in the last 500ms
      const timeSinceScroll = Date.now() - lastScrollTimeRef.current;
      if (!isScrollingRef.current && timeSinceScroll > 500) {
        const viewportHeight = window.innerHeight;
        setYPc((touch.clientY / viewportHeight) * 100);
        setXPc(((touch.clientX * 2) / viewportWidth) * 100);
      }
      // Always update X from touch even when scrolling (for combined effect)
      if (!isScrollingRef.current || timeSinceScroll < 100) {
        setXPc(((touch.clientX * 2) / viewportWidth) * 100);
      }
    }
  }

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    let attachedElement: HTMLElement | null = null;
    let rafId: number | null = null;
    
    const findScrollableElement = (): HTMLElement | null => {
      if (!containerRef.current) return null;
      
      // Find all ul elements and check which one is scrollable
      const allUls = containerRef.current.querySelectorAll('ul');
      for (const ul of Array.from(allUls)) {
        const element = ul as HTMLElement;
        const style = window.getComputedStyle(element);
        // Check if element has overflow auto/scroll and is actually scrollable
        if ((style.overflow === 'auto' || style.overflowY === 'auto' || style.overflow === 'scroll' || style.overflowY === 'scroll') &&
            element.scrollHeight > element.clientHeight) {
          return element;
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
            const wave1 = Math.sin((scrollPercent / 100) * Math.PI * 6) * 50 + 50;
            // Add a second wave for even more variation
            const wave2 = Math.cos((scrollPercent / 100) * Math.PI * 4) * 30;
            // Combine waves for rich, dramatic color transitions
            const amplified = Math.max(0, Math.min(100, wave1 + wave2));
            setYPc(amplified);
            
            // Also vary X position slightly based on scroll for even more dynamism
            const xWave = Math.sin((scrollPercent / 100) * Math.PI * 2) * 25 + 50;
            setXPc(xWave);
          } else {
            // If no scroll, set to 0
            setYPc(0);
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
          attachedElement.removeEventListener('scroll', scrollHandlerRef.current);
        }
        
        attachedElement = scrollableElement;
        scrollableElement.addEventListener('scroll', handleScroll, { passive: true });
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
        attachedElement.removeEventListener('scroll', scrollHandlerRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="h-[100dvh]" onTouchMove={handleTouchMove} onPointerMove={handlePointerMove}>
      <Navbar xPc={xPc} yPc={yPc} />
      <ProjectView />
    </div>
  )
};
