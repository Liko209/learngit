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
import {
  useRange,
  useRowManager,
  useScroll,
  PartialScrollPosition,
} from './hooks';
import {
  createKeyMapper,
  createRange,
  getChildren,
  isRangeEqual,
  isRangeIn,
} from './utils';
import { usePrevious } from './hooks/usePrevious';

type DivRefObject = MutableRefObject<HTMLDivElement | null>;
type JuiVirtualizedListHandles = {
  scrollToBottom: () => void;
  isAtBottom: () => boolean;
  scrollToIndex: (index: number) => void;
  getVisibleRange: () => IndexRange;
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
    contentStyle,
    stickToLastPosition = true,
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

  const computeRenderedRange = (visibleRange: IndexRange) => {
    const renderedRange: IndexRange = { ...visibleRange };

    renderedRange.startIndex = Math.max(
      visibleRange.startIndex - overscan,
      minIndex,
    );

    renderedRange.stopIndex = visibleRange.stopIndex + overscan;

    return renderedRange;
  };
  const virtualizedListStyle: React.CSSProperties = {
    height,
    overflow: 'auto',
    // Prevent repaints on scroll
    transform: 'translateZ(0)',
    // Prevent chrome's default behavior
    overflowAnchor: 'none',
  };
  const computeRangeOffset = (
    prevChildrenCount: number | null,
    prevStartIndex: number | null,
    prevStartChild: JSX.Element | null,
  ) => {
    let result = 0;
    if (
      prevChildrenCount !== null &&
      prevStartIndex !== null &&
      prevStartChild !== null &&
      prevChildrenCount !== children.length
    ) {
      const _prevStartChild = prevStartChild;
      result =
        children.findIndex(
          (child: JSX.Element) => child.key === _prevStartChild.key,
        ) - prevStartIndex;
    }
    return result;
  };

  const fixIndexWhenChildrenChanged = (
    renderedRange: IndexRange,
    prevChildrenCount: number | null,
    prevStartIndex: number | null,
    prevStartChild: JSX.Element | null,
  ) => {
    let { startIndex, stopIndex } = renderedRange;

    const rangeOffset = computeRangeOffset(
      prevChildrenCount,
      prevStartIndex,
      prevStartChild,
    );

    if (rangeOffset !== 0) {
      startIndex += rangeOffset;
      stopIndex += rangeOffset;
      // TODO avoid change state this way
      renderedRange.startIndex = startIndex;
      renderedRange.stopIndex = stopIndex;
      scrollPosition.index = Math.max(
        scrollPosition.index + rangeOffset,
        minIndex,
      );
      scrollEffectTriggerRef.current++; // Trigger scroll after render
    }

    return { startIndex, stopIndex };
  };

  const isRowRendered = (index: number) => rowManager.hasRowHeight(index);

  const scrollToPosition = ({
    index,
    offset = 0,
    options = true,
  }: PartialScrollPosition) => {
    if (ref.current) {
      if (options === true) {
        ref.current.scrollTop = rowManager.getRowOffsetTop(index) + offset;
      } else {
        ref.current.scrollTop =
          rowManager.getRowOffsetTop(index + 1) - height - offset;
      }
    }
  };

  const jumpToPosition = (position: PartialScrollPosition) => {
    rememberScrollPosition(position);
    setRenderedRange(
      createRange({
        startIndex: position.index,
        size: renderedRangeSize,
        min: minIndex,
        max: maxIndex,
      }),
    );
    prevAtBottomRef.current = false;
    scrollToPosition(position);
  };

  const computeAtBottom = () => {
    let result = false;
    if (ref.current) {
      result =
        height >=
        rowManager.getRowOffsetTop(childrenCount) -
          Math.ceil(ref.current.scrollTop);
    }
    return result;
  };

  const scrollToBottom = () => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight - height;
    }
  };

  const shouldUpdateRange = () => {
    return !isRangeIn(renderedRange, computeVisibleRange());
  };

  const updateRange = ({
    forceUpdate = false,
  }: { forceUpdate?: boolean } = {}) => {
    if (ref.current) {
      const { scrollTop } = ref.current;
      const visibleRange = computeVisibleRange();
      const offset =
        scrollTop - rowManager.getRowOffsetTop(visibleRange.startIndex);
      const visibleStartIndex = visibleRange.startIndex;
      const prevScrollIndex = scrollPosition.index;
      const prevScrollOffset = scrollPosition.offset;
      const isUserScrolling =
        prevScrollIndex !== visibleStartIndex ||
        (prevScrollIndex === visibleStartIndex && prevScrollOffset !== offset);

      if (forceUpdate || isUserScrolling) {
        if (isRowRendered(visibleRange.startIndex)) {
          rememberScrollPosition({
            offset,
            index: visibleRange.startIndex,
          });
        } else {
          rememberScrollPosition({
            offset:
              scrollTop - rowManager.getRowOffsetTop(scrollPosition.index),
            index: scrollPosition.index,
          });
        }

        const newRenderedRange = computeRenderedRange(visibleRange);

        // TODO Don't re-render if range not changed
        setRenderedRange(newRenderedRange);

        // Emit events
        if (!isRangeEqual(renderedRange, newRenderedRange)) {
          onRenderedRangeChange(newRenderedRange);
        }
        if (!isRangeEqual(prevVisibleRange, visibleRange)) {
          onVisibleRangeChange(visibleRange);
        }
      }
    }
  };

  const ensureNoBlankArea = () => {
    if (shouldUpdateRange()) {
      updateRange({ forceUpdate: true });
    }
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
      jumpToPosition({ index });
    },
    getVisibleRange: computeVisibleRange,
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

  const { scrollPosition, rememberScrollPosition } = useScroll({
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
  const prevVisibleRange = usePrevious(() => computeVisibleRange()) || {
    startIndex: 0,
    stopIndex: 0,
  };
  const { startIndex, stopIndex } = fixIndexWhenChildrenChanged(
    renderedRange,
    usePrevious(() => children.length),
    usePrevious(() => startIndex),
    usePrevious(() => children[startIndex] || null),
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
      let result: { diff: number };

      if (el.offsetParent) {
        const { diff } = rowManager.setRowHeight(
          startIndex + i,
          el.offsetHeight,
        );

        if (shouldScrollToBottom()) {
          scrollToBottom();
        } else {
          const beforeFirstVisibleRow = i + startIndex < scrollPosition.index;
          if (diff !== 0 && beforeFirstVisibleRow && stickToLastPosition) {
            scrollToPosition(scrollPosition);
          }
        }
        result = { diff };
      } else {
        // When the element was hidden via display: none, it also fires
        // a size change event, in this case we don't need to do anything.
        result = { diff: 0 };
      }

      return result;
    };

    const observeDynamicRow = (el: HTMLElement, i: number) => {
      const observer = new ResizeObserver(() => {
        const { diff } = handleRowSizeChange(el, i);

        // Fix blank area:
        // When row shrinks, the list didn't recompute rendered range
        // automatically, which may leave a blank area in the list.
        if (diff < 0) {
          ensureNoBlankArea();
        }
      });
      observer.observe(el);
      return observer;
    };

    const rowElements = getChildren(contentRef.current);
    rowElements.forEach(handleRowSizeChange);
    const observers = rowElements.map(observeDynamicRow);
    return () => observers.forEach((ro: ResizeObserver) => ro.disconnect());
  },              [keyMapper(startIndex), keyMapper(Math.min(stopIndex, maxIndex))]);

  //
  // Scroll to last remembered position,
  // The position was remembered in handleScroll() function
  //
  useLayoutEffect(() => {
    if (shouldScrollToBottom()) {
      scrollToBottom();
    } else {
      if (stickToLastPosition) {
        scrollToPosition(scrollPosition);
      }
    }
  },              [!!before, scrollEffectTriggerRef.current, height, childrenCount]);

  //
  // Emit visible range change when component mounted
  //
  useEffect(() => {
    const visibleRange = computeVisibleRange();
    onVisibleRangeChange(visibleRange);
    onRenderedRangeChange(visibleRange);
  },        []);

  //
  // Update prevAtBottom
  //
  useEffect(() => {
    prevAtBottomRef.current = computeAtBottom();
  });

  //
  // Ensure no blank area
  //
  useEffect(() => {
    ensureNoBlankArea();
  });

  //
  // Scrolling
  //
  const handleScroll = (event: React.UIEvent) => {
    if (ref.current) {
      updateRange();
      onScroll(event);
    }
  };

  const wrappedBefore = before ? <div ref={beforeRef}>{before}</div> : null;
  const heightBeforeStartRow = rowManager.getRowsHeight(
    minIndex,
    startIndex - 1,
  );
  const heightAfterStopRow = rowManager.getRowsHeight(stopIndex + 1, maxIndex);
  const childrenToRender: ReactNode[] = children.filter((_, i) => {
    return startIndex <= i && i <= stopIndex;
  });

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      style={virtualizedListStyle}
      data-test-automation-id="virtualized-list"
    >
      {wrappedBefore}
      <div style={{ height: heightBeforeStartRow }} />
      <div style={contentStyle} ref={contentRef}>
        {childrenToRender}
      </div>
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
      contentStyle?: React.CSSProperties;
      stickToLastPosition?: boolean;
    } & React.RefAttributes<JuiVirtualizedListHandles>
  >
>;

export {
  MemoList as JuiVirtualizedList,
  JuiVirtualizedListProps,
  JuiVirtualizedListHandles,
};
