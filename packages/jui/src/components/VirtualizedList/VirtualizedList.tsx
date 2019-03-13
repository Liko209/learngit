/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  forwardRef,
  memo,
  MutableRefObject,
  ReactNode,
  RefForwardingComponent,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { noop } from '../../foundation/utils';
import { IndexRange, JuiVirtualizedListProps } from './types';
import { useRange, useRowManager, useScroll, ScrollPosition } from './hooks';
import {
  createKeyMapper,
  createRange,
  getChildren,
  isRangeEqual,
} from './utils';
import { usePrevious } from './hooks/usePrevious';

type DivRefObject = MutableRefObject<HTMLDivElement | null>;
type JuiVirtualizedListHandles = {
  scrollToIndex: (index: number) => void;
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
  const computeVisibleRange = () => {
    let result: IndexRange;
    if (ref.current) {
      const { scrollTop } = ref.current;
      const top = scrollTop;
      const bottom = scrollTop + height;
      result = {
        startIndex: rowManager.getRowIndexFromPosition(top, maxIndex),
        stopIndex: rowManager.getRowIndexFromPosition(bottom, maxIndex, true),
      };
    } else {
      result = { startIndex: 0, stopIndex: 0 };
    }
    return result;
  };

  const computeRenderedRange = (
    visibleRange: IndexRange,
    overscanDirection: 'up' | 'down',
  ) => {
    const renderedRange: IndexRange = { ...visibleRange };

    if ('up' === overscanDirection) {
      renderedRange.startIndex = Math.max(
        visibleRange.startIndex - overscan,
        0,
      );
    }

    if ('down' === overscanDirection) {
      renderedRange.stopIndex = visibleRange.stopIndex + overscan;
    }

    return renderedRange;
  };

  const fixIndexWhenChildrenChanged = (
    renderedRange: IndexRange,
    prevChildrenCount: number | null,
    prevStartIndex: number | null,
    prevStartChild: JSX.Element | null,
  ) => {
    const {
      startIndex: unfixedStartIndex,
      stopIndex: unfixedStopIndex,
    } = renderedRange;
    let startIndex: number = unfixedStartIndex;
    let stopIndex: number = unfixedStopIndex;

    if (
      prevChildrenCount !== null &&
      prevStartIndex !== null &&
      prevStartChild !== null &&
      prevChildrenCount !== children.length
    ) {
      const _prevStartChild = prevStartChild;
      const offset =
        children.findIndex(
          (child: JSX.Element) => child.key === _prevStartChild.key,
        ) - prevStartIndex;

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

    return { startIndex, stopIndex };
  };

  const scrollToPosition = ({
    index,
    offset,
    options = true,
  }: ScrollPosition) => {
    if (ref.current) {
      if (options === true) {
        ref.current.scrollTop = rowManager.getRowOffsetTop(index) + offset;
      } else {
        ref.current.scrollTop =
          rowManager.getRowOffsetTop(index + 1) - height - offset;
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

  const keyMapper = createKeyMapper(children);
  const childrenCount = children.length;
  const minIndex = 0;
  const maxIndex = childrenCount - 1;

  //
  // Forward ref
  //
  useImperativeHandle(forwardRef, () => ({
    scrollToBottom,
    isAtBottom: () => {
      return prevAtBottomRef.current;
    },
    scrollToIndex: (index: number) => {
      if (index + 1 > children.length) {
        return;
      }
      setRenderedRange(
        createRange({ startIndex: index - 5, size: renderedRangeSize, min: 0 }),
      );
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
  const rowManager = useRowManager({ minRowHeight, keyMapper });
  const { scrollPosition, setScrollPosition } = useScroll({
    index: initialScrollToIndex,
    offset: 0,
  });
  const renderedRangeSize = Math.ceil(
    height / rowManager.getEstimateRowHeight(),
  );

  const { range: renderedRange, setRange: setRenderedRange } = useRange(
    createRange({
      startIndex: initialScrollToIndex,
      size: renderedRangeSize,
      min: minIndex,
      max: maxIndex,
    }),
  );

  const prevAtBottomRef = useRef(false);
  const shouldScrollToBottom = () => prevAtBottomRef.current && stickToBottom;

  const scrollEffectTriggerRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const prevVisibleRange = usePrevious(() => computeVisibleRange()) || {
    startIndex: 0,
    stopIndex: 0,
  };
  const { startIndex, stopIndex } = fixIndexWhenChildrenChanged(
    renderedRange,
    usePrevious(() => children.length),
    usePrevious(() => startIndex),
    usePrevious(() => children[startIndex]),
  );

  //
  // Update before content height when before content changed
  //
  useLayoutEffect(() => {
    const height = beforeRef.current ? beforeRef.current.offsetHeight : 0;
    rowManager.setBeforeHeight(height);
  },              [!!before]);

  //
  // Update height cache and observe dynamic rows
  //
  useLayoutEffect(() => {
    const handleRowSizeChange = (el: HTMLElement, i: number) => {
      const { diff } = rowManager.setRowHeight(startIndex + i, el.offsetHeight);
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
      return diff;
    };

    const observeDynamicRow = (el: HTMLElement, i: number) => {
      const observer = new ResizeObserver(() => {
        handleRowSizeChange(el, i);
      });
      observer.observe(el);
      return observer;
    };

    const rowElements = getChildren(contentRef.current);
    rowElements.forEach(handleRowSizeChange);
    const observers = rowElements.map(observeDynamicRow);
    return () => observers.forEach((ro: ResizeObserver) => ro.disconnect());
  },              [
    keyMapper(startIndex),
    keyMapper(Math.min(stopIndex, childrenCount - 1)),
  ]);

  //
  // Scroll to last remembered position,
  // The position was remembered in handleScroll() function
  //
  useLayoutEffect(() => {
    if (shouldScrollToBottom()) {
      scrollToBottom();
    } else {
      scrollToPosition(scrollPosition);
    }
  },              [!!before, scrollEffectTriggerRef.current, height, childrenCount]);

  //
  // Emit visible range change when component mounted
  //
  useLayoutEffect(() => {
    const visibleRange = computeVisibleRange();
    onVisibleRangeChange(visibleRange);
    onRenderedRangeChange(visibleRange);
  },              []);

  useEffect(() => {
    if (ref.current) {
      const { scrollTop } = ref.current;
      prevAtBottomRef.current =
        height >= rowManager.getRowOffsetTop(childrenCount) - scrollTop;
    }
  });
  //
  // Scrolling
  //
  const handleScroll = (event: React.UIEvent) => {
    if (ref.current) {
      const { scrollTop } = ref.current;
      const prevScrollTop = prevScrollTopRef.current;
      const visibleRange = computeVisibleRange();
      if (rowManager.hasRowHeight(visibleRange.startIndex)) {
        // If we know the real height of this row
        // Remember current scroll position
        const offset =
          scrollTop - rowManager.getRowOffsetTop(visibleRange.startIndex);
        setScrollPosition({
          offset,
          index: visibleRange.startIndex,
        });
      }

      // Update rendered range
      const newRenderedRange = computeRenderedRange(
        visibleRange,
        scrollTop > prevScrollTop ? 'down' : 'up',
      );
      setRenderedRange(newRenderedRange);

      // Remember scrollTop to check scroll direction
      prevScrollTopRef.current = scrollTop;

      if (!isRangeEqual(renderedRange, newRenderedRange)) {
        onRenderedRangeChange(newRenderedRange);
      }

      if (!isRangeEqual(prevVisibleRange, visibleRange)) {
        onVisibleRangeChange(visibleRange);
      }

      // Emit events
      onScroll(event);
    }
  };

  const wrappedBefore = before ? <div ref={beforeRef}>{before}</div> : null;
  const heightBeforeStartRow = rowManager.getRowsHeight(0, startIndex - 1);
  const heightAfterStopRow = rowManager.getRowsHeight(stopIndex + 1, maxIndex);
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
