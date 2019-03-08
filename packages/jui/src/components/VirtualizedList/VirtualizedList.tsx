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
  useEffect,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { noop } from '../../foundation/utils';
import { createRange } from './util/createRange';
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
    minRowHeight,
    overscan = 5,
    children,
    initialScrollToIndex = 0,
    onScroll = noop,
    onVisibleRangeChange = noop,
    onRenderedRangeChange = noop,
    before = null,
    after = null,
    stickToBottom,
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

  const getEstimateRowHeight = () => {
    let result: number;
    if (cache.size > 0) {
      let totalHeight = 0;
      for (const [, height] of cache) {
        totalHeight += height;
      }
      result = totalHeight / cache.size;
    } else {
      result = minRowHeight;
    }
    return result;
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

  const createRenderRange = ({
    startIndex,
    size = renderedRangeSize,
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

  const getVisibleRange = (scrollTop: number) => {
    return {
      startIndex: getRowIndexFromPosition(scrollTop),
      stopIndex: getRowIndexFromPosition(scrollTop + height),
    };
  };

  const getRowsEls = (contentEl: HTMLElement | null) => {
    return contentEl !== null ? slice.call(contentEl.children, 0) : [];
  };

  const scrollToPosition = ({
    index,
    offset,
    options = true,
  }: ScrollPosition) => {
    if (ref.current) {
      if (options === true) {
        ref.current.scrollTop = getRowOffsetTop(index) + offset;
      }
      if (options === false) {
        ref.current.scrollTop = getRowOffsetTop(index + 1) - height - offset;
      }
    }
  };
  const scrollToBottom = () => {
    return scrollToPosition({
      index: childrenCount - 1,
      offset: 99999,
      options: true,
    });
  };
  //
  // Forward ref
  //
  useImperativeHandle(forwardRef, () => ({
    scrollToIndex: (index: number) => {
      setRenderedRange(createRenderRange({ startIndex: index - 5 }));
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
  const [cache] = useState(new Map<string | number, number>());
  const { scrollPosition, setScrollPosition } = useScroll({
    index: initialScrollToIndex,
    offset: 0,
  });
  const [estimateRowHeight] = useState(60);
  const renderedRangeSize = Math.ceil(height / getEstimateRowHeight());
  const [renderedRange, setRenderedRange] = useRange(
    createRenderRange({ startIndex: initialScrollToIndex - 5 }),
  );
  const childrenCount = children.length;
  const { startIndex: _startIndex, stopIndex: _stopIndex } = renderedRange;

  // ------------------------------------------------------------
  const prevStartChildRef = useRef(children[_startIndex]);
  const prevStartIndexRef = useRef(_startIndex);
  const prevChildrenCountRef = useRef(childrenCount);
  const prevAtBottomRef = useRef(false);
  const shouldScrollToBottom = () => prevAtBottomRef.current && stickToBottom;

  let startIndex: number = _startIndex;
  let stopIndex: number = _stopIndex;
  const scrollEffectTriggerRef = useRef(0);

  if (prevChildrenCountRef.current !== children.length) {
    const prevStartChild = prevStartChildRef.current;
    const offset =
      children.findIndex(
        (child: JSX.Element) => child.key === prevStartChild.key,
      ) - prevStartIndexRef.current;

    if (offset !== 0) {
      startIndex += offset;
      stopIndex += offset;

      // TODO avoid change state this way
      renderedRange.startIndex = startIndex;
      renderedRange.stopIndex = stopIndex;
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
    if (shouldScrollToBottom()) {
      return scrollToBottom();
    }
    scrollToPosition(scrollPosition);
  },              [!!before, scrollEffectTriggerRef.current, height, childrenCount]);

  //
  // Emit visible range change when component mounted
  //
  useLayoutEffect(() => {
    const listEl = ref.current;
    if (listEl) {
      const visibleRange = getVisibleRange(listEl.scrollTop);
      onVisibleRangeChange(visibleRange);
      onRenderedRangeChange(visibleRange);
    }
  },              []);

  //
  // Update height cache and observe dynamic rows
  //
  useLayoutEffect(() => {
    const handleRowSizeChange = (el: HTMLElement, i: number) => {
      const { diff } = updateRowHeightCache(el, startIndex + i);
      if (diff === 0) {
        return;
      }

      if (shouldScrollToBottom()) {
        return scrollToBottom();
      }

      const beforeFirstVisibleRow = i + startIndex < scrollPosition.index;
      if (beforeFirstVisibleRow) {
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
      observers.forEach((ro: ResizeObserver) => ro.disconnect());
    };

    const renderedRowsEls = getRowsEls(contentRef.current);
    handleRowsSizeChange(renderedRowsEls);
    const resizeObservers = observeDynamicRows(renderedRowsEls);

    return () => unobserveDynamicRows(resizeObservers);
  },              [
    getChildKey(startIndex),
    getChildKey(Math.min(stopIndex, childrenCount - 1)),
  ]);

  useEffect(() => {
    if (ref.current) {
      const { scrollTop } = ref.current;
      prevAtBottomRef.current =
        height >= getRowOffsetTop(childrenCount) - scrollTop;
    }
  });
  //
  // Scrolling
  //
  const prevScrollTopRef = useRef(0);
  const handleScroll = (event: React.UIEvent) => {
    if (ref.current) {
      const { scrollTop } = ref.current;

      const visibleRange = getVisibleRange(scrollTop);

      if (cache.has(getChildKey(visibleRange.startIndex))) {
        // If we know the real height of this row
        // Remember current scroll position
        const offset = scrollTop - getRowOffsetTop(visibleRange.startIndex);
        setScrollPosition({
          offset,
          index: visibleRange.startIndex,
        });
      }

      // Update rendered range
      let renderedRange: IndexRange;
      const prevScrollTop = prevScrollTopRef.current;
      const direction = scrollTop > prevScrollTop ? 'down' : 'up';
      if ('up' === direction) {
        renderedRange = {
          startIndex: Math.max(visibleRange.startIndex - overscan, 0),
          stopIndex: visibleRange.stopIndex,
        };
      } else if ('down' === direction) {
        renderedRange = {
          startIndex: visibleRange.startIndex,
          stopIndex: visibleRange.stopIndex + overscan,
        };
      } else {
        renderedRange = { ...visibleRange };
      }
      setRenderedRange(renderedRange);

      // Emit events
      onScroll(event);
      onVisibleRangeChange(visibleRange);
      onRenderedRangeChange(renderedRange);

      // Remember startChild/startIndex/childrenCount which would been
      // used for detect list change when re-rendering
      prevStartChildRef.current = children[renderedRange.startIndex];
      prevStartIndexRef.current = renderedRange.startIndex;
      prevChildrenCountRef.current = children.length;
      // Remember scrollTop to check scroll direction
      prevScrollTopRef.current = scrollTop;
    }
  };

  const wrappedBefore = before ? <div ref={beforeRef}>{before}</div> : null;
  const heightBeforeStartRow = getRowsHeight(0, startIndex - 1);
  const heightAfterStopRow = getRowsHeight(stopIndex + 1, childrenCount - 1);
  const childrenToRender: ReactNode[] = children.filter((_, i) => {
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
      <div ref={contentRef}>{childrenToRender}</div>
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
      onScroll?: (event: React.UIEvent) => void;
      onVisibleRangeChange?: (range: IndexRange) => void;
      onRenderedRangeChange?: (range: IndexRange) => void;
      before?: React.ReactNode;
      after?: React.ReactNode;
      height: number;
      minRowHeight: number;
      overscan?: number;
      stickToBottom?: boolean;
      children: JSX.Element[];
    } & React.RefAttributes<JuiVirtualizedListHandles>
  >
>;

export {
  MemoList as JuiVirtualizedList,
  JuiVirtualizedListProps,
  JuiVirtualizedListHandles,
};
