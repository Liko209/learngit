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
import { useScroll, ScrollPosition } from './useScroll';

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
  const getChildKey = (i: number) => {
    const child = children[i];
    if (!child) return '';
    return child.key;
  };

  const updateRowHeightCache = (element: HTMLElement, i: number) => {
    let diff = 0;
    let newHeight = 0;
    let oldHeight = 0;

    if (element.offsetHeight !== 0) {
      newHeight = element.offsetHeight;
      oldHeight = getRowHeight(i);
      diff = newHeight - oldHeight;

      if (diff !== 0) {
        cache.set(getChildKey(i), newHeight);
      }
    }

    return { newHeight, oldHeight, diff };
  };

  const getRowHeight = (i: number) => {
    const key = getChildKey(i);
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
      if (position < rowsHeight) {
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

  const getChildrenEls = (contentEl: HTMLElement) => {
    return Array.prototype.slice.call(contentEl.children, 0);
  };

  const scrollToPosition = (position: ScrollPosition) => {
    if (ref.current) {
      ref.current.scrollTop =
        getRowsHeight(0, position.index - 1) + position.offset;
    }
  };

  //
  // Forward ref
  //
  useImperativeHandle(forwardRef, () => ({
    scrollToIndex: (index: number) => {
      setDisplayRange(createDisplayRange({ startIndex: index - 5 }));
      setScrollPosition({ index });
      scrollEffectTriggerRef.current++; // Trigger scroll after next render
    },
  }));

  const ref: DivRefObject = useRef(null);
  const contentRef: DivRefObject = useRef(null);

  //
  // State
  //
  const [displayRangeSize] = useState(initialRangeSize);
  const childrenCount = children.length;
  const { scrollPosition, setScrollPosition } = useScroll({
    index: initialScrollToIndex,
    offset: 0,
  });
  const [cache] = useState(new Map());
  const [estimateRowHeight] = useState(20);
  const [
    { startIndex: _startIndex, stopIndex: _stopIndex },
    setDisplayRange,
  ] = useRange(createDisplayRange({ startIndex: initialScrollToIndex - 5 }));

  // ------------------------------------------------------------
  const prevStartChildRef = useRef(children[_startIndex]);
  const prevStartIndexRef = useRef(_startIndex);
  const prevChildrenCountRef = useRef(childrenCount);
  const totalOffsetRef = useRef(0);

  let startIndex: number = _startIndex;
  let stopIndex: number = _stopIndex;
  const scrollEffectTriggerRef = useRef(0);

  if (prevChildrenCountRef.current !== children.length) {
    const prevStartChild = prevStartChildRef.current;
    const offset =
      children.findIndex(child => child.key === prevStartChild.key) -
      prevStartIndexRef.current;

    totalOffsetRef.current += offset;
    const totalOffset = Math.max(totalOffsetRef.current, 0);

    if (offset !== 0) {
      startIndex = startIndex + totalOffset;
      stopIndex = stopIndex + totalOffset;
      scrollPosition.index = Math.max(scrollPosition.index + offset, 0);
      scrollEffectTriggerRef.current++; // Trigger scroll after render
    }
  }

  console.log('currentOffset: ', totalOffsetRef.current);
  console.log('_startIndex: ', _startIndex, _stopIndex);
  console.log('startIndex: ', startIndex, stopIndex);
  console.log('scrollPosition: ', scrollPosition);

  prevStartChildRef.current = children[_startIndex];
  prevStartIndexRef.current = _startIndex;
  prevChildrenCountRef.current = children.length;
  // ------------------------------------------------------------

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
      const displayedRowsEls: HTMLElement[] = getChildrenEls(contentEl);
      displayedRowsEls.forEach((el, i) => {
        const { diff } = updateRowHeightCache(el, startIndex + i);
        if (diff !== 0 && i + startIndex < scrollPosition.index) {
          scrollToPosition(scrollPosition);
        }
      });
    }
  },              [getChildKey(startIndex), getChildKey(stopIndex)]);

  //
  // Handle scroll to
  //
  useLayoutEffect(() => {
    scrollToPosition(scrollPosition);
  },              [scrollEffectTriggerRef.current]);

  //
  // Observe dynamic rows
  //
  useLayoutEffect(() => {
    const resizeObservers: ResizeObserver[] = [];
    if (contentRef.current) {
      const contentEl = contentRef.current;

      const displayedRowsEls: HTMLElement[] = getChildrenEls(contentEl);
      displayedRowsEls.forEach((el, i) => {
        const ro = new ResizeObserver((entities: ResizeObserverEntry[]) => {
          const { diff } = updateRowHeightCache(el, startIndex + i);
          if (diff !== 0 && i + startIndex < scrollPosition.index) {
            scrollToPosition(scrollPosition);
          }
        });
        ro.observe(el);
        resizeObservers.push(ro);
      });
    }

    return () => {
      resizeObservers.forEach(ro => ro.disconnect());
    };
  },              [getChildKey(startIndex), getChildKey(stopIndex)]);

  //
  // Scrolling
  //
  const handleScroll = () => {
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const anchor = getRowIndexFromPosition(scrollTop + height / 2);
      const index = getRowIndexFromPosition(scrollTop);

      // Remember the position
      setScrollPosition({
        index,
        offset: scrollTop - getRowsHeight(0, index - 1),
      });

      // Update display range
      const range = createDisplayRangeFromAnchor({ anchor });
      setDisplayRange(createDisplayRangeFromAnchor({ anchor }));
      prevStartChildRef.current = children[range.startIndex];
      prevStartIndexRef.current = range.startIndex;
      prevChildrenCountRef.current = children.length;
      totalOffsetRef.current = 0;
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
