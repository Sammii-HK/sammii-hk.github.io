import React, { CSSProperties, ReactEventHandler } from 'react';
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

  // const cx = classNames.bind(styles);

  // const cx = classNames.bind(styles);

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    // console.log("e", e)
    console.log("e.screenX", e.screenX);
    console.log("e.screenY", e.screenY);
    
  }

  return (
    <div className={styles.root} onPointerMove={handlePointerMove}>
      <ul className={styles.scroll} ref={scrollRef}>
        {items.map((item, i) =>
          renderItem({
            item,
            isSnapPoint: snapPointIndexes.has(i)
          })
        )}
      </ul>
      <div className={styles.controls} aria-hidden>
        {pages.map((_, i) => (
          <button
            key={i}
            className={
              cx(
                styles.paginationButton,
                // (activePageIndex === i ? styles.paginationButtonActive : {}),
                { [`${styles.paginationButtonActive}`]: activePageIndex === i}
              )
            }
            onClick={() => goTo(i)}
          >
            {i + 1}
          </button>
        ))}
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
      // (isSnapPoint ? styles.itemSnapPoint : {})
      {[`${styles.itemSnapPoint}`]: isSnapPoint}
    )}
  >
    {children}
  </li>
);
