/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-05 15:35:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState, memo, forwardRef, useRef, useCallback } from 'react';
import { noop } from '../../foundation/utils';
import { JuiDataLoader } from './DataLoader';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles
} from './VirtualizedList';
import { ILoadMoreStrategy, ThresholdStrategy } from './LoadMoreStrategy';
import { IndexRange } from './types';
import { useMountState } from './hooks';
import { DIRECTION } from '../Lists';

type JuiInfiniteListProps = {
  height?: number;
  minRowHeight: number;
  overscan?: number;
  loadMoreStrategy?: ILoadMoreStrategy;
  hasMore: (direction: DIRECTION) => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: 'up' | 'down', count: number) => Promise<void>;
  initialScrollToIndex?: number;
  onScroll?: (event: React.UIEvent<HTMLElement>) => void;
  onWheel?: (event: React.WheelEvent<HTMLElement>) => void;
  onVisibleRangeChange?: (range: IndexRange) => void;
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
};

const JuiInfiniteList = (
  {
    height,
    minRowHeight,
    overscan,
    loadMoreStrategy = new ThresholdStrategy({
      threshold: 15,
      minBatchCount: 10
    }),
    hasMore,
    loadInitialData,
    loadMore,
    initialScrollToIndex = 0,
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
    onBottomStatusChange
  }: JuiInfiniteListProps,
  forwardRef: React.RefObject<JuiVirtualizedListHandles> | null
) => {
  let ref = useRef<JuiVirtualizedListHandles>(null);
  if (forwardRef) {
    ref = forwardRef;
  }
  const [isStickToBottomEnabled, setStickToBottom] = useState(true);
  const isMountedRef = useMountState();

  const _loadMore = useCallback(
    async (direction: 'up' | 'down', count: number) => {
      if (direction === 'down') {
        setStickToBottom(false);
      }
      await loadMore(direction, count);
      isMountedRef.current && setStickToBottom(true);
    },
    [loadMore, setStickToBottom]
  );

  if (!height) {
    return null;
  }

  return (
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
        onScroll: handleScroll
      }) => {
        const _handleScroll = (delta?: { x: number; y: number; z: number }) => {
          if (ref.current) {
            const visibleRange = ref.current.getVisibleRange();
            const prevVisibleRange = ref.current.getPrevVisibleRange();
            handleScroll(
              visibleRange,
              prevVisibleRange,
              {
                minIndex: 0,
                maxIndex: children.length - 1
              },
              delta
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
          const isEmpty = !hasMore('up') && !hasMore('down');
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
            initialScrollToIndex={initialScrollToIndex}
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
};

const memoInfiniteList = memo(forwardRef(JuiInfiniteList));

export { memoInfiniteList as JuiInfiniteList, JuiInfiniteListProps };
