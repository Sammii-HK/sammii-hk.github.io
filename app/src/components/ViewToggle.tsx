"use client";
import { useRef, useCallback } from "react";
import { Grid3x3, List } from "lucide-react";

type ViewMode = "grid" | "carousel";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  const gridButtonRef = useRef<HTMLButtonElement>(null);
  const carouselButtonRef = useRef<HTMLButtonElement>(null);

  const handleToggle = (view: ViewMode) => {
    onViewChange(view);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolioView", view);
    }
  };

  // Handle keyboard navigation between tabs
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentTab: ViewMode) => {
      let handled = false;
      
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        if (currentTab === "carousel") {
          handleToggle("grid");
          gridButtonRef.current?.focus();
        }
        handled = true;
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        if (currentTab === "grid") {
          handleToggle("carousel");
          carouselButtonRef.current?.focus();
        }
        handled = true;
      } else if (e.key === "Home") {
        handleToggle("grid");
        gridButtonRef.current?.focus();
        handled = true;
      } else if (e.key === "End") {
        handleToggle("carousel");
        carouselButtonRef.current?.focus();
        handled = true;
      }
      
      if (handled) {
        e.preventDefault();
      }
    },
    []
  );

  return (
    <div 
      role="tablist" 
      aria-label="View options"
      className="inline-flex items-center gap-1 sm:gap-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-black/10 dark:border-white/10"
    >
      <button
        ref={gridButtonRef}
        role="tab"
        id="tab-grid"
        aria-selected={currentView === "grid"}
        aria-controls="project-grid-scroll"
        tabIndex={currentView === "grid" ? 0 : -1}
        onClick={() => handleToggle("grid")}
        onKeyDown={(e) => handleKeyDown(e, "grid")}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-1 ${
          currentView === "grid"
            ? "bg-black/10 dark:bg-white/10 text-black dark:text-white"
            : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
      >
        <Grid3x3 size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
        <span className="text-xs sm:text-sm font-medium">Grid</span>
      </button>
      <button
        ref={carouselButtonRef}
        role="tab"
        id="tab-carousel"
        aria-selected={currentView === "carousel"}
        aria-controls="carousel-view"
        tabIndex={currentView === "carousel" ? 0 : -1}
        onClick={() => handleToggle("carousel")}
        onKeyDown={(e) => handleKeyDown(e, "carousel")}
        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-1 ${
          currentView === "carousel"
            ? "bg-black/10 dark:bg-white/10 text-black dark:text-white"
            : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
      >
        <List size={16} className="sm:w-[18px] sm:h-[18px]" aria-hidden="true" />
        <span className="text-xs sm:text-sm font-medium">Carousel</span>
      </button>
    </div>
  );
};

