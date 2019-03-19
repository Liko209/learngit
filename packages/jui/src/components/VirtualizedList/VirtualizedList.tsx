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
  useState,
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
    classWhenScrollable = 'scrollable',
    classWhenUnScrollable = 'un-scrollable',
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
        rowManager.getRowOffsetTop(childrenCount) - ref.current.scrollTop;
    }
    return result;
  };

  const scrollToBottom = () => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight - height;
    }
  };

  const updateRange = () => {
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

      if (isUserScrolling) {
        if (rowManager.hasRowHeight(visibleRange.startIndex)) {
          // If we know the real height of this row
          // Remember current scroll position
          rememberScrollPosition({
            offset,
            index: visibleRange.startIndex,
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
  }));

  //
  // HtmlElement ref
  //
  const ref: DivRefObject = useRef(null);
  const beforeRef: DivRefObject = useRef(null);
  const contentRef: DivRefObject = useRef(null);
  const prevScrollable: React.MutableRefObject<boolean> = useRef(true);
  const [listStyle, setListStyle] = useState(classWhenScrollable);

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

      if (shouldScrollToBottom()) {
        scrollToBottom();
      } else {
        const beforeFirstVisibleRow = i + startIndex < scrollPosition.index;
        if (diff !== 0 && beforeFirstVisibleRow) {
          scrollToPosition(scrollPosition);
        }
      }
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
  // Ensure there are not empty space in the list
  //
  useLayoutEffect(() => {
    const visibleRange = computeVisibleRange();
    if (!isRangeIn(renderedRange, visibleRange)) {
      // If visible range not in current renderedRange
      updateRange();
    }
  });

  // scrollable <--> unScrollable
  useEffect(() => {
    const contentHeight = rowManager.getRowsHeight(0, childrenCount - 1);
    const scrollable = height < contentHeight;
    if (prevScrollable.current !== scrollable) {
      prevScrollable.current = scrollable;
      setListStyle(scrollable ? classWhenScrollable : classWhenUnScrollable);
    }
  });

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
      style={{
        height,
        overflow: 'auto',
        // Prevent repaints on scroll
        transform: 'translateZ(0)',
        // Prevent chrome's default behavior
        overflowAnchor: 'none',
      }}
      data-test-automation-id="virtualized-list"
    >
      {wrappedBefore}
      <div style={{ height: heightBeforeStartRow }} />
      <div style={{ minHeight: height }} ref={contentRef} className={listStyle}>
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
      classWhenUnScrollable?: string;
      classWhenScrollable?: string;
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
