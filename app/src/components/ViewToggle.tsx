"use client";
import { Grid3x3, List } from "lucide-react";

type ViewMode = "grid" | "carousel";

interface ViewToggleProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  const handleToggle = (view: ViewMode) => {
    onViewChange(view);
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolioView", view);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/80 dark:bg-black/50 backdrop-blur-sm rounded-lg p-1 border border-black/10 dark:border-white/10">
      <button
        onClick={() => handleToggle("grid")}
        className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
          currentView === "grid"
            ? "bg-black/10 dark:bg-white/10 text-black dark:text-white"
            : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        aria-label="Grid view"
      >
        <Grid3x3 size={18} />
        <span className="text-sm font-medium">Grid</span>
      </button>
      <button
        onClick={() => handleToggle("carousel")}
        className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
          currentView === "carousel"
            ? "bg-black/10 dark:bg-white/10 text-black dark:text-white"
            : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
        }`}
        aria-label="Carousel view"
      >
        <List size={18} />
        <span className="text-sm font-medium">Carousel</span>
      </button>
    </div>
  );
};
