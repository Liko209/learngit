import React, {
  memo,
  MutableRefObject,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { createRange } from './util/createRange';
import { VirtualizedListProps } from './VirtualizedListProps';

type DivRefObject = MutableRefObject<HTMLDivElement | null>;

type IndexRange = {
  startIndex: number;
  stopIndex: number;
};

const useRange = (
  initialRange: IndexRange | (() => IndexRange),
): [IndexRange, React.Dispatch<React.SetStateAction<IndexRange>>] => {
  const [range, setRange] = useState(initialRange);
  return [range, setRange];
};

// const useScrollTop = (
//   initialScrollTop: number
// ): [number, (newValue: number) => void] => {
//   const [value, setValue] = useState(initialScrollTop);

//   const setScrollTop = (newValue: number) => {
//     if (newValue !== value && newValue >= 0) {
//       setValue(newValue);
//     }
//   };

//   return [value, setScrollTop];
// };

// const applyScrollTop = ({
//   ref,
//   scrollTop
// }: {
//   ref: MutableRefObject<HTMLElement | null>;
//   scrollTop: number;
// }) => {
//   useLayoutEffect(() => {
//     const targetEl = ref.current;
//     if (targetEl) {
//       targetEl.scrollTop = scrollTop;
//     }
//   }, [scrollTop]);
// };

const JuiVirtualizedList = ({ height, children }: VirtualizedListProps) => {
  const getCacheKey = (i: number) => {
    const child = children[i] as { key: string };
    if (!child) return '';
    return child.key;
  };

  const updateRowHeightCache = (element: Element, i: number) => {
    const key = getCacheKey(startIndex + i);
    const newHeight = element.clientHeight;
    const oldHeight = cache.get(key);
    const diff = newHeight - oldHeight;

    if (diff !== 0) {
      cache.set(key, element.clientHeight);
    }

    return diff;
  };

  const getRowHeight = (i: number) => {
    const key = getCacheKey(i);
    return cache.has(key) ? cache.get(key) : estimateRowHeight;
  };

  const getAllRowsHeight = () => {
    return getRowsHeight(0, childrenCount - 1);
  };

  const getRowsHeight = (startIndex: number, stopIndex: number) => {
    let heightBeforeIndex = 0;
    for (let i = startIndex; i <= stopIndex; i++) {
      const rowHeight = getRowHeight(i);
      heightBeforeIndex += rowHeight;
    }
    return heightBeforeIndex;
  };

  const createDisplayRange = (anchor: number, size?: number) => {
    return createRange({
      anchor,
      size: size || batchCount,
      min: 0,
      max: childrenCount - 1,
    });
  };

  const getChildrenEls = (contentEl: Element) => {
    return Array.prototype.slice.call(contentEl.children, 0);
  };

  const batchCount = 11;
  const childrenCount = children.length;

  const ref: DivRefObject = useRef(null);
  const innerRef: DivRefObject = useRef(null);
  const contentRef: DivRefObject = useRef(null);

  //
  // State
  //
  const [anchor] = useState(0);
  const [cache] = useState(new Map());
  // const [scrollTop] = useScrollTop(0);
  const [scrollOffset] = useState(0);
  const [estimateRowHeight, setEstimateRowHeight] = useState(10);
  const [{ startIndex, stopIndex }, setDisplayRange] = useRange(
    createDisplayRange(anchor),
  );

  const heightBeforeStartRow = getRowsHeight(0, startIndex - 1);
  const totalHeight = getAllRowsHeight();

  const childrenToDisplay: ReactNode[] = children.filter((_, i) => {
    return startIndex <= i && i <= stopIndex;
  });

  // applyScrollTop({
  //   ref,
  //   scrollTop: scrollTop
  // });

  useLayoutEffect(() => {
    const resizeObservers: ResizeObserver[] = [];
    if (contentRef.current) {
      const contentEl = contentRef.current;
      const { clientHeight: contentHeight } = contentEl;

      if (contentHeight < height) {
        //
        // Expand display range when there still
        // space to place more items.
        //
        const rangeSize = stopIndex - startIndex;
        const newRangeSize = rangeSize + batchCount;
        setDisplayRange(createDisplayRange(anchor, newRangeSize));
      }

      const displayedRowsEls: Element[] = getChildrenEls(contentEl);

      //
      // Update height cache and observe dynamic rows
      //
      displayedRowsEls.forEach((el, i) => {
        updateRowHeightCache(el, i);

        const ro = new ResizeObserver(() => {
          const rowHeightDiff = updateRowHeightCache(el, i);
          if (rowHeightDiff !== 0) {
            console.log('rowHeightDiff', rowHeightDiff);
            // setDisplayRange({ startIndex, stopIndex });
          }
        });

        ro.observe(contentEl);
        resizeObservers.push(ro);
      });

      //
      // Update estimateRowHeight
      //
      const newEstimateRowHeight = Math.floor(
        getAllRowsHeight() / childrenCount,
      );
      setEstimateRowHeight(newEstimateRowHeight);
    }

    return () => {
      resizeObservers.forEach(ro => ro.disconnect());
    };
  },              [getCacheKey(startIndex), getCacheKey(stopIndex)]);

  useLayoutEffect(() => {
    if (ref.current) {
      const newScrollTop = getRowsHeight(0, anchor - 1);
      ref.current.scrollTop = newScrollTop + scrollOffset;
    }
  },              [anchor, scrollOffset]);

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (ref.current) {
      //
      // When scrolling, update displayRange.
      //
      const centerOfViewport = ref.current.scrollTop + height / 2;
      const newAnchor = Math.floor(centerOfViewport / estimateRowHeight);
      setDisplayRange(createDisplayRange(newAnchor));
    }
  };

  const handleClick = () => {};

  return (
    <div
      ref={ref}
      onClick={handleClick}
      onScroll={handleScroll}
      style={{
        height,
        overflow: 'auto',
      }}
    >
      <div
        ref={innerRef}
        style={{
          position: 'relative',
          top: heightBeforeStartRow,
          height: totalHeight - heightBeforeStartRow,
        }}
      >
        <div ref={contentRef}>{childrenToDisplay}</div>
      </div>
    </div>
  );
};

JuiVirtualizedList.defaultProps = {};

const MemoList = memo(JuiVirtualizedList);
export { MemoList as JuiVirtualizedList };
