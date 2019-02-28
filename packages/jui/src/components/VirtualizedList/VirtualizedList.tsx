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
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { createRange, createRangeFromAnchor } from './util/createRange';
import { VirtualizedListProps } from './VirtualizedListProps';
import { useForceUpdate } from './useForceUpdate';

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

const JuiVirtualizedList = ({
  initialScrollToIndex,
  initialRangeSize,
  height,
  children,
}: VirtualizedListProps) => {
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
  const innerRef: DivRefObject = useRef(null);
  const contentRef: DivRefObject = useRef(null);

  //
  // State
  //
  const [scrollToIndex, setScrollToIndex] = useState(initialScrollToIndex);
  const {
    updateTrigger: scrollTopUpdateTrigger,
    forceUpdate: forceUpdateScrollTop,
  } = useForceUpdate();
  const { forceUpdate } = useForceUpdate();
  const [cache] = useState(new Map());
  const [scrollOffset, setScrollOffset] = useState(0);
  const [estimateRowHeight] = useState(20);
  const [{ startIndex, stopIndex }, setDisplayRange] = useRange(
    createDisplayRange({ startIndex: scrollToIndex - 5 }),
  );

  const heightBeforeStartRow = getRowsHeight(0, startIndex - 1);
  const heightAfterStopRow = getRowsHeight(stopIndex + 1, childrenCount - 1);

  const childrenToDisplay: ReactNode[] = children.filter((_, i) => {
    return startIndex <= i && i <= stopIndex;
  });

  useLayoutEffect(() => {
    if (contentRef.current) {
      const contentEl = contentRef.current;

      //
      // Update height cache
      //
      const displayedRowsEls: Element[] = getChildrenEls(contentEl);
      displayedRowsEls.forEach((el, i) => {
        const { diff } = updateRowHeightCache(el, startIndex + i);
        if (diff !== 0 && i + startIndex < scrollToIndex) {
          forceUpdate();
        }
      });
    }
  },              [getCacheKey(startIndex), getCacheKey(stopIndex)]);

  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.scrollTop =
        getRowsHeight(0, scrollToIndex - 1) + scrollOffset;
    }
  },              [scrollTopUpdateTrigger]);

  useLayoutEffect(() => {
    const resizeObservers: ResizeObserver[] = [];
    if (contentRef.current) {
      const contentEl = contentRef.current;

      //
      // Observe dynamic rows
      //
      const displayedRowsEls: Element[] = getChildrenEls(contentEl);
      displayedRowsEls.forEach((el, i) => {
        const ro = new ResizeObserver((entities: ResizeObserverEntry[]) => {
          const { diff } = updateRowHeightCache(el, startIndex + i);
          if (diff !== 0 && i + startIndex < scrollToIndex) {
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

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (ref.current) {
      //
      // When scrolling, update displayRange.
      //
      console.time('handleScroll');

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
      const scrollTop = ref.current.scrollTop;
      const anchor = getRowIndexFromPosition(scrollTop + height / 2);

      console.timeEnd('handleScroll');
      setScrollToIndex(anchor);
      setScrollOffset(scrollTop - getRowsHeight(0, anchor - 1));
      setDisplayRange(
        createDisplayRangeFromAnchor({
          anchor,
        }),
      );
    }
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      style={{
        height,
        overflow: 'auto',
        overflowAnchor: 'none',
      }}
    >
      <div style={{ height: heightBeforeStartRow }} />
      <div ref={innerRef}>
        <div ref={contentRef}>{childrenToDisplay}</div>
      </div>
      <div style={{ height: heightAfterStopRow }} />
    </div>
  );
};

JuiVirtualizedList.defaultProps = {
  initialRangeSize: 10,
};

const MemoList = memo(JuiVirtualizedList);
export { MemoList as JuiVirtualizedList };
