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
  }: JuiVirtualizedListProps,
  forwardRef,
) => {
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

  const getVisibleRange = () => {
    let result: IndexRange;
    if (ref.current) {
      const { scrollTop } = ref.current;
      const top = scrollTop;
      const bottom = scrollTop + height;
      result = {
        startIndex: rowManager.getRowIndexFromPosition(top, maxIndex),
        stopIndex: rowManager.getRowIndexFromPosition(bottom, maxIndex),
      };
    } else {
      result = { startIndex: 0, stopIndex: 0 };
    }
    return result;
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
        children.findIndex(child => child.key === _prevStartChild.key) -
        prevStartIndex;

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

  const scrollToPosition = (position: ScrollPosition) => {
    if (ref.current) {
      ref.current.scrollTop =
        rowManager.getRowOffsetTop(position.index) + position.offset;
    }
  };

  const keyMapper = createKeyMapper(children);
  const childrenCount = children.length;
  const maxIndex = childrenCount - 1;

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
  const rowManager = useRowManager({ minRowHeight, keyMapper });
  const { scrollPosition, setScrollPosition } = useScroll({
    index: initialScrollToIndex,
    offset: 0,
  });
  const renderedRangeSize = Math.ceil(
    height / rowManager.getEstimateRowHeight(),
  );
  const [renderedRange, setRenderedRange] = useRange(
    createRenderRange({ startIndex: initialScrollToIndex - 5 }),
  );

  const scrollEffectTriggerRef = useRef(0);
  const prevScrollTopRef = useRef(0);
  const prevVisibleRange = usePrevious(() => getVisibleRange()) || {
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
    const visibleRange = getVisibleRange();
    onVisibleRangeChange(visibleRange);
    onRenderedRangeChange(visibleRange);
  },              []);

  //
  // Update height cache and observe dynamic rows
  //
  useLayoutEffect(() => {
    const handleRowSizeChange = (el: HTMLElement, i: number) => {
      const { diff } = rowManager.setRowHeight(startIndex + i, el.offsetHeight);
      const beforeFirstVisibleRow = i + startIndex < scrollPosition.index;
      if (diff !== 0 && beforeFirstVisibleRow) {
        scrollToPosition(scrollPosition);
      }
    };

    const observeDynamicRow = (el: HTMLElement, i: number) => {
      const observer = new ResizeObserver(() => handleRowSizeChange(el, i));
      observer.observe(el);
      return observer;
    };

    const rowElements = getChildren(contentRef.current);
    rowElements.forEach(handleRowSizeChange);
    const observers = rowElements.map(observeDynamicRow);

    return () => observers.forEach(ro => ro.disconnect());
  },              [keyMapper(startIndex), keyMapper(stopIndex)]);

  //
  // Scrolling
  //
  const handleScroll = (event: React.UIEvent) => {
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const visibleRange = getVisibleRange();

      if (rowManager.hasRowHeight(visibleRange.startIndex)) {
        // If we know the real height of this row
        // Remember current scroll position
        setScrollPosition({
          index: visibleRange.startIndex,
          offset:
            scrollTop - rowManager.getRowOffsetTop(visibleRange.startIndex),
        });
      }

      // Update rendered range
      let newRenderedRange: IndexRange;
      const prevScrollTop = prevScrollTopRef.current;
      const direction = scrollTop > prevScrollTop ? 'down' : 'up';
      if ('up' === direction) {
        newRenderedRange = {
          startIndex: Math.max(visibleRange.startIndex - overscan, 0),
          stopIndex: visibleRange.stopIndex,
        };
      } else if ('down' === direction) {
        newRenderedRange = {
          startIndex: visibleRange.startIndex,
          stopIndex: visibleRange.stopIndex + overscan,
        };
      } else {
        newRenderedRange = { ...visibleRange };
      }

      if (!isRangeEqual(renderedRange, newRenderedRange)) {
        setRenderedRange(newRenderedRange);
        onRenderedRangeChange(newRenderedRange);
      }

      if (!isRangeEqual(prevVisibleRange, visibleRange)) {
        onVisibleRangeChange(visibleRange);
      }

      // Emit events
      onScroll(event);

      // Remember scrollTop to check scroll direction
      prevScrollTopRef.current = scrollTop;
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
      children: JSX.Element[];
    } & React.RefAttributes<JuiVirtualizedListHandles>
  >
>;

export {
  MemoList as JuiVirtualizedList,
  JuiVirtualizedListProps,
  JuiVirtualizedListHandles,
};
