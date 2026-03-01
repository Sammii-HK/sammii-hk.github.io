"use client";
import { useEffect, useCallback, useRef, useId } from "react";
import Image from "next/image";
import { X, CodeXml, ExternalLink } from "lucide-react";
import { GITHUB_URL_SAMMII, GITHUB_URL } from "../../../constants";
import { getImagePath } from "../../../common/utils/image-path";

type ProjectType = {
  id: string;
  title: string;
  techStack: string;
  info: string;
  type?: "product" | "experiment";
  liveUrl?: string;
};

interface ProjectModalProps {
  project: ProjectType;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export const ProjectModal = ({ project, onClose, triggerRef }: ProjectModalProps) => {
  const githubUrl = project.id.includes("unicorn-poo")
    ? GITHUB_URL
    : GITHUB_URL_SAMMII;
  const imagePath = getImagePath(project.id);
  
  // Generate unique IDs for ARIA attributes
  const titleId = useId();
  const descriptionId = useId();
  
  // Refs for focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const firstFocusableRef = useRef<HTMLButtonElement>(null);
  const lastFocusableRef = useRef<HTMLAnchorElement>(null);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Close on Escape
      if (e.key === "Escape") {
        onClose();
        return;
      }
      
      // Focus trap - Tab and Shift+Tab
      if (e.key === "Tab") {
        const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          // Shift+Tab: if on first element, go to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: if on last element, go to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    // Store the previously focused element to restore later
    const previouslyFocused = document.activeElement as HTMLElement;
    
    // Focus the close button when modal opens
    closeButtonRef.current?.focus();
    
    // Add keyboard listener
    document.addEventListener("keydown", handleKeyDown);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    
    // Announce modal to screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("role", "status");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `${project.title} project details dialog opened`;
    document.body.appendChild(announcement);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
      
      // Return focus to trigger element or previously focused element
      if (triggerRef?.current) {
        triggerRef.current.focus();
      } else if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
      
      // Clean up announcement
      document.body.removeChild(announcement);
    };
  }, [handleKeyDown, project.title, triggerRef]);

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-black rounded-xl shadow-2xl animate-scaleIn border border-black/10 dark:border-white/10 custom-scrollbar"
      >
        {/* Project Image */}
        <div className="w-full">
          <Image
            src={imagePath}
            alt={`Screenshot of ${project.title} project`}
            width={1000}
            height={500}
            className="w-full h-auto rounded-t-xl object-cover"
          />
        </div>

        {/* Project Content */}
        <div className="p-4 sm:p-6">
          {/* Header with title and close button */}
          <div className="flex items-start justify-between gap-4 mb-2">
            <h2 
              id={titleId}
              className="text-xl sm:text-2xl font-bold text-black dark:text-white"
            >
              {project.title}
            </h2>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="flex-shrink-0 p-1.5 rounded-lg border border-black/20 dark:border-white/20 hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2"
              aria-label="Close dialog"
            >
              <X size={18} className="text-black dark:text-white" aria-hidden="true" />
            </button>
          </div>

          <p className="text-sm sm:text-base text-black/60 dark:text-white/60 mb-4">
            <span className="sr-only">Technologies used: </span>
            {project.techStack}
          </p>

          <p 
            id={descriptionId}
            className="text-sm sm:text-base text-black/80 dark:text-white/80 mb-6 leading-relaxed"
          >
            {project.info}
          </p>

          <div className="flex items-center gap-3">
            {project.liveUrl && (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={project.liveUrl}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-black/20 dark:border-white/20 rounded hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all font-medium text-black dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink size={14} aria-hidden="true" />
                <span>{project.type === "experiment" ? "Try it" : "Open"}</span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            )}
            {project.type !== "experiment" && (
              <a
                ref={lastFocusableRef}
                target="_blank"
                rel="noopener noreferrer"
                href={`${githubUrl}/${project.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-black/20 dark:border-white/20 rounded hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all font-medium text-black dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                <CodeXml size={14} aria-hidden="true" />
                <span>View Code</span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            )}
            {project.type === "experiment" && !project.liveUrl && (
              <a
                ref={lastFocusableRef}
                target="_blank"
                rel="noopener noreferrer"
                href={`${githubUrl}/${project.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-black/20 dark:border-white/20 rounded hover:border-black/40 dark:hover:border-white/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all font-medium text-black dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white focus-visible:ring-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                <CodeXml size={14} aria-hidden="true" />
                <span>View Code</span>
                <span className="sr-only">(opens in new tab)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

