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
  useMemo,
} from 'react';
import ResizeObserver from 'resize-observer-polyfill';
import { noop } from '../../foundation/utils';
import {
  IndexRange,
  JuiVirtualizedListProps,
  VirtualizedListChild,
} from './types';
import {
  useRange,
  useRowManager,
  useScroll,
  PartialScrollPosition,
  useForceUpdate,
  useIsFirstRenderRef,
  ScrollPosition,
} from './hooks';
import {
  createKeyMapper,
  createRange,
  getChildren,
  isRangeIn,
  createIndexMapper,
} from './utils';
import { usePrevious } from './hooks/usePrevious';
import { debounce, compact } from 'lodash';
import { WRAPPER_IDENTIFIER } from './ItemWrapper';
import { RowManager } from './RowManager';

type DivRefObject = MutableRefObject<HTMLDivElement | null>;

type JuiVirtualizedListHandles = {
  focus: () => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  isAtBottom: () => boolean;
  scrollToIndex: (index: number) => void;
  scrollIntoViewIfNeeded: (index: number) => void;
  getVisibleRange: () => IndexRange;
  getPrevVisibleRange: () => IndexRange;
  scrollToPosition: (scrollPosition: PartialScrollPosition) => void;
  getScrollPosition: () => ScrollPosition;
};

const JuiVirtualizedList: RefForwardingComponent<
  JuiVirtualizedListHandles,
  JuiVirtualizedListProps
