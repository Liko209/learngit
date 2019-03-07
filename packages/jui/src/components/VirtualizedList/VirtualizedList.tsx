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
import { noop } from '../../foundation/utils';
import { createRange, createRangeFromAnchor } from './util/createRange';
import { JuiVirtualizedListProps, IndexRange } from './VirtualizedListProps';
import { useScroll, ScrollPosition } from './useScroll';

const slice = Array.prototype.slice;

type DivRefObject = MutableRefObject<HTMLDivElement | null>;

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
  JuiVirtualizedListProps
> = (
  {
    height,
    children,
    initialScrollToIndex = 0,
    initialRangeSize = 11,
    onScroll = noop,
    onVisibleRangeChange = noop,
    before = null,
    after = null,
  }: JuiVirtualizedListProps,
  forwardRef,
) => {
  const getChildKey = (i: number) => {
    let result: number | string = '';
    const child = children[i];
    if (child) {
      if (child.key === null) {
        throw new Error(
          "VirtualizedList Error: 'key' was required for <JuiVirtualizedList/>'s children",
        );
      }
      result = child.key;
    }
    return result;
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

  const getRowHeight = (index: number) => {
    const key = getChildKey(index);
    const height = cache.get(key);
    return typeof height === 'number' ? height : estimateRowHeight;
  };

  const getRowsHeight = (startIndex: number, stopIndex: number) => {
    let heightBeforeIndex = 0;
    for (let i = startIndex; i <= stopIndex; i++) {
      const rowHeight = getRowHeight(i);
      heightBeforeIndex += rowHeight;
    }
    return heightBeforeIndex;
  };

  const getRowOffsetTop = (index: number) => {
    return getBeforeHeight() + getRowsHeight(0, index - 1);
  };

  const updateBeforeHeight = (element: HTMLElement) => {
    cache.set('before', element.offsetHeight);
  };

  const getBeforeHeight = () => {
    return before ? cache.get('before') || 0 : 0;
  };

  const getRowIndexFromPosition = (position: number) => {
    let rowsHeight = getBeforeHeight();
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
    });
  };

  const getVisibleRange = (scrollTop: number) => {
    return {
      startIndex: getRowIndexFromPosition(scrollTop),
      stopIndex: getRowIndexFromPosition(scrollTop + height),
    };
  };

  const getRowsEls = (contentEl: HTMLElement | null) => {
    return contentEl !== null ? slice.call(contentEl.children, 0) : [];
  };

  const scrollToPosition = (position: ScrollPosition) => {
    if (ref.current) {
      ref.current.scrollTop = getRowOffsetTop(position.index) + position.offset;
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

  //
  // HtmlElement ref
  //
  const ref: DivRefObject = useRef(null);
  const beforeRef: DivRefObject = useRef(null);
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
  const [cache] = useState(new Map<string | number, number>());
  const [estimateRowHeight] = useState(60);
  const [displayRange, setDisplayRange] = useRange(
    createDisplayRange({ startIndex: initialScrollToIndex - 5 }),
  );
  const { startIndex: _startIndex, stopIndex: _stopIndex } = displayRange;

  // ------------------------------------------------------------
  const prevStartChildRef = useRef(children[_startIndex]);
  const prevStartIndexRef = useRef(_startIndex);
  const prevChildrenCountRef = useRef(childrenCount);

  let startIndex: number = _startIndex;
  let stopIndex: number = _stopIndex;
  const scrollEffectTriggerRef = useRef(0);

  if (prevChildrenCountRef.current !== children.length) {
    const prevStartChild = prevStartChildRef.current;
    const offset =
      children.findIndex(child => child.key === prevStartChild.key) -
      prevStartIndexRef.current;

    if (offset !== 0) {
      startIndex += offset;
      stopIndex += offset;

      // TODO avoid change state this way
      displayRange.startIndex = startIndex;
      displayRange.stopIndex = stopIndex;
      scrollPosition.index = Math.max(scrollPosition.index + offset, 0);
      scrollEffectTriggerRef.current++; // Trigger scroll after render
    }
  }

  prevStartChildRef.current = children[_startIndex];
  prevStartIndexRef.current = _startIndex;
  prevChildrenCountRef.current = children.length;
  // ------------------------------------------------------------

  //
  // Update before content height when before content changed
  //
  useLayoutEffect(() => {
    if (beforeRef.current) {
      updateBeforeHeight(beforeRef.current);
    }
  },              [!!before]);

  //
  // Scroll to last remembered position,
  // The position was remembered in handleScroll() function
  //
  useLayoutEffect(() => {
    scrollToPosition(scrollPosition);
  },              [!!before, scrollEffectTriggerRef.current]);

  //
  // Emit visible range change when component mounted
  //
  useLayoutEffect(() => {
    const listEl = ref.current;
    if (listEl) {
      const visibleRange = getVisibleRange(listEl.scrollTop);
      onVisibleRangeChange(visibleRange);
    }
  },              []);

  //
  // Update height cache and observe dynamic rows
  //
  useLayoutEffect(() => {
    const handleRowSizeChange = (el: HTMLElement, i: number) => {
      const { diff } = updateRowHeightCache(el, startIndex + i);
      const beforeFirstVisibleRow = i + startIndex < scrollPosition.index;
      if (diff !== 0 && beforeFirstVisibleRow) {
        scrollToPosition(scrollPosition);
      }
    };

    const handleRowsSizeChange = (rowElements: HTMLElement[]) => {
      rowElements.forEach(handleRowSizeChange);
    };

    const observeDynamicRows = (rowElements: HTMLElement[]) => {
      return rowElements.map((el, i) => {
        const observer = new ResizeObserver(() => handleRowSizeChange(el, i));
        observer.observe(el);
        return observer;
      });
    };

    const unobserveDynamicRows = (observers: ResizeObserver[]) => {
      observers.forEach(ro => ro.disconnect());
    };

    const displayedRowsEls = getRowsEls(contentRef.current);
    handleRowsSizeChange(displayedRowsEls);
    const resizeObservers = observeDynamicRows(displayedRowsEls);

    return () => unobserveDynamicRows(resizeObservers);
  },              [getChildKey(startIndex), getChildKey(stopIndex)]);

  //
  // Scrolling
  //
  const handleScroll = (event: React.UIEvent) => {
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;

      const visibleRange = getVisibleRange(scrollTop);

      if (cache.has(getChildKey(visibleRange.startIndex))) {
        // If we know the real height of this row
        // Remember current scroll position
        setScrollPosition({
          index: visibleRange.startIndex,
          offset: scrollTop - getRowOffsetTop(visibleRange.startIndex),
        });
      }

      // Update display range
      const anchor = getRowIndexFromPosition(scrollTop + height / 2);
      const range = createDisplayRangeFromAnchor({ anchor });
      setDisplayRange(range);

      // Remember startChild/startIndex/childrenCount which would been
      // used for detect list change when re-rendering
      prevStartChildRef.current = children[range.startIndex];
      prevStartIndexRef.current = range.startIndex;
      prevChildrenCountRef.current = children.length;

      onScroll(event);
      onVisibleRangeChange(visibleRange);
    }
  };

  const wrappedBefore = before ? <div ref={beforeRef}>{before}</div> : null;
  const heightBeforeStartRow = getRowsHeight(0, startIndex - 1);
  const heightAfterStopRow = getRowsHeight(stopIndex + 1, childrenCount - 1);
  const childrenToDisplay: ReactNode[] = children.filter((_, i) => {
    return startIndex <= i && i <= stopIndex;
  });
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
      {wrappedBefore}
      <div style={{ height: heightBeforeStartRow }} />
      <div ref={contentRef}>{childrenToDisplay}</div>
      <div style={{ height: heightAfterStopRow }} />
      {after}
    </div>
  );
};

const MemoList = memo(
  forwardRef(JuiVirtualizedList),
) as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    {
      initialScrollToIndex?: number;
      initialRangeSize?: number;
      onScroll?: (event: React.UIEvent) => void;
      onVisibleRangeChange?: (visibleRange: IndexRange) => void;
      before?: React.ReactNode;
      after?: React.ReactNode;
      height: number;
      children: JSX.Element[];
    } & React.RefAttributes<JuiVirtualizedListHandles>
  >
>;

export {
  MemoList as JuiVirtualizedList,
  JuiVirtualizedListProps,
  JuiVirtualizedListHandles,
};
