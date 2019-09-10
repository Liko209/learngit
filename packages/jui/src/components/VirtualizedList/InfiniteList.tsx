/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-05 15:35:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  useState,
  memo,
  forwardRef,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import { noop } from '../../foundation/utils';
import { JuiDataLoader } from './DataLoader';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from './VirtualizedList';
import { ILoadMoreStrategy, ThresholdStrategy } from './LoadMoreStrategy';
import { IndexRange, SCROLL_ALIGN } from './types';
import { useMountState } from './hooks';
import { DIRECTION } from '../Lists';

type JuiInfiniteListProps = {
  height?: number;
  fixedRowHeight?: number;
  minRowHeight?: number;
  overscan?: number;
  loadMoreStrategy?: ILoadMoreStrategy;
  hasMore: (direction: DIRECTION) => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: DIRECTION, count: number) => Promise<void>;
  initialScrollToIndex?: number;
  initialScrollAlignTo?: SCROLL_ALIGN;
  onScroll?: (event: React.UIEvent<HTMLElement>) => void;
  onWheel?: (event: React.WheelEvent<HTMLElement>) => void;
  onVisibleRangeChange?: (range: IndexRange, target: HTMLElement) => void;
  onRenderedRangeChange?: (range: IndexRange) => void;
  noRowsRenderer?: JSX.Element;
  loadingRenderer?: (() => JSX.Element) | null;
  loadingMoreRenderer?: (() => JSX.Element) | null;
  children: JSX.Element[];
  stickToBottom?: boolean;
  fallBackRenderer?: JSX.Element;
  contentStyle?: React.CSSProperties;
  stickToLastPosition?: boolean;
  onBottomStatusChange?: (atBottom: boolean) => void;
  highlightedIndex?: number;
};

const JuiInfiniteList = (
  {
    height,
    minRowHeight,
    fixedRowHeight,
    overscan,
    loadMoreStrategy = new ThresholdStrategy({
      threshold: 15,
      minBatchCount: 10,
    }),
    hasMore,
    loadInitialData,
    loadMore,
    initialScrollToIndex = 0,
    initialScrollAlignTo,
    noRowsRenderer,
    loadingRenderer = null,
    loadingMoreRenderer = null,
    onScroll = noop,
    onWheel = noop,
    onVisibleRangeChange = noop,
    onRenderedRangeChange = noop,
    stickToBottom,
    fallBackRenderer,
    children,
    contentStyle,
    stickToLastPosition,
    onBottomStatusChange,
    highlightedIndex,
  }: JuiInfiniteListProps,
  forwardRef: React.RefObject<JuiVirtualizedListHandles> | null,
) => {
  let ref = useRef<JuiVirtualizedListHandles>(null);
  if (forwardRef) {
    ref = forwardRef;
  }
  const [isStickToBottomEnabled, setStickToBottom] = useState(true);
  const isMountedRef = useMountState();

  const _loadMore = useCallback(
    async (direction: DIRECTION, count: number) => {
      if (direction === DIRECTION.DOWN) {
        setStickToBottom(false);
      }
      await loadMore(direction, count);
      isMountedRef.current && setStickToBottom(true);
    },
    [loadMore, setStickToBottom],
  );

  useEffect(() => {
    if (ref.current && highlightedIndex !== undefined) {
      ref.current.scrollIntoViewIfNeeded(highlightedIndex);
    }
  }, [highlightedIndex]);

  let result = null;

  if (height) {
    result = (
      <JuiDataLoader
        hasMore={hasMore}
        loadInitialData={loadInitialData}
        loadMore={_loadMore}
        loadMoreStrategy={loadMoreStrategy}
      >
        {({
          loadingInitial,
          loadingUp,
          loadingDown,
          loadingInitialFailed,
          onScroll: handleScroll,
        }) => {
          const _handleScroll = (delta?: {
            x: number;
            y: number;
            z: number;
          }) => {
            if (ref.current) {
              const visibleRange = ref.current.getVisibleRange();
              const prevVisibleRange = ref.current.getPrevVisibleRange();
              handleScroll(
                visibleRange,
                prevVisibleRange,
                {
                  minIndex: 0,
                  maxIndex: children.length - 1,
                },
                delta,
              );
            }
          };

          if (loadingInitial) {
            return loadingRenderer && loadingRenderer();
          }

          if (loadingInitialFailed) {
            return fallBackRenderer;
          }

          if (children.length === 0) {
            const isEmpty = !hasMore(DIRECTION.UP) && !hasMore(DIRECTION.DOWN);
            if (isEmpty) {
              return noRowsRenderer;
            }
            return null;
          }

          return (
            <JuiVirtualizedList
              ref={ref}
              height={height}
              minRowHeight={minRowHeight}
              fixedRowHeight={fixedRowHeight}
              initialScrollToIndex={initialScrollToIndex}
              initialScrollAlignTo={initialScrollAlignTo}
              overscan={overscan}
              before={loadingUp ? loadingMoreRenderer : null}
              after={loadingDown ? loadingMoreRenderer : null}
              onScroll={(event: React.UIEvent<HTMLElement>) => {
                _handleScroll();
                onScroll(event);
              }}
              onWheel={(event: React.WheelEvent<HTMLElement>) => {
                const { deltaX, deltaY, deltaZ } = event;
                _handleScroll({ x: deltaX, y: deltaY, z: deltaZ });
                onWheel(event);
              }}
              contentStyle={contentStyle}
              onVisibleRangeChange={onVisibleRangeChange}
              onRenderedRangeChange={onRenderedRangeChange}
              stickToBottom={stickToBottom && isStickToBottomEnabled}
              stickToLastPosition={stickToLastPosition}
              onBottomStatusChange={onBottomStatusChange}
            >
              {children}
            </JuiVirtualizedList>
          );
        }}
      </JuiDataLoader>
    );
  }
  return result;
};

const memoInfiniteList = memo(forwardRef(JuiInfiniteList));

export { memoInfiniteList as JuiInfiniteList, JuiInfiniteListProps };