> = (
  {
    role,
    tabIndex,
    height,
    minRowHeight,
    fixedRowHeight,
    overscan = 5,
    children,
    initialScrollToIndex = 0,
    onScroll = noop,
    onWheel,
    onKeyDown,
    onVisibleRangeChange = noop,
    onRenderedRangeChange = noop,
    before = null,
    after = null,
    stickToBottom,
    style,
    contentStyle,
    onBottomStatusChange = noop,
    stickToLastPosition = true,
    highlightedIndex,
  }: JuiVirtualizedListProps,
  forwardRef,
) => {
  const shouldUseNativeImplementation = true;
  // TODO use useCallback to optimize performance
  // need andy to fix
  /* eslint-disable no-use-before-define */
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
    prevStartChild: VirtualizedListChild | null,
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
          (child: VirtualizedListChild) => child.key === _prevStartChild.key,
        ) - prevStartIndex;
    }
    return result;
  };

  const fixIndexWhenChildrenChanged = (
    renderedRange: IndexRange,
    prevChildrenCount: number | null,
    prevStartIndex: number | null,
    prevStartChild: VirtualizedListChild | null,
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
        if (index === 0 && offset === 0) {
          ref.current.scrollTop = 0;
        } else {
          ref.current.scrollTop = rowManager.getRowOffsetTop(index) + offset;
        }
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
        startIndex: position.options
          ? position.index
          : position.index - visibleRangeSize,
        size: visibleRangeSize,
        min: minIndex,
        max: maxIndex,
      }),
    );
    prevAtBottomRef.current = false;
    scrollToPosition(position);
  };

  const scrollToTop = () => {
    if (ref.current) {
      ref.current.scrollTop = 0;
    }
  };

  const computeAtBottom = () => {
    let result = false;
    if (ref.current) {
      result =
        ref.current.clientHeight >=
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

  const shouldUpdateRange = () =>
    !isRangeIn(renderedRange, computeVisibleRange());

  const updateRange = () => {
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
      updateRange();
    }
  };

  const keyMapper = useMemo(() => createKeyMapper(children), [children]);
  const indexMapper = useMemo(() => createIndexMapper(children), [children]);
  const childrenCount = children.length;
  const minIndex = 0;
  const maxIndex = childrenCount - 1;

  const scrollIntoViewIfNeeded = (index: number) => {
    if (ref.current) {
      if (index < visibleRange.startIndex) {
        jumpToPosition({ index, options: true });
      } else if (index > visibleRange.stopIndex) {
        jumpToPosition({ index, options: false });
      }
    }
  };

  //
  // Forward ref
  //
  useImperativeHandle(
    forwardRef,
    () => ({
      scrollToTop,
      scrollToBottom,
      scrollIntoViewIfNeeded,
      scrollToPosition: jumpToPosition,
      getScrollPosition: () => scrollPosition,
      isAtBottom: () => prevAtBottomRef.current,
      scrollToIndex: (index: number, options?: boolean) => {
        jumpToPosition({ index, options });
      },
      getVisibleRange: computeVisibleRange,
      getPrevVisibleRange: () => prevVisibleRange,
      focus: () => {
        if (ref.current) {
          ref.current.focus();
        }
      },
    }),
    [computeVisibleRange, jumpToPosition],
  );

  //
  // HtmlElement ref
  //
  const ref: DivRefObject = useRef(null);
  const beforeRef: DivRefObject = useRef(null);
  const contentRef: DivRefObject = useRef(null);

  const scrollEffectTriggerRef = useRef(0);
  const prevAtBottomRef = useRef(false);
  const isFirstRenderRef = useIsFirstRenderRef();

  //
  // State
  //
  const rowManager = useRowManager({ minRowHeight, fixedRowHeight, keyMapper });

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
  const startKey = keyMapper(startIndex);
  const stopKey = keyMapper(Math.min(stopIndex, maxIndex));

  const shouldScrollToBottom = () => prevAtBottomRef.current && stickToBottom;

  const prevVisibleRange = usePrevious(() => computeVisibleRange()) || {
    startIndex: 0,
    stopIndex: 0,
  };

  const { forceUpdate } = useForceUpdate();
  const useDebounceForceUpdate = useCallback(
    debounce(() => {
      if (rowManager instanceof RowManager) {
        rowManager.flushCache();
        scrollEffectTriggerRef.current++;
        forceUpdate();
      }
    }, 300),
    [],
  );

  //
  // Update before content height when before content changed
  //
  useLayoutEffect(() => {
    const height = beforeRef.current ? beforeRef.current.offsetHeight : 0;
    rowManager.setBeforeHeight(height);
  }, [!!before]);

  //
  // Update height cache and observe dynamic rows
  //
  useLayoutEffect(() => {
    if (rowManager instanceof RowManager) {
      const handleRowSizeChange = (el: HTMLElement, i: number) => {
        const result = { diff: 0 };
        if (el.offsetParent) {
          const startIndex = indexMapper(startKey);
          const diff = rowManager.computeDiff(startIndex + i, el.offsetHeight);
          if (shouldUseNativeImplementation) {
            rowManager.setRowHeight(startIndex + i, el.offsetHeight);
            if (diff !== 0) {
              if (shouldScrollToBottom()) {
                scrollToBottom();
              } else {
                const beforeFirstVisibleRow =
                  i + startIndex < scrollPosition.index;
                if (beforeFirstVisibleRow && stickToLastPosition) {
                  scrollToPosition(scrollPosition);
                }
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
            const { diff } = handleRowSizeChange(
              entry.target as HTMLElement,
              i,
            );
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
        rowElements = compact(rowElements.map(i => i.firstElementChild));
      }

      rowElements.forEach(handleRowSizeChange);

      type Observers = {
        observer: ResizeObserver;
        cb: (entries: ResizeObserverEntry[]) => void;
      }[];

      let observers: Observers | undefined = rowElements.map(observeDynamicRow);
      return () => {
        (observers as Observers).forEach(observer => {
          observer.observer.disconnect();
          delete observer.cb;
        });
        observers = undefined;
      };
    }

    return () => {};
  }, [startKey, stopKey, indexMapper]);

  //
  // Scroll to last remembered position,
  // The position was remembered in handleScroll() function
  //
  useLayoutEffect(() => {
    if (shouldScrollToBottom()) {
      scrollToBottom();
    } else if (stickToLastPosition) {
      scrollToPosition(scrollPosition);
    }
  }, [!!before, scrollEffectTriggerRef.current, height, childrenCount]);

  //
  // TEMP SOLUTION
  // Force stop inertia scrolling to prevent scroll
  // position issue while load more data.
  //
  useLayoutEffect(() => {
    if (!stickToLastPosition) return;

    if (ref.current) {
      ref.current.style.pointerEvents = 'none';
    }
    const timeout = setTimeout(() => {
      if (ref.current) {
        ref.current.style.pointerEvents = 'auto';
      }
    }, 10);
    return () => clearTimeout(timeout);
  }, [
    stickToLastPosition,
    scrollEffectTriggerRef.current,
    height,
    childrenCount,
  ]);

  //
  // Emit visible range change
  //
  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    if (isFirstRenderRef.current && minRowHeight) {
      // [THE RANGE PROBLEM]
      // The first time list rendered, initial visible range was computed
      // from height/minRowHeight, which is not really represent what
      // the user can see. Sot, we need to recompute visible range before
      // Emit visible range change event.
      onVisibleRangeChange(computeVisibleRange(), ref.current);
    } else {
      onVisibleRangeChange(visibleRange, ref.current);
    }
  }, [keyMapper(visibleRange.startIndex), keyMapper(visibleRange.stopIndex)]);

  //
  // Emit rendered range change
  //
  useLayoutEffect(() => {
    if (isFirstRenderRef.current && minRowHeight) {
      // The first time list rendered, initial rendered range has same problem
      // as initial visible range. See [THE RANGE PROBLEM] for more.
      onRenderedRangeChange(computeRenderedRange(computeVisibleRange()));
    } else {
      onRenderedRangeChange(renderedRange);
    }
  }, [keyMapper(renderedRange.startIndex), keyMapper(renderedRange.stopIndex)]);

  //
  // Update prevAtBottom
  //
  useEffect(() => {
    const original = prevAtBottomRef.current;
    prevAtBottomRef.current = computeAtBottom();
    const current = prevAtBottomRef.current;
    if (original !== current) onBottomStatusChange(current);
  });

  //
  // Ensure no blank area
  //
  useEffect(() => {
    ensureNoBlankArea();
  });

  useEffect(() => {
    if (highlightedIndex !== undefined)
      scrollIntoViewIfNeeded(highlightedIndex);
  }, [highlightedIndex]);
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
    }
  };

  const wrappedBefore = before ? <div ref={beforeRef}>{before()}</div> : null;
  const heightBeforeStartRow = rowManager.getRowsHeight(
    minIndex,
    startIndex - 1,
  );
  const heightAfterStopRow = rowManager.getRowsHeight(stopIndex + 1, maxIndex);

  const EmptyDiv = () => (
    <div style={{ height: minRowHeight || fixedRowHeight }} />
  );
  const childrenToRender = children
    .filter((_, i) => startIndex <= i && i <= stopIndex)
    .map(child => (child.type ? child : <EmptyDiv key={child.key || 0} />));

  let childrenNode: React.ReactNode = childrenToRender;
  if (!shouldUseNativeImplementation) {
    childrenNode = childrenToRender.map((comp: any, i) => {
      const style = {
        height: rowManager.getRowHeight(startIndex + i),
        overflow: 'hidden',
      };
      if (comp.type) {
        if (comp.props[WRAPPER_IDENTIFIER]) {
          const concatStyle = comp.props.style
            ? Object.assign({}, style, comp.props.style)
            : style;
          return cloneElement(comp as JSX.Element, {
            style: concatStyle,
          });
        }
        return (
          <section style={style} key={comp.key ? comp.key : undefined}>
            {comp}
          </section>
        );
      }
      return <section style={style} key={comp.key ? comp.key : undefined} />;
    });
  }

  const wrapperStyle: React.CSSProperties = Object.assign(
    {
      height: '100%',
      maxHeight: '100%',
      minHeight: 'inherit',
      overflow: 'auto',
      // Prevent repaints on scroll
      transform: 'translateZ(0)',
      // Prevent chrome's default behavior
      overflowAnchor: 'none',
      WebkitOverflowScrolling: 'touch',
    },
    style,
  );

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      role={role}
      ref={ref}
      style={wrapperStyle}
      onWheel={onWheel}
      onKeyDown={onKeyDown}
      data-test-automation-id="virtualized-list"
      onScroll={handleScroll}
      tabIndex={tabIndex}
    >
      {wrappedBefore}
      <div style={{ height: heightBeforeStartRow }} />
      <div style={contentStyle} ref={contentRef}>
        {childrenNode}
      </div>
      <div style={{ height: heightAfterStopRow }} />
      {after && after()}
    </div>
  );
};

const MemoList = memo(
  forwardRef(JuiVirtualizedList),
) as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    JuiVirtualizedListProps & React.RefAttributes<JuiVirtualizedListHandles>
  >
>;

export {
  MemoList as JuiVirtualizedList,
  JuiVirtualizedListProps,
  JuiVirtualizedListHandles,
};
