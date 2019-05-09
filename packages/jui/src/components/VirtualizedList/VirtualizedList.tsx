/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 14:59:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  forwardRef,
  memo,
  MutableRefObject,
  RefForwardingComponent,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  cloneElement,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { noop } from '../../foundation/utils';
import { IndexRange, JuiVirtualizedListProps } from './types';
import {
  useRange,
  useRowManager,
  useScroll,
  PartialScrollPosition,
  useForceUpdate,
} from './hooks';
import {
  createKeyMapper,
  createRange,
  getChildren,
  isRangeIn,
  isRangeEqual,
} from './utils';
import { usePrevious } from './hooks/usePrevious';
import { debounce, compact } from 'lodash';
import { WRAPPER_IDENTIFIER } from './ItemWrapper';

type DivRefObject = MutableRefObject<HTMLDivElement | null>;
type JuiVirtualizedListHandles = {
  scrollToBottom: () => void;
  isAtBottom: () => boolean;
  scrollToIndex: (index: number) => void;
  getVisibleRange: () => IndexRange;
  getPrevVisibleRange: () => IndexRange;
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
    onWheel = noop,
    onVisibleRangeChange = noop,
    onRenderedRangeChange = noop,
    before = null,
    after = null,
    stickToBottom,
    contentStyle,
    stickToLastPosition = true,
    fixedWrapper,
  }: JuiVirtualizedListProps,
  forwardRef,
) => {
  const shouldUseNativeImplementation =
    'resizeObserver' in window || !fixedWrapper;
  // TODO use useCallback to optimize performance
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
    setVisibleRange(
      createRange({
        startIndex: position.index,
        size: visibleRangeSize,
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
      // JIRA FIJI-5392 scroll to bottom should be more strict because the height detacted is not precise and lagged
      ref.current.scrollTop = ref.current.scrollHeight;
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
      const startIndex = visibleRange.startIndex;
      const offset = scrollTop - rowManager.getRowOffsetTop(startIndex);

      const index = visibleRange.startIndex;
      rememberScrollPosition({
        index,
        offset,
      });
      // TODO Don't re-render if range not changed
      setVisibleRange(visibleRange);
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
    getPrevVisibleRange: () => prevVisibleRange,
  }));

  //
  // HtmlElement ref
  //
  const ref: DivRefObject = useRef(null);
  const beforeRef: DivRefObject = useRef(null);
  const contentRef: DivRefObject = useRef(null);

  const scrollEffectTriggerRef = useRef(0);
  const prevAtBottomRef = useRef(false);

  //
  // State
  //
  const rowManager = useRowManager({ minRowHeight, keyMapper });

  const { scrollPosition, rememberScrollPosition } = useScroll({
    index: initialScrollToIndex,
    offset: 0,
  });

  const visibleRangeSize = Math.ceil(
    height / rowManager.getEstimateRowHeight(),
  );

  const initialVisibleRange = createRange({
    startIndex: initialScrollToIndex,
    size: visibleRangeSize,
    min: minIndex,
    max: maxIndex,
  });

  const { range: unfixedVisibleRange, setRange: setVisibleRange } = useRange(
    initialVisibleRange,
  );
  const visibleRange = fixIndexWhenChildrenChanged(
    unfixedVisibleRange,
    usePrevious(() => children.length),
    usePrevious(() => visibleRange.startIndex),
    usePrevious(() => children[visibleRange.startIndex] || null),
  );
  const renderedRange = computeRenderedRange(visibleRange);
  const { startIndex, stopIndex } = renderedRange;

  const shouldScrollToBottom = () => prevAtBottomRef.current && stickToBottom;

  const prevVisibleRange = usePrevious(() => computeVisibleRange()) || {
    startIndex: 0,
    stopIndex: 0,
  };

  const { forceUpdate } = useForceUpdate();
  const useDebounceForceUpdate = useCallback(
    debounce(() => {
      rowManager.flushCache();
      scrollEffectTriggerRef.current++;
      forceUpdate();
    },       300),
    [],
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
      const result = { diff: 0 };
      if (el.offsetParent) {
        const diff = rowManager.computeDiff(startIndex + i, el.offsetHeight);
        if (shouldUseNativeImplementation) {
          rowManager.setRowHeight(startIndex + i, el.offsetHeight);
          if (shouldScrollToBottom()) {
            scrollToBottom();
          } else {
            const beforeFirstVisibleRow = i + startIndex < scrollPosition.index;
            if (diff !== 0 && beforeFirstVisibleRow && stickToLastPosition) {
              scrollToPosition(scrollPosition);
            }
          }
        } else {
          rowManager.cacheRowHeight(startIndex + i, el.offsetHeight);
          if (diff !== 0) {
            useDebounceForceUpdate();
          }
        }
        result.diff = diff;
      }

      return result;
    };

    const observeDynamicRow = (el: HTMLElement, i: number) => {
      const cb = (entries: ResizeObserverEntry[]) => {
        for (const entry of entries) {
          const { diff } = handleRowSizeChange(entry.target as HTMLElement, i);
          // Fix blank area:
          // When row shrinks, the list didn't recompute rendered range
          // automatically, which may leave a blank area in the list.
          if (diff < 0) {
            ensureNoBlankArea();
          }
        }
      };
      const observer = new ResizeObserver(cb);
      observer.observe(el);
      return { observer, cb };
    };

    let rowElements: Element[] = getChildren(contentRef.current);

    if (!shouldUseNativeImplementation) {
      rowElements = compact(rowElements.map((i) => i.firstElementChild));
    }

    rowElements.forEach(handleRowSizeChange);
    const observers = rowElements.map(observeDynamicRow);
    return () => {
      observers.forEach((observer) => {
        observer.observer.disconnect();
        delete observer.cb;
      });
    };
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
  // TEMP SOLUTION
  // Force stop inertia scrolling to prevent scroll
  // position issue while load more data.
  //
  useLayoutEffect(() => {
    if (ref.current) {
      ref.current.style.pointerEvents = 'none';
    }
    const timeout = setTimeout(() => {
      if (ref.current) {
        ref.current.style.pointerEvents = 'auto';
      }
    },                         10);
    return () => clearTimeout(timeout);
  },              [scrollEffectTriggerRef.current, height, childrenCount]);

  //
  // Emit visible range change
  //
  useEffect(() => {
    if (!isRangeEqual(visibleRange, initialVisibleRange)) {
      onVisibleRangeChange(visibleRange);
    }
  },        [
    visibleRange.startIndex,
    visibleRange.stopIndex,
    initialVisibleRange.startIndex,
    initialVisibleRange.stopIndex,
  ]);

  useEffect(() => {
    onRenderedRangeChange(renderedRange);
  },        [renderedRange.startIndex, renderedRange.stopIndex]);

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

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    if (ref.current) {
      if (event.target !== ref.current || ref.current.offsetTop < 0) {
        return;
      }
      updateRange();
      onScroll(event);
      useDebounceForceUpdate();
    }
  };

  const wrappedBefore = before ? <div ref={beforeRef}>{before}</div> : null;
  const heightBeforeStartRow = rowManager.getRowsHeight(
    minIndex,
    startIndex - 1,
  );
  const heightAfterStopRow = rowManager.getRowsHeight(stopIndex + 1, maxIndex);
  let childrenToRender = children.filter((_, i) => {
    return startIndex <= i && i <= stopIndex;
  });

  if (!shouldUseNativeImplementation) {
    childrenToRender = childrenToRender.map((comp: JSX.Element, i) => {
      const style = {
        height: rowManager.getRowHeight(startIndex + i),
        overflow: 'hidden',
      };
      if (comp.props[WRAPPER_IDENTIFIER]) {
        const concatStyle = comp.props.style
          ? Object.assign({}, style, comp.props.style)
          : style;
        return cloneElement(comp, {
          style: concatStyle,
        });
      }
      return (
        <section style={style} key={comp.key ? comp.key : undefined}>
          {comp}
        </section>
      );
    });
  }

  const wrapperStyle: React.CSSProperties = {
    height,
    overflow: 'auto',
    // Prevent repaints on scroll
    transform: 'translateZ(0)',
    // Prevent chrome's default behavior
    overflowAnchor: 'none',
    WebkitOverflowScrolling: 'touch',
  };

  return (
    <div
      ref={ref}
      style={wrapperStyle}
      onWheel={onWheel}
      data-test-automation-id="virtualized-list"
      onScroll={handleScroll}
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
      onScroll?: (event: React.UIEvent<HTMLElement>) => void;
      onWheel?: (event: React.WheelEvent<HTMLElement>) => void;
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
      fixedWrapper?: boolean;
    } & React.RefAttributes<JuiVirtualizedListHandles>
  >
>;

export {
  MemoList as JuiVirtualizedList,
  JuiVirtualizedListProps,
  JuiVirtualizedListHandles,
};
