/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  memo,
  MutableRefObject,
  useLayoutEffect,
  useRef,
  useState,
  ReactNode,
  forwardRef,
  useImperativeHandle,
  RefForwardingComponent,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { createRange, createRangeFromAnchor } from './util/createRange';
import { VirtualizedListProps } from './VirtualizedListProps';
import { useForceUpdate } from './useForceUpdate';
import { useScroll } from './useScroll';

type DivRefObject = MutableRefObject<HTMLDivElement | null>;

type IndexRange = {
  startIndex: number;
  stopIndex: number;
};

type JuiVirtualizedListHandles = {
  scrollToIndex: (index: number) => void;
};

const useRange = (
  initialRange: IndexRange | (() => IndexRange),
): [IndexRange, React.Dispatch<React.SetStateAction<IndexRange>>] => {
  const [range, setRange] = useState(initialRange);
  return [range, setRange];
};

const JuiVirtualizedList: RefForwardingComponent<
  JuiVirtualizedListHandles,
  VirtualizedListProps
> = (
  {
    initialScrollToIndex,
    initialRangeSize,
    height,
    children,
  }: VirtualizedListProps,
  forwardRef,
) => {
  const getCacheKey = (i: number) => {
    const child = children[i] as { key: string };
    if (!child) return '';
    return child.key;
  };

  const updateRowHeightCache = (element: Element, i: number) => {
    let diff = 0;
    let newHeight = 0;
    let oldHeight = 0;

    if (element.clientHeight !== 0) {
      newHeight = element.clientHeight;
      oldHeight = getRowHeight(i);
      diff = newHeight - oldHeight;

      if (diff !== 0) {
        cache.set(getCacheKey(i), newHeight);
      }
    }

    return { newHeight, oldHeight, diff };
  };

  const getRowHeight = (i: number) => {
    const key = getCacheKey(i);
    return cache.has(key) ? cache.get(key) : estimateRowHeight;
  };

  const getRowsHeight = (startIndex: number, stopIndex: number) => {
    let heightBeforeIndex = 0;
    for (let i = startIndex; i <= stopIndex; i++) {
      const rowHeight = getRowHeight(i);
      heightBeforeIndex += rowHeight;
    }
    return heightBeforeIndex;
  };

  const getRowIndexFromPosition = (position: number) => {
    let rowsHeight = 0;
    for (let index = 0; index < childrenCount; index++) {
      rowsHeight += getRowHeight(index);
      if (position <= rowsHeight) {
        return index;
      }
    }
    return childrenCount - 1;
  };

  const createDisplayRange = ({
    startIndex,
    size = displayRangeSize,
  }: {
    startIndex: number;
    size?: number;
  }) => {
    return createRange({
      startIndex,
      size,
      min: 0,
      max: childrenCount - 1,
    });
  };

  const createDisplayRangeFromAnchor = ({
    anchor,
    size = displayRangeSize,
  }: {
    anchor: number;
    size?: number;
  }) => {
    return createRangeFromAnchor({
      anchor,
      size,
      min: 0,
      max: childrenCount - 1,
    });
  };

  const getChildrenEls = (contentEl: Element) => {
    return Array.prototype.slice.call(contentEl.children, 0);
  };

  const [displayRangeSize] = useState(initialRangeSize);
  const childrenCount = children.length;

  const ref: DivRefObject = useRef(null);
  const contentRef: DivRefObject = useRef(null);

  //
  // Forward ref
  //
  useImperativeHandle(forwardRef, () => ({
    scrollToIndex: (index: number) => {
      setDisplayRange(createDisplayRange({ startIndex: index - 5 }));
      scrollTo({ index });
    },
  }));

  //
  // State
  //
  const {
    scrollPosition,
    setScrollPosition,
    scrollTo,
    scrollTopUpdateTrigger,
    forceUpdateScrollTop,
  } = useScroll({
    index: initialScrollToIndex,
    offset: 0,
  });
  const { forceUpdate } = useForceUpdate();
  const [cache] = useState(new Map());
  const [estimateRowHeight] = useState(20);
  const [{ startIndex, stopIndex }, setDisplayRange] = useRange(
    createDisplayRange({ startIndex: initialScrollToIndex - 5 }),
  );

  const heightBeforeStartRow = getRowsHeight(0, startIndex - 1);
  const heightAfterStopRow = getRowsHeight(stopIndex + 1, childrenCount - 1);

  const childrenToDisplay: ReactNode[] = children.filter((_, i) => {
    return startIndex <= i && i <= stopIndex;
  });

  //
  // Update height cache
  //
  useLayoutEffect(() => {
    if (contentRef.current) {
      const contentEl = contentRef.current;
      const displayedRowsEls: Element[] = getChildrenEls(contentEl);
      displayedRowsEls.forEach((el, i) => {
        const { diff } = updateRowHeightCache(el, startIndex + i);
        if (diff !== 0 && i + startIndex < scrollPosition.index) {
          forceUpdate();
        }
      });
    }
  },              [getCacheKey(startIndex), getCacheKey(stopIndex)]);

  //
  // Handle scroll to
  //
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop =
        getRowsHeight(0, scrollPosition.index - 1) + scrollPosition.offset;
    }
  },              [scrollTopUpdateTrigger]);

  //
  // Observe dynamic rows
  //
  useLayoutEffect(() => {
    const resizeObservers: ResizeObserver[] = [];
    if (contentRef.current) {
      const contentEl = contentRef.current;

      const displayedRowsEls: Element[] = getChildrenEls(contentEl);
      displayedRowsEls.forEach((el, i) => {
        const ro = new ResizeObserver((entities: ResizeObserverEntry[]) => {
          const { diff } = updateRowHeightCache(el, startIndex + i);
          if (diff !== 0 && i + startIndex < scrollPosition.index) {
            forceUpdateScrollTop();
          }
        });
        ro.observe(el);
        resizeObservers.push(ro);
      });
    }

    return () => {
      resizeObservers.forEach(ro => ro.disconnect());
    };
  },              [getCacheKey(startIndex), getCacheKey(stopIndex)]);

  //
  // Scrolling
  //
  const handleScroll = () => {
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const anchor = getRowIndexFromPosition(scrollTop + height / 2);

      // Remember the position
      setScrollPosition({
        index: anchor,
        offset: scrollTop - getRowsHeight(0, anchor - 1),
      });

      // Update display range
      setDisplayRange(createDisplayRangeFromAnchor({ anchor }));
    }
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      style={{
        height,
        overflow: 'auto',
        // Prevent repaints on scroll
        transform: 'translateZ(0)',
        // Prevent chrome's default behavior
        overflowAnchor: 'none',
      }}
    >
      <div style={{ height: heightBeforeStartRow }} />
      <div ref={contentRef}>{childrenToDisplay}</div>
      <div style={{ height: heightAfterStopRow }} />
    </div>
  );
};

JuiVirtualizedList.defaultProps = {
  initialRangeSize: 10,
};

const MemoList = memo(forwardRef(JuiVirtualizedList));
export { MemoList as JuiVirtualizedList, JuiVirtualizedListHandles };
