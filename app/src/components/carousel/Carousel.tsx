import React, { useRef } from 'react';
import { useSnapCarousel } from 'react-snap-carousel';
import styles from "./carousel.module.css"
import classNames from 'classnames/bind';
  
interface CarouselProps<T> {
  readonly items: T[];
  readonly renderItem: (
    props: CarouselRenderItemProps<T>
  ) => React.ReactElement<CarouselItemProps>;
}

interface CarouselRenderItemProps<T> {
  readonly item: T;
  readonly isSnapPoint: boolean;
}

const cx = classNames.bind(styles);


export const Carousel = <T extends any>({
  items,
  renderItem,
}: CarouselProps<T>) => {
  const {
    scrollRef,
    pages,
    activePageIndex,
    goTo,
    snapPointIndexes,
  } = useSnapCarousel({ axis: "y" });

  const controlsRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isDraggingRef = useRef(false);
  const lastIndexRef = useRef<number | null>(null);

  const getButtonIndexFromTouch = (clientY: number): number | null => {
    // Find which button this Y position corresponds to using absolute positions
    for (let i = 0; i < buttonRefs.current.length; i++) {
      const button = buttonRefs.current[i];
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        // Add some padding for easier touch targeting (half the gap)
        const padding = 4;
        
        if (clientY >= buttonRect.top - padding && clientY <= buttonRect.bottom + padding) {
          return i;
        }
      }
    }
    
    return null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    
    isDraggingRef.current = true;
    const index = getButtonIndexFromTouch(e.touches[0].clientY);
    if (index !== null && index !== lastIndexRef.current) {
      lastIndexRef.current = index;
      goTo(index);
      e.preventDefault();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    
    const index = getButtonIndexFromTouch(e.touches[0].clientY);
    if (index !== null && index !== lastIndexRef.current) {
      lastIndexRef.current = index;
      goTo(index);
    }
    // Only prevent default if we're actively dragging over the controls
    if (controlsRef.current) {
      const touch = e.touches[0];
      const rect = controlsRef.current.getBoundingClientRect();
      if (touch.clientX >= rect.left && touch.clientX <= rect.right) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    lastIndexRef.current = null;
  };

  return (
    <div className={styles.root}>
      <ul className={styles.scroll} ref={scrollRef}>
        {items.map((item, i) =>
          renderItem({
            item,
            isSnapPoint: snapPointIndexes.has(i)
          })
        )}
      </ul>
      <div 
        ref={controlsRef}
        className={styles.controls} 
        aria-hidden
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {pages.map((_, i) => {
          const isActive = activePageIndex === i;
          return (
            <button
              key={i}
              ref={(el) => {
                if (el) buttonRefs.current[i] = el;
              }}
              className={cx(styles.paginationButton, {
                [styles.paginationButtonActive]: isActive
              })}
              onClick={() => goTo(i)}
              aria-label={`Go to page ${i + 1}`}
            >
              <span className={styles.paginationButtonNumber}>{i + 1}</span>
              <span className={styles.paginationButtonDot}></span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface CarouselItemProps {
  readonly isSnapPoint: boolean;
  readonly children?: React.ReactNode;
}

export const CarouselItem = ({ isSnapPoint, children }: CarouselItemProps) => (
  <li
    className={cx(
      styles.item,
      {[`${styles.itemSnapPoint}`]: isSnapPoint}
    )}
  >
    {children}
  </li>
);
