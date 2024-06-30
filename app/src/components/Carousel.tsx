import React, { CSSProperties } from 'react';
import { useSnapCarousel } from 'react-snap-carousel';

const styles = {
  root: {
    display: 'flex',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center'
    // padding: '10px'
  },
  scroll: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'auto',
    scrollSnapType: 'y mandatory',
    height: '100%',
    width: '100%',
    // margin: '0 5px 0 5px',
    // alignItems: 'center'
  },
  item: {
    width: '100%',
    height: '100%',
    flexShrink: 0,
    alignItems: "center",
    display: "flex"
  },
  itemSnapPoint: {
    scrollSnapAlign: 'start'
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    right: '15px',
    position: 'absolute'
  },
  nextPrevButton: {},
  nextPrevButtonDisabled: { opacity: 0.3 },
  pagination: {
    display: 'flex'
  },
  paginationButton: {
    margin: '10px 0 10px 0'
  },
  paginationButtonActive: { opacity: 0.3 },
  pageIndicator: {
    display: 'flex',
    justifyContent: 'center'
  }
} satisfies Record<string, CSSProperties>;

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

export const Carousel = <T extends any>({
  items,
  renderItem,
}: CarouselProps<T>) => {
  const {
    scrollRef,
    pages,
    activePageIndex,
    prev,
    next,
    goTo,
    snapPointIndexes,
  } = useSnapCarousel({ axis: "y" });
  return (
    <div style={styles.root}>
      <ul style={styles.scroll} ref={scrollRef}>
        {items.map((item, i) =>
          renderItem({
            item,
            isSnapPoint: snapPointIndexes.has(i)
          })
        )}
      </ul>
      <div style={styles.controls} aria-hidden>
        {/* <button
          style={{
            ...styles.nextPrevButton,
            ...(activePageIndex <= 0 ? styles.nextPrevButtonDisabled : {})
          }}
          onClick={() => prev()}
        >
          Prev
        </button> */}
        {pages.map((_, i) => (
          <button
            key={i}
            style={{
              ...styles.paginationButton,
              ...(activePageIndex === i ? styles.paginationButtonActive : {}),
            }}
            onClick={() => goTo(i)}
          >
            {i + 1}
          </button>
        ))}
        {/* <button
          style={{
            ...styles.nextPrevButton,
            ...(activePageIndex === pages.length - 1
              ? styles.nextPrevButtonDisabled
              : {})
          }}
          onClick={() => next()}
        >
          Next
        </button> */}
      </div>
      {/* <div style={styles.pageIndicator}>
        {activePageIndex + 1} / {pages.length}
      </div> */}
    </div>
  );
};

interface CarouselItemProps {
  readonly isSnapPoint: boolean;
  readonly children?: React.ReactNode;
}

export const CarouselItem = ({ isSnapPoint, children }: CarouselItemProps) => (
  <li
    style={{
      ...styles.item,
      ...(isSnapPoint ? styles.itemSnapPoint : {})
    }}
  >
    {children}
  </li>
);
