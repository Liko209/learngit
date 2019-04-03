/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-05 15:35:27
 * Copyright © RingCentral. All rights reserved.
 */
import React, {
  useState,
  RefForwardingComponent,
  memo,
  forwardRef,
  useRef,
} from 'react';
import { noop } from '../../foundation/utils';
import { JuiDataLoader } from './DataLoader';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from './VirtualizedList';
import { ILoadMoreStrategy, ThresholdStrategy } from './LoadMoreStrategy';
import { IndexRange } from './types';

type JuiInfiniteListProps = {
  height?: number;
  minRowHeight: number;
  overscan?: number;
  loadMoreStrategy?: ILoadMoreStrategy;
  hasMore: (direction: 'up' | 'down') => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: 'up' | 'down', count: number) => Promise<void>;
  initialScrollToIndex?: number;
  onScroll?: (event: React.UIEvent<HTMLElement>) => void;
  onVisibleRangeChange?: (range: IndexRange) => void;
  onRenderedRangeChange?: (range: IndexRange) => void;
  noRowsRenderer?: JSX.Element;
  loadingRenderer: JSX.Element;
  loadingMoreRenderer: JSX.Element;
  children: JSX.Element[];
  stickToBottom?: boolean;
  fallBackRenderer?: JSX.Element;
  contentStyle?: React.CSSProperties;
  stickToLastPosition?: boolean;
};

const JuiInfiniteList: RefForwardingComponent<
  JuiVirtualizedListHandles,
  JuiInfiniteListProps
> = (
  {
    height,
    minRowHeight,
    overscan,
    loadMoreStrategy = new ThresholdStrategy({
      threshold: 15,
      minBatchCount: 10,
    }),
    hasMore,
    loadInitialData,
    loadMore,
    initialScrollToIndex = 0,
    noRowsRenderer,
    loadingRenderer,
    loadingMoreRenderer,
    onScroll = noop,
    onVisibleRangeChange = noop,
    onRenderedRangeChange = noop,
    stickToBottom,
    fallBackRenderer,
    children,
    contentStyle,
    stickToLastPosition,
  }: JuiInfiniteListProps,
  forwardRef: React.RefObject<JuiVirtualizedListHandles> | null,
) => {
  let ref = useRef<JuiVirtualizedListHandles>(null);
  if (forwardRef) {
    ref = forwardRef;
  }
  const [isStickToBottomEnabled, enableStickToBottom] = useState(true);

  const _loadMore = async (direction: 'up' | 'down', count: number) => {
    enableStickToBottom(false);
    await loadMore(direction, count);
    enableStickToBottom(true);
  };

  if (!height) {
    return loadingRenderer;
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
        onScroll: handleScroll,
      }) => {
        if (loadingInitial || !height) {
          return loadingRenderer;
        }
        if (loadingInitialFailed) {
          return fallBackRenderer || <></>;
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
              if (ref.current) {
                const visibleRange = ref.current.getVisibleRange();
                handleScroll(visibleRange, {
                  minIndex: 0,
                  maxIndex: children.length - 1,
                });
              }
              onScroll(event);
            }}
            contentStyle={contentStyle}
            onVisibleRangeChange={onVisibleRangeChange}
            onRenderedRangeChange={onRenderedRangeChange}
            stickToBottom={stickToBottom && isStickToBottomEnabled}
            stickToLastPosition={stickToLastPosition}
          >
            {children}
          </JuiVirtualizedList>
        );
      }}
    </JuiDataLoader>
  );
};

const memoInfiniteList = memo(
  forwardRef(JuiInfiniteList),
) as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    JuiInfiniteListProps & React.RefAttributes<JuiVirtualizedListHandles>
  >
>;
export { memoInfiniteList as JuiInfiniteList, JuiInfiniteListProps };
