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
} from 'react';
import { noop } from '../../foundation/utils';
import { JuiDataLoader } from './DataLoader';
import {
  JuiVirtualizedList,
  JuiVirtualizedListHandles,
} from './VirtualizedList';
import { IndexRange } from './types';

type JuiInfiniteListProps = {
  height?: number;
  minRowHeight: number;
  overscan?: number;
  hasMore: (direction: 'up' | 'down') => boolean;
  loadInitialData: () => Promise<void>;
  loadMore: (direction: 'up' | 'down') => Promise<void>;
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
};

const JuiInfiniteList: RefForwardingComponent<
  JuiVirtualizedListHandles,
  JuiInfiniteListProps
> = (
  {
    height,
    minRowHeight,
    overscan,
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
  }: JuiInfiniteListProps,
  forwardRef,
) => {
  const [isStickToBottomEnabled, enableStickToBottom] = useState(true);

  const _loadMore = async (direction: 'up' | 'down') => {
    enableStickToBottom(false);
    await loadMore(direction);
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
            ref={forwardRef}
            height={height}
            minRowHeight={minRowHeight}
            initialScrollToIndex={initialScrollToIndex}
            overscan={overscan}
            before={loadingUp ? loadingMoreRenderer : null}
            after={loadingDown ? loadingMoreRenderer : null}
            onScroll={(event: React.UIEvent<HTMLElement>) => {
              handleScroll(event);
              onScroll(event);
            }}
            contentStyle={contentStyle}
            onVisibleRangeChange={onVisibleRangeChange}
            onRenderedRangeChange={onRenderedRangeChange}
            stickToBottom={stickToBottom && isStickToBottomEnabled}
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
